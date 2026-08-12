// Tiny adapter — lokální fronta learning signálů ve tvaru integračního kontraktu
// „P-book ↔ tiny.school v0.3", §C (POST /v1/profile/signals).
//
// Dokud Tiny API neexistuje, signály se řadí do localStorage fronty a dají se
// exportovat (učitel/pilot). Při integraci se vymění jen flush() transport —
// tvar signálu už kontraktu odpovídá, včetně idempotentního `id`.
export const TinyAdapter = {
  QUEUE_KEY: 'pbook-tiny-signal-queue',
  endpoint: null, // po integraci: '{tiny}/v1/profile/signals'

  _load() {
    try { return JSON.parse(localStorage.getItem(this.QUEUE_KEY)) || []; }
    catch (e) { return []; }
  },
  _save(q) { localStorage.setItem(this.QUEUE_KEY, JSON.stringify(q)); },

  /**
   * Zařadí learning signál. Tvar dle kontraktu §C:
   * { domain, competence, level (0..1), confidence (0..1),
   *   source: {app, kind, unit, lesson}, occurred_at }
   */
  queue(signal) {
    const q = this._load();
    const s = Object.assign({
      id: 'sig-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7),
      source: { app: 'pbook', kind: 'event', unit: 'inf-zs2-internet', lesson: null },
      occurred_at: new Date().toISOString()
    }, signal);
    // idempotence: stejná kombinace kind+lesson+competence se přepíše (poslední stav)
    const key = x => `${x.source && x.source.kind}|${x.source && x.source.lesson}|${x.competence}`;
    const i = q.findIndex(x => key(x) === key(s));
    if (i >= 0) q[i] = s; else q.push(s);
    this._save(q);
    return s;
  },

  list() { return this._load(); },
  count() { return this._load().length; },

  /** Export pro učitele / pilot — payload přesně dle kontraktu §C. */
  exportPayload(studentRef) {
    return {
      student_ref: studentRef || 'local-anonymous',
      signals: this._load().map(({ id, ...s }) => s)
    };
  },

  download(studentRef) {
    const blob = new Blob([JSON.stringify(this.exportPayload(studentRef), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'pbook-learning-signals.json';
    a.click();
    URL.revokeObjectURL(a.href);
  },

  /** Po integraci s Tiny: odeslat frontu a při úspěchu ji vyprázdnit. */
  async flush(token) {
    if (!this.endpoint) return { sent: 0, reason: 'no-endpoint' };
    const payload = this.exportPayload();
    const res = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token,
                 'Idempotency-Key': 'pbook-' + Date.now().toString(36) },
      body: JSON.stringify(payload)
    });
    if (res.ok) { this._save([]); return { sent: payload.signals.length }; }
    return { sent: 0, reason: 'http-' + res.status };
  }
};

if (typeof window !== 'undefined') window.TinyAdapter = TinyAdapter;
