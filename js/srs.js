/* =========================================================
   SRS — simplified SM-2 spaced repetition
   grade: 0 = qayta (again), 1 = qiyin (hard), 2 = yaxshi (good), 3 = oson (easy)
   ========================================================= */
const DAY = 86400000;
const SRS = {
  get(id) { return Store.data.srs[id] || null; },
  fresh() { return { ef: 2.5, iv: 0, reps: 0, due: 0, lapses: 0, ok: 0, bad: 0, last: 0 }; },

  grade(id, q) {
    const now = Date.now();
    const c = Store.data.srs[id] || this.fresh();
    if (q === 0) {
      c.reps = 0; c.iv = 0; c.lapses++; c.bad++;
      c.due = now + 10 * 60 * 1000; // see again in 10 minutes
    } else {
      c.ok++;
      if (c.reps === 0) c.iv = q === 3 ? 3 : 1;
      else if (c.reps === 1) c.iv = q === 1 ? 2 : q === 3 ? 7 : 4;
      else c.iv = Math.max(c.iv + 1, Math.round(c.iv * (q === 1 ? 1.2 : c.ef + (q === 3 ? 0.3 : 0))));
      c.reps++;
      c.due = now + c.iv * DAY;
    }
    c.ef = Math.max(1.3, Math.min(3, c.ef + (q === 0 ? -0.2 : q === 1 ? -0.15 : q === 3 ? 0.1 : 0)));
    c.last = now;
    Store.data.srs[id] = c;
    Store.answer(q > 0);
    Store.save();
    return c;
  },

  /* Quiz answers: a correct answer only advances the schedule when the item is due
     (prevents inflating intervals by answering the same item many times in one day). */
  quiz(id, correct) {
    const c = Store.data.srs[id];
    const now = Date.now();
    if (correct && c && c.reps > 0 && c.due > now) { c.ok++; c.last = now; Store.answer(true); Store.save(); return c; }
    return this.grade(id, correct ? 2 : 0);
  },

  // 0 unseen · 1 learning/lapsed · 2 1 rep · 3 2 reps · 4 3+ reps · 5 interval ≥ 21 days
  level(id) {
    const c = this.get(id);
    if (!c) return 0;
    if (c.reps === 0) return 1;
    if (c.iv >= 21) return 5;
    return Math.min(4, c.reps + 1);
  },
  isDue(id) { const c = this.get(id); return !!c && c.due <= Date.now(); },
  dueIds(prefix) { const now = Date.now(); return Object.entries(Store.data.srs).filter(([k, c]) => k.startsWith(prefix) && c.due <= now).sort((a, b) => a[1].due - b[1].due).map(([k]) => k); },
  weakness(id) { const c = this.get(id); if (!c) return 0; return (c.bad * 2 + (c.reps === 0 ? 1 : 0)) / (c.ok + c.bad + 1); },
  nextIntervalLabel(id, q) {
    const c = this.get(id) || this.fresh();
    if (q === 0) return '10 daq';
    let iv;
    if (c.reps === 0) iv = q === 3 ? 3 : 1;
    else if (c.reps === 1) iv = q === 1 ? 2 : q === 3 ? 7 : 4;
    else iv = Math.max(c.iv + 1, Math.round(c.iv * (q === 1 ? 1.2 : c.ef + (q === 3 ? 0.3 : 0))));
    return iv >= 30 ? Math.round(iv / 30) + ' oy' : iv + ' kun';
  },
};
