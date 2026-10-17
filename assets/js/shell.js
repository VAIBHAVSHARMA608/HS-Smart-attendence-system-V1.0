const ICONS = {
  dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="5" rx="1.5"/><rect x="13" y="12" width="8" height="9" rx="1.5"/><rect x="3" y="14" width="8" height="7" rx="1.5"/></svg>',
  attendance: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9.5h18M8 3v3M16 3v3"/><path d="m8 14 2.3 2.3L16 11"/></svg>',
  people: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17.5" cy="8.5" r="2.5"/><path d="M15.8 14.2c2.9.4 5.2 2.8 5.2 5.8"/></svg>',
  salary: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 15.5c0 1.1 1.1 2 2.5 2s2.5-.8 2.5-1.8c0-2.7-5-1.4-5-4.1 0-1 1.1-1.8 2.5-1.8s2.5.9 2.5 1.8M12 7v1.3M12 15.5v1.2"/></svg>',
  reports: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M11 20V4M18 20v-7"/></svg>',
  announcements: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11v3a1 1 0 0 0 1 1h1.2l3.3 3.6c.6.7 1.8.2 1.8-.7V7.1c0-.9-1.1-1.4-1.8-.7L6.2 10H5a1 1 0 0 0-1 1Z"/><path d="M16 9c1 .9 1 4.1 0 5M19 7c2 1.8 2 7.2 0 9"/></svg>',
  profile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c.9-4 3.8-6 7.5-6s6.6 2 7.5 6"/></svg>',
  logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
};

const NAV_BY_ROLE = {
  student: ['dashboard', 'attendance', 'announcements', 'profile'],
  teacher: ['dashboard', 'attendance', 'people', 'reports', 'announcements', 'profile'],
  hr: ['dashboard', 'attendance', 'people', 'salary', 'reports', 'announcements', 'profile'],
  md: ['dashboard', 'attendance', 'people', 'salary', 'reports', 'announcements', 'profile'],
};

const NAV_LABEL = {
  dashboard: 'Dashboard', attendance: 'Attendance', people: 'People', salary: 'Salary',
  reports: 'Reports', announcements: 'Announcements', profile: 'Profile',
};

function renderShell(pageKey, pageTitle) {
  const user = Auth.user();
  if (!user) return;

  const items = NAV_BY_ROLE[user.role] || [];
  const navHtml = items.map((key) => `
    <a class="nav-link${key === pageKey ? ' active' : ''}" href="/${key}.html">
      ${ICONS[key]}<span>${NAV_LABEL[key]}</span>
    </a>`).join('');

  document.body.insertAdjacentHTML('afterbegin', `
    <div class="overlay" id="overlay"></div>
    <div class="app-shell">
      <aside class="sidebar" id="sidebar">
        <div class="brand"><span class="mark">HS&nbsp;ERP</span><span class="tag">campus suite</span></div>
        <nav class="nav-group">${navHtml}</nav>
        <div class="sidebar-foot">
          <div class="profile-chip">
            <div class="avatar">${initials(user.name || user.username)}</div>
            <div class="who"><strong>${user.name || user.username}</strong><span>${user.role}</span></div>
          </div>
          <button class="logout-link" onclick="Auth.logout()">${ICONS.logout}<span>Log out</span></button>
        </div>
      </aside>
      <div class="main">
        <header class="topbar">
          <div style="display:flex;align-items:center;gap:12px;">
            <button class="menu-toggle" id="menuToggle">${ICONS.menu}</button>
            <div><div class="eyebrow">HS ERP</div><h1>${pageTitle}</h1></div>
          </div>
          <div class="topbar-right"><span class="role-pill">${user.role}</span></div>
        </header>
        <main class="content" id="pageContent"></main>
      </div>
    </div>
  `);

  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  document.getElementById('menuToggle').addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
  });
  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  });

  return document.getElementById('pageContent');
}
