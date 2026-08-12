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
    time,.meta { color:var(--muted); font-size:.76rem; }
    .message { margin:1rem 0; line-height:1.7; white-space:pre-wrap; overflow-wrap:anywhere; }
    .email { display:inline-block; margin-top:.2rem; color:#334b8e; font-size:.84rem; overflow-wrap:anywhere; }
    .actions { display:flex; flex-wrap:wrap; gap:.45rem; margin-top:1rem; padding-top:.8rem; border-top:1px solid var(--line); }
    .actions button { padding:.45rem .7rem; border:1px solid var(--line); border-radius:.6rem; background:#f8f8f5; font-size:.78rem; }
    .actions .danger { margin-left:auto; color:var(--red); }
    .empty { padding:3rem 1rem; border:1px dashed var(--line); border-radius:1rem; color:var(--muted); text-align:center; }
    @media (max-width:36rem) { h1 { font-size:clamp(1.9rem,10vw,2.7rem); line-height:1.08; } .dashboard-head { display:block; } .filters { width:100%; margin-top:1rem; } .actions .danger { margin-left:0; } }
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
  };
  const list = document.getElementById('contacts');
  const statusText = document.getElementById('status');
  const filter = document.getElementById('filter');
  const date = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Seoul' });

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

  filter.addEventListener('change', load);
  load();
`;

export const dashboardPage = () => pageShell(
  'Utilark Admin',
  `<main>
    <header>
      <a class="brand" href="/"><span class="mark" aria-hidden="true">U</span><span>Utilark Admin</span></a>
      <form action="/logout" method="post"><button class="logout" type="submit">로그아웃</button></form>
    </header>
    <div class="dashboard-head">
      <div>
        <h1>문의함</h1>
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
