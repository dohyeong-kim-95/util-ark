const pageShell = (title, body, script = '') => `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>${title}</title>
  <style>
    :root { color-scheme: light; --ink:#111319; --muted:#626670; --paper:#f7f6f2; --surface:#fff; --line:#dedfdc; --yellow:#f6d365; --red:#a53434; }
    * { box-sizing:border-box; }
    body { margin:0; min-width:20rem; min-height:100vh; font-family:Inter,Pretendard,system-ui,sans-serif; word-break:keep-all; overflow-wrap:break-word; background:radial-gradient(circle at 8% 4%,#f6d36533,transparent 28rem),var(--paper); color:var(--ink); }
    button,input,select { font:inherit; color:inherit; }
    button { cursor:pointer; }
    main { width:min(68rem,calc(100% - 2rem)); margin:auto; padding:clamp(2rem,6vw,5rem) 0; }
    a { color:inherit; }
    .brand { display:inline-flex; align-items:center; gap:.65rem; font-weight:850; letter-spacing:-.04em; text-decoration:none; }
    .mark { width:2rem; height:2rem; display:grid; place-items:center; border:1.5px solid var(--ink); border-radius:50%; background:var(--yellow); transform:rotate(-7deg); }
    .login { width:min(28rem,calc(100% - 2rem)); min-height:100vh; display:grid; align-content:center; margin:auto; padding:2rem 0; }
    .panel { margin-top:1.5rem; padding:clamp(1.25rem,5vw,2rem); border:1px solid var(--ink); border-radius:1.5rem; background:var(--surface); box-shadow:.65rem .65rem 0 var(--yellow); }
    h1 { margin:0; font-size:clamp(2rem,7vw,3.5rem); letter-spacing:-.055em; }
    .lead { margin:.7rem 0 1.6rem; color:var(--muted); line-height:1.6; }
    label { display:grid; gap:.45rem; margin-top:1rem; color:var(--muted); font-size:.85rem; font-weight:700; }
    input,select { width:100%; min-height:2.9rem; padding:.65rem .8rem; border:1px solid var(--line); border-radius:.7rem; background:#fff; }
    .primary { min-height:2.9rem; margin-top:1.2rem; padding:.7rem 1rem; border:0; border-radius:999px; background:var(--ink); color:#fff; font-weight:750; }
    .error { padding:.8rem 1rem; border-radius:.7rem; background:#fff0f0; color:var(--red); font-size:.88rem; }
    header { display:flex; align-items:center; justify-content:space-between; gap:1rem; margin-bottom:2.5rem; }
    .logout { border:0; background:none; color:var(--muted); font-size:.85rem; text-decoration:underline; }
    .dashboard-head { display:flex; align-items:end; justify-content:space-between; gap:1rem; margin-bottom:1.4rem; }
    .dashboard-head h1 { font-size:clamp(2rem,5vw,3.8rem); }
    .analytics { margin-bottom:3rem; }
    .section-title { margin:0; font-size:clamp(1.45rem,4vw,2rem); letter-spacing:-.04em; }
    .section-note { max-width:52rem; margin:.55rem 0 0; color:var(--muted); font-size:.8rem; line-height:1.6; }
    .metrics { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:.75rem; margin-top:1.1rem; }
    .metric { min-width:0; padding:1rem; border:1px solid var(--line); border-radius:1rem; background:var(--surface); }
    .metric span,.metric strong { display:block; }
    .metric span { color:var(--muted); font-size:.75rem; }
    .metric strong { margin-top:.35rem; font-size:clamp(1.45rem,4vw,2.1rem); overflow-wrap:anywhere; }
    .exclusion { display:flex; align-items:center; justify-content:space-between; gap:1rem; margin-top:.85rem; padding:.85rem 1rem; border:1px solid var(--line); border-radius:1rem; background:#fffdf5; }
    .exclusion strong,.exclusion small { display:block; }
    .exclusion strong { font-size:.85rem; }
    .exclusion small { margin-top:.25rem; color:var(--muted); font-size:.72rem; line-height:1.5; }
    .switch { flex:0 0 auto; width:3.25rem; height:1.85rem; padding:.18rem; border:1px solid #b9bbb7; border-radius:999px; background:#d9dad6; transition:background .16s,border-color .16s; }
    .switch span { display:block; width:1.35rem; height:1.35rem; border-radius:50%; background:#fff; box-shadow:0 1px 4px #1113; transition:transform .16s; }
    .switch[aria-checked="true"] { border-color:#137246; background:#1c9b5e; }
    .switch[aria-checked="true"] span { transform:translateX(1.35rem); }
    .analytics-table { margin-top:1rem; border:1px solid var(--line); border-radius:1rem; background:var(--surface); overflow:auto; }
    table { width:100%; border-collapse:collapse; font-size:.82rem; }
    th,td { padding:.7rem .85rem; border-bottom:1px solid var(--line); text-align:right; white-space:nowrap; }
    th:first-child,td:first-child { text-align:left; }
    th { color:var(--muted); font-size:.72rem; }
    tbody tr:last-child td { border-bottom:0; }
    .counts { display:flex; flex-wrap:wrap; gap:.5rem; margin-top:1rem; }
    .count { padding:.45rem .7rem; border:1px solid var(--line); border-radius:999px; background:var(--surface); color:var(--muted); font-size:.8rem; }
    .count strong { color:var(--ink); }
    .filters { width:10rem; }
    #status { min-height:1.5rem; color:var(--muted); font-size:.85rem; }
    .list { display:grid; gap:.85rem; margin-top:1rem; }
    .contact { padding:1.15rem; border:1px solid var(--line); border-radius:1rem; background:var(--surface); }
    .contact-top { display:flex; flex-wrap:wrap; align-items:center; gap:.45rem .75rem; }
    .badge { padding:.25rem .5rem; border-radius:999px; background:#eee; font-size:.72rem; font-weight:750; }
    .badge-new { background:#fff0b5; }
    .badge-resolved { background:#dcf4e5; }
    .badge-pending { background:#fff0b5; }
    .badge-approved { background:#dcf4e5; }
    .badge-rejected { background:#eee; color:var(--muted); }
    .badge-private { background:#e8edf7; color:#334b8e; }
    time,.meta { color:var(--muted); font-size:.76rem; }
    .message { margin:1rem 0; line-height:1.7; white-space:pre-wrap; overflow-wrap:anywhere; }
    .email { display:inline-block; margin-top:.2rem; color:#334b8e; font-size:.84rem; overflow-wrap:anywhere; }
    .actions { display:flex; flex-wrap:wrap; gap:.45rem; margin-top:1rem; padding-top:.8rem; border-top:1px solid var(--line); }
    .actions button { padding:.45rem .7rem; border:1px solid var(--line); border-radius:.6rem; background:#f8f8f5; font-size:.78rem; }
    .actions .danger { margin-left:auto; color:var(--red); }
    .empty { padding:3rem 1rem; border:1px dashed var(--line); border-radius:1rem; color:var(--muted); text-align:center; }
    .feedback-admin { margin-bottom:3rem; }
    .feedback-note { margin:.55rem 0 0; color:var(--muted); font-size:.78rem; line-height:1.6; }
    .sentiment { font-size:.95rem; }
    @media (max-width:42rem) { .metrics { grid-template-columns:1fr 1fr; } }
    @media (max-width:36rem) { h1 { font-size:clamp(1.9rem,10vw,2.7rem); line-height:1.08; } .dashboard-head { display:block; } .filters { width:100%; margin-top:1rem; } .actions .danger { margin-left:0; } .metric { padding:.85rem; } .exclusion { align-items:flex-start; } }
  </style>
</head>
<body>${body}${script ? `<script>${script}</script>` : ''}</body>
</html>`;

export const loginPage = (failed = false) => pageShell(
  'Utilark Admin 로그인',
  `<main class="login">
    <a class="brand" href="https://utilark.app"><span class="mark" aria-hidden="true">U</span><span>Utilark Admin</span></a>
    <section class="panel">
      <h1>문의함 로그인</h1>
      <p class="lead">Utilark 운영자만 접근할 수 있습니다.</p>
      ${failed ? '<p class="error" role="alert">아이디 또는 비밀번호가 올바르지 않습니다.</p>' : ''}
      <form action="/login" method="post">
        <label>아이디<input name="id" autocomplete="username" required></label>
        <label>비밀번호<input name="password" type="password" autocomplete="current-password" required></label>
        <button class="primary" type="submit">로그인</button>
      </form>
    </section>
  </main>`,
);

const dashboardScript = String.raw`
  const copy = {
    category: { bug: '오류 제보', tool: '도구 제안', feedback: '의견', other: '기타' },
    status: { new: '새 문의', read: '확인함', resolved: '처리 완료' },
    feedbackStatus: { private: '비공개 의견', pending: '승인 대기', approved: '공개 중', rejected: '공개 거절' },
    reason: {
      worked: '필요한 작업 해결', easy: '사용하기 쉬움', private: '로컬 처리 선호',
      failed: '작동 오류', confusing: '사용법이 어려움', missing: '기능 부족', other: '기타',
    },
  };
  const list = document.getElementById('contacts');
  const statusText = document.getElementById('status');
  const filter = document.getElementById('filter');
  const feedbackList = document.getElementById('feedback-list');
  const feedbackStatus = document.getElementById('feedback-status');
  const feedbackFilter = document.getElementById('feedback-filter');
  const analyticsStatus = document.getElementById('analytics-status');
  const analyticsRows = document.getElementById('analytics-rows');
  const exclusionSwitch = document.getElementById('analytics-exclusion');
  const exclusionState = document.getElementById('exclusion-state');
  const date = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Seoul' });
  const day = new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric', weekday: 'short', timeZone: 'UTC' });

  function element(name, className, text) {
    const node = document.createElement(name);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  async function api(path, options) {
    const response = await fetch(path, { cache: 'no-store', ...options });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || '요청을 처리하지 못했습니다.');
    return data;
  }

  function addAction(container, label, item, nextStatus) {
    const button = element('button', '', label);
    button.type = 'button';
    button.addEventListener('click', async () => {
      button.disabled = true;
      try {
        await api('/api/contacts/' + encodeURIComponent(item.id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: nextStatus }),
        });
        await load();
      } catch (error) {
        statusText.textContent = error.message;
        button.disabled = false;
      }
    });
    container.append(button);
  }

  function renderContact(item) {
    const card = element('article', 'contact');
    const top = element('div', 'contact-top');
    top.append(
      element('span', 'badge badge-' + item.status, copy.status[item.status] || item.status),
      element('strong', '', copy.category[item.category] || item.category),
      element('span', 'meta', item.locale === 'ko' ? '한국어' : 'English'),
    );
    const created = element('time', '', date.format(new Date(item.createdAt)));
    created.dateTime = item.createdAt;
    top.append(created);
    card.append(top, element('p', 'message', item.message));
    if (item.email) {
      const email = element('a', 'email', item.email);
      email.href = 'mailto:' + item.email;
      card.append(email);
    }
    const actions = element('div', 'actions');
    if (item.status !== 'new') addAction(actions, '새 문의로', item, 'new');
    if (item.status !== 'read') addAction(actions, '확인함', item, 'read');
    if (item.status !== 'resolved') addAction(actions, '처리 완료', item, 'resolved');
    const remove = element('button', 'danger', '영구 삭제');
    remove.type = 'button';
    remove.addEventListener('click', async () => {
      if (!confirm('이 문의를 영구 삭제할까요? 되돌릴 수 없습니다.')) return;
      remove.disabled = true;
      try {
        await api('/api/contacts/' + encodeURIComponent(item.id), { method: 'DELETE' });
        await load();
      } catch (error) {
        statusText.textContent = error.message;
        remove.disabled = false;
      }
    });
    actions.append(remove);
    card.append(actions);
    return card;
  }

  function addFeedbackAction(container, label, item, nextStatus) {
    const button = element('button', '', label);
    button.type = 'button';
    button.addEventListener('click', async () => {
      button.disabled = true;
      try {
        await api('/api/feedback/' + encodeURIComponent(item.id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: nextStatus }),
        });
        await loadFeedback();
      } catch (error) {
        feedbackStatus.textContent = error.message;
        button.disabled = false;
      }
    });
    container.append(button);
  }

  function renderFeedback(item) {
    const card = element('article', 'contact');
    const top = element('div', 'contact-top');
    top.append(
      element('span', 'badge badge-' + item.status, copy.feedbackStatus[item.status] || item.status),
      element('strong', 'sentiment', item.helpful ? '↑ 도움됨' : '↓ 아쉬움'),
      element('span', 'meta', item.tool),
      element('span', 'meta', item.locale === 'ko' ? '한국어' : 'English'),
    );
    const created = element('time', '', date.format(new Date(item.createdAt)));
    created.dateTime = item.createdAt;
    top.append(created);
    card.append(top);
    if (item.reason) card.append(element('p', 'feedback-note', '선택 사유 · ' + (copy.reason[item.reason] || item.reason)));
    card.append(element('p', 'message', item.comment || '추가로 작성한 의견이 없습니다.'));
    if (item.publishConsent) card.append(element('span', 'badge badge-pending', '익명 공개 동의'));
    const actions = element('div', 'actions');
    if (item.publishConsent && item.helpful && item.comment && item.status !== 'approved') {
      addFeedbackAction(actions, '후기로 승인', item, 'approved');
    }
    if (item.status !== 'rejected' && item.status !== 'private') {
      addFeedbackAction(actions, '공개 거절', item, 'rejected');
    }
    if (item.publishConsent && item.status !== 'pending') {
      addFeedbackAction(actions, '승인 대기로', item, 'pending');
    }
    const remove = element('button', 'danger', '영구 삭제');
    remove.type = 'button';
    remove.addEventListener('click', async () => {
      if (!confirm('이 의견을 영구 삭제할까요? 되돌릴 수 없습니다.')) return;
      remove.disabled = true;
      try {
        await api('/api/feedback/' + encodeURIComponent(item.id), { method: 'DELETE' });
        await loadFeedback();
      } catch (error) {
        feedbackStatus.textContent = error.message;
        remove.disabled = false;
      }
    });
    actions.append(remove);
    card.append(actions);
    return card;
  }

  function number(value) {
    return Number(value || 0).toLocaleString('ko-KR');
  }

  async function loadAnalytics() {
    analyticsStatus.textContent = '접속 통계를 불러오는 중…';
    try {
      const data = await api('/api/analytics');
      const today = data.items[0] || { dau: 0, qualified: 0, pageViews: 0, botRequests: 0 };
      const firstWeek = data.items.slice(0, 7);
      const averageDau = firstWeek.length
        ? Math.round(firstWeek.reduce((sum, item) => sum + item.dau, 0) / firstWeek.length * 10) / 10
        : 0;
      const excludedBots = data.items.reduce((sum, item) => sum + item.botRequests, 0);
      document.getElementById('today-dau').textContent = number(today.dau);
      document.getElementById('today-qualified').textContent = number(today.qualified);
      const share = today.dau ? Math.round((today.qualified / today.dau) * 100) : 0;
      document.getElementById('qualified-share').textContent = today.dau ? share + '%' : '–';
      document.getElementById('today-views').textContent = number(today.pageViews);
      document.getElementById('week-dau').textContent = averageDau.toLocaleString('ko-KR');
      document.getElementById('bot-requests').textContent = number(excludedBots);
      analyticsRows.replaceChildren(...data.items.map((item) => {
        const row = document.createElement('tr');
        row.append(
          element('td', '', day.format(new Date(item.day + 'T00:00:00Z'))),
          element('td', '', number(item.dau)),
          element('td', '', number(item.qualified)),
          element('td', '', number(item.pageViews)),
          element('td', '', number(item.botRequests)),
        );
        return row;
      }));
      analyticsStatus.textContent = 'UTC 기준 · 최대 ' + number(data.retentionDays) + '일 보관';
    } catch (error) {
      analyticsRows.replaceChildren();
      analyticsStatus.textContent = error.message;
    }
  }

  function renderExclusion(excluded) {
    exclusionSwitch.dataset.excluded = String(excluded);
    exclusionSwitch.setAttribute('aria-checked', String(excluded));
    exclusionSwitch.setAttribute('aria-label', excluded ? '이 기기 방문 집계 제외 끄기' : '이 기기 방문 집계 제외 켜기');
    exclusionState.textContent = excluded
      ? '제외 중 · 이 브라우저의 이후 방문은 집계하지 않습니다.'
      : '집계 중 · 켜면 이 브라우저의 이후 방문을 제외합니다.';
  }

  async function loadExclusion() {
    exclusionSwitch.disabled = true;
    try {
      const data = await api('/api/analytics/exclusion');
      renderExclusion(Boolean(data.excluded));
    } catch (error) {
      exclusionState.textContent = error.message;
    } finally {
      exclusionSwitch.disabled = false;
    }
  }

  async function load() {
    statusText.textContent = '불러오는 중…';
    const query = filter.value ? '?status=' + encodeURIComponent(filter.value) : '';
    try {
      const data = await api('/api/contacts' + query);
      document.getElementById('new-count').textContent = data.counts.new.toLocaleString('ko-KR');
      document.getElementById('read-count').textContent = data.counts.read.toLocaleString('ko-KR');
      document.getElementById('resolved-count').textContent = data.counts.resolved.toLocaleString('ko-KR');
      list.replaceChildren(...data.items.map(renderContact));
      if (!data.items.length) list.append(element('p', 'empty', '해당 문의가 없습니다.'));
      statusText.textContent = '최근 문의 ' + data.items.length.toLocaleString('ko-KR') + '건';
    } catch (error) {
      list.replaceChildren(element('p', 'empty', error.message));
      statusText.textContent = '불러오지 못했습니다.';
    }
  }

  async function loadFeedback() {
    feedbackStatus.textContent = '도구 의견을 불러오는 중…';
    const query = feedbackFilter.value ? '?status=' + encodeURIComponent(feedbackFilter.value) : '';
    try {
      const data = await api('/api/feedback' + query);
      for (const name of ['private', 'pending', 'approved', 'rejected']) {
        document.getElementById('feedback-' + name).textContent = Number(data.counts[name] || 0).toLocaleString('ko-KR');
      }
      feedbackList.replaceChildren(...data.items.map(renderFeedback));
      if (!data.items.length) feedbackList.append(element('p', 'empty', '해당 도구 의견이 없습니다.'));
      feedbackStatus.textContent = '최근 도구 의견 ' + data.items.length.toLocaleString('ko-KR') + '건';
    } catch (error) {
      feedbackList.replaceChildren(element('p', 'empty', error.message));
      feedbackStatus.textContent = '도구 의견을 불러오지 못했습니다.';
    }
  }

  filter.addEventListener('change', load);
  feedbackFilter.addEventListener('change', loadFeedback);
  exclusionSwitch.addEventListener('click', async () => {
    const excluded = exclusionSwitch.dataset.excluded !== 'true';
    exclusionSwitch.disabled = true;
    try {
      const data = await api('/api/analytics/exclusion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ excluded }),
      });
      renderExclusion(Boolean(data.excluded));
    } catch (error) {
      exclusionState.textContent = error.message;
    } finally {
      exclusionSwitch.disabled = false;
    }
  });
  loadExclusion();
  loadAnalytics();
  loadFeedback();
  load();
`;

export const dashboardPage = () => pageShell(
  'Utilark Admin',
  `<main>
    <header>
      <a class="brand" href="/"><span class="mark" aria-hidden="true">U</span><span>Utilark Admin</span></a>
      <form action="/logout" method="post"><button class="logout" type="submit">로그아웃</button></form>
    </header>
    <section class="analytics" aria-labelledby="analytics-title">
      <h1 id="analytics-title">접속 현황</h1>
      <p class="section-note">원 IP나 브라우저 정보는 저장하지 않습니다. DAU는 날짜·IP·User-Agent의 일별 단방향 값으로 당일 중복을 제거한 추정치이며, 알려진 봇과 DNT/GPC 요청은 제외합니다.</p>
      <p class="section-note"><strong>유효 방문자</strong>는 페이지가 화면에 실제로 표시된 채 3초 이상 머물렀거나 누르기·입력·스크롤이 있었던 방문만 셉니다. HTML만 받아 가고 끝나는 크롤러·에이전트는 전체 DAU에는 들어가지만 여기에는 들어오지 않으므로, <strong>두 숫자의 차이가 실질 트래픽의 비율</strong>입니다.</p>
      <div class="metrics">
        <div class="metric"><span>오늘 유효 방문자</span><strong id="today-qualified">–</strong></div>
        <div class="metric"><span>오늘 DAU (전체)</span><strong id="today-dau">–</strong></div>
        <div class="metric"><span>오늘 유효 비율</span><strong id="qualified-share">–</strong></div>
        <div class="metric"><span>오늘 페이지뷰</span><strong id="today-views">–</strong></div>
        <div class="metric"><span>최근 7일 평균 DAU</span><strong id="week-dau">–</strong></div>
        <div class="metric"><span>30일 제외 봇 요청</span><strong id="bot-requests">–</strong></div>
      </div>
      <div class="exclusion">
        <div>
          <strong>이 기기 방문자 수 합계 제외</strong>
          <small id="exclusion-state">현재 상태를 확인하는 중…</small>
        </div>
        <button id="analytics-exclusion" class="switch" type="button" role="switch" aria-checked="false" aria-label="이 기기 방문 집계 제외 켜기" disabled><span aria-hidden="true"></span></button>
      </div>
      <p id="analytics-status" class="section-note" role="status"></p>
      <div class="analytics-table">
        <table>
          <thead><tr><th scope="col">날짜</th><th scope="col">DAU</th><th scope="col">유효</th><th scope="col">페이지뷰</th><th scope="col">제외 봇</th></tr></thead>
          <tbody id="analytics-rows"></tbody>
        </table>
      </div>
    </section>
    <section class="feedback-admin" aria-labelledby="feedback-title">
      <div class="dashboard-head">
        <div>
          <h2 id="feedback-title" class="section-title">도구 의견과 사용자 후기</h2>
          <p class="feedback-note">공개 동의를 받은 긍정 의견도 자동으로 노출하지 않습니다. 개인정보·광고성 문구·과장 표현이 없는지 직접 확인한 뒤 승인하세요.</p>
          <div class="counts" aria-label="도구 의견 상태별 건수">
            <span class="count">비공개 <strong id="feedback-private">–</strong></span>
            <span class="count">승인 대기 <strong id="feedback-pending">–</strong></span>
            <span class="count">공개 중 <strong id="feedback-approved">–</strong></span>
            <span class="count">공개 거절 <strong id="feedback-rejected">–</strong></span>
          </div>
        </div>
        <label class="filters">상태
          <select id="feedback-filter">
            <option value="">전체</option>
            <option value="pending">승인 대기</option>
            <option value="approved">공개 중</option>
            <option value="private">비공개 의견</option>
            <option value="rejected">공개 거절</option>
          </select>
        </label>
      </div>
      <p id="feedback-status" role="status"></p>
      <div class="list" id="feedback-list" aria-live="polite"></div>
    </section>
    <div class="dashboard-head">
      <div>
        <h2 class="section-title">문의함</h2>
        <div class="counts" aria-label="문의 상태별 건수">
          <span class="count">새 문의 <strong id="new-count">–</strong></span>
          <span class="count">확인함 <strong id="read-count">–</strong></span>
          <span class="count">처리 완료 <strong id="resolved-count">–</strong></span>
        </div>
      </div>
      <label class="filters">상태
        <select id="filter">
          <option value="">전체</option>
          <option value="new">새 문의</option>
          <option value="read">확인함</option>
          <option value="resolved">처리 완료</option>
        </select>
      </label>
    </div>
    <p id="status" role="status"></p>
    <section class="list" id="contacts" aria-live="polite"></section>
  </main>`,
  dashboardScript,
);

export const unavailablePage = () => pageShell(
  'Utilark Admin 설정 필요',
  `<main class="login"><section class="panel"><h1>관리자 잠금 상태</h1><p class="lead">ADMIN_PASSWORD와 ADMIN_SESSION_SECRET Worker secret을 설정한 뒤 이용할 수 있습니다.</p></section></main>`,
);
