const RETENTION_MS = 180 * 24 * 60 * 60 * 1000;

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
      CREATE TABLE IF NOT EXISTS rate_limits (
        scope TEXT NOT NULL,
        visitor_key TEXT NOT NULL,
        window_started_at INTEGER NOT NULL,
        count INTEGER NOT NULL,
        PRIMARY KEY (scope, visitor_key)
      );
    `);
  }

  purge(now) {
    this.sql.exec('DELETE FROM contacts WHERE created_at < ?', now - RETENTION_MS);
    this.sql.exec('DELETE FROM rate_limits WHERE window_started_at < ?', now - 24 * 60 * 60 * 1000);
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

    return json({ error: 'not found' }, { status: 404 });
  }
}
