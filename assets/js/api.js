/* Session + API helper, shared by every page. */
const Auth = {
  TOKEN_KEY: 'hs_erp_token',
  USER_KEY: 'hs_erp_user',

  save(token, user) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  },
  token() { return localStorage.getItem(this.TOKEN_KEY); },
  user() {
    try { return JSON.parse(localStorage.getItem(this.USER_KEY)); }
    catch { return null; }
  },
  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    window.location.href = '/index.html';
  },
  // Call at the top of every protected page. Redirects to login if not
  // authenticated, and optionally restricts the page to a set of roles.
  requireAuth(allowedRoles) {
    const user = this.user();
    const token = this.token();
    if (!user || !token) {
      window.location.href = '/index.html';
      return null;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      window.location.href = '/dashboard.html';
      return null;
    }
    return user;
  },
};

// Thin fetch wrapper: attaches the auth token, parses JSON, and bounces to
// login on a 401 (expired/invalid token) instead of failing silently.
async function api(path, options = {}) {
  const headers = Object.assign(
    { 'Content-Type': 'application/json' },
    options.headers || {}
  );
  const token = Auth.token();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(path, { ...options, headers });

  if (res.status === 401) {
    Auth.logout();
    throw new Error('Session expired');
  }

  let body = null;
  const text = await res.text();
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }

  if (!res.ok) {
    const message = (body && body.message) || 'Something went wrong';
    throw new Error(message);
  }
  return body;
}

function toast(message, type = 'ok') {
  document.querySelectorAll('.toast').forEach((t) => t.remove());
  const el = document.createElement('div');
  el.className = `toast${type === 'error' ? ' error' : ''}`;
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

function initials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
}

function formatDate(d) {
  return new Date(d).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}
