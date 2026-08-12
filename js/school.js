// Školní jádro — logika fází, bran, vstupenek, checkpointů a signálů.
//
// Žádné UI: tenhle modul používají samostatné vstupní brány (start.html,
// dp1–dp3.html, hodina.html, ucitel.html, rodic.html). Choreografie bloku dle
// zadání „P-book — Školní edice v0.4" (§5): DP1 → H2 → DP2 → H3 → DP3 → H4.
// Learning signály jdou do lokální fronty TinyAdapteru ve tvaru kontraktu
// tiny.school v0.3 (§C); po integraci se vymění jen transport.
import { TinyAdapter } from './tiny-adapter.js?v=1';

const STORE = 'pbook-school-state';
const UNIT_URL = 'content/school-unit.json';

export const School = {
  unit: null,
  state: null,
  bossAvailable: false,

  // ---------- stav ----------
  load() {
    try { this.state = JSON.parse(localStorage.getItem(STORE)) || {}; }
    catch (e) { this.state = {}; }
    this.state.tickets = this.state.tickets || {};
    this.state.tutored = this.state.tutored || {};
    this.state.telling = this.state.telling || {};
    return this.state;
  },
  save() { localStorage.setItem(STORE, JSON.stringify(this.state)); },

  async init() {
    this.load();
    const r = await fetch(UNIT_URL);
    this.unit = await r.json();
    try {
      const p = await fetch('/api/boss');
      this.bossAvailable = !!(await p.json()).available;
    } catch (e) { this.bossAvailable = false; }
    return this.unit;
  },

  phase(id) { return this.unit.phases.find(p => p.id === id); },

  // ---------- stav knihy (čteno přímo z localStorage jádra p-booku) ----------
  bookUser() {
    try { return JSON.parse(localStorage.getItem('pbook-user')) || {}; } catch (e) { return {}; }
  },
  missionDone(missionId) {
    return (this.bookUser().completedMissions || []).includes(missionId);
  },
  missionProgress(ph) {
    const read = new Set(this.bookUser().readBlocks || []);
    const core = ph.missionCore || [];
    return { read: core.filter(b => read.has(b)).length, total: core.length };
  },
  tellingArtifacts() {
    let n = 0;
    for (const k of ['pbook-private-blocks', 'pbook-block-overrides']) {
      try { n += Object.keys(JSON.parse(localStorage.getItem(k)) || {}).length; } catch (e) {}
    }
    return n;
  },

  // ---------- brány ----------
  entryOpen(ph) {
    if (!ph.entry || !ph.entry.ticket) return true;
    return !!this.state.tickets[ph.entry.ticket];
  },
  phaseDone(ph) {
    if (ph.kind === 'home') {
      if (ph.exit && ph.exit.type === 'ticket') return !!this.state.tickets[ph.id];
      return this.missionDone(ph.mission);
    }
    if (ph.id === 'H4') return this.missionDone(ph.mission || '');
    return this.entryOpen(ph) && !!(ph.entry && this.state.tickets[ph.entry.ticket]);
  },
  exitReady(ph) {
    if (ph.mission && !this.missionDone(ph.mission)) return false;
    if (ph.tutored && !(this.state.tutored[ph.tutored.id] || {}).done) return false;
    if (ph.telling && !this.state.telling.done) return false;
    return true;
  },
  currentPhaseId() {
    for (const ph of this.unit.phases) {
      if (!this.phaseDone(ph) && this.entryOpen(ph)) return ph.id;
    }
    return null;
  },

  // ---------- vstupenky ----------
  _hash(str) {
    let a = 5381;
    for (let i = 0; i < str.length; i++) a = ((a * 33) ^ str.charCodeAt(i)) >>> 0;
    return a.toString(36).toUpperCase();
  },
  ticketCode(phaseId) {
    const raw = [this.unit.unit, phaseId, new Date().toISOString().slice(0, 10)].join('|');
    const h = (this._hash(raw) + this._hash(raw + 'x')).replace(/[^A-Z0-9]/g, '').padEnd(12, '0');
    return h.slice(0, 4) + '-' + h.slice(4, 8) + '-' + h.slice(8, 12);
  },
  issueTicket(phaseId) {
    const ph = this.phase(phaseId);
    if (!ph || !this.exitReady(ph) || this.state.tickets[phaseId]) return this.state.tickets[phaseId];
    const t = { code: this.ticketCode(phaseId), date: new Date().toISOString().slice(0, 10), label: ph.exit.label };
    this.state.tickets[phaseId] = t;
    this.save();
    TinyAdapter.queue({
      domain: 'informatika/pocitacove-site',
      competence: 'dokoncil-domaci-pripravu-' + phaseId.toLowerCase(),
      level: 1, confidence: 0.8,
      source: { app: 'pbook', kind: 'home_prep', unit: this.unit.unit, lesson: phaseId }
    });
    return t;
  },

  // ---------- tutorovaný úkol ----------
  gradeLocal(cp, answer) {
    const a = (answer || '').toLowerCase();
    if (a.length < 40) return { score: 30, verdict: 'fail', feedback: 'Napiš to podrobněji — aspoň pár vět s konkrétními čísly nebo příklady.', missing: cp.hints, followUp: '' };
    const hit = cp.hints.filter(h => h.toLowerCase().split(' ').some(w => w.length > 3 && a.includes(w.slice(0, 5)))).length;
    const ratio = hit / cp.hints.length;
    if (ratio >= 0.6) return { score: 80, verdict: 'pass', feedback: 'Vypadá to dobře! (Hodnoceno bez AI — jen podle klíčových bodů.)', missing: [], followUp: '' };
    if (ratio >= 0.3) return { score: 55, verdict: 'almost', feedback: 'Dobrý směr, ale něco chybí.', missing: [], followUp: 'Zkus doplnit: ' + cp.hints.join(', ') + '.' };
    return { score: 30, verdict: 'fail', feedback: 'Tohle je zatím moc obecné. Vrať se k zadání checkpointu a odpověz konkrétně.', missing: cp.hints, followUp: '' };
  },
  async gradeCheckpoint(ph, cpIndex, answer) {
    const cp = ph.tutored.checkpoints[cpIndex];
    let grade = null;
    if (this.bossAvailable) {
      try {
        const r = await fetch('/api/boss', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: cp.prompt, hints: cp.hints, answer, missionTitle: ph.tutored.title })
        });
        grade = ((await r.json()) || {}).grade;
      } catch (e) { /* fallback níže */ }
    }
    if (!grade) grade = this.gradeLocal(cp, answer);
    const t = this.state.tutored[ph.tutored.id] = this.state.tutored[ph.tutored.id] || { checkpoints: {}, done: false };
    const prev = t.checkpoints[cp.id] || { attempts: 0 };
    t.checkpoints[cp.id] = {
      attempts: prev.attempts + 1, score: grade.score, verdict: grade.verdict,
      assisted: prev.attempts > 0 || grade.verdict !== 'pass',
      answer: (answer || '').slice(0, 600)
    };
    if (grade.verdict === 'pass' && ph.tutored.checkpoints.every(c => (t.checkpoints[c.id] || {}).verdict === 'pass') && !t.done) {
      t.done = true;
      TinyAdapter.queue({
        domain: 'informatika/pocitacove-site',
        competence: 'zmeri-a-interpretuje-rychlost-pripojeni',
        level: Math.round(ph.tutored.checkpoints.reduce((s, c) => s + t.checkpoints[c.id].score, 0) / ph.tutored.checkpoints.length) / 100,
        confidence: this.bossAvailable ? 0.7 : 0.4,
        source: { app: 'pbook', kind: 'tutored_task', unit: this.unit.unit, lesson: ph.id }
      });
    }
    this.save();
    return grade;
  },
  reportText(ph) {
    const t = this.state.tutored[ph.tutored.id];
    if (!t) return '';
    const lines = [`Report: ${ph.tutored.title} (${this.unit.unit} / ${ph.id})`,
      `Hodnoceno: ${this.bossAvailable ? 'AI zkoušející' : 'lokálně (bez AI)'}`];
    ph.tutored.checkpoints.forEach((c, i) => {
      const r = t.checkpoints[c.id];
      lines.push(`- checkpoint ${i + 1}: ${r ? `${r.verdict} (${r.score}/100, pokusů: ${r.attempts}${r.assisted ? ', s dopomocí' : ', samostatně'})` : 'nedokončen'}`);
    });
    return lines.join('\n');
  },

  // ---------- telling ----------
  markTelling(shared, note) {
    this.state.telling = { done: true, shared: !!shared, note: (note || '').slice(0, 300), date: new Date().toISOString().slice(0, 10) };
    this.save();
    TinyAdapter.queue({
      domain: 'informatika/pocitacove-site',
      competence: 'vytvoril-vlastni-telling',
      level: shared ? 1 : 0.8, confidence: 0.6,
      source: { app: 'pbook', kind: 'telling', unit: this.unit.unit, lesson: 'DP3' }
    });
  },

  // ---------- rozcvička (M1): náhodné recall otázky z kontraktů konceptů ----------
  async warmupQuestions(n) {
    const res = await fetch('content/concepts.json');
    const data = await res.json();
    const list = (data.concepts || [])
      .filter(c => c && c.contract && c.contract.recallQ && c.contract.recallA);
    const picked = list.sort(() => Math.random() - 0.5).slice(0, n || 3);
    return picked.map(c => ({ q: c.contract.recallQ, a: c.contract.recallA, concept: c.id, title: c.title }));
  },

  signals: TinyAdapter
};

if (typeof window !== 'undefined') window.School = School;
