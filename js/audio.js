/* =========================================================
   AUDIO — speech synthesis (TTS), voice recording, speech recognition
   ========================================================= */
const Sound = {
  supported: typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined',
  voices: [], jaVoices: [], loaded: false, listeners: [],
  init() {
    if (!this.supported) { this.loaded = true; return; }
    let prevJa = null;
    const load = () => {
      this.voices = speechSynthesis.getVoices() || [];
      this.jaVoices = this.voices.filter(v => /^ja([-_]|$)/i.test(v.lang));
      this.loaded = true;
      const has = this.jaVoices.length > 0;
      if (has !== prevJa) { prevJa = has; this.listeners.forEach(f => { try { f(); } catch (e) { } }); }
    };
    load();
    if (speechSynthesis.addEventListener) speechSynthesis.addEventListener('voiceschanged', load);
    else speechSynthesis.onvoiceschanged = load;
    setTimeout(load, 800); setTimeout(load, 2500);
    // Unstick the engine when the user returns to the tab (mobile browsers pause it)
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') this.reset(); });
    // Chrome stops long speech after ~15 s unless it is nudged
    setInterval(() => { try { if (speechSynthesis.speaking && !speechSynthesis.paused) { speechSynthesis.pause(); speechSynthesis.resume(); } } catch (e) { } }, 10000);
  },
  onVoices(f) { this.listeners.push(f); },
  hasJa() { return this.jaVoices.length > 0; },
  voice() {
    if (!this.jaVoices.length) { try { this.voices = speechSynthesis.getVoices() || []; this.jaVoices = this.voices.filter(v => /^ja([-_]|$)/i.test(v.lang)); } catch (e) { } }
    const want = Store.data.settings.voice;
    return this.jaVoices.find(v => v.voiceURI === want) || this.jaVoices.find(v => /google|kyoko|nanami|haruka|ayumi|o-ren/i.test(v.name)) || this.jaVoices[0] || null;
  },
  reset() { try { speechSynthesis.cancel(); if (speechSynthesis.paused) speechSynthesis.resume(); } catch (e) { } },
  _token: 0, _keep: [],
  /* Resolves with the playback duration in ms (0 if unsupported) */
  speak(text, opts = {}) {
    return new Promise(resolve => {
      if (!this.supported || !text) { resolve(0); return; }
      const token = ++this._token;
      const make = () => {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'ja-JP';
        const v = this.voice(); if (v) u.voice = v;
        u.rate = opts.rate || Store.data.settings.rate || 0.9;
        u.pitch = 1; u.volume = 1;
        u.onstart = () => { started = true; };
        u.onend = finish; u.onerror = e => { if (e && (e.error === 'interrupted' || e.error === 'canceled')) finish(); else if (!retried) retry(); else finish(); };
        // keep a reference: Chrome may garbage-collect the utterance and never finish it
        this._keep.push(u); if (this._keep.length > 5) this._keep.shift();
        return u;
      };
      const t0 = performance.now();
      let done = false, started = false, retried = false;
      const finish = () => { if (done) return; done = true; resolve(performance.now() - t0); };
      const retry = () => {
        if (retried || done || token !== this._token) return;
        retried = true;
        this.reset();
        try { speechSynthesis.speak(make()); } catch (e) { finish(); }
      };
      try { if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel(); if (speechSynthesis.paused) speechSynthesis.resume(); } catch (e) { }
      // speak synchronously so it stays inside the user's tap (required on iOS / some Android browsers)
      try { speechSynthesis.speak(make()); } catch (e) { finish(); return; }
      // Watchdog: if nothing started (engine stuck after cancel), reset and try once more
      setTimeout(() => { if (!started && !done && token === this._token && !speechSynthesis.speaking) retry(); }, 700);
      const est = 600 + text.length * 260 / (opts.rate || Store.data.settings.rate || 0.9);
      setTimeout(finish, Math.min(20000, est * 2.2 + 1500));
    });
  },
  stop() { this._token++; if (this.supported) this.reset(); },

  /* ---- Recording (MediaRecorder) ---- */
  rec: null, chunks: [], stream: null,
  canRecord() { return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder); },
  async startRecording() {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.chunks = [];
    this.rec = new MediaRecorder(this.stream);
    this.rec.ondataavailable = e => { if (e.data && e.data.size) this.chunks.push(e.data); };
    this.rec.start();
  },
  stopRecording() {
    return new Promise(resolve => {
      if (!this.rec) { resolve(null); return; }
      this.rec.onstop = () => {
        const blob = new Blob(this.chunks, { type: this.rec.mimeType || 'audio/webm' });
        this.stream.getTracks().forEach(t => t.stop());
        this.rec = null;
        resolve(URL.createObjectURL(blob));
      };
      this.rec.stop();
    });
  },

  /* ---- Speech recognition (Chrome / Edge, needs internet) ---- */
  Recognition: typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition || null) : null,
  canRecognize() { return !!this.Recognition; },
  recognize() {
    return new Promise((resolve, reject) => {
      const r = new this.Recognition();
      r.lang = 'ja-JP'; r.interimResults = false; r.maxAlternatives = 3;
      let got = false;
      r.onresult = e => { got = true; const alts = []; for (let i = 0; i < e.results[0].length; i++) alts.push(e.results[0][i].transcript); resolve(alts); };
      r.onerror = e => reject(e.error || 'error');
      r.onend = () => { if (!got) reject('no-speech'); };
      r.start();
    });
  },
};

/* Similarity between a recognized utterance and a target (kanji or kana form) */
function normJa(s) {
  return (s || '').replace(/[\s、。！？!?,.「」・ー〜~]/g, '').replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60)).toLowerCase();
}
function levenshtein(a, b) {
  const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}
function similarity(heard, targets) {
  let best = 0;
  for (const h of heard) for (const t of targets) {
    const a = normJa(h), b = normJa(t); if (!b) continue;
    const s = 1 - levenshtein(a, b) / Math.max(a.length, b.length);
    if (s > best) best = s;
  }
  return Math.max(0, Math.round(best * 100));
}
