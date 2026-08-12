// Controller vstupních bran — vykresluje trasu bloku, kroky fází, checkpointy,
// vstupenky a rozcvičku podle data-page atributu <body>. Logika je v school.js.
import { School } from './school.js?v=2';

const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---------- trasa bloku (na každé stránce) ----------
function renderRoute(activeId) {
  const el = $('skRoute');
  if (!el || !School.unit) return;
  const cur = School.currentPhaseId();
  const pageMap = { DP1: '/dp1', DP2: '/dp2', DP3: '/dp3', H2: '/hodina', H3: '/hodina', H4: '/hodina' };
  el.innerHTML = School.unit.phases.map((ph, i) => {
    const done = School.phaseDone(ph);
    const cls = ['sk-node', ph.kind === 'home' ? 'home' : 'klass', done ? 'done' : '', ph.id === (activeId || cur) ? 'now' : ''].join(' ');
    const node = `<a class="${cls}" href="${pageMap[ph.id]}${ph.kind !== 'home' ? '#' + ph.id : ''}" title="${esc(ph.title)}">
      <span class="sk-dot">${done ? '✓' : ph.id}</span><small>${ph.kind === 'home' ? 'doma' : 'třída'}</small></a>`;
    return (i ? '<span class="sk-link"></span>' : '') + node;
  }).join('');
}

// ---------- prvky ----------
function ticketHtml(t, ph) {
  return `<div class="sk-ticket">
    <div class="sk-ticket-head"><p class="sk-eyebrow">Výstupní brána · vstupenka</p><h2>${esc(t.label)}</h2></div>
    <div class="sk-ticket-body">fáze: <b>${ph.id} · ${esc(ph.topic)}</b><br>datum: <b>${t.date}</b><br>ukaž ve třídě (stačí obrazovka) nebo vytiskni</div>
    <div class="sk-ticket-code">${t.code}</div>
  </div>
  <p style="text-align:center" class="no-print">
    <button class="sk-btn ghost" onclick="navigator.clipboard&&navigator.clipboard.writeText('${t.code}')">Kopírovat kód</button>
    <button class="sk-btn ghost" onclick="print()">🖨 Vytisknout</button>
    <a class="sk-btn" href="/start">Zpět na rozcestník</a>
  </p>`;
}

function missionStepHtml(ph) {
  const mp = School.missionProgress(ph);
  const done = School.missionDone(ph.mission);
  const pct = mp.total ? Math.round(100 * mp.read / mp.total) : 0;
  return `<li class="sk-step ${done ? 'done' : ''}">
    <h3>Projdi misi v knize</h3>
    <p>Přečti základní sekce a na konci odpověz na boss otázku — hodnotí tě ${School.bossAvailable ? 'AI zkoušející (neprozradí řešení, ptá se dál)' : 'kniha podle klíčových bodů'}.</p>
    <div class="sk-progress">přečteno ${mp.read}/${mp.total} sekcí${done ? ' · boss zvládnut ✓' : ''}</div>
    <div class="sk-bar"><i style="width:${done ? 100 : pct}%"></i></div>
    <a class="sk-btn" href="/#mission-${ph.mission}">${done ? 'Otevřít misi znovu' : (mp.read ? 'Pokračovat v misi →' : 'Začít misi →')}</a>
  </li>`;
}

function tutoredStepHtml(ph) {
  const t = School.state.tutored[ph.tutored.id] || { checkpoints: {} };
  let inner = `<h3>${esc(ph.tutored.title)}</h3><p>${esc(ph.tutored.goal)}</p>`;
  if (t.done) {
    inner += `<div class="sk-fb pass" style="white-space:pre-wrap">${esc(School.reportText(ph))}</div>
      <button class="sk-btn ghost" onclick="navigator.clipboard&&navigator.clipboard.writeText(this.previousElementSibling.textContent)">Kopírovat report pro učitele</button>`;
  } else {
    let unlocked = true;
    ph.tutored.checkpoints.forEach((cp, i) => {
      if (!unlocked) return;
      const r = t.checkpoints[cp.id];
      const passed = r && r.verdict === 'pass';
      inner += `<div class="sk-cp"><b>Checkpoint ${i + 1}/${ph.tutored.checkpoints.length}:</b> ${esc(cp.prompt)}`;
      if (passed) {
        inner += `<div class="sk-fb pass">✓ Splněno (${r.score}/100)</div>`;
      } else {
        inner += `<textarea id="cp-${i}" placeholder="Tvoje odpověď — vlastními slovy, s konkrétními čísly…">${esc(r && r.answer || '')}</textarea>
          <button class="sk-btn" id="cpb-${i}" data-cp="${i}">Odeslat k hodnocení</button>
          <div id="cpf-${i}"></div>`;
        unlocked = false;
      }
      inner += '</div>';
    });
  }
  return `<li class="sk-step ${t.done ? 'done' : ''}">${inner}</li>`;
}

function tellingStepHtml(ph) {
  const done = School.state.telling.done;
  const artifacts = School.tellingArtifacts();
  let inner = `<h3>Vytvoř svůj telling</h3><p>${esc(ph.telling.brief)}</p>`;
  if (done) {
    inner += `<div class="sk-fb pass">✓ Telling hotový${School.state.telling.shared ? ' a sdílený se třídou' : ''}${School.state.telling.note ? ': ' + esc(School.state.telling.note) : ''}</div>`;
  } else {
    inner += `<div class="sk-progress">${artifacts > 0 ? `✓ V knize už máš ${artifacts} vlastní verzi/e sekcí` : 'Zatím žádná vlastní verze — otevři sekci v knize, označ text a zvol Remix (nebo ✏️ edituj ručně)'}</div>
      <a class="sk-btn ghost" href="/#ch3-stopa" style="margin:8px 0">Otevřít knihu na tématu →</a>
      <input id="tellNote" placeholder="Jaké téma a jaké přirovnání sis vybral? (1 věta)" style="width:100%;margin:8px 0;padding:9px;border:1px solid #cfcdc6;border-radius:8px;font:inherit;font-size:14.5px">
      <button class="sk-btn" id="tellDone">Hotovo — mám telling</button>
      <button class="sk-btn ghost" id="tellShared">Hotovo a sdílel jsem se třídou</button>
      <p style="margin-top:8px"><small>${esc(ph.telling.peerReview)}</small></p>`;
  }
  return `<li class="sk-step ${done ? 'done' : ''}">${inner}</li>`;
}

function exitGateHtml(ph) {
  const t = School.state.tickets[ph.id];
  if (t) return ticketHtml(t, ph);
  if (School.exitReady(ph)) {
    return `<p style="text-align:center;margin-top:22px"><button class="sk-btn big" id="issueTicket">🎫 Vystavit: ${esc(ph.exit.label)}</button></p>`;
  }
  return `<div class="sk-gate-in">🔒 <span><b>Výstupní brána:</b> dokonči kroky výš a odemkneš „${esc(ph.exit.label)}". Brána je měkká — počet pokusů není omezený.</span></div>`;
}

// ---------- stránky ----------
function renderDP(phaseId) {
  const ph = School.phase(phaseId);
  renderRoute(phaseId);
  const meta = $('skMeta');
  if (meta) meta.textContent = (ph.est || '') + ' · vše jde opakovat · nic se nikam neposílá';
  let html = '<ol class="sk-steps">';
  html += missionStepHtml(ph);
  if (ph.tutored) html += tutoredStepHtml(ph);
  if (ph.telling) html += tellingStepHtml(ph);
  html += '</ol>';
  html += exitGateHtml(ph);
  $('skDyn').innerHTML = html;

  const issue = $('issueTicket');
  if (issue) issue.onclick = () => { School.issueTicket(phaseId); renderDP(phaseId); window.scrollTo(0, 0); };
  document.querySelectorAll('[data-cp]').forEach(btn => {
    btn.onclick = async () => {
      const i = Number(btn.dataset.cp);
      const answer = ($('cp-' + i) || {}).value || '';
      if (!answer.trim()) return;
      btn.disabled = true; btn.textContent = 'Hodnotím…';
      const grade = await School.gradeCheckpoint(ph, i, answer.trim());
      if (grade.verdict === 'pass') { renderDP(phaseId); return; }
      btn.disabled = false; btn.textContent = 'Odeslat znovu';
      $('cpf-' + i).innerHTML = `<div class="sk-fb ${grade.verdict}"><b>${grade.verdict === 'almost' ? 'Skoro!' : 'Ještě ne.'}</b> ${esc(grade.feedback)}${grade.followUp ? '<br>🤔 ' + esc(grade.followUp) : ''}</div>`;
    };
  });
  const td = $('tellDone'), ts = $('tellShared');
  if (td) td.onclick = () => { School.markTelling(false, ($('tellNote') || {}).value); renderDP(phaseId); };
  if (ts) ts.onclick = () => { School.markTelling(true, ($('tellNote') || {}).value); renderDP(phaseId); };
}

function renderStart() {
  renderRoute(null);
  const cur = School.currentPhaseId();
  const ph = cur && School.phase(cur);
  const tickets = Object.keys(School.state.tickets).length;
  const cta = $('skResume');
  if (cta && ph) {
    const pageMap = { DP1: '/dp1', DP2: '/dp2', DP3: '/dp3', H2: '/hodina', H3: '/hodina', H4: '/hodina' };
    cta.innerHTML = `<a class="sk-btn big" href="${pageMap[ph.id]}">▶ Pokračuj, kde jsi: ${esc(ph.title)} · ${esc(ph.topic)}</a>
      <p class="sk-meta" style="text-align:center">vstupenek: ${tickets}/3 · ${School.bossAvailable ? 'AI zkoušející připraven' : 'AI zkoušející offline (hodnotí se lokálně)'}</p>`;
  }
  ['dp1', 'dp2', 'dp3'].forEach(p => {
    const el = $('st-' + p);
    if (!el) return;
    const phx = School.phase(p.toUpperCase());
    const t = School.state.tickets[phx.id];
    const mp = School.missionProgress(phx);
    el.textContent = t ? `✓ vstupenka ${t.code}` : `přečteno ${mp.read}/${mp.total}`;
  });
}

async function renderHodina() {
  renderRoute(null);
  let qs = [], idx = 0, revealed = false;
  const box = $('skWarm');
  async function load() { qs = await School.warmupQuestions(5); idx = 0; revealed = false; draw(); }
  function draw() {
    if (!qs.length) { box.innerHTML = '<p>Otázky se nepodařilo načíst.</p>'; return; }
    const q = qs[idx];
    box.innerHTML = `<p class="n">Rozcvička · otázka ${idx + 1}/${qs.length} · ${esc(q.title || '')}</p>
      <p class="q">${esc(q.q)}</p>
      ${revealed ? `<p class="a">${esc(q.a)}</p>` : ''}
      <p>
        ${revealed ? '' : `<button class="sk-btn" id="wReveal">Ukázat odpověď</button>`}
        <button class="sk-btn ${revealed ? '' : 'ghost'}" id="wNext">${idx + 1 < qs.length ? 'Další otázka →' : '🔄 Nové otázky'}</button>
      </p>`;
    const r = $('wReveal'); if (r) r.onclick = () => { revealed = true; draw(); };
    $('wNext').onclick = () => { if (idx + 1 < qs.length) { idx++; revealed = false; draw(); } else load(); };
  }
  await load();
  // agenda hodin
  const ag = $('skAgenda');
  if (ag) {
    ag.innerHTML = School.unit.phases.filter(p => p.kind === 'class').map(p => {
      const ok = School.entryOpen(p);
      return `<div class="sk-q" id="${p.id}"><b>${esc(p.title)} · ${esc(p.topic)}</b>${esc(p.what)}<br>
        <small>${ok ? '✓ vstupenka z ' + p.entry.ticket + ' na tomto zařízení existuje' : 'vstupní brána: vstupenka z ' + (p.entry ? p.entry.ticket : '—')}</small></div>`;
    }).join('');
  }
}

function renderUcitel() {
  renderRoute(null);
  const base = location.origin + location.pathname.replace(/[^/]*$/, '');
  const links = [
    ['Rozcestník pro žáky', base + 'start'],
    ['Domácí příprava 1 (po 1. hodině)', base + 'dp1'],
    ['Domácí příprava 2 (po 2. hodině)', base + 'dp2'],
    ['Domácí příprava 3 (po 3. hodině)', base + 'dp3'],
    ['Režim třídy (projekce, rozcvička)', base + 'hodina'],
    ['Briefing pro rodiče', base + 'rodic'],
    ['Kniha (volné čtení)', base]
  ];
  $('skLinks').innerHTML = links.map(([label, url]) =>
    `<div class="sk-copy"><span><b>${esc(label)}</b><br>${esc(url)}</span>
     <button class="sk-btn ghost" onclick="navigator.clipboard&&navigator.clipboard.writeText('${url}')">Kopírovat</button></div>`).join('');
  const exp = $('skExport');
  if (exp) exp.onclick = () => School.signals.download('local-anonymous');
  const cnt = $('skSigCount');
  if (cnt) cnt.textContent = School.signals.count();
}

// ---------- start ----------
(async function () {
  await School.init();
  const page = document.body.dataset.page;
  if (page === 'dp1') renderDP('DP1');
  else if (page === 'dp2') renderDP('DP2');
  else if (page === 'dp3') renderDP('DP3');
  else if (page === 'start') renderStart();
  else if (page === 'hodina') renderHodina();
  else if (page === 'ucitel') renderUcitel();
  else renderRoute(null); // rodic a další: jen trasa
})();
