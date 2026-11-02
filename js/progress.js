/* =========================================================
   PROGRESS — LocalStorage persistence, daily stats, streak
   ========================================================= */
const Store = {
  key: 'nihongo-start-v1',
  data: null,
  defaults() {
    return {
      version: 1, createdAt: Date.now(),
      settings: { theme: 'auto', romaji: true, kana: true, uz: true, rate: 0.9, voice: '', unlockAll: false, goal: 20, casual: false },
      srs: {}, lessons: {}, phrasesLearned: {}, daily: {}, mistakes: [],
      dialogues: {}, grammar: {}, pron: {}, writing: {},
    };
  },
  load() {
    let raw = null;
    try { raw = localStorage.getItem(this.key); } catch (e) { /* storage blocked */ }
    const d = this.defaults();
    try { this.data = raw ? Object.assign(d, JSON.parse(raw)) : d; } catch (e) { this.data = d; }
    this.data.settings = Object.assign(this.defaults().settings, this.data.settings || {});
  },
  save() { try { localStorage.setItem(this.key, JSON.stringify(this.data)); } catch (e) { /* ignore */ } },
  dateKey(d = new Date()) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); },
  day(k) { k = k || this.dateKey(); if (!this.data.daily[k]) this.data.daily[k] = { sec: 0, reviews: 0, correct: 0, wrong: 0 }; return this.data.daily[k]; },
  addTime(sec) { this.day().sec += sec; this.save(); },
  answer(ok) { const d = this.day(); d.reviews++; ok ? d.correct++ : d.wrong++; },
  addMistake(m) { this.data.mistakes.unshift({ ...m, t: Date.now() }); this.data.mistakes = this.data.mistakes.slice(0, 150); },
  active(k) { const d = this.data.daily[k]; return !!d && (d.sec >= 60 || d.reviews >= 5); },
  streak() {
    let n = 0; const d = new Date();
    if (!this.active(this.dateKey(d))) d.setDate(d.getDate() - 1); // today not yet counted
    while (this.active(this.dateKey(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  },
  totalSec() { return Object.values(this.data.daily).reduce((a, d) => a + (d.sec || 0), 0); },
  export() { return JSON.stringify({ app: 'nihongo-start', exportedAt: new Date().toISOString(), data: this.data }, null, 2); },
  import(text) {
    const obj = JSON.parse(text);
    const d = obj && obj.app === 'nihongo-start' ? obj.data : obj;
    if (!d || typeof d !== 'object' || !d.srs || !d.settings) throw new Error('Fayl formati noto‘g‘ri');
    this.data = Object.assign(this.defaults(), d);
    this.data.settings = Object.assign(this.defaults().settings, d.settings);
    this.save();
  },
  reset() { this.data = this.defaults(); this.save(); },
};

/* Time tracking: counts only while the tab is visible and the user was active recently */
const Timer = {
  lastActivity: Date.now(),
  start() {
    ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(ev => addEventListener(ev, () => { this.lastActivity = Date.now(); }, { passive: true }));
    setInterval(() => {
      const speaking = typeof speechSynthesis !== 'undefined' && speechSynthesis.speaking;
      if (document.visibilityState === 'visible' && (Date.now() - this.lastActivity < 90000 || speaking)) {
        Store.addTime(15);
        if (typeof App !== 'undefined' && App.route === 'home') App.refreshHomeTime && App.refreshHomeTime();
      }
    }, 15000);
  },
};
