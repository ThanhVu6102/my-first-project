/* MyFirstWeb scripts – DOM, Storage, Geolocation, Fetch, Canvas, PWA */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);

  /* Giữ hàm cũ để tương thích, nay có state */
  window.sayHello = function () {
    const n = Number(localStorage.getItem('clickCount') || 0) + 1;
    localStorage.setItem('clickCount', String(n));
    paintCount();
    alert('Hello from my first website! Lần bấm thứ ' + n);
  };

  /* ---- Theme dark/light (CSS variables + localStorage) ---- */
  const themeToggle = $('#themeToggle');
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;
  paintTheme();
  themeToggle?.addEventListener('click', () => {
    const cur = document.documentElement.dataset.theme === 'dark' ? '' : 'dark';
    if (cur) document.documentElement.dataset.theme = cur;
    else delete document.documentElement.dataset.theme;
    localStorage.setItem('theme', cur);
    paintTheme();
  });
  function paintTheme() {
    const dark = document.documentElement.dataset.theme === 'dark';
    if (themeToggle) themeToggle.textContent = dark ? '☀️' : '🌙';
  }

  /* ---- Mobile menu + active nav + to-top (responsive – PDF 02/04) ---- */
  const menuBtn = $('#menuBtn'), nav = $('#mainNav'), toTop = $('#toTop');
  menuBtn?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  nav?.addEventListener('click', (e) => {
    if (e.target.classList.contains('nav-link')) nav.classList.remove('open');
  });
  const links = [...document.querySelectorAll('.nav-link')];
  const secs = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const io = new IntersectionObserver((es) => {
    es.forEach((en) => {
      if (en.isIntersecting) {
        links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  secs.forEach((s) => io.observe(s));
  window.addEventListener('scroll', () => {
    if (toTop) toTop.hidden = window.scrollY < 600;
  }, { passive: true });
  toTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---- Counter + Web Storage (PDF 03 – Web Storage) ---- */
  function paintCount() {
    const el = $('#clickCount');
    if (el) el.textContent = localStorage.getItem('clickCount') || '0';
  }
  paintCount();
  $('#countBtn')?.addEventListener('click', () => window.sayHello());
  $('#resetCount')?.addEventListener('click', () => {
    localStorage.setItem('clickCount', '0');
    paintCount();
  });

  /* ---- Budget output ---- */
  const budget = $('#fBudget'), budgetOut = $('#budgetOut');
  budget?.addEventListener('input', () => { budgetOut.textContent = budget.value + 'tr'; });

  /* ---- Contact form: validate + draft autosave (localStorage) ---- */
  const form = $('#contactForm');
  const fields = ['fName', 'fEmail', 'fPhone', 'fService', 'fBudget', 'fMsg'];
  fields.forEach((id) => {
    const el = document.getElementById(id);
    const v = localStorage.getItem('draft_' + id);
    if (el && v !== null) el.value = v;
    el?.addEventListener('input', () => localStorage.setItem('draft_' + id, el.value));
  });
  $('#clearDraft')?.addEventListener('click', () => {
    fields.forEach((id) => localStorage.removeItem('draft_' + id));
    form.reset();
  });
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const err = $('#formErr'), ok = $('#formOk');
    err.hidden = true; ok.hidden = true;
    const name = $('#fName').value.trim();
    const email = $('#fEmail').value.trim();
    const agree = $('#fAgree').checked;
    if (name.length < 2) return fail('Vui lòng nhập họ tên (≥ 2 ký tự).');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('Email chưa hợp lệ.');
    if (!agree) return fail('Bạn cần tick “đồng ý được liên hệ lại”.');
    const subs = JSON.parse(localStorage.getItem('contacts') || '[]');
    subs.push({ name, email, phone: $('#fPhone').value, at: new Date().toISOString() });
    localStorage.setItem('contacts', JSON.stringify(subs));
    fields.forEach((id) => localStorage.removeItem('draft_' + id));
    form.reset();
    ok.hidden = false;
    function fail(m) { err.textContent = m; err.hidden = false; }
  });

  /* ---- Geolocation (PDF 03 – Geolocation API) ---- */
  $('#geoBtn')?.addEventListener('click', () => {
    const out = $('#geoOut');
    if (!('geolocation' in navigator)) { out.textContent = 'Trình duyệt không hỗ trợ Geolocation.'; return; }
    out.textContent = 'Đang lấy vị trí…';
    navigator.geolocation.getCurrentPosition(
      (p) => { out.textContent = `Vĩ độ ${p.coords.latitude.toFixed(4)}, kinh độ ${p.coords.longitude.toFixed(4)} (±${Math.round(p.coords.accuracy)}m).`; },
      () => { out.textContent = 'Bị từ chối / lỗi. Hãy bật quyền vị trí.'; },
      { timeout: 8000 }
    );
  });

  /* ---- Drag & Drop (PDF 03) ---- */
  const drag = $('#dragItem'), drop = $('#dropZone');
  drag?.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', 'drag'));
  drop?.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('over'); });
  drop?.addEventListener('dragleave', () => drop.classList.remove('over'));
  drop?.addEventListener('drop', (e) => {
    e.preventDefault(); drop.classList.remove('over');
    drop.textContent = 'Đã nhận ✔ — ' + new Date().toLocaleTimeString('vi-VN');
  });

  /* ---- Fetch API integration demo (PDF 02 – Integration, CORS, JSON) ---- */
  $('#fetchBtn')?.addEventListener('click', async () => {
    const out = $('#fetchOut'), st = $('#fetchStatus');
    st.textContent = 'Đang gọi…'; out.textContent = '…';
    try {
      const res = await fetch('https://jsonplaceholder.typicode.com/posts/1');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      out.textContent = JSON.stringify(data, null, 2);
      st.textContent = 'OK 200 • ' + new Date().toLocaleTimeString('vi-VN');
    } catch (err) {
      st.textContent = 'Lỗi mạng/CORS';
      out.textContent = 'Không gọi được API (offline hoặc bị chặn). Chi tiết: ' + err.message;
    }
  });

  /* ---- Canvas demo (PDF 03) ---- */
  function drawCanvas() {
    const c = $('#demoCanvas');
    if (!c) return;
    const ctx = c.getContext('2d');
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);
    const g = ctx.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, '#2563eb'); g.addColorStop(1, '#a855f7');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 8) {
      ctx.lineTo(x, H / 2 + Math.sin((x + Math.random() * 20) / 40) * 50);
    }
    ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('Canvas + JS — ' + new Date().toLocaleTimeString('vi-VN'), 16, 34);
  }
  drawCanvas();
  $('#drawBtn')?.addEventListener('click', drawCanvas);

  /* ---- Auth mock (PDF 02 – Authentication, sessionStorage state) ---- */
  const modal = $('#loginModal');
  const loginState = $('#loginState');
  const loginBtn = $('#loginBtn');
  loginBtn?.addEventListener('click', () => {
    if (sessionStorage.getItem('user')) { sessionStorage.clear(); paintLogin(); }
    else if (modal) modal.hidden = false;
  });
  $('#loginClose')?.addEventListener('click', () => { modal.hidden = true; });
  modal?.addEventListener('click', (e) => { if (e.target === modal) modal.hidden = true; });
  $('#loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const em = $('#lEmail').value.trim(), pw = $('#lPass').value;
    const err = $('#loginErr'); err.hidden = true;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { err.textContent = 'Email chưa hợp lệ.'; err.hidden = false; return; }
    if (pw.length < 4) { err.textContent = 'Mật khẩu ≥ 4 ký tự.'; err.hidden = false; return; }
    sessionStorage.setItem('token', btoa(em + ':' + Date.now()));
    sessionStorage.setItem('user', em);
    modal.hidden = true;
    paintLogin();
  });
  paintLogin();
  function paintLogin() {
    const u = sessionStorage.getItem('user');
    if (loginBtn) loginBtn.textContent = u ? '👤 ' + u.split('@')[0] + ' (thoát)' : 'Đăng nhập';
    if (loginState) loginState.textContent = u ? 'Đã đăng nhập: ' + u + ' (token trong sessionStorage)' : 'Chưa đăng nhập.';
  }

  /* ---- PWA: register Service Worker (PDF 02 – manifest + SW + HTTPS) ---- */
  if ('serviceWorker' in navigator && (location.protocol.startsWith('http') || location.protocol === 'https:')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => { /* file:// hoặc chưa deploy – bỏ qua */ });
    });
  }
})();
