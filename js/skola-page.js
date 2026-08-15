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
  let ph = School.phase(phaseId);
  const custom = customTaskFromHash();
  if (custom) ph = { ...ph, tutored: custom, topic: ph.topic, what: ph.what + ' (Učitel poslal vlastní zadání úkolu — je níž.)' };
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

function b64u(obj) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(obj)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function unb64u(str) {
  try { return JSON.parse(decodeURIComponent(escape(atob(str.replace(/-/g, '+').replace(/_/g, '/'))))); }
  catch (e) { return null; }
}
// Vlastní tutorovaný úkol od učitele: #ukol-<b64url {t,g,c:[{p,h:[…]}]}> na stránce DP
// přepíše výchozí úkol z school-unit.json. Checkpointy hodnotí týž AI zkoušející.
function customTaskFromHash() {
  const m = location.hash.match(/^#ukol-(.+)$/);
  if (!m) return null;
  const d = unb64u(m[1]);
  if (!d || !d.t || !Array.isArray(d.c) || !d.c.length) return null;
  let hash36 = 0;
  for (const ch of m[1]) hash36 = (hash36 * 31 + ch.charCodeAt(0)) >>> 0;
  return {
    id: 'tc-custom-' + hash36.toString(36),
    title: String(d.t).slice(0, 90),
    goal: String(d.g || '').slice(0, 300),
    checkpoints: d.c.slice(0, 4).map((x, i) => ({
      id: 'c' + (i + 1),
      prompt: String(x.p || '').slice(0, 400),
      hints: (Array.isArray(x.h) ? x.h : []).map(h => String(h).slice(0, 60)).slice(0, 6),
    })).filter(cp => cp.prompt),
  };
}

async function renderMissionBuilder() {
  const el = $('skBuilder');
  if (!el) return;
  let concepts = [];
  try { concepts = (await (await fetch('/content/concepts.json')).json()).concepts || []; } catch (e) {}
  let proposals = [];
  try { const d = await (await fetch('/api/proposals')).json(); if (d.ok) proposals = d.proposals; } catch (e) {}
  const byCh = {};
  concepts.forEach(c => (byCh[c.chapter] = byCh[c.chapter] || []).push(c));
  el.innerHTML = `
    <h3 style="margin:2px 0 6px;font-size:16px">🎯 Sestavit misi</h3>
    <p>Vyberte koncepty k procvičení — <b>formu si žák volí sám</b> (text, komiks, ukázka kódu, jiné podání…). Z odkazu se žákovi sestaví krátká mise s boss otázkou; za zvládnutí dostane <b>mikrocertifikát</b>.</p>
    <input id="mbTitle" placeholder="Název mikromise (nepovinné, např. Opakování na test)" style="width:100%;padding:9px;border:1px solid #cfcdc6;border-radius:8px;font:inherit;font-size:14.5px;margin:6px 0">
    ${Object.entries(byCh).map(([ch, list]) => `
      <div style="margin:.5em 0"><b style="font-family:var(--mono);font-size:12px">${esc(ch)}</b><br>
      ${list.map(c => `<label style="display:inline-block;border:1px solid var(--line);border-radius:999px;padding:2px 10px;margin:3px 4px 0 0;font-size:13.5px;cursor:pointer;background:var(--card)">
        <input type="checkbox" class="mbC" value="${esc(c.id)}" data-t="${esc(c.title)}" style="vertical-align:-2px"> ${esc(c.title)}</label>`).join('')}
      </div>`).join('')}
    <div class="sk-copy" id="mbOut" style="display:none"><span id="mbLink"></span><button class="sk-btn ghost" id="mbCopy">Kopírovat</button></div>


  `;
  const update = () => {
    const sel = [...el.querySelectorAll('.mbC:checked')];
    const out = $('mbOut');
    if (!sel.length) { out.style.display = 'none'; return; }
    const payload = { c: sel.map(x => x.value) };
    const t = ($('mbTitle').value || '').trim();
    if (t) payload.t = t.slice(0, 60);
    const link = location.origin + '/#mise-' + b64u(payload);
    out.style.display = '';
    $('mbLink').innerHTML = `<b>${sel.length}× koncept</b> · odkaz pro žáky:<br>${esc(link)}`;
    $('mbCopy').onclick = () => navigator.clipboard && navigator.clipboard.writeText(link);
  };
  el.addEventListener('change', update);
  $('mbTitle').addEventListener('input', update);
}


// Builder vlastního tutorovaného úkolu: učitel sestaví zadání + checkpointy,
// odkaz #ukol-<b64u> na dp2 přepíše výchozí úkol. Hodnotí týž AI zkoušející.
function renderTaskBuilder() {
  const el = $('skTaskBuilder'); if (!el) return;
  const inp = 'width:100%;padding:9px;border:1px solid #cfcdc6;border-radius:8px;font:inherit;font-size:14px;margin:5px 0;background:#fff';
  el.innerHTML = `
    <h2 style="margin-top:30px">🧪 Vlastní tutorovaný úkol (do DP2)</h2>
    <p>Výchozí úkol v DP2 je měření rychlosti. Tady sestavíte <b>vlastní zadání</b> (třeba pozorování Wi-Fi doma, mini-výzkum cookies…): žák z odkazu dostane vaše checkpointy a každou odpověď obhájí u AI zkoušejícího — hodnotí podle vašich nápověd, co má v odpovědi zaznít.</p>
    <input id="tbT" placeholder="Název úkolu (např. Prozkoumej, co o tobě ví prohlížeč)" style="${inp}">
    <input id="tbG" placeholder="Cíl jednou větou — žák ho uvidí nad checkpointy" style="${inp}">
    ${[1, 2, 3].map(i => `
      <div style="border:1px solid var(--line);border-radius:10px;padding:8px 10px;margin:7px 0;background:var(--card)">
        <b style="font-size:13px">Checkpoint ${i}${i > 1 ? ' <span style="font-weight:400;color:#8a887f">(nepovinný)</span>' : ''}</b>
        <textarea id="tbP${i}" rows="2" placeholder="Zadání — co má žák udělat a napsat" style="${inp};resize:vertical"></textarea>
        <input id="tbH${i}" placeholder="Nápovědy pro hodnocení, oddělené čárkou (co má zaznít — žák je nevidí)" style="${inp}">
      </div>`).join('')}
    <div class="sk-copy" id="tbOut" style="display:none"><span id="tbLink"></span><button class="sk-btn ghost" id="tbCopy">Kopírovat</button></div>`;
  const update = () => {
    const t = $('tbT').value.trim();
    const c = [1, 2, 3]
      .map(i => ({ p: $('tbP' + i).value.trim(), h: $('tbH' + i).value.split(',').map(x => x.trim()).filter(Boolean) }))
      .filter(x => x.p);
    const out = $('tbOut');
    if (!t || !c.length) { out.style.display = 'none'; return; }
    const g = $('tbG').value.trim();
    const link = location.origin + '/dp2#ukol-' + b64u(g ? { t, g, c } : { t, c });
    out.style.display = '';
    $('tbLink').innerHTML = `<b>${esc(t)}</b> · ${c.length}× checkpoint · odkaz pro žáky:<br>${esc(link)}`;
    $('tbCopy').onclick = () => navigator.clipboard && navigator.clipboard.writeText(link);
  };
  el.addEventListener('input', update);
}


// Builder tvůrčího úkolu: koncept (i zatím nenapsaný pojem z mapy) + režim
// (rychlé studio / dílna s koučem) + volba zpětné vazby → odkaz + hotové zadání.
async function renderCreateBuilder() {
  const el = $('skCreateBuilder'); if (!el) return;
  let concepts = [];
  try { concepts = (await (await fetch('/content/concepts.json')).json()).concepts || []; } catch (e) {}
  let ghosts = [];
  try {
    const cm = await (await fetch('/content/concept-map.json')).json();
    ghosts = (cm.nodes || []).filter(n => !(n.pool || []).length).map(n => ({ id: n.slug, title: n.title + ' (zatím nenapsaný pojem)' }));
  } catch (e) {}
  const opts = concepts.map(c => `<option value="${esc(c.id)}">${esc(c.title)}</option>`).join('')
    + (ghosts.length ? `<optgroup label="🌱 Pojmy, které v knize ještě chybí">${ghosts.map(g => `<option value="${esc(g.id)}">${esc(g.title)}</option>`).join('')}</optgroup>` : '');
  const inp = 'padding:9px;border:1px solid #cfcdc6;border-radius:8px;font:inherit;font-size:14px;background:#fff';
  el.innerHTML = `
    <div style="display:flex;gap:.6em;flex-wrap:wrap;align-items:center;margin:.4em 0">
      <select id="cbConcept" style="${inp};flex:1 1 220px;min-width:0">${opts}</select>
      <label style="font-size:13.5px"><input type="radio" name="cbMode" value="dilna" checked> 🎓 dílna s koučem <span style="color:#8a887f">(role → domluva → tvorba → certifikát)</span></label>
      <label style="font-size:13.5px"><input type="radio" name="cbMode" value="autor"> ✍️ jen studio <span style="color:#8a887f">(rychlá volná tvorba)</span></label>
    </div>
    <div style="margin:.3em 0;font-size:13.5px">
      <b style="font-size:12.5px;color:#57554d">Forma práce:</b>
      <label style="margin-left:.6em"><input type="radio" name="cbWork" value="solo" checked> 🙋 sólo</label>
      <label style="margin-left:.6em"><input type="radio" name="cbWork" value="par"> 👥 ve dvojici <span style="color:#8a887f">(vzájemné připomínkování)</span></label>
      <label style="margin-left:.6em"><input type="radio" name="cbWork" value="soutez"> 🏆 soutěž třídy <span style="color:#8a887f">(galerie + hlasování ve třídě)</span></label>
    </div>
    <div style="margin:.25em 0;font-size:13.5px"><b style="font-size:12.5px;color:#57554d">Doporučená forma:</b>
      <select id="cbGenre" style="padding:6px;border:1px solid #cfcdc6;border-radius:8px;font:inherit;font-size:13.5px;background:#fff">
        <option value="">— nechám na žákovi —</option>
        <option value="výklad">📄 výklad</option><option value="komiks">🎭 komiks</option><option value="příběh">📖 příběh</option>
        <option value="experiment">🧪 experiment</option><option value="dialog">💬 dialog</option><option value="propočet">🧮 propočet</option>
      </select></div>
    <label style="font-size:13.5px;display:block;margin:.2em 0"><input type="checkbox" id="cbFb" checked> Chci vidět rozdělané drafty — žák mi pošle odkaz na zpětnou vazbu</label>
    <div class="sk-copy" id="cbOut" style="display:none"><span id="cbLink"></span><button class="sk-btn ghost" id="cbCopy">Kopírovat zadání</button></div>`;
  // kód třídy: stabilní pro tuto stránku (učitel ho pošle všem najednou)
  let classCode = (localStorage.getItem('sk-class-code') || '').replace(/^trida-/, '');
  if (!/^[a-z0-9]{4,10}$/.test(classCode)) { classCode = Math.random().toString(36).slice(2, 8); localStorage.setItem('sk-class-code', classCode); }
  const update = () => {
    const cid = $('cbConcept').value;
    const title = ($('cbConcept').selectedOptions[0] || {}).textContent || cid;
    const mode = document.querySelector('input[name="cbMode"]:checked').value;
    const work = document.querySelector('input[name="cbWork"]:checked').value;
    const genre = $('cbGenre') ? $('cbGenre').value : '';
    const link = location.origin + '/#' + (mode === 'dilna' ? 'dilna-' : 'autor-') + cid + (genre ? '~' + encodeURIComponent(genre) : '');
    const galLink = location.origin + '/#trida-' + classCode;
    const fb = $('cbFb').checked;
    const tvor = mode === 'dilna'
      ? 'Vyber si roli (vlastní nápad / spolu / oponent), domluv se s koučem CO vytvoříš, a tvoř.'
      : 'Napiš vlastní podání — klikni na odstavec a piš; obrázky přes [diagram: …].';
    let kroky;
    if (work === 'par') {
      kroky = `1) Utvořte dvojice. Každý otevři ${link}\n2) ${tvor}\n3) Až máš hrubou verzi: klikni na 👀 Zpětná vazba, do pole „kód třídy" napiš ${classCode}, vytvoř odkaz a POŠLI HO PARŤÁKOVI.\n4) Parťákovu práci si přečti a přidej aspoň 2 komentáře (👍 co funguje, ❓ otázka nebo 💡 návrh). On udělá totéž tobě.\n5) Podle komentářů svůj text vylepši a pošli do knihy (📤).`;
    } else if (work === 'soutez') {
      kroky = `1) Otevři ${link}\n2) ${tvor}\n3) Hotovou práci sdílej: klikni na 👀 Zpětná vazba, do pole „kód třídy" napiš ${classCode} a vytvoř odkaz.\n4) Ve třídě si všechny práce promítneme z galerie a budeme hlasovat o nejlepší.`;
    } else {
      kroky = `1) Otevři ${link}\n2) ${tvor}\n`
        + (fb ? `3) Až budeš mít hrubou verzi, klikni na 👀 Zpětná vazba${fb ? `, kód třídy ${classCode},` : ''} a odkaz mi pošli.\n` : '')
        + (mode === 'dilna' ? '4) Na konci vyplň, co jsi do tvorby přinesl/a ty — certifikát mi ukážeš.' : '3) Hotový text pošli do knihy (📤) a připrav si ho k prezentaci.');
    }
    const zadani = `Tvůrčí úkol: ${title.replace(' (zatím nenapsaný pojem)', '')}\n` + kroky;
    const out = $('cbOut');
    out.style.display = '';
    const galRow = (work !== 'solo' || fb)
      ? `<div style="margin-top:.35em;font-size:12px;color:#57554d">🖼 <b>Vaše galerie odevzdaných prací</b> (kód ${esc(classCode)}): <a href="${galLink}" target="_blank">${esc(galLink)}</a> — otevřete na projektoru, práce se objevují průběžně.</div>` : '';
    $('cbLink').innerHTML = `<b>${esc(title)}</b> · ${mode === 'dilna' ? '🎓 dílna' : '✍️ studio'} · ${work === 'par' ? '👥 dvojice' : work === 'soutez' ? '🏆 soutěž' : '🙋 sólo'}<br><span style="white-space:pre-wrap;font-size:12.5px;color:#57554d">${esc(zadani)}</span>${galRow}`;
    $('cbCopy').onclick = () => navigator.clipboard && navigator.clipboard.writeText(zadani);
  };
  el.addEventListener('change', update);
  update();
}

function renderUcitel() {
  renderRoute(null);
  renderMissionBuilder();
  renderTaskBuilder();
  renderCreateBuilder();

  // Dlaždice: panel toggle (jen jeden otevřený) + kopírování odkazů
  const base = location.origin;
  document.querySelectorAll('.sk-tile[data-panel]').forEach(t => {
    t.addEventListener('click', () => {
      const id = t.dataset.panel;
      const panel = $(id);
      const wasOpen = panel.classList.contains('open');
      document.querySelectorAll('.sk-panel').forEach(p2 => p2.classList.remove('open'));
      document.querySelectorAll('.sk-tile').forEach(t2 => t2.classList.remove('active'));
      if (!wasOpen) { panel.classList.add('open'); t.classList.add('active'); panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
    });
  });
  const flash = (t, txt) => { const h = t.querySelector('h4'); const o = h.textContent; h.textContent = txt; setTimeout(() => { h.textContent = o; }, 1400); };
  document.querySelectorAll('.sk-tile[data-copy]').forEach(t => {
    t.addEventListener('click', () => {
      const url = base + t.dataset.copy;
      if (navigator.clipboard) navigator.clipboard.writeText(url);
      flash(t, '✓ odkaz zkopírován');
    });
  });
  const gal = $('skGalTile');
  if (gal) gal.addEventListener('click', () => {
    let code = (localStorage.getItem('sk-class-code') || '').replace(/^trida-/, '');
    if (!/^[a-z0-9]{4,10}$/.test(code)) { code = Math.random().toString(36).slice(2, 8); localStorage.setItem('sk-class-code', code); }
    const url = base + '/#trida-' + code;
    if (navigator.clipboard) navigator.clipboard.writeText(url);
    flash(gal, '✓ ' + code + ' zkopírováno');
    window.open(url, '_blank');
  });

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
