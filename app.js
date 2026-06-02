// ─── Firebase config ───────────────────────────────────────────────────────
// IMPORTANTE: Reemplaza estos valores con los de tu proyecto Firebase
// Instrucciones en README.md
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDtKXEWtu2z8cPNqX3EvYG7Qe6Ic5hOfzo",
  authDomain: "quiniela-pitaya-tech-2026.firebaseapp.com",
  projectId: "quiniela-pitaya-tech-2026",
  storageBucket: "quiniela-pitaya-tech-2026.firebasestorage.app",
  messagingSenderId: "100399049705",
  appId: "1:100399049705:web:5169f2dfcd4d5995023978"
};

// ─── State ──────────────────────────────────────────────────────────────────
let db;
let state = {
  users: [],
  matches: [],
  picks: {},
  points: { result: 1, exact: 3 },
  currentUser: null,
  editingAs: null
};

const COLORS = ['#3B6D11','#185FA5','#A32D2D','#854F0B','#993556','#3C3489','#0F6E56','#993C1D'];
function colorFor(name) {
  let h = 0;
  for (let c of name) h = (h * 31 + c.charCodeAt(0)) % COLORS.length;
  return COLORS[h];
}
function initials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// ─── Firebase init ──────────────────────────────────────────────────────────
async function initFirebase() {
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js");
  const { getFirestore, doc, getDoc, setDoc, onSnapshot, collection } =
    await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");

  const app = initializeApp(FIREBASE_CONFIG);
  db = getFirestore(app);

  // Live listener — actualiza la UI cuando cambia algo en Firestore
  onSnapshot(doc(db, 'quiniela', 'data'), (snap) => {
    if (snap.exists()) {
      const d = snap.data();
      state.users   = d.users   || [];
      state.matches = d.matches || [];
      state.picks   = d.picks   || {};
      state.points  = d.points  || { result: 1, exact: 3 };
      if (state.currentUser) {
        // Refresh current user object in case admin status changed
        state.currentUser = state.users.find(u => u.id === state.currentUser.id) || state.currentUser;
        if (!state.editingAs || state.editingAs.id === state.currentUser.id) {
          state.editingAs = state.currentUser;
        }
        refreshAll();
      }
    }
    renderLogin();
  });
}

async function saveState() {
  const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
  await setDoc(doc(db, 'quiniela', 'data'), {
    users:   state.users,
    matches: state.matches,
    picks:   state.picks,
    points:  state.points
  });
}

// ─── Login / Logout ──────────────────────────────────────────────────────────
function renderLogin() {
  const sel = document.getElementById('login-select');
  const current = sel.value;
  sel.innerHTML = '<option value="">— Selecciona tu nombre —</option>';
  state.users.forEach(u => {
    const o = document.createElement('option');
    o.value = u.id;
    o.textContent = u.name + (u.isAdmin ? ' (admin)' : '');
    sel.appendChild(o);
  });
  if (current) sel.value = current;
}

function doLogin() {
  const id = document.getElementById('login-select').value;
  if (!id) return;
  const user = state.users.find(u => u.id === id);
  if (!user) return;
  state.currentUser = user;
  state.editingAs = user;
  document.getElementById('screen-login').classList.add('hidden');
  document.getElementById('screen-main').classList.remove('hidden');

  const av = document.getElementById('user-avatar');
  av.textContent = initials(user.name);
  av.style.background = colorFor(user.name) + '30';
  av.style.color = colorFor(user.name);
  document.getElementById('user-name-display').textContent = user.name;

  const adminBadge = document.getElementById('admin-badge');
  const adminTab   = document.getElementById('tab-admin-btn');
  if (user.isAdmin) {
    adminBadge.classList.remove('hidden');
    adminTab.classList.remove('hidden');
  } else {
    adminBadge.classList.add('hidden');
    adminTab.classList.add('hidden');
  }

  document.getElementById('pts-result').value = state.points.result;
  document.getElementById('pts-exact').value   = state.points.exact;
  refreshAll();
}

function doLogout() {
  state.currentUser = null;
  state.editingAs = null;
  document.getElementById('screen-login').classList.remove('hidden');
  document.getElementById('screen-main').classList.add('hidden');
  document.querySelectorAll('.tab').forEach((t, i) => t.classList.toggle('active', i === 0));
  ['tab-quiniela','tab-tabla','tab-stats','tab-admin'].forEach((id, i) => {
    document.getElementById(id).classList.toggle('hidden', i !== 0);
  });
}

function refreshAll() {
  renderMatches();
  renderTabla();
  renderStats();
  renderAdminMatches();
  renderAdminUsers();
  document.getElementById('pts-result').value = state.points.result;
  document.getElementById('pts-exact').value   = state.points.exact;
}

// ─── Tabs ────────────────────────────────────────────────────────────────────
function showTab(id, btn) {
  ['tab-quiniela','tab-tabla','tab-stats','tab-admin'].forEach(t => {
    document.getElementById(t).classList.add('hidden');
  });
  document.getElementById(id).classList.remove('hidden');
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function isLocked(match) {
  return Date.now() >= new Date(match.datetime).getTime() - 60 * 60 * 1000;
}

function calcPoints(userId, match) {
  if (!match.result || match.result.home === '') return 0;
  const pick = state.picks[userId]?.[match.id];
  if (!pick || pick.home === '' || pick.away === '') return 0;
  const rh = parseInt(match.result.home), ra = parseInt(match.result.away);
  const ph = parseInt(pick.home),         pa = parseInt(pick.away);
  if (ph === rh && pa === ra) return state.points.exact;
  const rRes = rh > ra ? 'H' : rh < ra ? 'A' : 'D';
  const pRes = ph > pa ? 'H' : ph < pa ? 'A' : 'D';
  return rRes === pRes ? state.points.result : 0;
}

function getTableData() {
  return state.users.map(u => {
    let pts = 0, exact = 0, result = 0, played = 0;
    state.matches.forEach(m => {
      if (m.result && m.result.home !== '') {
        played++;
        const p = calcPoints(u.id, m);
        pts += p;
        if (p === state.points.exact) exact++;
        else if (p === state.points.result) result++;
      }
    });
    return { user: u, pts, exact, result, played };
  }).sort((a, b) => b.pts - a.pts || b.exact - a.exact);
}

function getStreak(userId) {
  const played = state.matches
    .filter(m => m.result && m.result.home !== '')
    .sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
  let streak = 0;
  for (const m of played) {
    const pts = calcPoints(userId, m);
    if (streak === 0) { streak = pts > 0 ? 1 : -1; continue; }
    if (streak > 0 && pts > 0) streak++;
    else if (streak < 0 && pts === 0) streak--;
    else break;
  }
  return streak;
}

// ─── Render: Matches ─────────────────────────────────────────────────────────
function renderMatches() {
  const container = document.getElementById('matches-list');
  const editUser = state.editingAs;
  if (!editUser) { container.innerHTML = ''; return; }

  if (state.matches.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:3rem;color:var(--text-secondary)">
      <i class="ti ti-calendar-off" style="font-size:28px;display:block;margin-bottom:10px"></i>
      Aún no hay partidos cargados
    </div>`;
    return;
  }

  const phases = [...new Set(state.matches.map(m => m.phase))];
  let html = '';

  phases.forEach(phase => {
    const ms = state.matches.filter(m => m.phase === phase);
    html += `<div class="phase-group"><div class="card"><div class="phase-header">${phase}</div>`;

    ms.forEach(m => {
      const locked = isLocked(m);
      const pick = state.picks[editUser.id]?.[m.id] || { home: '', away: '' };
      const resultKnown = m.result && m.result.home !== '' && m.result.away !== '';

      let statusBadge = '';
      if (resultKnown) {
        const pts = calcPoints(editUser.id, m);
        if (pts === state.points.exact)
          statusBadge = `<span class="badge badge-success">+${pts} exacto ✓</span>`;
        else if (pts === state.points.result)
          statusBadge = `<span class="badge badge-info">+${pts} resultado</span>`;
        else if (pick.home !== '' || pick.away !== '')
          statusBadge = `<span class="badge badge-gray">+0</span>`;
      }

      const dt = new Date(m.datetime);
      const dtStr = dt.toLocaleDateString('es', { weekday: 'short', month: 'short', day: 'numeric' })
        + ' ' + dt.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });

      const inputsOrPick = locked || resultKnown
        ? `<span style="font-size:14px;font-weight:600;min-width:64px;text-align:center;color:var(--text-secondary)">
             ${pick.home !== '' ? pick.home + ' – ' + pick.away : '– –'}
           </span>`
        : `<input type="number" min="0" max="20" class="score-input" value="${pick.home}"
             placeholder="0" onchange="setPick('${editUser.id}','${m.id}','home',this.value)">
           <span class="score-sep">–</span>
           <input type="number" min="0" max="20" class="score-input" value="${pick.away}"
             placeholder="0" onchange="setPick('${editUser.id}','${m.id}','away',this.value)">`;

      html += `<div class="match-row">
        <div class="match-teams">
          <div class="match-teams-row">
            <span class="team-name right">${m.home}</span>
            ${inputsOrPick}
            <span class="team-name">${m.away}</span>
          </div>
          <div class="match-meta">
            <span>${dtStr}</span>
            ${locked ? `<span class="badge badge-warning"><i class="ti ti-lock"></i> bloqueado</span>` : ''}
            ${resultKnown ? `<span class="badge badge-gray">${m.result.home}–${m.result.away}</span>` : ''}
            ${statusBadge}
          </div>
        </div>
      </div>`;
    });

    html += '</div></div>';
  });

  container.innerHTML = html;
}

async function setPick(userId, matchId, side, val) {
  if (!state.picks[userId]) state.picks[userId] = {};
  if (!state.picks[userId][matchId]) state.picks[userId][matchId] = { home: '', away: '' };
  state.picks[userId][matchId][side] = val === '' ? '' : parseInt(val);
  await saveState();
}

// ─── Render: Tabla ───────────────────────────────────────────────────────────
function renderTabla() {
  const data = getTableData();
  const totalPlayed = state.matches.filter(m => m.result && m.result.home !== '').length;

  document.getElementById('tabla-stats').innerHTML = `
    <div class="stat-card"><div class="stat-label">Partidos jugados</div><div class="stat-value">${totalPlayed}</div></div>
    <div class="stat-card"><div class="stat-label">Partidos totales</div><div class="stat-value">${state.matches.length}</div></div>
    <div class="stat-card"><div class="stat-label">Participantes</div><div class="stat-value">${state.users.length}</div></div>
    <div class="stat-card"><div class="stat-label">Pts por exacto</div><div class="stat-value">${state.points.exact}</div></div>
  `;

  const medals = ['🥇', '🥈', '🥉'];
  document.getElementById('tabla-body').innerHTML = data.map((d, i) => {
    const color = colorFor(d.user.name);
    return `<tr>
      <td><span class="pos-num" style="background:${color}22;color:${color}">${medals[i] || i + 1}</span></td>
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          <div class="avatar" style="width:28px;height:28px;font-size:11px;background:${color}30;color:${color}">${initials(d.user.name)}</div>
          <span style="font-weight:500">${d.user.name}</span>
          ${d.user.isAdmin ? '<span class="badge badge-gray" style="font-size:10px">admin</span>' : ''}
        </div>
      </td>
      <td class="text-right"><strong style="font-size:16px">${d.pts}</strong></td>
      <td class="text-right"><span class="badge badge-success">${d.exact}</span></td>
      <td class="text-right"><span class="badge badge-info">${d.result}</span></td>
      <td class="text-right" style="color:var(--text-secondary)">${d.played}</td>
    </tr>`;
  }).join('');
}

// ─── Render: Stats ───────────────────────────────────────────────────────────
function renderStats() {
  const data = getTableData();

  document.getElementById('stats-body').innerHTML = data.map(d => {
    const total = d.played;
    const pctExact  = total > 0 ? Math.round(d.exact / total * 100) : 0;
    const pctResult = total > 0 ? Math.round((d.exact + d.result) / total * 100) : 0;
    const streak = getStreak(d.user.id);
    const color = colorFor(d.user.name);
    return `<tr>
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          <div class="avatar" style="width:26px;height:26px;font-size:10px;background:${color}30;color:${color}">${initials(d.user.name)}</div>
          ${d.user.name}
        </div>
      </td>
      <td class="text-right"><strong>${pctExact}%</strong></td>
      <td class="text-right">${pctResult}%</td>
      <td class="text-right">
        ${streak > 0
          ? `<span class="badge badge-success">🔥 ${streak}</span>`
          : streak < 0
          ? `<span class="badge badge-danger">${streak}</span>`
          : `<span class="badge badge-gray">—</span>`}
      </td>
    </tr>`;
  }).join('');

  const played = state.matches.filter(m => m.result && m.result.home !== '');
  if (played.length === 0) {
    document.getElementById('all-picks-container').innerHTML =
      '<p style="font-size:13px;color:var(--text-secondary);padding:1rem 0">Aún no hay partidos con resultado.</p>';
    return;
  }

  let html = '<div class="table-wrapper"><table><thead><tr><th>Partido</th><th>Real</th>';
  state.users.forEach(u => html += `<th style="text-align:center">${initials(u.name)}</th>`);
  html += '</tr></thead><tbody>';

  played.forEach(m => {
    html += `<tr>
      <td style="font-size:12px;white-space:nowrap">${m.home} vs ${m.away}</td>
      <td><span class="badge badge-gray">${m.result.home}–${m.result.away}</span></td>`;
    state.users.forEach(u => {
      const pick = state.picks[u.id]?.[m.id];
      const pts = calcPoints(u.id, m);
      const pickStr = pick && pick.home !== '' ? `${pick.home}–${pick.away}` : '–';
      const cls = pts === state.points.exact ? 'badge-success'
                : pts === state.points.result ? 'badge-info' : 'badge-gray';
      html += `<td style="text-align:center"><span class="badge ${cls}">${pickStr}</span></td>`;
    });
    html += '</tr>';
  });

  html += '</tbody></table></div>';
  document.getElementById('all-picks-container').innerHTML = html;
}

// ─── Render: Admin Matches ───────────────────────────────────────────────────
function renderAdminMatches() {
  const container = document.getElementById('admin-matches-list');
  if (state.matches.length === 0) {
    container.innerHTML = '<p style="font-size:13px;color:var(--text-secondary)">No hay partidos aún.</p>';
    return;
  }

  container.innerHTML = state.matches.map(m => {
    const dt = new Date(m.datetime);
    const dtStr = dt.toLocaleDateString('es', { day: 'numeric', month: 'short' })
      + ' ' + dt.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
    const hasResult = m.result && m.result.home !== '';

    return `<div class="admin-match-row">
      <span style="font-size:13px;flex:1;min-width:160px">
        <strong>${m.home}</strong> vs <strong>${m.away}</strong><br>
        <span style="color:var(--text-secondary);font-size:11px">${dtStr} · ${m.phase}</span>
      </span>
      <input type="number" min="0" max="20" placeholder="L" value="${hasResult ? m.result.home : ''}"
        id="res-h-${m.id}" class="score-input">
      <span class="score-sep">–</span>
      <input type="number" min="0" max="20" placeholder="V" value="${hasResult ? m.result.away : ''}"
        id="res-a-${m.id}" class="score-input">
      <button class="btn btn-sm btn-primary" onclick="saveResult('${m.id}')">
        <i class="ti ti-check"></i>
      </button>
      <button class="btn btn-sm btn-danger" onclick="deleteMatch('${m.id}')">
        <i class="ti ti-trash"></i>
      </button>
    </div>`;
  }).join('');
}

async function saveResult(matchId) {
  const h = document.getElementById('res-h-' + matchId).value;
  const a = document.getElementById('res-a-' + matchId).value;
  const m = state.matches.find(x => x.id === matchId);
  if (!m) return;
  m.result = { home: h, away: a };
  await saveState();
}

async function deleteMatch(matchId) {
  if (!confirm('¿Eliminar este partido?')) return;
  state.matches = state.matches.filter(m => m.id !== matchId);
  await saveState();
}

async function addMatch() {
  const home = document.getElementById('m-home').value.trim();
  const away = document.getElementById('m-away').value.trim();
  const datetime = document.getElementById('m-date').value;
  const phase = document.getElementById('m-phase').value;
  if (!home || !away || !datetime) { alert('Completa todos los campos del partido'); return; }
  state.matches.push({ id: 'm' + Date.now(), home, away, datetime, phase, result: { home: '', away: '' } });
  document.getElementById('m-home').value = '';
  document.getElementById('m-away').value = '';
  document.getElementById('m-date').value = '';
  await saveState();
}

// ─── Render: Admin Users ─────────────────────────────────────────────────────
function renderAdminUsers() {
  document.getElementById('admin-users-body').innerHTML = state.users.map(u => `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          <div class="avatar" style="width:26px;height:26px;font-size:10px;background:${colorFor(u.name)}30;color:${colorFor(u.name)}">${initials(u.name)}</div>
          ${u.name}
        </div>
      </td>
      <td>${u.isAdmin ? '<span class="badge badge-warning">admin</span>' : '<span class="badge badge-gray">jugador</span>'}</td>
      <td>
        <button class="btn btn-sm" onclick="editPicksFor('${u.id}')">
          <i class="ti ti-edit"></i> Editar
        </button>
      </td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="deleteUser('${u.id}')">
          <i class="ti ti-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

async function addUser() {
  const name = document.getElementById('new-user-name').value.trim();
  if (!name) return;
  const isAdmin = document.getElementById('new-user-admin').checked;
  state.users.push({ id: 'u' + Date.now(), name, isAdmin });
  document.getElementById('new-user-name').value = '';
  document.getElementById('new-user-admin').checked = false;
  await saveState();
}

async function deleteUser(userId) {
  if (!confirm('¿Eliminar este usuario?')) return;
  state.users = state.users.filter(u => u.id !== userId);
  await saveState();
}

async function savePoints() {
  state.points.result = parseInt(document.getElementById('pts-result').value) || 1;
  state.points.exact  = parseInt(document.getElementById('pts-exact').value)  || 3;
  await saveState();
}

function editPicksFor(userId) {
  const user = state.users.find(u => u.id === userId);
  if (!user) return;
  state.editingAs = user;
  document.getElementById('quiniela-info').innerHTML =
    `<i class="ti ti-edit"></i> Editando quiniela de <strong>${user.name}</strong>. 
     <a href="#" onclick="resetEditAs(event)" style="color:inherit;font-weight:500">← Volver a la mía</a>`;
  showTab('tab-quiniela', document.querySelectorAll('.tab')[0]);
  document.querySelectorAll('.tab').forEach((t, i) => t.classList.toggle('active', i === 0));
  renderMatches();
}

function resetEditAs(e) {
  if (e) e.preventDefault();
  state.editingAs = state.currentUser;
  document.getElementById('quiniela-info').innerHTML =
    '<i class="ti ti-info-circle"></i> Puedes editar tu quiniela hasta 1 hora antes de cada partido.';
  renderMatches();
}

// ─── Boot ────────────────────────────────────────────────────────────────────
initFirebase().catch(err => {
  console.error('Firebase error:', err);
  document.body.innerHTML = `<div style="padding:2rem;font-family:sans-serif;color:#a32d2d">
    <h2>Error de configuración</h2>
    <p>Asegúrate de haber reemplazado los valores de Firebase en <code>app.js</code>. Ver <code>README.md</code>.</p>
  </div>`;
});
