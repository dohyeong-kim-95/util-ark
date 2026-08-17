const RETENTION_MS = 180 * 24 * 60 * 60 * 1000;
const ANALYTICS_RETENTION_DAYS = 90;

const json = (data, init = {}) => {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('Cache-Control', 'no-store');
  return new Response(JSON.stringify(data), { ...init, headers });
};

export class ContactStore {
  constructor(state) {
    this.sql = state.storage.sql;
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS contacts (
        id TEXT PRIMARY KEY,
        created_at INTEGER NOT NULL,
        locale TEXT NOT NULL,
        category TEXT NOT NULL,
        email TEXT,
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'new'
      );
      CREATE INDEX IF NOT EXISTS contacts_created_at ON contacts(created_at DESC);
      CREATE INDEX IF NOT EXISTS contacts_status ON contacts(status, created_at DESC);
      CREATE TABLE IF NOT EXISTS tool_feedback (
        id TEXT PRIMARY KEY,
        created_at INTEGER NOT NULL,
        locale TEXT NOT NULL,
        tool TEXT NOT NULL,
        helpful INTEGER NOT NULL,
        reason TEXT,
        comment TEXT,
        publish_consent INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'private'
      );
      CREATE INDEX IF NOT EXISTS tool_feedback_created_at ON tool_feedback(created_at DESC);
      CREATE INDEX IF NOT EXISTS tool_feedback_status ON tool_feedback(status, created_at DESC);
      CREATE INDEX IF NOT EXISTS tool_feedback_tool ON tool_feedback(tool, created_at DESC);
      CREATE TABLE IF NOT EXISTS rate_limits (
        scope TEXT NOT NULL,
        visitor_key TEXT NOT NULL,
        window_started_at INTEGER NOT NULL,
        count INTEGER NOT NULL,
        PRIMARY KEY (scope, visitor_key)
      );
      CREATE TABLE IF NOT EXISTS analytics_daily (
        day TEXT PRIMARY KEY,
        page_views INTEGER NOT NULL DEFAULT 0,
        bot_requests INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS analytics_visitors (
        day TEXT NOT NULL,
        visitor_key TEXT NOT NULL,
        PRIMARY KEY (day, visitor_key)
      );
      CREATE INDEX IF NOT EXISTS analytics_visitors_day ON analytics_visitors(day);
      -- Qualified visitors: the subset that stayed visible for a few seconds or
      -- interacted. A crawler that fetches the HTML lands in analytics_visitors
      -- but never here, which is what makes the two numbers worth comparing.
      CREATE TABLE IF NOT EXISTS analytics_qualified (
        day TEXT NOT NULL,
        visitor_key TEXT NOT NULL,
        PRIMARY KEY (day, visitor_key)
      );
      CREATE INDEX IF NOT EXISTS analytics_qualified_day ON analytics_qualified(day);
    `);
  }

  purge(now) {
    this.sql.exec('DELETE FROM contacts WHERE created_at < ?', now - RETENTION_MS);
    this.sql.exec('DELETE FROM tool_feedback WHERE created_at < ?', now - RETENTION_MS);
    this.sql.exec('DELETE FROM rate_limits WHERE window_started_at < ?', now - 24 * 60 * 60 * 1000);
    const cutoff = new Date(now - ANALYTICS_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    this.sql.exec('DELETE FROM analytics_daily WHERE day < ?', cutoff);
    this.sql.exec('DELETE FROM analytics_visitors WHERE day < ?', cutoff);
    this.sql.exec('DELETE FROM analytics_qualified WHERE day < ?', cutoff);
  }

  consumeRateLimit(scope, visitorKey, limit, windowMs, now) {
    const row = [...this.sql.exec(
      'SELECT window_started_at, count FROM rate_limits WHERE scope = ? AND visitor_key = ?',
      scope,
      visitorKey,
    )][0];

    if (!row || now - row.window_started_at >= windowMs) {
      this.sql.exec(
        `INSERT INTO rate_limits (scope, visitor_key, window_started_at, count)
         VALUES (?, ?, ?, 1)
         ON CONFLICT(scope, visitor_key) DO UPDATE SET window_started_at = excluded.window_started_at, count = 1`,
        scope,
        visitorKey,
        now,
      );
      return { allowed: true, remaining: limit - 1 };
    }

    if (row.count >= limit) {
      return { allowed: false, retryAfter: Math.max(1, Math.ceil((windowMs - (now - row.window_started_at)) / 1000)) };
    }

    this.sql.exec(
      'UPDATE rate_limits SET count = count + 1 WHERE scope = ? AND visitor_key = ?',
      scope,
      visitorKey,
    );
    return { allowed: true, remaining: limit - row.count - 1 };
  }

  async fetch(request) {
    const url = new URL(request.url);
    const now = Date.now();
    this.purge(now);

    if (url.pathname === '/rate-limit' && request.method === 'POST') {
      const body = await request.json().catch(() => null);
      if (!body?.scope || !body?.visitorKey) return json({ error: 'invalid rate-limit request' }, { status: 400 });
      return json(this.consumeRateLimit(
        String(body.scope),
        String(body.visitorKey),
        Math.min(20, Math.max(1, Number(body.limit) || 1)),
        Math.min(24 * 60 * 60 * 1000, Math.max(1000, Number(body.windowMs) || 60_000)),
        now,
      ));
    }

    if (url.pathname === '/submit' && request.method === 'POST') {
      const body = await request.json().catch(() => null);
      if (!body?.visitorKey || !body?.contact) return json({ error: 'invalid submission' }, { status: 400 });
      const rate = this.consumeRateLimit('contact-submit', String(body.visitorKey), 5, 15 * 60 * 1000, now);
      if (!rate.allowed) {
        return json({ error: 'rate_limited', retryAfter: rate.retryAfter }, {
          status: 429,
          headers: { 'Retry-After': String(rate.retryAfter) },
        });
      }

      const contact = body.contact;
      const id = crypto.randomUUID();
      this.sql.exec(
        `INSERT INTO contacts (id, created_at, locale, category, email, message, status)
         VALUES (?, ?, ?, ?, ?, ?, 'new')`,
        id,
        now,
        contact.locale,
        contact.category,
        contact.email || null,
        contact.message,
      );
      return json({ ok: true, id }, { status: 201 });
    }

    if (url.pathname === '/feedback/submit' && request.method === 'POST') {
      const body = await request.json().catch(() => null);
      if (!body?.visitorKey || !body?.feedback) return json({ error: 'invalid submission' }, { status: 400 });
      const feedback = body.feedback;
      const rate = this.consumeRateLimit(
        `feedback-submit:${String(feedback.tool)}`,
        String(body.visitorKey),
        1,
        24 * 60 * 60 * 1000,
        now,
      );
      if (!rate.allowed) {
        return json({ error: 'rate_limited', retryAfter: rate.retryAfter }, {
          status: 429,
          headers: { 'Retry-After': String(rate.retryAfter) },
        });
      }

      const id = crypto.randomUUID();
      const comment = feedback.comment || null;
      const eligibleQuote = feedback.helpful === true
        && feedback.publishConsent === true
        && typeof comment === 'string'
        && comment.length >= 10;
      this.sql.exec(
        `INSERT INTO tool_feedback
           (id, created_at, locale, tool, helpful, reason, comment, publish_consent, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        id,
        now,
        feedback.locale,
        feedback.tool,
        feedback.helpful ? 1 : 0,
        feedback.reason || null,
        comment,
        feedback.publishConsent ? 1 : 0,
        eligibleQuote ? 'pending' : 'private',
      );
      return json({ ok: true, id, moderation: eligibleQuote ? 'pending' : 'private' }, { status: 201 });
    }

    if (url.pathname === '/feedback/public' && request.method === 'GET') {
      const tool = url.searchParams.get('tool') || null;
      const locale = ['en', 'ko'].includes(url.searchParams.get('locale')) ? url.searchParams.get('locale') : null;
      const summary = tool
        ? [...this.sql.exec(
            `SELECT COUNT(*) AS total, COALESCE(SUM(helpful), 0) AS helpful
             FROM tool_feedback WHERE tool = ?`,
            tool,
          )][0]
        : [...this.sql.exec(
            'SELECT COUNT(*) AS total, COALESCE(SUM(helpful), 0) AS helpful FROM tool_feedback',
          )][0];
      const approvedTotal = Number([...this.sql.exec(
        `SELECT COUNT(*) AS count FROM tool_feedback
         WHERE status = 'approved' AND helpful = 1 AND publish_consent = 1 AND LENGTH(comment) >= 10`,
      )][0]?.count ?? 0);
      const clauses = ["status = 'approved'", 'helpful = 1', 'publish_consent = 1', 'LENGTH(comment) >= 10'];
      const params = [];
      if (tool) {
        clauses.push('tool = ?');
        params.push(tool);
      }
      if (locale) {
        clauses.push('locale = ?');
        params.push(locale);
      }
      const items = [...this.sql.exec(
        `SELECT tool, comment FROM tool_feedback
         WHERE ${clauses.join(' AND ')}
         ORDER BY created_at DESC LIMIT 6`,
        ...params,
      )].map((row) => ({ tool: row.tool, quote: row.comment }));
      return json({
        summary: { total: Number(summary?.total ?? 0), helpful: Number(summary?.helpful ?? 0) },
        approvedTotal,
        items,
      });
    }

    if (url.pathname === '/analytics/record' && request.method === 'POST') {
      const body = await request.json().catch(() => null);
      const day = typeof body?.day === 'string' && /^\d{4}-\d{2}-\d{2}$/u.test(body.day) ? body.day : null;
      if (!day || (!body.bot && !body.visitorKey)) {
        return json({ error: 'invalid analytics record' }, { status: 400 });
      }
      this.sql.exec(
        `INSERT INTO analytics_daily (day, page_views, bot_requests)
         VALUES (?, ?, ?)
         ON CONFLICT(day) DO UPDATE SET
           page_views = page_views + excluded.page_views,
           bot_requests = bot_requests + excluded.bot_requests`,
        day,
        body.bot ? 0 : 1,
        body.bot ? 1 : 0,
      );
      if (!body.bot) {
        this.sql.exec(
          'INSERT OR IGNORE INTO analytics_visitors (day, visitor_key) VALUES (?, ?)',
          day,
          String(body.visitorKey),
        );
      }
      return json({ ok: true }, { status: 201 });
    }

    if (url.pathname === '/analytics/qualify' && request.method === 'POST') {
      const body = await request.json().catch(() => null);
      const day = typeof body?.day === 'string' ? body.day : null;
      if (!day || !body?.visitorKey) {
        return json({ error: 'invalid qualify record' }, { status: 400 });
      }
      // Same key as the page view, so the two tables describe the same visitor
      // without anything new being stored about them.
      this.sql.exec(
        'INSERT OR IGNORE INTO analytics_qualified (day, visitor_key) VALUES (?, ?)',
        day,
        String(body.visitorKey),
      );
      this.purge(now);
      return json({ ok: true }, { status: 202 });
    }

    if (url.pathname === '/analytics' && request.method === 'GET') {
      const days = Math.min(90, Math.max(1, Number(url.searchParams.get('days')) || 30));
      const today = new Date(now).toISOString().slice(0, 10);
      const firstDay = new Date(now - (days - 1) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const daily = Object.fromEntries(
        [...this.sql.exec(
          `SELECT d.day, d.page_views, d.bot_requests,
                  (SELECT COUNT(*) FROM analytics_visitors v WHERE v.day = d.day) AS unique_visitors,
                  (SELECT COUNT(*) FROM analytics_qualified q WHERE q.day = d.day) AS qualified_visitors
           FROM analytics_daily d
           WHERE d.day BETWEEN ? AND ?
           ORDER BY d.day DESC`,
          firstDay,
          today,
        )].map((row) => [row.day, row]),
      );
      const items = [];
      for (let offset = 0; offset < days; offset += 1) {
        const day = new Date(now - offset * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        const row = daily[day];
        items.push({
          day,
          dau: Number(row?.unique_visitors ?? 0),
          qualified: Number(row?.qualified_visitors ?? 0),
          pageViews: Number(row?.page_views ?? 0),
          botRequests: Number(row?.bot_requests ?? 0),
        });
      }
      return json({ timeZone: 'UTC', retentionDays: ANALYTICS_RETENTION_DAYS, items });
    }

    if (url.pathname === '/analytics/public' && request.method === 'GET') {
      const today = new Date(now).toISOString().slice(0, 10);
      const weekStart = new Date(now - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const monthStart = new Date(now - 29 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      // The published footer keeps counting every deduplicated visit, which is
      // what it has always meant. Qualified visits ship alongside so the number
      // shown can be switched deliberately rather than by redefining it here.
      const totals = (table) => [...this.sql.exec(
        `SELECT
           SUM(CASE WHEN day = ? THEN 1 ELSE 0 END) AS today,
           SUM(CASE WHEN day >= ? THEN 1 ELSE 0 END) AS week,
           COUNT(*) AS month
         FROM ${table}
         WHERE day BETWEEN ? AND ?`,
        today,
        weekStart,
        monthStart,
        today,
      )][0];
      const row = totals('analytics_visitors');
      const qualifiedRow = totals('analytics_qualified');
      return json({
        today: Number(row?.today ?? 0),
        week: Number(row?.week ?? 0),
        month: Number(row?.month ?? 0),
        qualified: {
          today: Number(qualifiedRow?.today ?? 0),
          week: Number(qualifiedRow?.week ?? 0),
          month: Number(qualifiedRow?.month ?? 0),
        },
        method: 'sum_of_daily_unique_visitors',
      });
    }

    if (url.pathname === '/contacts' && request.method === 'GET') {
      const requestedStatus = url.searchParams.get('status');
      const status = ['new', 'read', 'resolved'].includes(requestedStatus) ? requestedStatus : null;
      const limit = Math.min(200, Math.max(1, Number(url.searchParams.get('limit')) || 100));
      const rows = status
        ? [...this.sql.exec(
            `SELECT id, created_at, locale, category, email, message, status
             FROM contacts WHERE status = ? ORDER BY created_at DESC LIMIT ?`,
            status,
            limit,
          )]
        : [...this.sql.exec(
            `SELECT id, created_at, locale, category, email, message, status
             FROM contacts ORDER BY created_at DESC LIMIT ?`,
            limit,
          )];
      const counts = Object.fromEntries(
        [...this.sql.exec('SELECT status, COUNT(*) AS count FROM contacts GROUP BY status')]
          .map((row) => [row.status, row.count]),
      );
      return json({
        items: rows.map((row) => ({ ...row, createdAt: new Date(row.created_at).toISOString(), created_at: undefined })),
        counts: { new: counts.new ?? 0, read: counts.read ?? 0, resolved: counts.resolved ?? 0 },
      });
    }

    if (url.pathname === '/feedback' && request.method === 'GET') {
      const requestedStatus = url.searchParams.get('status');
      const status = ['private', 'pending', 'approved', 'rejected'].includes(requestedStatus) ? requestedStatus : null;
      const limit = Math.min(200, Math.max(1, Number(url.searchParams.get('limit')) || 100));
      const rows = status
        ? [...this.sql.exec(
            `SELECT id, created_at, locale, tool, helpful, reason, comment, publish_consent, status
             FROM tool_feedback WHERE status = ? ORDER BY created_at DESC LIMIT ?`,
            status,
            limit,
          )]
        : [...this.sql.exec(
            `SELECT id, created_at, locale, tool, helpful, reason, comment, publish_consent, status
             FROM tool_feedback ORDER BY created_at DESC LIMIT ?`,
            limit,
          )];
      const counts = Object.fromEntries(
        [...this.sql.exec('SELECT status, COUNT(*) AS count FROM tool_feedback GROUP BY status')]
          .map((row) => [row.status, row.count]),
      );
      return json({
        items: rows.map((row) => ({
          ...row,
          helpful: row.helpful === 1,
          publishConsent: row.publish_consent === 1,
          publish_consent: undefined,
          createdAt: new Date(row.created_at).toISOString(),
          created_at: undefined,
        })),
        counts: {
          private: counts.private ?? 0,
          pending: counts.pending ?? 0,
          approved: counts.approved ?? 0,
          rejected: counts.rejected ?? 0,
        },
      });
    }

    const contactMatch = url.pathname.match(/^\/contacts\/([0-9a-f-]+)$/u);
    if (contactMatch && request.method === 'PATCH') {
      const body = await request.json().catch(() => null);
      if (!['new', 'read', 'resolved'].includes(body?.status)) return json({ error: 'invalid status' }, { status: 400 });
      this.sql.exec('UPDATE contacts SET status = ? WHERE id = ?', body.status, contactMatch[1]);
      return json({ ok: true });
    }

    if (contactMatch && request.method === 'DELETE') {
      this.sql.exec('DELETE FROM contacts WHERE id = ?', contactMatch[1]);
      return json({ ok: true });
    }

    const feedbackMatch = url.pathname.match(/^\/feedback\/([0-9a-f-]+)$/u);
    if (feedbackMatch && request.method === 'PATCH') {
      const body = await request.json().catch(() => null);
      if (!['pending', 'approved', 'rejected'].includes(body?.status)) {
        return json({ error: 'invalid status' }, { status: 400 });
      }
      const row = [...this.sql.exec(
        'SELECT helpful, comment, publish_consent FROM tool_feedback WHERE id = ?',
        feedbackMatch[1],
      )][0];
      if (!row) return json({ error: 'not found' }, { status: 404 });
      if (body.status === 'approved' && !(row.helpful === 1 && row.publish_consent === 1 && String(row.comment ?? '').length >= 10)) {
        return json({ error: 'not publishable' }, { status: 400 });
      }
      this.sql.exec('UPDATE tool_feedback SET status = ? WHERE id = ?', body.status, feedbackMatch[1]);
      return json({ ok: true });
    }

    if (feedbackMatch && request.method === 'DELETE') {
      this.sql.exec('DELETE FROM tool_feedback WHERE id = ?', feedbackMatch[1]);
      return json({ ok: true });
    }

    return json({ error: 'not found' }, { status: 404 });
  }
}
