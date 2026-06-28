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


// ─── API-Football config ─────────────────────────────────────────────────────
// Registrate gratis en https://dashboard.api-football.com/register
// y pega tu API key aqui:
const API_FOOTBALL_KEY = "9999ebd705992251ae7de01915a6deac"; // <-- pega tu key aqui

// ─── State ──────────────────────────────────────────────────────────────────
let db;
let state = {
  users: [],
  matches: [],
  picks: {},
  points: { exact: 5, result: 2 },
  currentUser: null,
  editingAs: null
};

const COLORS = ['#3B6D11','#185FA5','#A32D2D','#854F0B','#993556','#3C3489','#0F6E56','#993C1D'];

// ─── Banderas de países (emoji via código ISO 3166-1 alpha-2) ────────────────
const COUNTRY_FLAGS = {
  // Grupo A-Z y equipos del Mundial 2026
  'Mexico': 'MX', 'México': 'MX',
  'USA': 'US', 'United States': 'US', 'Estados Unidos': 'US',
  'Canada': 'CA', 'Canadá': 'CA',
  'Brazil': 'BR', 'Brasil': 'BR',
  'Argentina': 'AR',
  'Colombia': 'CO',
  'Ecuador': 'EC',
  'Uruguay': 'UY',
  'Chile': 'CL',
  'Paraguay': 'PY',
  'Peru': 'PE', 'Perú': 'PE',
  'Bolivia': 'BO',
  'Venezuela': 'VE',
  'Spain': 'ES', 'España': 'ES',
  'France': 'FR', 'Francia': 'FR',
  'Germany': 'DE', 'Alemania': 'DE',
  'England': 'GB', 'Inglaterra': 'GB',
  'Portugal': 'PT',
  'Netherlands': 'NL', 'Países Bajos': 'NL', 'Holanda': 'NL',
  'Belgium': 'BE', 'Bélgica': 'BE',
  'Italy': 'IT', 'Italia': 'IT',
  'Croatia': 'HR', 'Croacia': 'HR',
  'Denmark': 'DK', 'Dinamarca': 'DK',
  'Switzerland': 'CH', 'Suiza': 'CH',
  'Austria': 'AT',
  'Serbia': 'RS',
  'Poland': 'PL', 'Polonia': 'PL',
  'Ukraine': 'UA', 'Ucrania': 'UA',
  'Hungary': 'HU', 'Hungría': 'HU',
  'Slovakia': 'SK', 'Eslovaquia': 'SK',
  'Slovenia': 'SI', 'Eslovenia': 'SI',
  'Romania': 'RO', 'Rumanía': 'RO',
  'Czechia': 'CZ', 'Czech Republic': 'CZ', 'República Checa': 'CZ',
  'Scotland': 'GB', 'Escocia': 'GB',
  'Wales': 'GB', 'Gales': 'GB',
  'Turkey': 'TR', 'Turquía': 'TR',
  'Greece': 'GR', 'Grecia': 'GR',
  'Morocco': 'MA', 'Marruecos': 'MA',
  'Senegal': 'SN',
  'Nigeria': 'NG',
  'Ghana': 'GH',
  'Ivory Coast': 'CI', 'Côte d\'Ivoire': 'CI', 'Costa de Marfil': 'CI',
  'Egypt': 'EG', 'Egipto': 'EG',
  'Cameroon': 'CM', 'Camerún': 'CM',
  'Tunisia': 'TN', 'Túnez': 'TN',
  'Algeria': 'DZ', 'Argelia': 'DZ',
  'Mali': 'ML',
  'South Africa': 'ZA', 'Sudáfrica': 'ZA',
  'DR Congo': 'CD', 'Congo': 'CD',
  'Japan': 'JP', 'Japón': 'JP',
  'South Korea': 'KR', 'Corea del Sur': 'KR', 'Korea Republic': 'KR',
  'Australia': 'AU',
  'Iran': 'IR', 'Irán': 'IR',
  'Saudi Arabia': 'SA', 'Arabia Saudita': 'SA',
  'Qatar': 'QA',
  'Iraq': 'IQ',
  'Jordan': 'JO', 'Jordania': 'JO',
  'Uzbekistan': 'UZ', 'Uzbekistán': 'UZ',
  'China': 'CN',
  'Indonesia': 'ID',
  'New Zealand': 'NZ', 'Nueva Zelanda': 'NZ',
  'Costa Rica': 'CR',
  'Panama': 'PA', 'Panamá': 'PA',
  'Honduras': 'HN',
  'Guatemala': 'GT',
  'Jamaica': 'JM',
  'Trinidad and Tobago': 'TT',
  'Cuba': 'CU',
  'Haiti': 'HT', 'Haití': 'HT',
  'El Salvador': 'SV',
  'Nicaragua': 'NI',
};

function countryFlag(teamName) {
  if (!teamName) return '';
  // Buscar directamente
  const iso = COUNTRY_FLAGS[teamName];
  if (iso) {
    // Convertir código ISO a emoji de bandera
    return iso.toUpperCase().split('').map(c => String.fromCodePoint(0x1F1E0 + c.charCodeAt(0) - 65)).join('');
  }
  // Buscar ignorando mayúsculas/minúsculas y coincidencias parciales
  const key = Object.keys(COUNTRY_FLAGS).find(k =>
    k.toLowerCase() === teamName.toLowerCase() ||
    teamName.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(teamName.toLowerCase())
  );
  if (key) {
    const iso2 = COUNTRY_FLAGS[key];
    return iso2.toUpperCase().split('').map(c => String.fromCodePoint(0x1F1E0 + c.charCodeAt(0) - 65)).join('');
  }
  return '';
}

// ─── Banderas (imagen, estilo Villasol) ───────────────────────────────────────
// Nombres tal como vienen de openfootball → código ISO para flagcdn.com
const TEAM_FLAGS = {
  'Algeria':'dz','Argentina':'ar','Australia':'au','Austria':'at','Belgium':'be',
  'Bosnia & Herzegovina':'ba','Brazil':'br','Canada':'ca','Cape Verde':'cv',
  'Colombia':'co','Croatia':'hr','Curaçao':'cw','Czech Republic':'cz',
  'DR Congo':'cd','Ecuador':'ec','Egypt':'eg','England':'gb-eng','France':'fr',
  'Germany':'de','Ghana':'gh','Haiti':'ht','Iran':'ir','Iraq':'iq',
  'Ivory Coast':'ci','Japan':'jp','Jordan':'jo','Mexico':'mx','Morocco':'ma',
  'Netherlands':'nl','New Zealand':'nz','Norway':'no','Panama':'pa',
  'Paraguay':'py','Portugal':'pt','Qatar':'qa','Saudi Arabia':'sa',
  'Scotland':'gb-sct','Senegal':'sn','South Africa':'za','South Korea':'kr',
  'Spain':'es','Sweden':'se','Switzerland':'ch','Tunisia':'tn','Turkey':'tr',
  'USA':'us','Uruguay':'uy','Uzbekistan':'uz'
};
function flagImg(team, cls = 'flag') {
  const c = TEAM_FLAGS[team];
  const w = cls === 'flag' ? 'w40' : 'w80';
  return c
    ? `<img class="${cls}" src="https://flagcdn.com/${w}/${c}.png" alt="" loading="lazy">`
    : `<span class="${cls} flag-tbd"><i class="ti ti-star"></i></span>`;
}

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
      state.points  = d.points  || { exact: 5, result: 2 };
      // Compatibilidad con datos guardados anteriormente
      if (state.points.result === undefined) state.points.result = 2;
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

function pinNext(el, nextIdx) {
  if (el.value.length === 1 && nextIdx !== null) {
    document.getElementById("pin-" + nextIdx).focus();
  }
}
function pinBack(e, el, prevIdx) {
  if (e.key === "Backspace" && el.value === "" && prevIdx !== null) {
    document.getElementById("pin-" + prevIdx).focus();
  }
}
function getPin() {
  return [0,1,2,3].map(i => document.getElementById("pin-"+i).value).join("");
}
function clearPin() {
  [0,1,2,3].forEach(i => { document.getElementById("pin-"+i).value = ""; });
  document.getElementById("pin-0").focus();
}

function doLogin() {
  const id = document.getElementById('login-select').value;
  if (!id) { alert('Selecciona tu nombre'); return; }
  const user = state.users.find(u => u.id === id);
  if (!user) return;

  const pin = getPin();
  if (pin.length < 4) { alert('Ingresa tu PIN de 4 digitos'); return; }
  if (user.pin && user.pin !== pin) {
    document.getElementById('pin-error').classList.remove('hidden');
    [0,1,2,3].forEach(i => document.getElementById('pin-'+i).classList.add('error'));
    clearPin();
    return;
  }
  document.getElementById('pin-error').classList.add('hidden');
  [0,1,2,3].forEach(i => document.getElementById('pin-'+i).classList.remove('error'));

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

  const elExact2  = document.getElementById('pts-exact');
  const elResult2 = document.getElementById('pts-result');
  if (elExact2)  elExact2.value  = state.points.exact;
  if (elResult2) elResult2.value = state.points.result;
  refreshAll();
}

function doLogout() {
  state.currentUser = null;
  state.editingAs = null;
  clearPin();
  document.getElementById('screen-login').classList.remove('hidden');
  document.getElementById('screen-main').classList.add('hidden');
  document.querySelectorAll('.tab').forEach((t, i) => t.classList.toggle('active', i === 0));
  ['tab-quiniela','tab-tabla','tab-stats','tab-admin'].forEach((id, i) => {
    document.getElementById(id).classList.toggle('hidden', i !== 0);
  });
}

function refreshAll() {
  renderMyStats();
  renderMatches();
  renderTabla();
  renderStats();
  renderComparar();
  renderAdminMatches();
  renderAdminUsers();
  const elExact  = document.getElementById('pts-exact');
  const elResult = document.getElementById('pts-result');
  if (elExact)  elExact.value  = state.points.exact;
  if (elResult) elResult.value = state.points.result;
}

// ─── Tabs ────────────────────────────────────────────────────────────────────
function showTab(id, btn) {
  ['tab-quiniela','tab-tabla','tab-stats','tab-comparar','tab-admin'].forEach(t => {
    document.getElementById(t).classList.add('hidden');
  });
  document.getElementById(id).classList.remove('hidden');
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  if (id === 'tab-comparar') renderComparar();
}
function toggleCmpCard(id)  { document.getElementById('cmpc-' + id)?.classList.toggle('open'); }
function toggleCmpGroup(key) { document.getElementById('cmpg-' + key)?.classList.toggle('open'); }

// Llena el selector de días de Comparar (autoselecciona hoy)
function populateCmpDates() {
  const sel = document.getElementById('cmp-date-filter');
  if (!sel) return;
  const today = getTodayGuatemala();
  const dates = [...new Set(
    state.matches.map(m => m.datetime ? m.datetime.slice(0,10) : null).filter(Boolean)
  )].sort();
  const current = sel.value;
  sel.innerHTML = '<option value="all">Todos los partidos</option>';
  dates.forEach(d => {
    const o = document.createElement('option');
    o.value = d;
    o.textContent = (d === today ? '\u{1F4C5} Hoy \u2014 ' : '') + formatDayLabel(d);
    sel.appendChild(o);
  });
  if (current && current !== 'all') sel.value = current;
  else if (dates.includes(today)) sel.value = today;
}
function stepCmpDay(dir) {
  const sel = document.getElementById('cmp-date-filter');
  if (!sel) return;
  const opts = [...sel.options].map(o => o.value);
  const i = Math.max(0, Math.min(opts.length - 1, opts.indexOf(sel.value) + dir));
  sel.value = opts[i];
  renderComparar();
}


// ─── Pick value helpers (0 is a valid score!) ────────────────────────────────
function hasVal(v) { return v !== '' && v !== null && v !== undefined; }
// A pick is "set" if at least one side has a value — the other defaults to 0
function pickSet(pick) {
  if (!pick) return false;
  return hasVal(pick.home) || hasVal(pick.away);
}
// Normalize pick: if one side is empty, treat it as 0
function normPick(pick) {
  if (!pick) return { home: 0, away: 0 };
  return {
    home: hasVal(pick.home) ? pick.home : 0,
    away: hasVal(pick.away) ? pick.away : 0
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function isLocked(match) {
  return Date.now() >= new Date(match.datetime).getTime() - 60 * 60 * 1000;
}

// "En vivo": desde la hora de inicio y durante las 2h típicas de un partido.
// El marcador parcial no cancela el estado EN VIVO; solo lo cancela si el
// admin marcó el partido como finalizado (m.finished === true).
function isLive(match) {
  if (!match.datetime) return false;
  if (match.finished) return false;            // admin marcó como terminado
  const start = new Date(match.datetime).getTime();
  const now = Date.now();
  return now >= start && now < start + 2 * 60 * 60 * 1000;
}

// Un partido muestra resultado "Final" solo si ya terminó la ventana EN VIVO
// O si el admin lo marcó como finalizado explícitamente.
function isFinished(match) {
  if (match.finished) return true;
  if (!match.datetime) return false;
  const start = new Date(match.datetime).getTime();
  return Date.now() >= start + 2 * 60 * 60 * 1000;
}

// Ganador por penales en un empate: 'H' | 'A' | null (si no hay penales o están empatados)
function penWinner(result) {
  if (!result || !hasVal(result.penHome) || !hasVal(result.penAway)) return null;
  const ph = parseInt(result.penHome), pa = parseInt(result.penAway);
  if (ph === pa) return null;
  return ph > pa ? 'H' : 'A';
}

function calcPoints(userId, match, { includeLive = false } = {}) {
  if (!match.result || match.result.home === '') return 0;
  const finished = isFinished(match);
  const live = isLive(match);
  // Si no está finalizado y no queremos incluir partidos en vivo, retornar 0
  if (!finished && !(includeLive && live)) return 0;
  const pick = state.picks[userId]?.[match.id];
  if (!pickSet(pick)) return 0;
  const np = normPick(pick);
  const rh = parseInt(match.result.home), ra = parseInt(match.result.away);
  const ph = parseInt(np.home), pa = parseInt(np.away);

  // Marcador exacto de ambos equipos: 5 pts (sin bonos)
  if (ph === rh && pa === ra) return state.points.exact;

  // Ganador correcto: 2 pts base
  let rRes = rh > ra ? 'H' : rh < ra ? 'A' : 'D';
  // Empate definido por penales: el ganador de penales es el ganador efectivo
  if (rRes === 'D') rRes = penWinner(match.result) || 'D';
  const pRes = ph > pa ? 'H' : ph < pa ? 'A' : 'D';
  let pts = rRes === pRes ? state.points.result : 0;

  // Bonos (solo aplican cuando NO se acertó el marcador exacto)
  // +1 si acertaste la diferencia de goles
  if ((ph - pa) === (rh - ra)) pts += 1;
  // +1 si acertaste el marcador de al menos un equipo
  if (ph === rh || pa === ra) pts += 1;

  return pts;
}

function getTableData() {
  return state.users.map(u => {
    let pts = 0, exact = 0, winner = 0, played = 0;
    state.matches.forEach(m => {
      const finished = isFinished(m);
      const live = isLive(m);
      if (m.result && m.result.home !== '' && (finished || live)) {
        played++;
        const p = calcPoints(u.id, m, { includeLive: true });
        pts += p;
        if (p === state.points.exact) exact++;
        else if (p > 0) winner++;
      }
    });
    return { user: u, pts, exact, winner, played };
  }).sort((a, b) => b.pts - a.pts || b.exact - a.exact);
}

function getStreak(userId) {
  const played = state.matches
    .filter(m => m.result && m.result.home !== '' && (isFinished(m) || isLive(m)))
    .sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
  let streak = 0;
  for (const m of played) {
    const pts = calcPoints(userId, m, { includeLive: true });
    if (streak === 0) { streak = pts > 0 ? 1 : -1; continue; }
    if (streak > 0 && pts > 0) streak++;
    else if (streak < 0 && pts === 0) streak--;
    else break;
  }
  return streak;
}


// ─── Render: My Stats (top of quiniela tab) ──────────────────────────────────
function renderMyStats() {
  const grid = document.getElementById('my-stats-grid');
  if (!grid || !state.currentUser) return;
  const u = state.currentUser;
  let pts = 0, exact = 0, winner = 0, played = 0, pending = 0;
  state.matches.forEach(m => {
    const mFinished = isFinished(m);
    const mLive = isLive(m);
    if (m.result && m.result.home !== '' && (mFinished || mLive)) {
      played++;
      const p = calcPoints(u.id, m, { includeLive: true });
      pts += p;
      if (p === state.points.exact) exact++;
      else if (p > 0) winner++;
    } else {
      pending++;
    }
  });
  const color = colorFor(u.name);
  grid.innerHTML = `
    <div class="stat-card" style="border-left:3px solid ${color}">
      <div class="stat-label">Mis puntos</div>
      <div class="stat-value" style="color:${color}">${pts}</div>
    </div>
    <div class="stat-card" style="border-left:3px solid var(--success-text)">
      <div class="stat-label">Marcador exacto</div>
      <div class="stat-value" style="color:var(--success-text)">${exact}</div>
    </div>
    <div class="stat-card" style="border-left:3px solid var(--info, #3b82f6)">
      <div class="stat-label">Ganador acertado</div>
      <div class="stat-value" style="color:var(--info, #3b82f6)">${winner}</div>
    </div>
    <div class="stat-card" style="border-left:3px solid var(--text-secondary)">
      <div class="stat-label">Por jugar</div>
      <div class="stat-value">${pending}</div>
    </div>
  `;
}

// ─── Date filter helpers ──────────────────────────────────────────────────────

// Retorna la fecha de hoy en zona horaria de Guatemala (UTC-6) como "YYYY-MM-DD"
function getTodayGuatemala() {
  const now = new Date();
  // Guatemala es UTC-6 (sin cambio de horario de verano)
  const offset = -6 * 60; // minutos
  const local = new Date(now.getTime() + (offset - now.getTimezoneOffset()) * 60000);
  return local.toISOString().slice(0, 10);
}

function populateDateFilter() {
  const sel = document.getElementById('date-filter');
  if (!sel) return;
  const current = sel.value;
  const today = getTodayGuatemala();
  // Get unique dates
  const dates = [...new Set(
    state.matches.map(m => m.datetime ? m.datetime.slice(0,10) : null).filter(Boolean)
  )].sort();
  sel.innerHTML = '<option value="all">Todos los partidos</option>';
  dates.forEach(d => {
    const dt = new Date(d + 'T12:00:00');
    const label = dt.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });
    const o = document.createElement('option');
    o.value = d;
    o.textContent = (d === today ? '📅 Hoy — ' : '') + label.charAt(0).toUpperCase() + label.slice(1);
    sel.appendChild(o);
  });
  // Si el usuario ya eligió una fecha específica, mantenerla; si no, auto-seleccionar hoy
  if (current && current !== 'all') {
    sel.value = current;
  } else if (!current || current === 'all') {
    if (dates.includes(today)) sel.value = today;
  }
}

function formatDayLabel(d) {
  const dt = new Date(d + 'T12:00:00');
  const s = dt.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}
// Mueve la selección entre días disponibles (‹ ›) en Mi quiniela
function stepDay(dir) {
  const sel = document.getElementById('date-filter');
  if (!sel) return;
  const opts = [...sel.options].map(o => o.value);
  const i = Math.max(0, Math.min(opts.length - 1, opts.indexOf(sel.value) + dir));
  sel.value = opts[i];
  renderMatches();
}

// ─── Render: Matches ─────────────────────────────────────────────────────────
function renderMatches() {
  const container = document.getElementById('matches-list');
  const editUser = state.editingAs;
  if (!editUser) { container.innerHTML = ''; return; }

  renderMyStats();
  populateDateFilter();

  const dateFilter = document.getElementById('date-filter')?.value || 'all';

  if (state.matches.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:3rem;color:var(--text-secondary)">
      <i class="ti ti-calendar-off" style="font-size:28px;display:block;margin-bottom:10px"></i>
      Aún no hay partidos cargados
    </div>`;
    return;
  }

  let filteredMatches = [...state.matches];
  if (dateFilter !== 'all') {
    filteredMatches = filteredMatches.filter(m => m.datetime && m.datetime.slice(0,10) === dateFilter);
  }

  if (filteredMatches.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:2rem;color:var(--text-secondary);font-size:14px">
      No hay partidos para esta fecha.
    </div>`;
    return;
  }

  const dayLabel = dateFilter === 'all' ? 'Todos los partidos' : formatDayLabel(dateFilter);
  const phases = [...new Set(filteredMatches.map(m => m.phase))];
  let html = '';

  phases.forEach(phase => {
    const ms = filteredMatches.filter(m => m.phase === phase);
    html += `<div class="mq-board">
      <div class="mq-board-head">
        <span class="mq-phase">${phase}</span>
        <span class="mq-day">${dayLabel}</span>
      </div>`;

    ms.forEach(m => {
      const locked = isLocked(m);
      const live = isLive(m);
      const finished = isFinished(m);
      const hasResult = m.result && m.result.home !== '' && m.result.away !== '';
      // "resultKnown" para puntos: cuando el partido terminó o está en vivo con resultado
      const resultKnown = hasResult && finished;
      const resultLive  = hasResult && live && !finished;
      const pick = state.picks[editUser.id]?.[m.id] || { home: '', away: '' };
      const np = normPick(pick);

      let statusBadge = '';
      if (resultKnown) {
        const pts = calcPoints(editUser.id, m);
        if (pts === state.points.exact)
          statusBadge = `<span class="badge badge-success">+${pts} exacto ✓</span>`;
        else if (pts > 0)
          statusBadge = `<span class="badge badge-purple">+${pts}</span>`;
        else if (pickSet(pick))
          statusBadge = `<span class="badge badge-gray">+0</span>`;
      } else if (resultLive && pickSet(pick)) {
        // Puntos tentativos mientras el partido está en vivo
        const pts = calcPoints(editUser.id, m, { includeLive: true });
        if (pts === state.points.exact)
          statusBadge = `<span class="badge badge-success" style="opacity:.7" title="Tentativo, pendiente de finalizar">~+${pts} exacto</span>`;
        else if (pts > 0)
          statusBadge = `<span class="badge badge-purple" style="opacity:.7" title="Tentativo, pendiente de finalizar">~+${pts}</span>`;
        else
          statusBadge = `<span class="badge badge-gray" style="opacity:.7" title="Tentativo, pendiente de finalizar">~+0</span>`;
      }

      const timeStr = new Date(m.datetime).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });

      const center = locked || hasResult
        ? `<div class="mq-final">${pickSet(pick) ? `${np.home}<span>–</span>${np.away}` : `<span style="opacity:.5">– –</span>`}</div>`
        : `<div class="mq-inputs">
             <input type="number" min="0" max="20" class="score-input" value="${pick.home}" placeholder="0"
               onfocus="this.select()" onchange="setPick('${editUser.id}','${m.id}','home',this.value)">
             <span class="score-sep">–</span>
             <input type="number" min="0" max="20" class="score-input" value="${pick.away}" placeholder="0"
               onfocus="this.select()" onchange="setPick('${editUser.id}','${m.id}','away',this.value)">
           </div>`;

      // Marcador parcial en vivo (hay resultado pero aún en ventana de 2h)
      const liveScore = live && hasResult
        ? `<span class="badge badge-live-score">${m.result.home}–${m.result.away}</span>`
        : '';

      // Goleadores
      const hasGoals = hasResult && ((m.goals1 && m.goals1.length) || (m.goals2 && m.goals2.length));
      const scorersHtml = hasGoals ? (() => {
        const homeGoals = (m.goals1 || []).map(g => `<span class="scorer-item">${g.name} <span class="scorer-min">${g.minute}'</span></span>`).join('');
        const awayGoals = (m.goals2 || []).map(g => `<span class="scorer-item">${g.name} <span class="scorer-min">${g.minute}'</span></span>`).join('');
        return `<div class="mq-scorers">
          <div class="scorers-col scorers-home">${homeGoals}</div>
          <div class="scorers-icon"><i class="ti ti-ball-football"></i></div>
          <div class="scorers-col scorers-away">${awayGoals}</div>
        </div>`;
      })() : '';

      html += `<div class="mq-card${live ? ' card-live' : ''}">
        <div class="mq-fixture">
          <div class="mq-team">${flagImg(m.home, 'flag-lg')}<span class="mq-name">${m.home}</span></div>
          ${center}
          <div class="mq-team">${flagImg(m.away, 'flag-lg')}<span class="mq-name">${m.away}</span></div>
        </div>
        <div class="mq-foot">
          <span class="mq-time"><i class="ti ti-clock"></i> ${timeStr}</span>
          ${live ? `<span class="badge badge-live"><i class="ti ti-broadcast"></i> EN VIVO</span>` : ''}
          ${liveScore}
          ${locked && !hasResult && !live ? `<span class="badge badge-warning"><i class="ti ti-lock"></i> bloqueado</span>` : ''}
          ${resultKnown ? `<span class="badge badge-gray">Final ${m.result.home}–${m.result.away}</span>` : ''}
          ${resultKnown && penWinner(m.result) ? `<span class="badge badge-info">Pen ${m.result.penHome}–${m.result.penAway} · ${penWinner(m.result) === 'H' ? m.home : m.away} ✓</span>` : ''}
          ${statusBadge}
        </div>
        ${scorersHtml}
      </div>`;
    });

    html += '</div>';
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
// Ranking compacto (medallas + puntos). Reutilizable.
function rankingHtml() {
  if (!state.users.length) return '';
  const rows = getTableData().map((d, i) => {
    const color = colorFor(d.user.name);
    const pos = i < 3 ? ['🥇','🥈','🥉'][i] : (i + 1);
    return '<div class="cmp-rank-row">'
      + '<span class="cmp-rank-pos">' + pos + '</span>'
      + '<span class="cmp-avatar" style="background:' + color + '30;color:' + color + '">' + initials(d.user.name) + '</span>'
      + '<span class="cmp-rank-name">' + d.user.name.split(' ')[0] + '</span>'
      + '<span class="cmp-rank-pts">' + d.pts + '<small> pts</small></span>'
      + '</div>';
  }).join('');
  return '<div class="cmp-rank"><div class="cmp-rank-head"><i class="ti ti-trophy"></i> Ranking general</div>' + rows + '</div>';
}

function renderTabla() {
  const rankEl = document.getElementById('tabla-rank');
  if (!rankEl) return;
  const totalPlayed = state.matches.filter(m => m.result && m.result.home !== '').length;

  rankEl.innerHTML = rankingHtml();

  document.getElementById('tabla-stats').innerHTML = `
    <div class="stat-card"><div class="stat-label">Partidos jugados</div><div class="stat-value">${totalPlayed}</div></div>
    <div class="stat-card"><div class="stat-label">Partidos totales</div><div class="stat-value">${state.matches.length}</div></div>
    <div class="stat-card"><div class="stat-label">Participantes</div><div class="stat-value">${state.users.length}</div></div>
    <div class="stat-card"><div class="stat-label">Pts por exacto</div><div class="stat-value">${state.points.exact}</div></div>
    <div class="stat-card"><div class="stat-label">Pts por ganador</div><div class="stat-value">${state.points.result}</div></div>
    <div class="stat-card"><div class="stat-label">Bonos</div><div class="stat-value">+1 +1</div></div>
  `;
}

// ─── Render: Stats ───────────────────────────────────────────────────────────
// Empates predichos por un jugador (sobre todas sus quinielas)
function countDraws(userId) {
  let d = 0;
  state.matches.forEach(m => {
    const pk = state.picks[userId]?.[m.id];
    if (pickSet(pk)) { const np = normPick(pk); if (+np.home === +np.away) d++; }
  });
  return d;
}

function renderStats() {
  if (!document.getElementById('stats-body')) return;
  const data = getTableData();
  const medals = ['🥇', '🥈', '🥉'];

  // Tabla de posiciones
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
      <td class="text-right"><span class="badge badge-purple">${d.winner}</span></td>
      <td class="text-right" style="color:var(--text-secondary)">${d.played}</td>
    </tr>`;
  }).join('');

  // Precisión por participante
  document.getElementById('stats-body').innerHTML = data.map(d => {
    const total = d.played;
    const pctExact = total > 0 ? Math.round(d.exact / total * 100) : 0;
    const pctHits  = total > 0 ? Math.round((d.exact + d.winner) / total * 100) : 0;
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
      <td class="text-right">${pctHits}%</td>
      <td class="text-right">
        ${streak > 0
          ? `<span class="badge badge-success">🔥 ${streak}</span>`
          : streak < 0
          ? `<span class="badge badge-danger">${streak}</span>`
          : `<span class="badge badge-gray">—</span>`}
      </td>
    </tr>`;
  }).join('');

  // Destacados (mejores) — sin sección "De la Verga"
  const arr = data.map(d => ({
    name: d.user.name.split(' ')[0],
    aciertos: d.exact + d.winner,
    draws: countDraws(d.user.id),
    played: d.played,
    pct: d.played > 0 ? Math.round((d.exact + d.winner) / d.played * 100) : 0
  }));
  const playedArr = arr.filter(x => x.played > 0);
  const maxBy = (pool, k) => pool.length ? pool.reduce((b, x) => x[k] > b[k] ? x : b) : null;
  const ifPos = (w, k) => (w && w[k] > 0) ? w : null;
  const statCard = (label, w, fmt) =>
    `<div class="stat-card">
      <div class="stat-label">${label}</div>
      <div class="stat-value" style="font-size:20px">${w ? w.name : '—'}</div>
      <div style="font-size:12px;color:var(--text-secondary);margin-top:2px">${w ? fmt(w) : 'Aún sin datos'}</div>
    </div>`;
  const hl = document.getElementById('stats-highlights');
  if (hl) hl.innerHTML =
      statCard('Quién acierta más', ifPos(maxBy(playedArr, 'aciertos'), 'aciertos'), w => w.aciertos + ' aciertos')
    + statCard('Rey del empate',    ifPos(maxBy(arr, 'draws'), 'draws'),             w => w.draws + ' empates predichos')
    + statCard('Mejor precisión',   ifPos(maxBy(playedArr, 'pct'), 'pct'),           w => w.pct + '% de aciertos');
}

// ─── Render: Admin Matches ───────────────────────────────────────────────────
function renderAdminMatches() {
  const container = document.getElementById('admin-matches-list');
  if (state.matches.length === 0) {
    container.innerHTML = '<p style="font-size:13px;color:var(--text-secondary)">No hay partidos aún.</p>';
    return;
  }

  // Populate admin date filter
  const adminSel = document.getElementById('admin-date-filter');
  if (adminSel) {
    const currentVal = adminSel.value;
    const dates = [...new Set(
      state.matches.map(m => m.datetime ? m.datetime.slice(0,10) : null).filter(Boolean)
    )].sort();
    adminSel.innerHTML = '<option value="all">Todas las fechas</option>';
    dates.forEach(d => {
      const dt = new Date(d + 'T12:00:00');
      const label = dt.toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' });
      const o = document.createElement('option');
      o.value = d; o.textContent = label;
      adminSel.appendChild(o);
    });
    if (currentVal) adminSel.value = currentVal;
  }

  const adminDateFilter = document.getElementById('admin-date-filter')?.value || 'all';
  let matches = adminDateFilter === 'all'
    ? state.matches
    : state.matches.filter(m => m.datetime && m.datetime.slice(0,10) === adminDateFilter);

  if (matches.length === 0) {
    container.innerHTML = '<p style="font-size:13px;color:var(--text-secondary)">No hay partidos para esta fecha.</p>';
    return;
  }

  container.innerHTML = matches.map(m => {
    const dt = new Date(m.datetime);
    const dtStr = dt.toLocaleDateString('es', { day: 'numeric', month: 'short' })
      + ' ' + dt.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
    const hasResult = m.result && m.result.home !== '' && m.result.away !== '';
    const isDraw = hasResult && parseInt(m.result.home) === parseInt(m.result.away);
    const live = isLive(m);

    return `<div class="admin-match-row">
      <span style="font-size:13px;flex:1;min-width:160px">
        <strong>${m.home}</strong> vs <strong>${m.away}</strong><br>
        <span style="color:var(--text-secondary);font-size:11px">${dtStr} · ${m.phase}</span>
        ${live ? `<span class="badge badge-live" style="font-size:10px;padding:1px 6px;margin-left:4px"><i class="ti ti-broadcast"></i> EN VIVO</span>` : ''}
        ${m.finished ? `<span class="badge badge-gray" style="font-size:10px;padding:1px 6px;margin-left:4px">Finalizado</span>` : ''}
      </span>
      <input type="number" min="0" max="20" placeholder="L" value="${hasResult ? m.result.home : ''}"
        id="res-h-${m.id}" class="score-input">
      <span class="score-sep">–</span>
      <input type="number" min="0" max="20" placeholder="V" value="${hasResult ? m.result.away : ''}"
        id="res-a-${m.id}" class="score-input">
      ${isDraw ? `<span class="pen-label">Pen</span>
      <input type="number" min="0" max="20" placeholder="L" value="${hasVal(m.result.penHome) ? m.result.penHome : ''}"
        id="pen-h-${m.id}" class="score-input">
      <span class="score-sep">–</span>
      <input type="number" min="0" max="20" placeholder="V" value="${hasVal(m.result.penAway) ? m.result.penAway : ''}"
        id="pen-a-${m.id}" class="score-input">` : ''}
      <button class="btn btn-sm btn-primary" onclick="saveResult('${m.id}')">
        <i class="ti ti-check"></i> Guardar
      </button>
      ${live || m.finished ? `<button class="btn btn-sm ${m.finished ? '' : 'btn-danger'}" onclick="toggleFinished('${m.id}')" title="${m.finished ? 'Reabrir partido' : 'Marcar como finalizado'}">
        <i class="ti ti-${m.finished ? 'player-play' : 'flag-check'}"></i>
      </button>` : ''}
      <button class="btn btn-sm" onclick="openEditModal('${m.id}')" title="Editar partido">
        <i class="ti ti-edit"></i>
      </button>
      <button class="btn btn-sm btn-danger" onclick="openDeleteModal('${m.id}')" title="Eliminar">
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
  const result = { home: h, away: a };
  // Penales (solo si el partido es empate y se rendían los inputs)
  const penH = document.getElementById('pen-h-' + matchId);
  const penA = document.getElementById('pen-a-' + matchId);
  if (penH && penA && penH.value !== '' && penA.value !== '') {
    result.penHome = parseInt(penH.value);
    result.penAway = parseInt(penA.value);
  }
  m.result = result;
  await saveState();
}

async function toggleFinished(matchId) {
  const m = state.matches.find(x => x.id === matchId);
  if (!m) return;
  m.finished = !m.finished;
  await saveState();
  renderAdminMatches();
  renderMatches();
}

let _deleteMatchId = null;
function openDeleteModal(matchId) {
  const m = state.matches.find(x => x.id === matchId);
  if (!m) return;
  _deleteMatchId = matchId;
  document.getElementById('delete-confirm-text').textContent =
    '¿Eliminar ' + m.home + ' vs ' + m.away + '? Esta acción no se puede deshacer.';
  document.getElementById('modal-delete-overlay').classList.remove('hidden');
}
function closeDeleteModal() {
  _deleteMatchId = null;
  document.getElementById('modal-delete-overlay').classList.add('hidden');
}
async function confirmDelete() {
  if (!_deleteMatchId) return;
  state.matches = state.matches.filter(m => m.id !== _deleteMatchId);
  closeDeleteModal();
  await saveState();
  renderAdminMatches();
  renderMatches();
}

// Keep old deleteMatch as alias for backwards compat
async function deleteMatch(matchId) { openDeleteModal(matchId); }

let _editMatchId = null;
function openEditModal(matchId) {
  const m = state.matches.find(x => x.id === matchId);
  if (!m) return;
  _editMatchId = matchId;
  document.getElementById('edit-home').value  = m.home;
  document.getElementById('edit-away').value  = m.away;
  document.getElementById('edit-date').value  = m.datetime;
  document.getElementById('edit-phase').value = m.phase;
  document.getElementById('modal-overlay').classList.remove('hidden');
}
function closeModal() {
  _editMatchId = null;
  document.getElementById('modal-overlay').classList.add('hidden');
}
async function saveEdit() {
  if (!_editMatchId) return;
  const m = state.matches.find(x => x.id === _editMatchId);
  if (!m) return;
  m.home     = document.getElementById('edit-home').value.trim()  || m.home;
  m.away     = document.getElementById('edit-away').value.trim()  || m.away;
  m.datetime = document.getElementById('edit-date').value         || m.datetime;
  m.phase    = document.getElementById('edit-phase').value        || m.phase;
  closeModal();
  await saveState();
  renderAdminMatches();
  renderMatches();
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
      <td style="font-family:monospace;letter-spacing:2px">${u.pin || '—'}</td>
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
  const pin  = document.getElementById('new-user-pin').value.trim();
  if (!name) { alert('Escribe el nombre del jugador'); return; }
  if (pin.length !== 4 || isNaN(pin)) { alert('El PIN debe ser de 4 digitos numericos'); return; }
  const isAdmin = document.getElementById('new-user-admin').checked;
  state.users.push({ id: 'u' + Date.now(), name, pin, isAdmin });
  document.getElementById('new-user-name').value = '';
  document.getElementById('new-user-pin').value  = '';
  document.getElementById('new-user-admin').checked = false;
  await saveState();
}

async function deleteUser(userId) {
  if (!confirm('¿Eliminar este usuario?')) return;
  state.users = state.users.filter(u => u.id !== userId);
  await saveState();
}

async function savePoints() {
  state.points.exact   = parseInt(document.getElementById('pts-exact').value)   || 5;
  state.points.result  = parseInt(document.getElementById('pts-result').value)  || 2;
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


// ─── Importar partidos desde openfootball (sin API key) ──────────────────────
async function importFixtures() {
  const btn = document.getElementById('btn-import');
  btn.textContent = 'Importando...';
  btn.disabled = true;
  try {
    const res = await fetch('https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json');
    if (!res.ok) throw new Error('No se pudo conectar');
    const data = await res.json();

    let added = 0;
    let updated = 0;
    // Para fase de grupos: dedup por equipos. Para eliminación: dedup por fecha+ronda (los equipos pueden ser "W74")
    const existingKeys = new Set(state.matches.map(m => m.home + '|' + m.away));
    // Mapa de partidos existentes por fecha+ronda para actualizar placeholders
    const existingByDateRound = {};
    state.matches.forEach(m => {
      const key = (m.datetime || '').slice(0,10) + '|' + (m.phase || '');
      existingByDateRound[key] = m;
    });

    // openfootball 2026 format: data.matches[] with round, date, time, team1, team2, group, score
    const matches = data.matches || [];
    matches.forEach(m => {
      const home = m.team1;
      const away = m.team2;
      if (!home || !away) return;

      // Parse datetime - time comes as "13:00 UTC-6", convert to UTC ISO
      // Ejemplo: "13:00 UTC-6" en fecha "2026-06-11" → UTC = 13:00 + 6h = 19:00Z
      const timeParts = (m.time || '12:00 UTC-6').split(' ');
      const timeStr = timeParts[0]; // "13:00"
      const tzStr   = timeParts[1] || 'UTC-6'; // "UTC-6" o "UTC-4"
      const tzMatch = tzStr.match(/UTC([+-]\d+)/);
      const tzOffset = tzMatch ? parseInt(tzMatch[1]) : -6; // negativo = atrás de UTC
      // Convertir a UTC: restar el offset (UTC-6 → sumar 6h)
      const localMs  = new Date(m.date + 'T' + timeStr + ':00').getTime();
      const utcMs    = localMs - tzOffset * 60 * 60 * 1000;
      const utcDate  = new Date(utcMs);
      const pad = n => String(n).padStart(2,'0');
      const datetime = utcDate.getUTCFullYear() + '-'
        + pad(utcDate.getUTCMonth()+1) + '-'
        + pad(utcDate.getUTCDate()) + 'T'
        + pad(utcDate.getUTCHours()) + ':'
        + pad(utcDate.getUTCMinutes()) + ':00Z';

      // Phase from round
      // openfootball 2026 usa: "Round of 32" (16avos), "Round of 16" (8vos),
      // "Quarter-final", "Semi-final", "Final", "Match for third place"
      const round = (m.round || 'Fase de grupos').toLowerCase();
      let phase = 'Fase de grupos';
      if (round.includes('round of 32'))                              phase = '16avos de final';
      else if (round.includes('round of 16'))                         phase = 'Octavos de final';
      else if (round.includes('quarter'))                             phase = 'Cuartos de final';
      else if (round.includes('semi'))                                phase = 'Semifinal';
      else if (round.includes('third') || round.includes('tercer'))  phase = 'Tercer lugar';
      else if (round === 'final')                                     phase = 'Final';
      else if (m.group) phase = 'Fase de grupos - ' + m.group;

      // Score if available
      let result = { home: '', away: '' };
      if (m.score && m.score.ft) {
        result = { home: String(m.score.ft[0]), away: String(m.score.ft[1]) };
      }

      // ── Para knockout: si ya existe un partido con esa fecha+fase, actualizar equipos ──
      const dateRoundKey = datetime.slice(0,10) + '|' + phase;
      const isKnockout = phase !== 'Fase de grupos' && !phase.startsWith('Fase de grupos -');
      const isPlaceholder = /^W\d+$/.test(home) || /^W\d+$/.test(away);

      if (isKnockout && !isPlaceholder) {
        // Tenemos equipos reales: buscar partido existente con placeholder o mismo nombre
        const existingMatch = existingByDateRound[dateRoundKey];
        if (existingMatch) {
          // Actualizar equipos y resultado en el partido existente
          existingMatch.home = home;
          existingMatch.away = away;
          if (m.score && m.score.ft) existingMatch.result = result;
          existingMatch.datetime = datetime;
          updated++;
          return;
        }
      }

      // Si ya existe exactamente este partido (mismos equipos), omitir
      if (existingKeys.has(home + '|' + away)) return;
      // No importar placeholders WXX si aún no hay equipos definidos (se añadirán al actualizar)
      if (isPlaceholder) return;

      state.matches.push({
        id: 'm' + Date.now() + Math.random().toString(36).slice(2,6),
        home, away, datetime, phase, result
      });
      existingKeys.add(home + '|' + away);
      existingByDateRound[dateRoundKey] = state.matches[state.matches.length - 1];
      added++;
    });

    await saveState();
    const msg = [];
    if (added > 0) msg.push('✓ ' + added + ' nuevos');
    if (updated > 0) msg.push(updated + ' actualizados');
    btn.textContent = msg.length ? msg.join(', ') + ' partidos' : '✓ Sin cambios nuevos';
    renderAdminMatches();
    renderMatches();
    setTimeout(() => { btn.textContent = 'Importar partidos del Mundial'; btn.disabled = false; }, 3000);
  } catch(e) {
    btn.textContent = 'Error: ' + e.message;
    btn.disabled = false;
    console.error(e);
  }
}

// ─── Actualizar resultados y goleadores desde openfootball ──────────────────
async function syncResults() {
  const btn = document.getElementById('btn-sync');
  btn.textContent = 'Actualizando...';
  btn.disabled = true;
  try {
    const res = await fetch('https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json');
    if (!res.ok) throw new Error('No se pudo conectar con openfootball');
    const data = await res.json();
    const matches = data.matches || [];

    let updated = 0;
    matches.forEach(of => {
      if (!of.score || !of.score.ft) return; // sin resultado aún

      const scoreHome = String(of.score.ft[0]);
      const scoreAway = String(of.score.ft[1]);
      const goals1 = (of.goals1 || []).map(g => ({ name: g.name, minute: g.minute }));
      const goals2 = (of.goals2 || []).map(g => ({ name: g.name, minute: g.minute }));

      // Match por nombres (fuzzy igual que antes)
      const match = state.matches.find(m => {
        const h1 = m.home.toLowerCase(), h2 = of.team1.toLowerCase();
        const a1 = m.away.toLowerCase(), a2 = of.team2.toLowerCase();
        return (h1.includes(h2.slice(0,5)) || h2.includes(h1.slice(0,5))) &&
               (a1.includes(a2.slice(0,5)) || a2.includes(a1.slice(0,5)));
      });
      if (!match) return;

      const changed = match.result.home !== scoreHome || match.result.away !== scoreAway;
      const goalsChanged = JSON.stringify(match.goals1) !== JSON.stringify(goals1) ||
                           JSON.stringify(match.goals2) !== JSON.stringify(goals2);

      if (changed || goalsChanged) {
        match.result = { home: scoreHome, away: scoreAway };
        match.goals1 = goals1;
        match.goals2 = goals2;
        updated++;
      }
    });

    await saveState();
    btn.textContent = '✓ ' + updated + ' partidos actualizados';
    renderAdminMatches();
    renderTabla();
    renderStats();
    renderMatches();
    setTimeout(() => { btn.textContent = 'Actualizar resultados'; btn.disabled = false; }, 3000);
  } catch(e) {
    btn.textContent = 'Error: ' + e.message;
    btn.disabled = false;
    console.error(e);
  }
}



// ─── Render: Comparar ────────────────────────────────────────────────────────
function renderComparar() {
  const listEl = document.getElementById('comparar-list');
  if (!listEl) return;

  // Partidos por día (hoy por defecto)
  populateCmpDates();
  const dayFilter = document.getElementById('cmp-date-filter')?.value || 'all';
  let matches = [...state.matches].sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  if (dayFilter !== 'all') matches = matches.filter(m => m.datetime && m.datetime.slice(0, 10) === dayFilter);

  if (matches.length === 0) {
    listEl.innerHTML = '<div class="cmp-empty">No hay partidos para este día. Usa ‹ › para ver otro día.</div>';
    return;
  }

  // Agrupados por estado: finalizados / en curso / pendientes
  const groups = { done: [], live: [], pend: [] };
  matches.forEach(m => {
    if (m.result && m.result.home !== '') groups.done.push(m);
    else if (isLocked(m)) groups.live.push(m);
    else groups.pend.push(m);
  });

  const meta = {
    done: { label: 'Finalizados', icon: 'ti-circle-check' },
    live: { label: 'En curso',    icon: 'ti-ball-football' },
    pend: { label: 'Pendientes',  icon: 'ti-clock' }
  };
  const order = ['done', 'live', 'pend'];
  const firstVisible = order.find(k => groups[k].length);

  let html = '';
  order.forEach(key => {
    const ms = groups[key];
    if (!ms.length) return;
    const open = key === 'done' || (!groups.done.length && key === firstVisible);
    html += '<div class="cmp-group' + (open ? ' open' : '') + '" id="cmpg-' + key + '">'
      + '<button class="cmp-group-head" onclick="toggleCmpGroup(\'' + key + '\')">'
      + '<i class="ti ' + meta[key].icon + ' cmp-group-icon"></i>'
      + '<span class="cmp-group-title">' + meta[key].label + '</span>'
      + '<span class="cmp-group-count">' + ms.length + '</span>'
      + '<i class="ti ti-chevron-down cmp-chev"></i>'
      + '</button>'
      + '<div class="cmp-group-wrap"><div class="cmp-group-body">'
      + ms.map(cmpCard).join('')
      + '</div></div></div>';
  });

  listEl.innerHTML = html;
}

// Tarjeta colapsable de un partido
function cmpCard(m) {
  const hasResult = m.result && m.result.home !== '';
  const meId = state.currentUser?.id;

  // Clasifica puntos al estilo Pitaya (exacto / acierta ganador+bonos / falla)
  const badgeFor = pts => pts === state.points.exact ? 'badge-success' : pts > 0 ? 'badge-purple' : 'badge-danger';

  const liveOrFinished = isLive(m) || isFinished(m);

  // Ganadores (mayor puntuación) — visible en vivo y al terminar
  let winnersHtml = '';
  if (hasResult && liveOrFinished) {
    const scored = state.users
      .filter(u => pickSet(state.picks[u.id]?.[m.id]))
      .map(u => ({ u, pts: calcPoints(u.id, m, { includeLive: true }) }));
    const max = scored.reduce((mx, s) => Math.max(mx, s.pts), 0);
    const winners = max > 0 ? scored.filter(s => s.pts === max) : [];
    winnersHtml = winners.length
      ? winners.map(s => '<span class="cmp-win">🥇 ' + s.u.name.split(' ')[0]
          + '<span class="badge-win">+' + s.pts + '</span></span>').join('')
      : '<span class="cmp-noone">Nadie acertó este partido</span>';
  }

  // Mi predicción
  const myPick = meId ? state.picks[meId]?.[m.id] : null;
  const myHas = pickSet(myPick);
  const myNp = normPick(myPick);
  const myPts = hasResult && myHas && liveOrFinished ? calcPoints(meId, m, { includeLive: true }) : null;
  const mineStr = myHas
    ? myNp.home + ' - ' + myNp.away + (myPts !== null ? ' <span class="cmp-mine-pts">(+' + myPts + ')</span>' : '')
    : '<span class="cmp-noone">Sin predicción</span>';

  // Detalle: todas las predicciones, ordenadas por puntos
  const detailHtml = state.users
    .map(u => {
      const pk = state.picks[u.id]?.[m.id];
      const has = pickSet(pk);
      const np = normPick(pk);
      const pts = hasResult && has && liveOrFinished ? calcPoints(u.id, m, { includeLive: true }) : null;
      return { u, has, np, pts };
    })
    .sort((a, b) => (b.pts ?? -1) - (a.pts ?? -1))
    .map(r => {
      const color = colorFor(r.u.name);
      const pickStr = r.has ? r.np.home + '-' + r.np.away : '–';
      const cls = r.pts !== null ? badgeFor(r.pts) : 'badge-gray';
      return '<div class="cmp-pred' + (r.u.id === meId ? ' me' : '') + '">'
        + '<span class="cmp-avatar" style="background:' + color + '30;color:' + color + '">' + initials(r.u.name) + '</span>'
        + '<span class="cmp-pred-name">' + r.u.name.split(' ')[0] + '</span>'
        + '<span class="cmp-pred-pick">' + pickStr + '</span>'
        + '<span class="badge ' + cls + ' cmp-pred-badge">' + (r.pts !== null ? '+' + r.pts : '·') + '</span>'
        + '</div>';
    }).join('');

  const dt = new Date(m.datetime);
  const center = hasResult
    ? '<span class="cmp-score">' + m.result.home + ' - ' + m.result.away + '</span>'
    : '<span class="cmp-vs">vs</span>';
  const subline = hasResult
    ? 'Resultado final'
    : dt.toLocaleDateString('es', { day: 'numeric', month: 'short' }) + ' · '
      + dt.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });

  return '<div class="cmp-card" id="cmpc-' + m.id + '">'
    + '<div class="cmp-fixture">'
    +   '<span class="cmp-team home">' + m.home + ' ' + flagImg(m.home) + '</span>'
    +   center
    +   '<span class="cmp-team away">' + flagImg(m.away) + ' ' + m.away + '</span>'
    + '</div>'
    + '<div class="cmp-subline">' + subline + '</div>'
    + (winnersHtml ? '<div class="cmp-winners">' + winnersHtml + '</div>' : '')
    + '<div class="cmp-mine"><span class="cmp-mine-label">⭐ Tu predicción</span>'
    +   '<span class="cmp-mine-val">' + mineStr + '</span></div>'
    + '<button class="cmp-toggle" onclick="toggleCmpCard(\'' + m.id + '\')">'
    +   '<span class="cmp-toggle-label"></span><i class="ti ti-chevron-down cmp-chev"></i>'
    + '</button>'
    + '<div class="cmp-detail-wrap"><div class="cmp-detail">' + detailHtml + '</div></div>'
    + '</div>';
}

// ─── Verificar horarios contra openfootball ──────────────────────────────────
async function verifySchedule() {
  const btn = document.getElementById('btn-verify-schedule');
  const out = document.getElementById('verify-schedule-output');
  btn.disabled = true;
  btn.textContent = 'Verificando...';
  out.innerHTML = '';

  try {
    const res = await fetch('https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json');
    if (!res.ok) throw new Error('No se pudo conectar con openfootball');
    const data = await res.json();
    const matches = data.matches || [];

    // Construir mapa source: "Home|Away" → datetime UTC
    const sourceMap = {};
    matches.forEach(m => {
      if (!m.team1 || !m.team2) return;
      const timeParts = (m.time || '12:00 UTC-6').split(' ');
      const timeStr = timeParts[0];
      const tzStr   = timeParts[1] || 'UTC-6';
      const tzMatch = tzStr.match(/UTC([+-]\d+)/);
      const tzOffset = tzMatch ? parseInt(tzMatch[1]) : -6;
      const localMs = new Date(m.date + 'T' + timeStr + ':00').getTime();
      const utcMs   = localMs - tzOffset * 60 * 60 * 1000;
      const utcDate = new Date(utcMs);
      const pad = n => String(n).padStart(2,'0');
      const utcISO = utcDate.getUTCFullYear() + '-'
        + pad(utcDate.getUTCMonth()+1) + '-'
        + pad(utcDate.getUTCDate()) + 'T'
        + pad(utcDate.getUTCHours()) + ':'
        + pad(utcDate.getUTCMinutes()) + ':00Z';
      sourceMap[m.team1 + '|' + m.team2] = { utcISO, rawTime: m.time, date: m.date };
    });

    // Comparar contra partidos guardados
    let issues = [];
    let ok = 0;
    state.matches.forEach(m => {
      const key = m.home + '|' + m.away;
      const src = sourceMap[key];
      if (!src) return; // partido no encontrado en source (ok, puede ser manual)
      // Normalizar ambos a minutos UTC para comparar
      const savedDate  = new Date(m.datetime);
      const sourceDate = new Date(src.utcISO);
      const diffMin = Math.abs((savedDate.getTime() - sourceDate.getTime()) / 60000);
      if (diffMin > 1) {
        // Convertir a hora Guatemala para mostrar
        const toGT = dt => {
          const d = new Date(new Date(dt).getTime() - 6*60*60*1000);
          const pad = n => String(n).padStart(2,'0');
          return pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes());
        };
        issues.push({
          match: m,
          savedGT:  toGT(m.datetime),
          correctGT: toGT(src.utcISO),
          correctUTC: src.utcISO,
          diffMin
        });
      } else {
        ok++;
      }
    });

    if (issues.length === 0) {
      out.innerHTML = '<div style="color:var(--success-text);background:var(--success-bg);border-radius:var(--radius);padding:10px 14px;font-size:13px">'
        + '<i class="ti ti-circle-check"></i> ¡Todos los horarios están correctos! (' + ok + ' partidos verificados)</div>';
    } else {
      let html = '<div style="font-size:13px;margin-bottom:10px;color:var(--danger-text)">'
        + '<i class="ti ti-alert-triangle"></i> ' + issues.length + ' partido(s) con horario incorrecto:</div>';
      issues.forEach(issue => {
        html += '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:8px 10px;background:var(--bg-secondary);border-radius:var(--radius);margin-bottom:6px;font-size:13px">'
          + '<span style="font-weight:600;flex:1;min-width:140px">' + issue.match.home + ' vs ' + issue.match.away + '</span>'
          + '<span style="color:var(--danger-text)">Guardado: ' + issue.savedGT + ' GT</span>'
          + '<span style="color:var(--text-secondary)">→</span>'
          + '<span style="color:var(--success-text)">Correcto: ' + issue.correctGT + ' GT</span>'
          + '<button class="btn btn-sm btn-primary" style="font-size:11px;padding:3px 8px" '
          + 'onclick="fixOneSchedule(\'' + issue.match.id + '\',\'' + issue.correctUTC + '\',this)">'
          + '<i class="ti ti-check"></i> Corregir</button>'
          + '</div>';
      });
      out.innerHTML = html;
    }
  } catch(e) {
    out.innerHTML = '<div style="color:var(--danger-text);font-size:13px"><i class="ti ti-alert-circle"></i> Error: ' + e.message + '</div>';
  }
  btn.disabled = false;
  btn.textContent = 'Verificar horarios';
}

async function fixOneSchedule(matchId, correctUTC, btn) {
  const m = state.matches.find(x => x.id === matchId);
  if (!m) return;
  m.datetime = correctUTC;
  btn.disabled = true;
  btn.textContent = '✓ Corregido';
  btn.style.background = 'var(--success-bg)';
  btn.style.color = 'var(--success-text)';
  await saveState();
  renderMatches();
}

// ─── Limpiar y corregir fases / deduplicar partidos ────────────────────────
async function fixAndDeduplicateMatches() {
  const btn = document.getElementById('btn-fix');
  btn.textContent = 'Procesando...';
  btn.disabled = true;

  try {
    // 1) Obtener los datos actualizados de openfootball para saber qué equipos son reales
    const res = await fetch('https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json');
    if (!res.ok) throw new Error('No se pudo conectar');
    const data = await res.json();
    const ofMatches = data.matches || [];

    // Construir mapa: fecha+equipo1 → datos completos de openfootball
    const ofMap = {};
    ofMatches.forEach(m => {
      const key = m.date + '|' + m.team1 + '|' + m.team2;
      ofMap[key] = m;
    });

    // Función para detectar si un nombre es placeholder (letras/números como "1J", "2H", "3E/F/G/I/J", "W74", "L101", etc.)
    function isPlaceholder(name) {
      if (!name) return true;
      // Patrones: "W74", "L102", "1J", "2H", "3A/B/C", "1E", etc.
      if (/^[WL]\d+$/.test(name)) return true;
      if (/^\d+[A-Z](\/[A-Z])*$/.test(name)) return true;
      if (/^\d[A-Z](\/[A-Z\/]+)?$/.test(name)) return true;
      return false;
    }

    // Función para mapear round de openfootball → fase en español
    function roundToPhase(round, group) {
      const r = (round || '').toLowerCase();
      if (r.includes('round of 32'))   return '16avos de final';
      if (r.includes('round of 16'))   return 'Octavos de final';
      if (r.includes('quarter'))       return 'Cuartos de final';
      if (r.includes('semi'))          return 'Semifinal';
      if (r.includes('third') || r.includes('tercer')) return 'Tercer lugar';
      if (r === 'final')               return 'Final';
      if (group)                       return 'Fase de grupos - ' + group;
      return 'Fase de grupos';
    }

    // 2) Corregir fases de partidos existentes usando datos de openfootball
    let phaseFixed = 0;
    state.matches.forEach(sm => {
      // Buscar en openfootball por equipo home+away
      const ofMatch = ofMatches.find(m =>
        m.team1 === sm.home && m.team2 === sm.away
      );
      if (ofMatch) {
        const correctPhase = roundToPhase(ofMatch.round, ofMatch.group);
        if (sm.phase !== correctPhase) {
          sm.phase = correctPhase;
          phaseFixed++;
        }
      }
    });

    // 3) Deduplicar: si hay dos partidos con mismo datetime exacto (o mismos equipos),
    //    quedarse con el que tenga equipos reales; eliminar placeholders
    // Agrupar por clave datetime+fase (cada slot de horario es único)
    const byDatePhase = {};
    state.matches.forEach(m => {
      // Usar datetime completo para evitar conflictos con varios partidos el mismo día
      const key = (m.datetime || '').slice(0, 16) + '|' + (m.phase || '');
      if (!byDatePhase[key]) byDatePhase[key] = [];
      byDatePhase[key].push(m);
    });

    const toRemove = new Set();
    Object.values(byDatePhase).forEach(group => {
      if (group.length < 2) return;
      // Separar reales y placeholders
      const reals = group.filter(m => !isPlaceholder(m.home) && !isPlaceholder(m.away));
      const placeholders = group.filter(m => isPlaceholder(m.home) || isPlaceholder(m.away));
      if (reals.length > 0) {
        // Eliminar todos los placeholders de este grupo
        placeholders.forEach(m => toRemove.add(m.id));
        // Si hay más de un real, eliminar duplicados exactos (mismo home+away)
        const seen = new Set();
        reals.forEach(m => {
          const k = m.home + '|' + m.away;
          if (seen.has(k)) {
            toRemove.add(m.id);
          } else {
            seen.add(k);
          }
        });
      }
    });

    // 4) Eliminar partidos-placeholder que no tienen ningún partido real contraparte
    //    (los que nunca se podrán jugar, i.e. están solos con placeholder)
    state.matches.forEach(m => {
      if (isPlaceholder(m.home) || isPlaceholder(m.away)) {
        toRemove.add(m.id);
      }
    });

    const removedCount = toRemove.size;
    state.matches = state.matches.filter(m => !toRemove.has(m.id));

    await saveState();
    renderAdminMatches();
    renderMatches();

    const parts = [];
    if (phaseFixed > 0)  parts.push(phaseFixed + ' fases corregidas');
    if (removedCount > 0) parts.push(removedCount + ' duplicados/placeholders eliminados');
    btn.textContent = parts.length ? '✓ ' + parts.join(', ') : '✓ Todo ya estaba correcto';
    setTimeout(() => { btn.textContent = 'Limpiar y corregir fases'; btn.disabled = false; }, 4000);
  } catch(e) {
    btn.textContent = 'Error: ' + e.message;
    btn.disabled = false;
    console.error(e);
  }
}

// ─── Corrección masiva de horarios ───────────────────────────────────────────
function openFixTimesModal() {
  // Previsualizar partidos afectados
  const fromHour = document.getElementById('fix-from-hour').value.padStart(2,'0') + ':00';
  const toHour   = document.getElementById('fix-to-hour').value.padStart(2,'0')   + ':00';
  const affected = state.matches.filter(m => m.datetime && m.datetime.includes('T' + fromHour + ':'));
  document.getElementById('fix-times-preview').textContent =
    affected.length > 0
      ? `Se cambiarán ${affected.length} partido(s) de ${fromHour} → ${toHour}`
      : `No hay partidos con hora ${fromHour}`;
  document.getElementById('modal-fixtimes-overlay').classList.remove('hidden');
}
function closeFixTimesModal() {
  document.getElementById('modal-fixtimes-overlay').classList.add('hidden');
}
async function confirmFixTimes() {
  const fromHour = document.getElementById('fix-from-hour').value.padStart(2,'0') + ':00';
  const toHour   = document.getElementById('fix-to-hour').value.padStart(2,'0')   + ':00';
  let changed = 0;
  state.matches.forEach(m => {
    if (m.datetime && m.datetime.includes('T' + fromHour + ':')) {
      m.datetime = m.datetime.replace('T' + fromHour + ':', 'T' + toHour + ':');
      changed++;
    }
  });
  closeFixTimesModal();
  await saveState();
  renderAdminMatches();
  renderMatches();
  alert(`✓ ${changed} partido(s) actualizados de ${fromHour} → ${toHour}`);
}

// ─── Borrar todos los partidos ───────────────────────────────────────────────
function openDeleteAllModal() {
  document.getElementById('modal-deleteall-overlay').classList.remove('hidden');
}
function closeDeleteAllModal() {
  document.getElementById('modal-deleteall-overlay').classList.add('hidden');
}
async function confirmDeleteAll() {
  state.matches = [];
  state.picks   = {};
  closeDeleteAllModal();
  await saveState();
  renderAdminMatches();
  renderMyStats();
  renderMatches();
  renderTabla();
  renderStats();
}

// ─── Cambiar PIN ─────────────────────────────────────────────────────────────
function cpNext(prefix, el, nextIdx) {
  if (el.value.length === 1 && nextIdx !== null)
    document.getElementById('cp-' + prefix + '-' + nextIdx).focus();
}
function cpBack(prefix, e, el, prevIdx) {
  if (e.key === 'Backspace' && el.value === '' && prevIdx !== null)
    document.getElementById('cp-' + prefix + '-' + prevIdx).focus();
}
function getCpPin(prefix) {
  return [0,1,2,3].map(i => document.getElementById('cp-' + prefix + '-' + i).value).join('');
}
function clearCpPin(prefix) {
  [0,1,2,3].forEach(i => { document.getElementById('cp-' + prefix + '-' + i).value = ''; });
}

function openChangePinModal() {
  ['cur','new','cfm'].forEach(p => clearCpPin(p));
  document.getElementById('cp-error').classList.add('hidden');
  document.getElementById('cp-success').classList.add('hidden');
  ['cur','new','cfm'].forEach(p =>
    [0,1,2,3].forEach(i => document.getElementById('cp-'+p+'-'+i).classList.remove('error'))
  );
  document.getElementById('modal-changepin-overlay').classList.remove('hidden');
  document.getElementById('cp-cur-0').focus();
}
function closeChangePinModal() {
  document.getElementById('modal-changepin-overlay').classList.add('hidden');
}
async function saveNewPin() {
  const errEl = document.getElementById('cp-error');
  const sucEl = document.getElementById('cp-success');
  errEl.classList.add('hidden');
  sucEl.classList.add('hidden');

  const cur = getCpPin('cur');
  const nw  = getCpPin('new');
  const cfm = getCpPin('cfm');

  const user = state.users.find(u => u.id === state.currentUser.id);

  if (cur.length < 4) { errEl.textContent = 'Ingresa tu PIN actual completo'; errEl.classList.remove('hidden'); return; }
  if (user.pin && user.pin !== cur) {
    errEl.textContent = 'PIN actual incorrecto';
    errEl.classList.remove('hidden');
    clearCpPin('cur');
    document.getElementById('cp-cur-0').focus();
    return;
  }
  if (nw.length < 4) { errEl.textContent = 'El nuevo PIN debe tener 4 dígitos'; errEl.classList.remove('hidden'); return; }
  if (nw !== cfm) {
    errEl.textContent = 'Los PINs nuevos no coinciden';
    errEl.classList.remove('hidden');
    clearCpPin('new'); clearCpPin('cfm');
    document.getElementById('cp-new-0').focus();
    return;
  }

  user.pin = nw;
  state.currentUser = user;
  await saveState();
  sucEl.classList.remove('hidden');
  setTimeout(() => closeChangePinModal(), 1500);
}

// ─── Boot ────────────────────────────────────────────────────────────────────
initFirebase().catch(err => {
  console.error('Firebase error:', err);
  document.body.innerHTML = `<div style="padding:2rem;font-family:sans-serif;color:#a32d2d">
    <h2>Error de configuración</h2>
    <p>Asegúrate de haber reemplazado los valores de Firebase en <code>app.js</code>. Ver <code>README.md</code>.</p>
  </div>`;
});

// Refresca el estado "en vivo" de los partidos cada minuto.
setInterval(() => { if (state.currentUser && state.editingAs) renderMatches(); }, 60000);
