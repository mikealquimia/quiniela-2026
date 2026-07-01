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
  renderBracket();
  const elExact  = document.getElementById('pts-exact');
  const elResult = document.getElementById('pts-result');
  if (elExact)  elExact.value  = state.points.exact;
  if (elResult) elResult.value = state.points.result;
}

// ─── Tabs ────────────────────────────────────────────────────────────────────
function showTab(id, btn) {
  ['tab-quiniela','tab-tabla','tab-stats','tab-comparar','tab-admin','tab-bracket'].forEach(t => {
    document.getElementById(t).classList.add('hidden');
  });
  document.getElementById(id).classList.remove('hidden');
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  if (id === 'tab-comparar') renderComparar();
  if (id === 'tab-bracket') renderBracket();
}
function toggleCmpCard(id)  { document.getElementById('cmpc-' + id)?.classList.toggle('open'); }
function toggleCmpGroup(key) { document.getElementById('cmpg-' + key)?.classList.toggle('open'); }

// Llena el selector de días de Comparar (autoselecciona hoy)
function populateCmpDates() {
  const sel = document.getElementById('cmp-date-filter');
  if (!sel) return;
  const today = getTodayGuatemala();
  const dates = [...new Set(
    state.matches.map(m => m.datetime ? getDateGuatemala(m.datetime) : null).filter(Boolean)
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
  // En partidos con penales: el resultado "oficial" es empate (D) porque el marcador
  // reglamentario fue empate; el ganador efectivo solo se usa para comparar quién
  // predijo el lado correcto (penales) vs quien predijo empate.
  const rawRes = rh > ra ? 'H' : rh < ra ? 'A' : 'D';
  const pen = penWinner(match.result); // 'H' | 'A' | null

  // El resultado efectivo para calcular ganador:
  // - Si hay penales: quien predijo empate también acertó (marcador reglamentario fue D),
  //   y quien predijo al ganador de penales también acertó.
  // - Sin penales: solo quien predijo el resultado real.
  const rRes = pen ? pen : rawRes; // 'H', 'A', o 'D'
  const pRes = ph > pa ? 'H' : ph < pa ? 'A' : 'D';

  // Con penales: tanto pRes==='D' (predijo empate, acertó marcador real)
  // como pRes===pen (predijo directamente al ganador en penales) dan puntos de ganador.
  let pts = 0;
  if (pen) {
    if (pRes === 'D' || pRes === pen) pts = state.points.result;
  } else {
    if (pRes === rRes) pts = state.points.result;
  }

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
  return getDateGuatemala(new Date());
}
// Convierte cualquier datetime (UTC ISO string o Date) a fecha "YYYY-MM-DD" en Guatemala (UTC-6)
function getDateGuatemala(dt) {
  const d = (dt instanceof Date) ? dt : new Date(dt);
  const GT_OFFSET = -6 * 60; // Guatemala = UTC-6, sin horario de verano
  const local = new Date(d.getTime() + (GT_OFFSET - d.getTimezoneOffset()) * 60000);
  return local.toISOString().slice(0, 10);
}
// Igual pero retorna "YYYY-MM-DDTHH:MM" en hora Guatemala (para datetime-local inputs)
function getLocalGuatemala(dt) {
  const d = (dt instanceof Date) ? dt : new Date(dt);
  const GT_OFFSET = -6 * 60;
  const local = new Date(d.getTime() + (GT_OFFSET - d.getTimezoneOffset()) * 60000);
  return local.toISOString().slice(0, 16);
}

function populateDateFilter() {
  const sel = document.getElementById('date-filter');
  if (!sel) return;
  const current = sel.value;
  const today = getTodayGuatemala();
  // Get unique dates
  const dates = [...new Set(
    state.matches.map(m => m.datetime ? getDateGuatemala(m.datetime) : null).filter(Boolean)
  )].sort();
  sel.innerHTML = '<option value="all">Todos los partidos</option>';
  dates.forEach(d => {
    const dt = new Date(d + 'T12:00:00');
    const label = dt.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Guatemala' });
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
  const s = dt.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Guatemala' });
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
    filteredMatches = filteredMatches.filter(m => m.datetime && getDateGuatemala(m.datetime) === dateFilter);
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

      const timeStr = new Date(m.datetime).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Guatemala' });

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


// ─── Render: Comparar ────────────────────────────────────────────────────────
function renderComparar() {
  const container = document.getElementById('comparar-list');
  if (!container) return;

  populateCmpDates();

  const dateFilter = document.getElementById('cmp-date-filter')?.value || 'all';

  if (!state.users.length || !state.matches.length) {
    container.innerHTML = `<div style="text-align:center;padding:3rem;color:var(--text-secondary)">
      <i class="ti ti-users" style="font-size:28px;display:block;margin-bottom:10px"></i>
      No hay datos para comparar aún
    </div>`;
    return;
  }

  let matches = [...state.matches];
  if (dateFilter !== 'all') {
    matches = matches.filter(m => m.datetime && getDateGuatemala(m.datetime) === dateFilter);
  }

  const me = state.currentUser;
  let html = rankingHtml();

  // Agrupar por fase
  const phases = [...new Set(matches.map(m => m.phase))];

  phases.forEach(phase => {
    const phaseMatches = matches.filter(m => m.phase === phase);
    const phaseId = phase.replace(/\s+/g, '_');

    const matchCards = phaseMatches.map(m => {
      const hasResult = m.result && m.result.home !== '' && m.result.away !== '';
      const finished  = isFinished(m);
      const live      = isLive(m);
      const timeStr   = new Date(m.datetime).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Guatemala' });
      const dateStr   = new Date(m.datetime).toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'America/Guatemala' });

      // Quién acertó
      const winners = state.users.filter(u => {
        const p = calcPoints(u.id, m, { includeLive: true });
        return p > 0 && hasResult && (finished || live);
      });
      const exactWinners = state.users.filter(u => {
        const p = calcPoints(u.id, m, { includeLive: true });
        return p === state.points.exact && hasResult && (finished || live);
      });

      // Mi predicción
      const myPick = me ? (state.picks[me.id]?.[m.id] || null) : null;
      const myNp   = myPick ? normPick(myPick) : null;
      const myPts  = me && hasResult && (finished || live) ? calcPoints(me.id, m, { includeLive: true }) : null;

      const resultBadge = finished
        ? `<span class="badge badge-gray">Final ${m.result.home}–${m.result.away}</span>`
        : live
        ? `<span class="badge badge-live"><i class="ti ti-broadcast"></i> EN VIVO ${hasResult ? m.result.home+'–'+m.result.away : ''}</span>`
        : '';

      const winnersHtml = (finished || live) && hasResult
        ? exactWinners.length
          ? `<div class="cmp-winners">${exactWinners.map(u => {
              const color = colorFor(u.name);
              return `<span class="cmp-win">
                <span class="cmp-avatar" style="background:${color}30;color:${color}">${initials(u.name)}</span>
                <span>${u.name.split(' ')[0]}</span>
                <span class="badge-win">exacto ✓</span>
              </span>`;
            }).join('')}
            ${winners.filter(u => !exactWinners.find(e => e.id === u.id)).map(u => {
              const color = colorFor(u.name);
              return `<span class="cmp-win">
                <span class="cmp-avatar" style="background:${color}30;color:${color}">${initials(u.name)}</span>
                <span>${u.name.split(' ')[0]}</span>
              </span>`;
            }).join('')}</div>`
          : winners.length
          ? `<div class="cmp-winners">${winners.map(u => {
              const color = colorFor(u.name);
              return `<span class="cmp-win">
                <span class="cmp-avatar" style="background:${color}30;color:${color}">${initials(u.name)}</span>
                <span>${u.name.split(' ')[0]}</span>
              </span>`;
            }).join('')}</div>`
          : `<div class="cmp-winners"><span class="cmp-noone">Nadie acertó</span></div>`
        : '';

      // Badge para puntos en el detalle
      const badgeFor = pts => pts === state.points.exact ? 'badge-success' : pts > 0 ? 'badge-purple' : 'badge-danger';
      const meId = me ? me.id : null;

      // Detalle: todas las predicciones de todos los participantes, ordenadas por puntos
      const detailRows = state.users
        .map(u => {
          const pk = state.picks[u.id]?.[m.id];
          const has = pickSet(pk);
          const np = has ? normPick(pk) : null;
          const pts = hasResult && has && (finished || live) ? calcPoints(u.id, m, { includeLive: true }) : null;
          return { u, has, np, pts };
        })
        .sort((a, b) => (b.pts ?? -1) - (a.pts ?? -1))
        .map(r => {
          const color = colorFor(r.u.name);
          const pickStr = r.has ? r.np.home + '–' + r.np.away : '–';
          const cls = r.pts !== null ? badgeFor(r.pts) : 'badge-gray';
          return '<div class="cmp-pred' + (r.u.id === meId ? ' me' : '') + '">'
            + '<span class="cmp-avatar" style="background:' + color + '30;color:' + color + '">' + initials(r.u.name) + '</span>'
            + '<span class="cmp-pred-name">' + r.u.name.split(' ')[0] + '</span>'
            + '<span class="cmp-pred-pick">' + pickStr + '</span>'
            + '<span class="badge ' + cls + ' cmp-pred-badge">' + (r.pts !== null ? '+' + r.pts : '·') + '</span>'
            + '</div>';
        }).join('');

      const myPickHtml = me && pickSet(myPick)
        ? `<div class="cmp-mine">
            <span class="cmp-mine-label"><i class="ti ti-user"></i> Mi pronóstico</span>
            <span class="cmp-mine-val">${myNp.home} – ${myNp.away}</span>
            ${myPts !== null ? `<span class="cmp-mine-pts">${myPts > 0 ? '+' + myPts + ' pts' : '+0'}</span>` : ''}
          </div>`
        : me
        ? `<div class="cmp-mine" style="opacity:.5">
            <span class="cmp-mine-label"><i class="ti ti-user"></i> Mi pronóstico</span>
            <span class="cmp-mine-val" style="color:var(--text-secondary);font-size:13px">Sin pronóstico</span>
          </div>`
        : '';

      return `<div class="cmp-card" id="cmpc-${m.id}">
        <div class="cmp-fixture">
          <div class="cmp-team home">${m.home} ${flagImg(m.home, 'flag')}</div>
          <div>
            ${hasResult && (finished || live)
              ? `<div class="cmp-score">${m.result.home} – ${m.result.away}</div>`
              : `<div class="cmp-vs">${timeStr}</div>`}
          </div>
          <div class="cmp-team away">${flagImg(m.away, 'flag')} ${m.away}</div>
        </div>
        <div class="cmp-subline">${dateStr} · ${phase} ${resultBadge}</div>
        ${myPickHtml}
        ${winnersHtml}
        <button class="cmp-toggle" onclick="toggleCmpCard('${m.id}')">
          <span class="cmp-toggle-label"></span><i class="ti ti-chevron-down cmp-chev"></i>
        </button>
        <div class="cmp-detail-wrap"><div class="cmp-detail">${detailRows}</div></div>
      </div>`;
    }).join('');

    html += `<div class="cmp-group open" id="cmpg-${phaseId}">
      <button class="cmp-group-head" onclick="toggleCmpGroup('${phaseId}')">
        <i class="ti ti-layout-list cmp-group-icon"></i>
        <span class="cmp-group-title">${phase}</span>
        <span class="cmp-group-count">${phaseMatches.length}</span>
        <i class="ti ti-chevron-down cmp-chev"></i>
      </button>
      <div class="cmp-group-wrap">
        <div class="cmp-group-body">${matchCards}</div>
      </div>
    </div>`;
  });

  container.innerHTML = html;
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
      state.matches.map(m => m.datetime ? getDateGuatemala(m.datetime) : null).filter(Boolean)
    )].sort();
    adminSel.innerHTML = '<option value="all">Todas las fechas</option>';
    dates.forEach(d => {
      const dt = new Date(d + 'T12:00:00');
      const label = dt.toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'America/Guatemala' });
      const o = document.createElement('option');
      o.value = d; o.textContent = label;
      adminSel.appendChild(o);
    });
    if (currentVal) adminSel.value = currentVal;
  }

  const adminDateFilter = document.getElementById('admin-date-filter')?.value || 'all';
  let matches = adminDateFilter === 'all'
    ? state.matches
    : state.matches.filter(m => m.datetime && getDateGuatemala(m.datetime) === adminDateFilter);

  if (matches.length === 0) {
    container.innerHTML = '<p style="font-size:13px;color:var(--text-secondary)">No hay partidos para esta fecha.</p>';
    return;
  }

  container.innerHTML = matches.map(m => {
    const dt = new Date(m.datetime);
    const dtStr = dt.toLocaleDateString('es', { day: 'numeric', month: 'short', timeZone: 'America/Guatemala' })
      + ' ' + dt.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Guatemala' });
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
  document.getElementById('edit-date').value  = getLocalGuatemala(m.datetime);
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
  const editDateVal = document.getElementById('edit-date').value;
  if (editDateVal) {
    // datetime-local gives local time; convert Guatemala (UTC-6) → UTC
    const localDt = new Date(editDateVal);
    const utcMs = localDt.getTime() + (-6 - (-localDt.getTimezoneOffset()/60)) * 3600000;
    // Simpler: treat input as Guatemala time, add 6h to get UTC
    const gtMs = new Date(editDateVal).getTime();
    const gtDate = new Date(editDateVal + ':00');  // local parse
    // Convert: Guatemala is UTC-6, so UTC = local + 6h
    const browserOffset = gtDate.getTimezoneOffset(); // browser's own offset in minutes
    const gtOffset = 6 * 60; // Guatemala ahead of UTC by 6h (UTC-6 means 6h behind)
    const utcDate2 = new Date(gtDate.getTime() + (browserOffset - gtOffset) * 60000);
    m.datetime = utcDate2.toISOString().replace('.000Z', 'Z').slice(0, 19) + 'Z';
  }
  m.phase    = document.getElementById('edit-phase').value        || m.phase;
  closeModal();
  await saveState();
  renderAdminMatches();
  renderMatches();
}

async function addMatch() {
  const home = document.getElementById('m-home').value.trim();
  const away = document.getElementById('m-away').value.trim();
  const rawDate = document.getElementById('m-date').value;
  let datetime = rawDate;
  if (rawDate) {
    const gtDate = new Date(rawDate);
    const browserOffset = gtDate.getTimezoneOffset();
    const gtOffset = 6 * 60;
    const utcDate = new Date(gtDate.getTime() + (browserOffset - gtOffset) * 60000);
    datetime = utcDate.toISOString().replace('.000Z', 'Z').slice(0, 19) + 'Z';
  }
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


// ─── Sincronización completa desde openfootball ──────────────────────────────
async function syncAll() {
  const btn = document.getElementById('btn-sync-all');
  const steps = ['Conectando...','Importando partidos...','Corrigiendo horarios...','Actualizando resultados...','Limpiando duplicados...'];
  let si = 0;
  const tick = () => { if (btn) btn.textContent = steps[Math.min(si++, steps.length-1)]; };
  tick(); if (btn) btn.disabled = true;

  try {
    tick();
    const res = await fetch('https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json');
    if (!res.ok) throw new Error('No se pudo conectar con openfootball');
    const data = await res.json();
    const ofMatches = data.matches || [];

    const pad = n => String(n).padStart(2,'0');

    // Convierte "19:00 UTC-6" en fecha "2026-06-29" → ISO UTC correcto
    // Usa Date.UTC() para evitar que el browser interprete como hora local (double-conversion bug)
    function toUTC(dateStr, timeAndTz) {
      const parts = (timeAndTz || '12:00 UTC-6').split(' ');
      const timeStr = parts[0], tzStr = parts[1] || 'UTC-6';
      const [h, min] = timeStr.split(':').map(Number);
      const [yyyy, mm, dd] = dateStr.split('-').map(Number);
      const tzMatch = tzStr.match(/UTC([+-]\d+)/);
      const tzOffset = tzMatch ? parseInt(tzMatch[1]) : -6;
      // Date.UTC crea timestamp en UTC puro, sin zona horaria del browser
      const utcMs = Date.UTC(yyyy, mm - 1, dd, h, min, 0) - tzOffset * 3600000;
      const u = new Date(utcMs);
      return u.getUTCFullYear() + '-' + pad(u.getUTCMonth()+1) + '-' + pad(u.getUTCDate())
        + 'T' + pad(u.getUTCHours()) + ':' + pad(u.getUTCMinutes()) + ':00Z';
    }

    function roundToPhase(round, group) {
      const r = (round || '').toLowerCase();
      if (r.includes('round of 32'))                    return '16avos de final';
      if (r.includes('round of 16'))                    return 'Octavos de final';
      if (r.includes('quarter'))                        return 'Cuartos de final';
      if (r.includes('semi'))                           return 'Semifinal';
      if (r.includes('third') || r.includes('tercer')) return 'Tercer lugar';
      if (r === 'final')                                return 'Final';
      if (group)                                        return 'Fase de grupos - ' + group;
      return 'Fase de grupos';
    }

    function isPlaceholder(name) {
      if (!name) return true;
      if (/^[WL]\d+$/.test(name)) return true;
      if (/^\d+[A-Z](\/[A-Z])*$/.test(name)) return true;
      if (/^\d[A-Z](\/[A-Z\/]+)?$/.test(name)) return true;
      return false;
    }

    // PASO 1: Importar nuevos y corregir existentes
    tick();
    let added = 0, timeFixed = 0, phaseFixed = 0, resultsFixed = 0;

    ofMatches.forEach(of => {
      const home = of.team1, away = of.team2;
      if (!home || !away || isPlaceholder(home) || isPlaceholder(away)) return;

      const datetime = toUTC(of.date, of.time);
      const phase    = roundToPhase(of.round, of.group);
      const result   = of.score?.ft
        ? { home: String(of.score.ft[0]), away: String(of.score.ft[1]) }
        : null;
      const goals1 = (of.goals1 || []).map(g => ({ name: g.name, minute: g.minute }));
      const goals2 = (of.goals2 || []).map(g => ({ name: g.name, minute: g.minute }));

      const existing = state.matches.find(m => m.home === home && m.away === away);

      if (existing) {
        if (existing.datetime !== datetime) { existing.datetime = datetime; timeFixed++; }
        if (existing.phase !== phase)       { existing.phase = phase;       phaseFixed++; }
        if (result && (existing.result?.home !== result.home || existing.result?.away !== result.away)) {
          existing.result = result; resultsFixed++;
        }
        if (result) {
          existing.goals1 = goals1;
          existing.goals2 = goals2;
        }
      } else {
        state.matches.push({
          id: 'm' + Date.now() + Math.random().toString(36).slice(2,6),
          home, away, datetime, phase,
          result: result || { home: '', away: '' }
        });
        added++;
      }
    });

    // PASO 2: Eliminar placeholders y duplicados exactos
    tick();
    const beforeCount = state.matches.length;
    state.matches = state.matches.filter(m => !isPlaceholder(m.home) && !isPlaceholder(m.away));
    const seen = new Set();
    state.matches = state.matches.filter(m => {
      const k = m.home + '|' + m.away;
      if (seen.has(k)) return false;
      seen.add(k); return true;
    });
    const removed = beforeCount - state.matches.length;

    // PASO 3: Guardar y refrescar todo
    tick();
    await saveState();
    renderAdminMatches(); renderTabla(); renderStats(); renderMatches(); renderBracket();

    const parts = [];
    if (added > 0)        parts.push(added + ' nuevos');
    if (timeFixed > 0)    parts.push(timeFixed + ' horarios corregidos');
    if (phaseFixed > 0)   parts.push(phaseFixed + ' fases corregidas');
    if (resultsFixed > 0) parts.push(resultsFixed + ' resultados actualizados');
    if (removed > 0)      parts.push(removed + ' eliminados');

    if (btn) {
      btn.textContent = parts.length ? '✓ ' + parts.join(' · ') : '✓ Todo al día';
      setTimeout(() => { btn.textContent = '🔄 Sincronizar'; btn.disabled = false; }, 4000);
    }
  } catch(e) {
    if (btn) { btn.textContent = '✗ Error: ' + e.message; btn.disabled = false; }
    console.error(e);
  }
}

// Aliases para compatibilidad
async function importFixtures()          { return syncAll(); }
async function syncResults()             { return syncAll(); }
async function fixAndDeduplicateMatches(){ return syncAll(); }

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

// ─── Bracket Mundial 2026 ────────────────────────────────────────────────────
const BRACKET_STRUCTURE = {
  r32: [
    { home: 'South Africa', away: 'Canada' },   // 0=M73
    { home: 'Germany',      away: 'Paraguay' },  // 1=M74  ↘ R16[0]
    { home: 'Netherlands',  away: 'Morocco' },   // 2=M75
    { home: 'Brazil',       away: 'Japan' },     // 3=M76  ↘ R16[2]
    { home: 'France',       away: 'Sweden' },    // 4=M77  ↘ R16[0]
    { home: 'Ivory Coast',  away: 'Norway' },    // 5=M78
    { home: 'Mexico',       away: 'Ecuador' },   // 6=M79  ↘ R16[3]
    { home: 'England',      away: 'DR Congo' },  // 7=M80
    { home: 'USA',          away: 'Bosnia & Herzegovina' }, // 8=M81
    { home: 'Belgium',      away: 'Senegal' },              // 9=M82
    { home: 'Portugal',     away: 'Croatia' },              // 10=M83
    { home: 'Spain',        away: 'Austria' },              // 11=M84
    { home: 'Switzerland',  away: 'Algeria' },              // 12=M85
    { home: 'Argentina',    away: 'Cape Verde' },           // 13=M86
    { home: 'Colombia',     away: 'Ghana' },                // 14=M87
    { home: 'Australia',    away: 'Egypt' },                // 15=M88
  ],
  // R16: W74vsW77, W73vsW75, W76vsW78, W79vsW80, W83vsW84, W81vsW82, W86vsW88, W85vsW87
  r16Pairs: [
    [1, 4],   // R16[0]: W74 vs W77
    [0, 2],   // R16[1]: W73 vs W75
    [3, 5],   // R16[2]: W76 vs W78
    [6, 7],   // R16[3]: W79 vs W80
    [10,11],  // R16[4]: W83 vs W84
    [8, 9],   // R16[5]: W81 vs W82
    [13,15],  // R16[6]: W86 vs W88
    [12,14],  // R16[7]: W85 vs W87
  ],
  // QF: W89vsW90=R16[0]vsR16[1], W91vsW92=R16[2]vsR16[3], W93vsW94=R16[4]vsR16[5], W95vsW96=R16[6]vsR16[7]
  qfPairs:  [[0,1],[2,3],[4,5],[6,7]],
  // SF: W97vsW98=QF[0]vsQF[1], W99vsW100=QF[2]vsQF[3]
  sfPairs:  [[0,1],[2,3]],
};

function getWinnerOf(home, away) {
  if (!home || !away) return null;
  const m = state.matches.find(sm =>
    (sm.home === home && sm.away === away) ||
    (sm.home === away && sm.away === home)
  );
  if (!m) return null;
  const rh = m.result?.home, ra = m.result?.away;
  if (rh === '' || rh == null || ra === '' || ra == null) return null;
  const nh = parseInt(rh), na = parseInt(ra);
  if (isNaN(nh) || isNaN(na)) return null;
  if (nh > na) return m.home;
  if (na > nh) return m.away;
  // Empate en tiempo reglamentario: desempate por penales
  const pw = penWinner(m.result);
  if (!pw) return null; // aún sin resultado de penales
  return pw === 'H' ? m.home : m.away;
}

function resolveBracket() {
  const r32 = BRACKET_STRUCTURE.r32;
  const w32 = r32.map(m => getWinnerOf(m.home, m.away));
  const w16 = BRACKET_STRUCTURE.r16Pairs.map(([a,b]) => {
    const ha = w32[a], hb = w32[b];
    return (ha && hb) ? getWinnerOf(ha, hb) : null;
  });
  const wQF = BRACKET_STRUCTURE.qfPairs.map(([a,b]) => {
    const ha = w16[a], hb = w16[b];
    return (ha && hb) ? getWinnerOf(ha, hb) : null;
  });
  const wSF = BRACKET_STRUCTURE.sfPairs.map(([a,b]) => {
    const ha = wQF[a], hb = wQF[b];
    return (ha && hb) ? getWinnerOf(ha, hb) : null;
  });
  // SF losers → 3rd place
  const sfLosers = BRACKET_STRUCTURE.sfPairs.map(([a,b]) => {
    const ha = wQF[a], hb = wQF[b];
    if (!ha || !hb) return null;
    const w = getWinnerOf(ha, hb);
    return w ? (w === ha ? hb : ha) : null;
  });
  const champion = (wSF[0] && wSF[1]) ? getWinnerOf(wSF[0], wSF[1]) : null;
  return { w32, w16, wQF, wSF, sfLosers, champion };
}

// ── Bracket radial futurista ──
// Orden angular de los 16 partidos de 16avos alrededor del círculo,
// construido para que los pares consecutivos coincidan exactamente
// con r16Pairs / qfPairs / sfPairs (ver BRACKET_STRUCTURE).
const BR_CIRCLE_ORDER = [1,4,0,2,3,5,6,7,10,11,8,9,13,15,12,14];
const BR_RADII = [392, 326, 258, 190, 122];
const BR_NODE_SIZE = [15, 13.5, 12, 11, 10];
const BR_SPIN_DUR = 60; // segundos por vuelta completa del circuito

function brAngleAt(level, idx) {
  if (level === 0) return -90 + idx * (360 / 32);
  const a1 = brAngleAt(level - 1, idx * 2);
  const a2 = brAngleAt(level - 1, idx * 2 + 1);
  return (a1 + a2) / 2;
}
function brPos(level, idx) {
  const a = brAngleAt(level, idx) * Math.PI / 180;
  const r = BR_RADII[level];
  return { x: r * Math.cos(a), y: r * Math.sin(a) };
}

let brClipSeq = 0;
// Solo dibuja un nodo cuando ya se conoce el equipo — nada de círculos
// grises de "por definir" en los niveles todavía sin resolver.
function brRadialFlag(team, x, y, r, out) {
  if (!team) return '';
  const gx = x.toFixed(1), gy = y.toFixed(1);
  const code = TEAM_FLAGS[team];
  if (!code) {
    return `<g transform="translate(${gx},${gy})" class="brw-node">
      <g class="brw-node-hover">
        <circle r="${r}" class="brw-node-ring"/>
        <text class="brw-node-q" x="0" y="1" text-anchor="middle" dominant-baseline="central">?</text>
      </g>
      <title>${team}</title>
    </g>`;
  }
  brClipSeq++;
  const cid = 'brwclip' + brClipSeq;
  const d = r * 2 - 2.4;
  return `<g transform="translate(${gx},${gy})" class="brw-node${out ? ' brw-node-out' : ''}">
    <g class="brw-node-spin">
      <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="-360 0 0" dur="${BR_SPIN_DUR}s" repeatCount="indefinite"/>
      <g class="brw-node-hover">
        <clipPath id="${cid}"><circle r="${(r - 1.2).toFixed(1)}"/></clipPath>
        <circle r="${r}" class="brw-node-ring${out ? ' brw-node-ring-out' : ''}"/>
        <image href="https://flagcdn.com/w80/${code}.png" x="${(-d / 2).toFixed(1)}" y="${(-d * 0.72 / 2).toFixed(1)}"
          width="${d.toFixed(1)}" height="${(d * 0.72).toFixed(1)}" clip-path="url(#${cid})"
          preserveAspectRatio="xMidYMid slice" class="brw-flagimg"/>
      </g>
    </g>
    <title>${team}</title>
  </g>`;
}

// Secuencia de luz por tramo (7s en total, siempre de afuera hacia adentro):
//  0-2s  → se dibuja de afuera hacia adentro, de tenue a brillante
//  2-5s  → línea completa encendida y parpadeando
//  5-7s  → se apaga de afuera hacia adentro, de brillante a tenue
const BR_EDGE_CYCLE = 7;
const BR_DASH_KT = "0;0.28571;0.71429;1";
const BR_OPACITY_KT = "0;0.28571;0.33929;0.39286;0.44643;0.5;0.55357;0.60714;0.66071;0.71429;1";
const BR_OPACITY_VALS = "0.15;1;0.55;1;0.55;1;0.55;1;0.55;1;0.15";

function brRadialEdge(x1, y1, x2, y2, alive, delay) {
  const a = [x1.toFixed(1), y1.toFixed(1), x2.toFixed(1), y2.toFixed(1)];
  if (alive) {
    const len = Math.hypot(x2 - x1, y2 - y1);
    const lenF = len.toFixed(1);
    const beginAt = (delay || 0).toFixed(2);
    const dashVals = `${lenF};0;0;${(-len).toFixed(1)}`;
    const dashAnim = `<animate attributeName="stroke-dashoffset" values="${dashVals}" keyTimes="${BR_DASH_KT}" dur="${BR_EDGE_CYCLE}s" begin="${beginAt}s" repeatCount="indefinite" calcMode="linear"/>`;
    const opacityAnim = `<animate attributeName="opacity" values="${BR_OPACITY_VALS}" keyTimes="${BR_OPACITY_KT}" dur="${BR_EDGE_CYCLE}s" begin="${beginAt}s" repeatCount="indefinite" calcMode="linear"/>`;
    return `<g>
      ${opacityAnim}
      <line x1="${a[0]}" y1="${a[1]}" x2="${a[2]}" y2="${a[3]}" class="brw-edge-glow" stroke-dasharray="${lenF} ${lenF}" stroke-dashoffset="${lenF}">${dashAnim}</line>
      <line x1="${a[0]}" y1="${a[1]}" x2="${a[2]}" y2="${a[3]}" class="brw-edge-core" stroke-dasharray="${lenF} ${lenF}" stroke-dashoffset="${lenF}">${dashAnim}</line>
    </g>`;
  }
  return `<line x1="${a[0]}" y1="${a[1]}" x2="${a[2]}" y2="${a[3]}" class="brw-edge"/>`;
}

function buildRadialBracket() {
  const { w32, w16, wQF, wSF, champion } = resolveBracket();
  const r32 = BRACKET_STRUCTURE.r32;
  const order = BR_CIRCLE_ORDER;

  const L0 = [];
  for (let p = 0; p < 32; p++) {
    const s = Math.floor(p / 2);
    const mi = order[s];
    const isHome = p % 2 === 0;
    const team = isHome ? r32[mi].home : r32[mi].away;
    const winner = w32[mi];
    const { x, y } = brPos(0, p);
    L0.push({ x, y, team, out: !!(winner && team && winner !== team) });
  }
  const L1 = [];
  for (let s = 0; s < 16; s++) {
    const mi = order[s];
    const team = w32[mi];
    const t = Math.floor(s / 2);
    const winner = w16[t];
    const { x, y } = brPos(1, s);
    L1.push({ x, y, team, out: !!(winner && team && winner !== team) });
  }
  const L2 = [];
  for (let t = 0; t < 8; t++) {
    const team = w16[t];
    const q = Math.floor(t / 2);
    const winner = wQF[q];
    const { x, y } = brPos(2, t);
    L2.push({ x, y, team, out: !!(winner && team && winner !== team) });
  }
  const L3 = [];
  for (let q = 0; q < 4; q++) {
    const team = wQF[q];
    const f = Math.floor(q / 2);
    const winner = wSF[f];
    const { x, y } = brPos(3, q);
    L3.push({ x, y, team, out: !!(winner && team && winner !== team) });
  }
  const L4 = [];
  for (let f = 0; f < 2; f++) {
    const team = wSF[f];
    const { x, y } = brPos(4, f);
    L4.push({ x, y, team, out: !!(champion && team && champion !== team) });
  }

  const edges = [];
  function link(childArr, parentArr, level) {
    for (let p = 0; p < parentArr.length; p++) {
      const c0 = childArr[p * 2], c1 = childArr[p * 2 + 1];
      const par = parentArr[p];
      [c0, c1].forEach(c => {
        edges.push({
          x1: c.x, y1: c.y, x2: par.x, y2: par.y,
          alive: !!(c.team && par.team && c.team === par.team),
          delay: level * 1.0,
        });
      });
    }
  }
  link(L0, L1, 0); link(L1, L2, 1); link(L2, L3, 2); link(L3, L4, 3);
  [L4[0], L4[1]].forEach(c => {
    edges.push({ x1: c.x, y1: c.y, x2: 0, y2: 0, alive: !!(c.team && champion && c.team === champion), delay: 4 * 1.0 });
  });

  return { levels: [L0, L1, L2, L3, L4], edges, champion };
}

// Trofeo oficial (imagen provista por el usuario, recortada al trofeo).
// El centro nunca gira: es el eje fijo alrededor del cual gira el circuito.
function brTrophyIcon() {
  return `<clipPath id="brwTrophyClip"><rect x="-24" y="-38" width="48" height="76" rx="6"/></clipPath>
  <image href="trophy-fifa26.png" x="-24" y="-38" width="48" height="76" clip-path="url(#brwTrophyClip)" preserveAspectRatio="xMidYMid slice"/>`;
}

function renderBracket() {
  const el = document.getElementById('tab-bracket');
  if (!el || el.classList.contains('hidden')) return;

  const { levels, edges, champion } = buildRadialBracket();

  let nodesSvg = '';
  levels.forEach((arr, lvl) => {
    arr.forEach(n => { nodesSvg += brRadialFlag(n.team, n.x, n.y, BR_NODE_SIZE[lvl], n.out); });
  });

  let edgesSvg = '';
  edges.forEach(e => { edgesSvg += brRadialEdge(e.x1, e.y1, e.x2, e.y2, e.alive, e.delay); });

  const spokes = Array.from({ length: 16 }, (_, i) => {
    const a = (-90 + i * (360 / 16)) * Math.PI / 180;
    const x2 = (392 * Math.cos(a)).toFixed(1), y2 = (392 * Math.sin(a)).toFixed(1);
    return `<line x1="0" y1="0" x2="${x2}" y2="${y2}" class="brw-spoke"/>`;
  }).join('');

  const champCode = champion ? TEAM_FLAGS[champion] : null;
  const champCenter = champCode
    ? `<clipPath id="brwChampClip"><circle r="30" cx="0" cy="-2"/></clipPath>
       <image href="https://flagcdn.com/w80/${champCode}.png" x="-30" y="-30" width="60" height="43.2" clip-path="url(#brwChampClip)" preserveAspectRatio="xMidYMid slice"/>`
    : brTrophyIcon();

  el.innerHTML = `
  <div class="brwrap">
    <div class="brtitle"><i class="ti ti-trophy"></i> Bracket Mundial 2026</div>
    <div class="brw-stage">
      <svg viewBox="-430 -430 860 860" class="brw-svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="brwCenterGlow" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="72">
            <animate attributeName="fx" values="-28;24;18;-30;-28" dur="7s" repeatCount="indefinite"/>
            <animate attributeName="fy" values="-22;12;28;-14;-22" dur="7s" repeatCount="indefinite"/>
            <stop offset="0%" stop-color="#fff6da" stop-opacity=".95"/>
            <stop offset="45%" stop-color="#ffcf4d" stop-opacity=".5"/>
            <stop offset="100%" stop-color="#ffcf4d" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <circle r="392" class="brw-ring"/>
        <circle r="326" class="brw-ring"/>
        <circle r="258" class="brw-ring"/>
        <circle r="190" class="brw-ring"/>
        <circle r="122" class="brw-ring"/>
        ${spokes}
        <g class="brw-rotor">
          <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="${BR_SPIN_DUR}s" repeatCount="indefinite"/>
          ${edgesSvg}
          ${nodesSvg}
        </g>
        <g class="brw-center">
          <circle r="72" class="brw-center-glow" fill="url(#brwCenterGlow)"/>
          <circle r="40" class="brw-center-disc"/>
          ${champCenter}
        </g>
      </svg>
    </div>
    ${champion ? `<div class="brw-champ-caption"><i class="ti ti-trophy"></i> Campeón: <strong>${champion}</strong></div>` : ''}
    <p class="br-note"><i class="ti ti-info-circle"></i> Se actualiza automáticamente con los resultados oficiales.</p>
  </div>`;
}
