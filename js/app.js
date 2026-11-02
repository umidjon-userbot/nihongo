/* =========================================================
   APP — router, views, components
   ========================================================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const kcode = ch => 'x' + [...ch].map(c => c.codePointAt(0).toString(16)).join('x');
const kdecode = s => /^x[0-9a-f]+(x[0-9a-f]+)*$/i.test(s) ? s.slice(1).split('x').map(h => String.fromCodePoint(parseInt(h, 16))).join('') : s;
const S = () => Store.data.settings;
const fmtMin = sec => { const m = Math.round(sec / 60); return m < 60 ? m + ' daq' : Math.floor(m / 60) + ' soat ' + (m % 60) + ' daq'; };

function toast(msg) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2200); }
function modal(html, mount) {
  const o = document.createElement('div'); o.className = 'overlay';
  o.innerHTML = `<div class="modal" role="dialog" aria-modal="true"><button class="btn sm icon ghost close" aria-label="Yopish">✕</button>${html}</div>`;
  const close = () => { Sound.stop(); o.remove(); document.removeEventListener('keydown', onKey); if (o._cleanup) o._cleanup(); };
  const onKey = e => { if (e.key === 'Escape') close(); };
  o.addEventListener('click', e => { if (e.target === o) close(); });
  $('.close', o).onclick = close; document.addEventListener('keydown', onKey);
  document.body.appendChild(o); mount && mount($('.modal', o), close, o);
  return close;
}
function confirmBox(text, okLabel, onOk) {
  modal(`<h3>Tasdiqlang</h3><p>${text}</p><div class="row" style="justify-content:flex-end"><button class="btn" data-no>Bekor qilish</button><button class="btn primary" data-yes>${okLabel}</button></div>`,
    (m, close) => { $('[data-no]', m).onclick = close; $('[data-yes]', m).onclick = () => { close(); onOk(); }; });
}
function download(name, text, type) {
  try {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  } catch (e) { toast('Yuklab bo‘lmadi'); }
}
function applyTheme() {
  const t = S().theme; const dark = t === 'dark' || (t === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.body.classList.toggle('hide-r', !S().romaji);
  document.body.classList.toggle('hide-k', !S().kana);
  document.body.classList.toggle('hide-u', !S().uz);
}
const lvClass = id => { const l = SRS.level(id); return l ? 'lv-' + l : ''; };
const LV_NAMES = ["ko'rilmagan", "o'rganilmoqda", '1 marta', '2 marta', '3+ marta', 'mustahkam'];

/* ---------- stroke order SVG ---------- */
function strokeSVG(text) {
  const chars = [...text].filter(c => STROKES[c]);
  if (!chars.length) return null;
  const w = 109 * chars.length;
  let g = '';
  chars.forEach((c, i) => {
    const small = /[ゃゅょャュョっッ]/.test(c);
    const tr = small ? `translate(${i * 109 + 18},28) scale(.7)` : `translate(${i * 109},0)`;
    g += `<g transform="${tr}">` + STROKES[c].map(d => `<path class="svg-stroke ghost" d="${d}"/>`).join('') + STROKES[c].map(d => `<path class="svg-stroke anim" d="${d}"/>`).join('') + '</g>';
  });
  return `<svg viewBox="0 0 ${w} 109" xmlns="http://www.w3.org/2000/svg" aria-label="Yozilish tartibi">${g}</svg>`;
}
function animateStrokes(svg, speed = 1) {
  if (!svg) return;
  const paths = $$('.anim', svg);
  svg._run = (svg._run || 0) + 1; const run = svg._run;
  paths.forEach(p => { const L = p.getTotalLength ? p.getTotalLength() : 100; p.style.transition = 'none'; p.style.strokeDasharray = L; p.style.strokeDashoffset = L; p._L = L; });
  let i = 0;
  const step = () => {
    if (svg._run !== run || i >= paths.length) return;
    const p = paths[i++]; const dur = Math.max(250, p._L * 9) / speed;
    p.getBoundingClientRect();
    p.style.transition = `stroke-dashoffset ${dur}ms ease-in-out`; p.style.strokeDashoffset = 0;
    setTimeout(step, dur + 120);
  };
  setTimeout(step, 150);
}

/* ---------- kana helpers ---------- */
const kanaOf = (script, groups) => KANA.list.filter(k => (script === 'both' || k.script === script) && (!groups || groups.includes(k.group)));
const sayKana = k => k.ch;
function kanaQuestion(item, mode, pool) {
  const same = pool.filter(x => x.ro !== item.ro && x.ch !== item.ch && x.script === item.script);
  const base = same.length >= 3 ? same : pool.filter(x => x.ro !== item.ro && x.ch !== item.ch);
  const pick = (arr, key) => { const out = []; const seen = new Set([item[key]]); for (const x of shuffle(arr)) { if (!seen.has(x[key])) { seen.add(x[key]); out.push(x); } if (out.length === 3) break; } return out; };
  const romajiLbl = r => r === 'o' && /[をヲ]/.test(item.ch) ? 'o (wo)' : r;
  if (mode === 'k2r' || mode === 'type') {
    const q = { id: item.id, kind: mode === 'type' ? 'type' : 'mc', prompt: `<div class="lbl">Bu harf qanday o'qiladi?</div><div class="big">${item.ch}</div>`, answer: item.ro, answerLabel: item.ro, mistakeLabel: `<span class="jp">${item.ch}</span>`, after: sayKana(item) };
    if (mode === 'type') q.accept = ROMAJI_ALT[item.ro] || [];
    else q.options = shuffle([item, ...pick(base, 'ro')]).map(x => ({ label: esc(x.ro), value: x.ro }));
    return q;
  }
  const opts = shuffle([item, ...pick(base, 'ch')]).map(x => ({ label: x.ch, value: x.ch, cls: 'jp' }));
  if (mode === 'r2k') return { id: item.id, kind: 'mc', prompt: `<div class="lbl">Qaysi harf «${esc(item.ro)}» deb o'qiladi?</div><div class="big" style="font-family:var(--ui);font-weight:700">${esc(item.ro)}</div>`, options: opts, answer: item.ch, answerLabel: `<span class="jp">${item.ch}</span>`, mistakeLabel: esc(item.ro), after: sayKana(item) };
  return { id: item.id, kind: 'mc', prompt: `<div class="lbl">Tinglang va eshitgan harfingizni tanlang</div><div class="big">🔊</div>`, audio: sayKana(item), options: opts, answer: item.ch, answerLabel: `<span class="jp">${item.ch}</span> (${esc(item.ro)})`, mistakeLabel: '🔊' };
}

/* ---------- practice sheet: listen, record, compare, recognize ---------- */
function openPractice(p) {
  const target = p.j; let myUrl = null;
  modal(`
    <div class="tiny">Talaffuz mashqi</div>
    <div class="practice-target"><div class="j">${esc(p.j)}</div>${p.k && p.k !== p.j ? `<div class="k jp muted">${esc(p.k)}</div>` : ''}<div class="r">${esc(p.r)}</div><div class="u muted">${esc(p.uz || '')}</div></div>
    <div class="row" style="justify-content:center"><button class="btn" data-n>🔊 Tinglash</button><button class="btn" data-s>🐢 Sekin</button></div>
    <div class="card" style="margin-top:16px;box-shadow:none">
      <h3>1. Ovozingizni yozib oling</h3>
      <p class="small muted">Namunani tinglang, keyin o'zingiz ayting va solishtiring.</p>
      <div class="row"><button class="btn primary" data-rec>⏺ Yozib olish</button><button class="btn" data-mine disabled>▶ Mening ovozim</button><button class="btn" data-cmp disabled>⇄ Solishtirish</button></div>
      <div class="small" data-recmsg style="margin-top:8px"></div>
    </div>
    <div class="card" style="box-shadow:none">
      <h3>2. Ovozni tanish (tajriba)</h3>
      <p class="small muted">Brauzer siz aytgan gapni yozib beradi va namunaga qanchalik o'xshashligini ko'rsatadi. Faqat Chrome/Edge'da, internet bilan ishlaydi.</p>
      <button class="btn" data-sr ${Sound.canRecognize() ? '' : 'disabled'}>🎤 Aytib ko'rish</button>
      <div data-srres style="margin-top:10px"></div>
      ${Sound.canRecognize() ? '' : '<div class="tiny">Bu brauzer ovozni tanishni qo‘llab-quvvatlamaydi.</div>'}
    </div>`, (m, close, o) => {
    $('[data-n]', m).onclick = () => Sound.speak(target);
    $('[data-s]', m).onclick = () => Sound.speak(target, { rate: 0.6 });
    const recBtn = $('[data-rec]', m), msg = $('[data-recmsg]', m);
    let recording = false;
    if (!Sound.canRecord()) { recBtn.disabled = true; msg.textContent = 'Bu brauzerda ovoz yozib bo‘lmaydi.'; }
    recBtn.onclick = async () => {
      if (!recording) {
        try { Sound.stop(); await Sound.startRecording(); recording = true; recBtn.innerHTML = '⏹ To‘xtatish'; msg.innerHTML = '<span class="rec-dot"></span> Yozilmoqda… gapni ayting'; }
        catch (e) { msg.textContent = 'Mikrofonga ruxsat berilmadi yoki bu oynada mikrofon bloklangan (masalan, Claude ichidagi ko‘rinishda). Ilovani GitHub Pages orqali alohida sahifada oching va mikrofonga ruxsat bering.'; }
      } else {
        recording = false; myUrl = await Sound.stopRecording(); recBtn.innerHTML = '⏺ Qayta yozish';
        msg.textContent = 'Tayyor. Endi solishtirib eshiting.'; $('[data-mine]', m).disabled = false; $('[data-cmp]', m).disabled = false;
      }
    };
    const playMine = () => new Promise(res => { if (!myUrl) return res(); const a = new window.Audio(myUrl); a.onended = res; a.onerror = res; a.play().catch(res); });
    $('[data-mine]', m).onclick = playMine;
    $('[data-cmp]', m).onclick = async () => { await Sound.speak(target); await new Promise(r => setTimeout(r, 300)); await playMine(); };
    $('[data-sr]', m).onclick = async () => {
      const box = $('[data-srres]', m); box.innerHTML = '<span class="rec-dot"></span> Gapiring…'; Sound.stop();
      try {
        const alts = await Sound.recognize();
        const sim = similarity(alts, [p.j, p.k || p.j, ...(p.alt || [])]);
        const col = sim >= 80 ? 'var(--ok)' : sim >= 55 ? 'var(--warn)' : 'var(--bad)';
        box.innerHTML = `<div class="row"><span class="sim" style="color:${col}">${sim}%</span><div><div class="tiny">Eshitildi:</div><div class="jp" style="font-size:1.1rem">${esc(alts[0])}</div></div></div><div class="small muted">${sim >= 80 ? 'Ajoyib! Juda yaqin.' : sim >= 55 ? "Yomon emas. Namunani yana tinglab, qayta urinib ko'ring." : "Sekinroq va aniqroq aytib ko'ring."} Eslatma: bu baho taxminiy.</div>`;
      } catch (e) {
        box.innerHTML = `<div class="small" style="color:var(--bad)">${e === 'not-allowed' || e === 'service-not-allowed' ? 'Mikrofonga ruxsat berilmadi yoki bu oynada bloklangan. Ilovani alohida sahifada (GitHub Pages) oching.' : e === 'network' ? 'Internet aloqasi kerak.' : 'Hech narsa eshitilmadi. Qayta urinib ko‘ring.'}</div>`;
      }
    };
    o._cleanup = () => { if (recording) Sound.stopRecording(); };
    Sound.speak(target);
  });
}

/* ---------- character modal ---------- */
function openChar(item) {
  const info = item.ex;
  const svg = strokeSVG(item.ch);
  const n = [...item.ch].reduce((a, c) => a + (STROKES[c] ? STROKES[c].length : 0), 0);
  const lv = SRS.level(item.id);
  modal(`
    <div class="char-hero">
      <div class="stroke-box">${svg ? '<div class="guide-lines"></div>' + svg : `<div class="bigglyph">${item.ch}</div>`}</div>
      <div>
        <div class="tiny">${item.script === 'hira' ? 'Hiragana' : 'Katakana'} · ${{ basic: 'asosiy', daku: 'dakuten', yoon: 'yōon' }[item.group]}</div>
        <div class="romaji-big">${esc(item.ch === 'を' || item.ch === 'ヲ' ? 'o (wo)' : item.ro)}</div>
        <div class="small muted">${n ? n + ' ta chiziq' : ''} · <span class="badge ${lv >= 4 ? 'ok' : lv ? 'warn' : ''}">${LV_NAMES[lv]}</span></div>
        <div class="row" style="margin-top:10px"><button class="btn sm" data-say="${item.ch}">🔊 Tinglash</button>${svg ? '<button class="btn sm" data-anim>✍️ Tartib</button>' : ''}</div>
      </div>
    </div>
    ${item.mn ? `<div class="mnemonic" style="margin-top:16px">💡 ${esc(item.mn)}</div>` : ''}
    ${info ? `<div class="example" style="margin-top:12px"><button class="btn sm icon" data-say="${esc(info.w)}" aria-label="Tinglash">🔊</button><div><div class="w">${esc(info.w)}</div><div class="small"><b>${esc(info.r)}</b> — ${esc(info.m)}</div></div></div>` : ''}
    <div class="row" style="margin-top:16px"><a class="btn primary" href="#kana-write-${kcode(item.ch)}">Yozishni mashq qilish</a></div>`,
    (m) => {
      const s = $('svg', m); if (s) { animateStrokes(s); $('[data-anim]', m).onclick = () => animateStrokes(s); }
      Sound.speak(item.ch);
      $$('a', m).forEach(a => a.addEventListener('click', () => { Sound.stop(); m.parentElement.remove(); }));
    });
}

/* ================== VIEWS ================== */
const Views = {};
const st = { kanaScript: 'hira', gridRomaji: true, phraseCat: 'all', phraseQuery: '', reviewDir: 'uz2jp', drill: { script: 'hira', groups: ['basic'], mode: 'k2r', count: 10 } };

function lessonUnlocked(l, script) { if (l.idx === 0 || S().unlockAll) return true; return !!Store.data.lessons[KANA_LESSONS[script][l.idx - 1].id]; }
function nextLesson() {
  for (const sc of ['hira', 'kata']) for (const l of KANA_LESSONS[sc]) if (!Store.data.lessons[l.id]) return { l, sc };
  return null;
}
function masteryPct(script) {
  const items = KANA.list.filter(k => k.script === script);
  return Math.round(items.filter(k => SRS.level(k.id) >= 2).length / items.length * 100);
}
function phrasesLearnedCount() { return Object.keys(Store.data.phrasesLearned).filter(k => Store.data.phrasesLearned[k]).length; }

/* ---------------- HOME ---------------- */
Views.home = (el) => {
  const goal = S().goal; const today = Store.day(); const min = Math.floor(today.sec / 60);
  const pct = Math.min(100, Math.round(min / goal * 100));
  const dueK = SRS.dueIds('k:').length, dueP = SRS.dueIds('p:').length;
  const nl = nextLesson();
  const plan = [];
  if (dueK) plan.push(['Kana takrorlash', `${dueK} ta harfni takrorlash vaqti keldi`, 3, '#kana-drill-srs']);
  if (nl) plan.push([`Yangi dars: ${nl.sc === 'hira' ? 'Hiragana' : 'Katakana'} ${nl.l.label}`, "Harflarni tanishing va testdan o'ting", goal >= 20 ? 6 : 4, `#kana-lessons-${nl.l.id}`]);
  else plan.push(['Zaif harflar mashqi', "Eng ko'p xato qilingan harflar", 4, '#kana-drill-weak']);
  plan.push([dueP ? 'Iboralarni takrorlash' : "Yangi iboralar", dueP ? `${dueP} ta ibora kutmoqda` : "5 ta yangi iborani qo'shing va yodlang", 3, '#speak-review']);
  if (goal >= 20) {
    const d = DIALOGUES.find(x => !Store.data.dialogues[x.id]) || DIALOGUES[Math.floor(Math.random() * DIALOGUES.length)];
    plan.push([`Rol o'yini: ${d.title}`, "Suhbatda o'z rolingizni o'ynang", 4, `#speak-dialogs-${d.id}`]);
    plan.push(['Shadowing', 'Eshiting va darhol takrorlang', 3, '#speak-shadow']);
  }
  if (goal >= 30) {
    const p = PRONUNCIATION.find(x => !Store.data.pron[x.id]); const g = GRAMMAR.find(x => !Store.data.grammar[x.id]);
    if (p) plan.push([`Talaffuz: ${p.title}`, "O'zbek tilida gapiruvchilar uchun", 4, `#pron-${p.id}`]);
    if (g) plan.push([`Grammatika: ${g.title}`, 'Qisqa dars va test', 5, `#grammar-${g.id}`]);
    plan.push(['Chalkash harflar', 'シ/ツ, ソ/ン, ね/れ/わ…', 3, '#kana-drill-confuse']);
  }
  const weak = KANA.list.filter(k => SRS.get(k.id)).sort((a, b) => SRS.weakness(b.id) - SRS.weakness(a.id)).filter(k => SRS.weakness(k.id) > 0.3).slice(0, 8);
  const days = []; for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push(d); }
  const wd = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'];
  const mins = days.map(d => Math.round((Store.data.daily[Store.dateKey(d)]?.sec || 0) / 60));
  const maxM = Math.max(goal, ...mins);
  const cal = []; const start = new Date(); start.setDate(start.getDate() - 34);
  for (let i = 0; i < 35; i++) { const d = new Date(start); d.setDate(start.getDate() + i); const m = (Store.data.daily[Store.dateKey(d)]?.sec || 0) / 60; cal.push([m === 0 ? '' : m < 5 ? 'l1' : m < goal ? 'l2' : 'l3', i === 34, Store.dateKey(d), Math.round(m)]); }
  const hour = new Date().getHours();
  el.innerHTML = `
    ${voiceNotice()}
    <div class="page-head"><h1>${hour < 12 ? 'おはよう！' : hour < 18 ? 'こんにちは！' : 'こんばんは！'} <span class="muted" style="font-weight:500;font-size:1rem">— ${hour < 12 ? 'Xayrli tong' : hour < 18 ? 'Xush kelibsiz' : 'Xayrli kech'}</span></h1><p>Kana va jonli gaplashish uchun kundalik mashg'ulot.</p></div>
    <div class="grid g2">
      <div class="card hero">
        <div class="ring" style="--p:${pct}"><div><div><b data-today>${min}</b><span>/ ${goal} daq</span></div></div></div>
        <div>
          <h3>Bugungi maqsad</h3>
          <p class="small muted" style="margin:0 0 10px">${pct >= 100 ? '🎉 Bugungi maqsad bajarildi!' : `Yana ${Math.max(0, goal - min)} daqiqa mashq qiling.`}</p>
          <div class="seg" data-goal>${[10, 20, 30].map(g => `<button class="${g === goal ? 'active' : ''}" data-g="${g}">${g} daq</button>`).join('')}</div>
        </div>
      </div>
      <div class="card grid g2" style="gap:16px">
        <div class="stat"><b>🔥 ${Store.streak()}</b><span>kunlik seriya</span></div>
        <div class="stat"><b>${fmtMin(Store.totalSec())}</b><span>jami vaqt</span></div>
        <div class="stat"><b>${masteryPct('hira')}% · ${masteryPct('kata')}%</b><span>hiragana · katakana</span></div>
        <div class="stat"><b>${phrasesLearnedCount()} / ${PHRASES.length}</b><span>o'rganilgan iboralar</span></div>
      </div>
    </div>
    <div class="section-head"><h2>Bugungi reja</h2><span class="small muted">≈ ${plan.reduce((a, p) => a + p[2], 0)} daqiqa</span></div>
    <div class="card" style="padding:6px 16px">${plan.map((p, i) => `<a class="plan-item" href="${p[3]}" style="color:inherit;text-decoration:none"><div class="num">${i + 1}</div><div class="grow"><b>${esc(p[0])}</b><small>${esc(p[1])}</small></div><span class="badge">${p[2]} daq</span></a>`).join('')}</div>
    <div class="grid g2" style="margin-top:14px">
      <div class="card"><h3>Oxirgi 7 kun</h3>
        <div class="bars">${days.map((d, i) => `<div title="${mins[i]} daq"><i class="${mins[i] ? '' : 'zero'}" style="height:${Math.max(3, mins[i] / maxM * 100)}%"></i><span>${wd[d.getDay()]}</span></div>`).join('')}</div>
      </div>
      <div class="card"><h3>Faollik taqvimi</h3><div class="cal">${cal.map(c => `<i class="${c[0]} ${c[1] ? 'today' : ''}" title="${c[2]}: ${c[3]} daq"></i>`).join('')}</div><div class="tiny" style="margin-top:8px">Oxirgi 5 hafta · to'q rang — maqsad bajarilgan kun</div></div>
    </div>
    <div class="card" style="margin-top:14px">
      <h3>Tavsiyalar</h3>
      ${weak.length ? `<p class="small muted">Ko'p xato qilinayotgan harflar — bosib takrorlang:</p><div class="weak-chars">${weak.map(k => `<button data-ch="${k.ch}">${k.ch}</button>`).join('')}</div><div style="margin-top:12px"><a class="btn sm" href="#kana-drill-weak">Zaif harflar mashqi</a></div>` : `<p class="small muted" style="margin:0">Hozircha zaif harflar yo'q. ${nl ? 'Keyingi kana darsidan davom eting.' : "Iboralar va dialoglarga e'tibor bering."}</p>`}
    </div>`;
  $$('[data-g]', el).forEach(b => b.onclick = () => { S().goal = +b.dataset.g; Store.save(); App.render(); });
  $$('[data-ch]', el).forEach(b => b.onclick = () => openChar(KANA.byChar[b.dataset.ch]));
};

function voiceNotice() {
  if (!Sound.loaded || Sound.hasJa()) return '';
  return `<details class="notice" style="margin-bottom:16px"><summary style="cursor:pointer">🔇 <b>Qurilmangizda yaponcha ovoz topilmadi</b> — qanday qo'shish?</summary><div style="margin-top:8px"><b>Windows</b>: Sozlamalar → Vaqt va til → Nutq → Yapon tilini qo'shish. <b>Android</b>: Sozlamalar → Google nutq xizmati → Yapon tili ovozini yuklab olish. <b>iPhone</b>: Sozlamalar → Universal kirish → O'qib berish → Ovozlar → Yapon. Chrome brauzerida odatda tayyor yaponcha ovoz bo'ladi. Qo'shgach, sahifani yangilang.</div></details>`;
}

/* ---------------- KANA ---------------- */
Views.kana = (el, sub = 'table', param) => {
  const tabs = [['table', 'Jadval'], ['lessons', 'Darslar'], ['drill', 'Mashqlar'], ['write', 'Yozish'], ['loan', "Katakana so'zlar"]];
  el.innerHTML = `<div class="page-head"><h1>Kana — ひらがな・カタカナ</h1><p>Yapon yozuvining ikki asosiy alifbosi. Avval hiragana, keyin katakana.</p></div>
    <div class="tabs">${tabs.map(t => `<a class="tab ${t[0] === sub ? 'active' : ''}" href="#kana-${t[0]}" style="text-decoration:none;text-align:center">${t[1]}</a>`).join('')}</div><div data-body></div>`;
  const body = $('[data-body]', el);
  ({ table: kanaTable, lessons: kanaLessons, drill: kanaDrill, write: kanaWrite, loan: kanaLoan }[sub] || kanaTable)(body, param);
};

function scriptSeg(onChange, cur = st.kanaScript) {
  return `<div class="seg" data-script><button class="${cur === 'hira' ? 'active' : ''}" data-s="hira">ひらがな</button><button class="${cur === 'kata' ? 'active' : ''}" data-s="kata">カタカナ</button></div>`;
}
function bindScriptSeg(el, cb) { $$('[data-script] button', el).forEach(b => b.onclick = () => { st.kanaScript = b.dataset.s; cb(); }); }

function kanaTable(el) {
  const rows = KANA.rows[st.kanaScript];
  const cell = k => k ? `<button class="kcell" data-ch="${k.ch}" aria-label="${k.ch} ${k.ro}"><span class="g">${k.ch}</span>${st.gridRomaji ? `<span class="ro">${esc(k.ro)}</span>` : ''}<span class="lv ${lvClass(k.id)}"></span></button>` : '<div class="kcell empty"></div>';
  const sec = (title, group, cls) => `<div class="section-head"><h2>${title}</h2></div><div class="kgrid ${cls || ''}">${rows.filter(r => r.group === group).map(r => r.slots.map(cell).join('')).join('')}</div>`;
  el.innerHTML = `<div class="row between"><div class="row">${scriptSeg()}<label class="check small"><input type="checkbox" data-ro ${st.gridRomaji ? 'checked' : ''}> Romaji</label></div>
    <div class="legend"><span><i style="background:var(--lv0)"></i>yangi</span><span><i style="background:var(--lv1)"></i>o'rganilmoqda</span><span><i style="background:var(--lv3)"></i>yaxshi</span><span><i style="background:var(--lv5)"></i>mustahkam</span></div></div>
    <p class="small muted" style="margin-top:12px">Harfni bosing: tovush, yozilish tartibi, eslab qolish usuli va misol.</p>
    ${sec('Asosiy harflar (gojūon)', 'basic')}${sec('Dakuten ゛ va handakuten ゜', 'daku')}${sec("Yōon — qo'shma bo'g'inlar", 'yoon', 'y3')}
    <div class="card" style="margin-top:22px"><h3>Muhim qoidalar</h3>
      <p class="small"><b>Kichik っ/ッ</b> — keyingi undoshni ikkilaydi: きって (kitte). <b>Cho'ziq unlilar</b> — hiraganada unli qo'shiladi (おかあさん), katakanada ー (コーヒー). <b>は, へ, を</b> bog'lovchi bo'lganda «wa», «e», «o» o'qiladi. <a href="#pron-long">Batafsil — Talaffuz bo'limida</a>.</p></div>`;
  bindScriptSeg(el, () => kanaTable(el));
  $('[data-ro]', el).onchange = e => { st.gridRomaji = e.target.checked; kanaTable(el); };
  $$('[data-ch]', el).forEach(b => b.onclick = () => openChar(KANA.byChar[b.dataset.ch]));
}

function kanaLessons(el, param) {
  if (param) { const sc = param.startsWith('kata') ? 'kata' : 'hira'; const l = KANA_LESSONS[sc].find(x => x.id === param); if (l) return kanaLesson(el, l, sc); }
  const list = KANA_LESSONS[st.kanaScript];
  const done = list.filter(l => Store.data.lessons[l.id]).length;
  el.innerHTML = `<div class="row between">${scriptSeg()}<span class="small muted">${done} / ${list.length} dars topshirilgan</span></div>
    <div class="progress ok" style="margin:14px 0 18px"><i style="width:${done / list.length * 100}%"></i></div>
    <div class="lesson-list">${list.map((l, i) => { const ok = !!Store.data.lessons[l.id], un = lessonUnlocked(l, st.kanaScript);
      return `<${un ? 'a' : 'div'} class="lesson ${ok ? 'done' : ''} ${un ? '' : 'locked'}" ${un ? `href="#kana-lessons-${l.id}"` : ''} style="color:inherit;text-decoration:none"><div class="n">${ok ? '✓' : un ? i + 1 : '🔒'}</div><div><div class="t">${l.label}</div><div class="tiny">${l.chars.length} ta harf</div></div></${un ? 'a' : 'div'}>`; }).join('')}</div>
    <p class="tiny" style="margin-top:14px">Har bir darsdan keyingi test 80% dan yuqori bo'lsa, keyingi dars ochiladi. Hammasini birdan ochish — Sozlamalarda.</p>`;
  bindScriptSeg(el, () => kanaLessons(el));
}

function kanaLesson(el, l, sc) {
  const prevChars = KANA_LESSONS[sc].slice(0, l.idx).flatMap(x => x.chars);
  el.innerHTML = `<div class="row between"><a class="btn sm" href="#kana-lessons">← Darslar</a><span class="badge ${Store.data.lessons[l.id] ? 'ok' : ''}">${Store.data.lessons[l.id] ? '✓ topshirilgan' : (l.idx + 1) + '-dars'}</span></div>
    <h2 style="margin-top:16px" class="jp">${l.chars.map(c => c.ch).join(' ')}</h2>
    <p class="muted small">Har bir harfni tinglang, eslab qolish usulini o'qing va yozilish tartibini ko'ring. Keyin testdan o'ting.</p>
    <div class="intro-cards">${l.chars.map(c => `<div class="intro-card"><div class="top"><div class="g">${c.ch}</div><div><div style="font-weight:700;font-size:1.2rem">${esc(c.ch === 'を' || c.ch === 'ヲ' ? 'o (wo)' : c.ro)}</div><div class="row" style="gap:6px;margin-top:4px"><button class="btn sm icon" data-say="${c.ch}" aria-label="Tinglash">🔊</button><button class="btn sm" data-open="${c.ch}">✍️</button></div></div></div>
      ${c.mn ? `<div class="small muted">💡 ${esc(c.mn)}</div>` : ''}${c.ex ? `<div class="small" style="margin-top:6px"><span class="jp" style="font-size:1.05rem">${esc(c.ex.w)}</span> <b>${esc(c.ex.r)}</b> — ${esc(c.ex.m)} <button class="btn sm icon ghost" data-say="${esc(c.ex.w)}">🔊</button></div>` : ''}</div>`).join('')}</div>
    <div class="row" style="margin-top:20px;justify-content:center"><button class="btn primary" data-start style="min-width:220px">Testni boshlash →</button></div>`;
  $$('[data-open]', el).forEach(b => b.onclick = () => openChar(KANA.byChar[b.dataset.open]));
  const build = () => {
    const pool = [...l.chars, ...prevChars];
    const review = sample(prevChars, Math.min(4, prevChars.length));
    const items = shuffle([...l.chars, ...l.chars, ...review]).slice(0, Math.max(10, l.chars.length + 4));
    const modes = ['k2r', 'r2k', 'a2k', 'k2r'];
    return items.map((it, i) => kanaQuestion(it, modes[i % modes.length], pool.length >= 4 ? pool : kanaOf(sc, ['basic'])));
  };
  $('[data-start]', el).onclick = () => Quiz.run(el, {
    title: 'Dars testi', area: 'kana', passPct: 80, questions: build(), regen: build, onBack: () => App.render(),
    onDone: r => { if (r.pass) { Store.data.lessons[l.id] = true; Store.save(); } },
  });
}

function kanaDrill(el, param) {
  const d = st.drill;
  if (param === 'srs') d.mode = 'srs'; else if (param === 'weak') d.mode = 'weak'; else if (param === 'confuse') d.mode = 'confuse';
  const modes = [['k2r', 'Kana → romaji', 'Harfni ko‘rib, tovushini tanlang'], ['type', 'Kana → yozib javob', 'Romajini klaviaturada yozing'], ['r2k', 'Romaji → kana', 'Tovush berilgan, harfni toping'], ['a2k', 'Eshitib tanlash', 'Tinglang va harfni tanlang'], ['speed', 'Tezlik rejimi ⚡', '20 savol, vaqt o‘lchanadi'], ['confuse', 'Chalkash juftliklar', 'シ/ツ, ソ/ン, ね/れ/わ…'], ['srs', 'SRS takrorlash', 'Vaqti kelgan harflar'], ['weak', 'Zaif harflar', 'Ko‘p xato qilinganlar']];
  const due = SRS.dueIds('k:').length;
  el.innerHTML = `<div class="card">
    <h3>Mashq turi</h3>
    <div class="grid g4" style="gap:8px">${modes.map(m => `<button class="lesson ${d.mode === m[0] ? 'sel' : ''}" data-m="${m[0]}" style="display:block"><b style="font-size:.92rem">${m[1]}</b>${m[0] === 'srs' ? ` <span class="badge ${due ? 'red' : ''}">${due}</span>` : ''}<div class="tiny">${m[2]}</div></button>`).join('')}</div>
    <div class="grid g3" style="margin-top:18px">
      <div><div class="tiny" style="margin-bottom:6px">Alifbo</div><div class="seg" data-sc>${[['hira', 'ひらがな'], ['kata', 'カタカナ'], ['both', 'Aralash']].map(x => `<button class="${d.script === x[0] ? 'active' : ''}" data-v="${x[0]}">${x[1]}</button>`).join('')}</div></div>
      <div><div class="tiny" style="margin-bottom:6px">Harflar to'plami</div><div class="row" style="gap:12px">${[['basic', 'Asosiy'], ['daku', 'Dakuten'], ['yoon', 'Yōon']].map(x => `<label class="check small"><input type="checkbox" data-gr="${x[0]}" ${d.groups.includes(x[0]) ? 'checked' : ''}>${x[1]}</label>`).join('')}</div></div>
      <div><div class="tiny" style="margin-bottom:6px">Savollar soni</div><div class="seg" data-cnt>${[10, 20, 30].map(n => `<button class="${d.count === n ? 'active' : ''}" data-v="${n}">${n}</button>`).join('')}</div></div>
    </div>
    <button class="btn primary" data-go style="margin-top:20px;width:100%">Boshlash →</button>
  </div>`;
  $$('[data-m]', el).forEach(b => b.onclick = () => { d.mode = b.dataset.m; kanaDrill(el); });
  $$('[data-sc] button', el).forEach(b => b.onclick = () => { d.script = b.dataset.v; kanaDrill(el); });
  $$('[data-cnt] button', el).forEach(b => b.onclick = () => { d.count = +b.dataset.v; kanaDrill(el); });
  $$('[data-gr]', el).forEach(c => c.onchange = () => { d.groups = $$('[data-gr]', el).filter(x => x.checked).map(x => x.dataset.gr); if (!d.groups.length) { d.groups = ['basic']; kanaDrill(el); } });
  $('[data-go]', el).onclick = () => {
    const build = () => buildDrill(d);
    const qs = build();
    if (!qs.length) { toast(d.mode === 'srs' ? "Hozircha takrorlanadigan harf yo'q 👍" : "Avval bir nechta harfni o'rganing"); return; }
    Quiz.run(el, { title: modes.find(m => m[0] === d.mode)[1], area: 'kana', speed: d.mode === 'speed', questions: qs, regen: build, onBack: () => kanaDrill(el) });
  };
}

function buildDrill(d) {
  const pool = kanaOf(d.script, d.groups).filter(k => !/[ぢづヂヅヲ]/.test(k.ch));
  const all = kanaOf(d.script).filter(k => !/[ヂヅヲ]/.test(k.ch));
  const n = d.mode === 'speed' ? 20 : d.count;
  if (d.mode === 'confuse') {
    const groups = CONFUSABLE.filter(g => d.script === 'both' || g.set.every(c => KANA.byChar[c].script === d.script));
    const gs = groups.length ? groups : CONFUSABLE;
    return Array.from({ length: n }, (_, i) => {
      const g = gs[Math.floor(Math.random() * gs.length)]; const items = g.set.map(c => KANA.byChar[c]); const it = items[Math.floor(Math.random() * items.length)];
      const opts = i % 2 ? items.map(x => ({ label: x.ch, value: x.ch, cls: 'jp' })) : items.map(x => ({ label: x.ro, value: x.ch }));
      return { id: it.id, kind: 'mc', prompt: i % 2 ? `<div class="lbl">Qaysi biri «${it.ro}»?</div><div class="big" style="font-family:var(--ui);font-weight:700">${it.ro}</div>` : `<div class="lbl">Bu qaysi harf?</div><div class="big">${it.ch}</div>`,
        options: shuffle(opts), answer: it.ch, answerLabel: `<span class="jp">${it.ch}</span> (${it.ro})`, mistakeLabel: it.ro, explain: '💡 ' + esc(g.tip), after: it.ch };
    });
  }
  let items;
  if (d.mode === 'srs') items = SRS.dueIds('k:').map(id => KANA.byChar[id.slice(2)]).filter(k => k && (d.script === 'both' || k.script === d.script)).slice(0, n);
  else if (d.mode === 'weak') items = all.filter(k => SRS.get(k.id)).sort((a, b) => SRS.weakness(b.id) - SRS.weakness(a.id)).slice(0, Math.min(n, 12));
  else items = [];
  if (d.mode === 'weak' && items.length) items = shuffle([...items, ...items]).slice(0, n);
  if (!items.length && (d.mode === 'srs' || d.mode === 'weak')) return [];
  if (!items.length) { while (items.length < n) items.push(...shuffle(pool)); items = items.slice(0, n); }
  const modeFor = i => d.mode === 'speed' ? (i % 2 ? 'r2k' : 'k2r') : ['srs', 'weak'].includes(d.mode) ? ['k2r', 'r2k', 'a2k'][i % 3] : d.mode;
  const qpool = pool.length >= 4 ? pool : all;
  return items.map((it, i) => kanaQuestion(it, modeFor(i), qpool));
}

function kanaWrite(el, param) {
  let ch = param ? kdecode(param) : null;
  if (ch && KANA.byChar[ch]) st.kanaScript = KANA.byChar[ch].script;
  const list = KANA.list.filter(k => k.script === st.kanaScript && k.group !== 'yoon' && STROKES[k.ch]);
  if (!ch || !KANA.byChar[ch] || KANA.byChar[ch].script !== st.kanaScript) ch = list[0].ch;
  const item = KANA.byChar[ch]; const idx = list.findIndex(k => k.ch === ch);
  let showGuide = true;
  el.innerHTML = `<div class="write-wrap">
    <div class="card">
      <div class="row between"><div><span class="jp" style="font-size:1.6rem">${ch}</span> <b>${esc(item.ro)}</b> <span class="tiny">· ${STROKES[ch].length} ta chiziq</span></div>
        <div class="row" style="gap:6px"><button class="btn sm icon" data-prev aria-label="Oldingi">◀</button><button class="btn sm icon" data-next aria-label="Keyingi">▶</button></div></div>
      <div class="canvas-box" style="margin-top:12px"><div class="cross"></div>${strokeSVG(ch).replace('<svg', '<svg data-anim-svg class="guide-svg"')}<canvas></canvas></div>
      <div class="row" style="justify-content:center;margin-top:12px"><button class="btn sm" data-clear>🧽 Tozalash</button><button class="btn sm on" data-guide>👁 Yo'riqnoma</button><button class="btn sm" data-anim>✍️ Tartibni ko'rsatish</button><button class="btn sm icon" data-say="${ch}" aria-label="Tinglash">🔊</button></div>
      <div style="margin-top:16px;text-align:center"><div class="tiny" style="margin-bottom:6px">O'zingizni baholang (avtomatik tanish yo'q):</div>
        <div class="row" style="justify-content:center"><button class="btn sm" data-self="2">😊 Yaxshi chiqdi</button><button class="btn sm" data-self="1">😐 O'rtacha</button><button class="btn sm" data-self="0">🔁 Qayta mashq</button></div></div>
    </div>
    <div class="card"><div class="row between">${scriptSeg()}</div>
      <div class="mini-grid" style="margin-top:12px">${list.map(k => `<button class="${k.ch === ch ? 'active' : ''}" data-w="${k.ch}" title="${k.ro}">${k.ch}</button>`).join('')}</div>
      <p class="tiny" style="margin-top:12px">Maslahat: avval «Tartibni ko'rsatish»ni ko'ring, keyin barmoq yoki sichqoncha bilan xira harf ustidan yozing. Keyin yo'riqnomani o'chirib, xotiradan yozing.</p></div>
  </div>`;
  const go = c => { location.hash = '#kana-write-' + kcode(c); };
  bindScriptSeg(el, () => go(KANA.list.find(k => k.script === st.kanaScript).ch));
  $$('[data-w]', el).forEach(b => b.onclick = () => go(b.dataset.w));
  $('[data-prev]', el).onclick = () => go(list[(idx - 1 + list.length) % list.length].ch);
  $('[data-next]', el).onclick = () => go(list[(idx + 1) % list.length].ch);
  const box = $('.canvas-box', el), cv = $('canvas', box), svg = $('[data-anim-svg]', box);
  const ctx = cv.getContext('2d');
  const size = () => { const r = box.getBoundingClientRect(); const dpr = devicePixelRatio || 1; cv.width = r.width * dpr; cv.height = r.height * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(6, r.width / 28); ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#c0392b'; };
  size();
  let drawing = false, last = null;
  const pos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  cv.onpointerdown = e => { drawing = true; last = pos(e); cv.setPointerCapture(e.pointerId); ctx.beginPath(); ctx.arc(last[0], last[1], ctx.lineWidth / 2.2, 0, 7); ctx.fillStyle = ctx.strokeStyle; ctx.fill(); };
  cv.onpointermove = e => { if (!drawing) return; const p = pos(e); ctx.beginPath(); ctx.moveTo(last[0], last[1]); ctx.lineTo(p[0], p[1]); ctx.stroke(); last = p; };
  cv.onpointerup = cv.onpointercancel = () => { drawing = false; };
  $('[data-clear]', el).onclick = () => ctx.clearRect(0, 0, cv.width, cv.height);
  $('[data-guide]', el).onclick = e => { showGuide = !showGuide; svg.style.display = showGuide ? '' : 'none'; e.currentTarget.classList.toggle('on', showGuide); };
  $('[data-anim]', el).onclick = () => { svg.style.display = ''; animateStrokes(svg, 0.9); };
  $$('[data-self]', el).forEach(b => b.onclick = () => {
    const v = +b.dataset.self; Store.data.writing[ch] = v; Store.save();
    if (v === 0) { ctx.clearRect(0, 0, cv.width, cv.height); toast('Yana bir bor yozib ko‘ring ✍️'); }
    else { toast(v === 2 ? 'Zo‘r! Keyingi harf →' : 'Yaxshi, davom eting'); setTimeout(() => go(list[(idx + 1) % list.length].ch), 600); }
  });
}

function kanaLoan(el) {
  el.innerHTML = `<p class="muted">Katakana asosan chet tilidan kirgan so'zlar uchun ishlatiladi. Bu so'zlar gaplashishda juda ko'p uchraydi — ularni bilish lug'atingizni tez boyitadi.</p>
    <div class="row" style="margin:6px 0 18px"><button class="btn primary" data-q="mean">Test: katakana → ma'no</button><button class="btn" data-q="listen">Test: eshitib tanlash</button></div>
    <h2>Inglizcha so'z katakanaga qanday aylanadi</h2>
    <div class="grid g3">${LOAN_RULES.map(r => `<div class="card" style="margin:0"><b class="small">${esc(r.rule)}</b><div class="stack" style="margin-top:8px">${r.ex.map(e => `<button class="word-chip" data-say="${e[0]}" style="width:100%"><span class="jp">${e[0]}</span><span><b class="small">${e[1]}</b><small>${e[2]}</small></span></button>`).join('')}</div></div>`).join('')}</div>
    <div class="section-head"><h2>Ko'p ishlatiladigan so'zlar</h2><span class="small muted">${LOANWORDS.length} ta</span></div>
    <div class="card" style="padding:4px 12px;overflow-x:auto"><table class="ltable"><thead><tr><th></th><th>Katakana</th><th>Romaji</th><th>Ma'nosi</th></tr></thead><tbody>
      ${LOANWORDS.map(w => `<tr><td style="width:40px"><button class="btn sm icon ghost" data-say="${w[0]}" aria-label="Tinglash">🔊</button></td><td class="jp">${w[0]}</td><td>${esc(w[1])}</td><td class="muted">${esc(w[2])}</td></tr>`).join('')}</tbody></table></div>`;
  const build = kind => () => sample(LOANWORDS, 10).map(w => {
    const others = sample(LOANWORDS.filter(x => x[2] !== w[2] && x[0] !== w[0]), 3);
    if (kind === 'mean') return { id: 'l:' + w[0], kind: 'mc', oneCol: false, prompt: `<div class="lbl">Bu so'z nimani anglatadi?</div><div class="mid">${w[0]}</div>`, options: shuffle([w, ...others]).map(x => ({ label: esc(x[2]), value: x[2], cls: 'text' })), answer: w[2], answerLabel: esc(w[2]), mistakeLabel: `<span class="jp">${w[0]}</span>`, after: w[0], explain: `<span class="jp">${w[0]}</span> — <b>${esc(w[1])}</b>` };
    return { id: 'l:' + w[0], kind: 'mc', prompt: `<div class="lbl">Tinglang va so'zni tanlang</div><div class="big">🔊</div>`, audio: w[0], options: shuffle([w, ...others]).map(x => ({ label: x[0], value: x[0], cls: 'jp' })), answer: w[0], answerLabel: `<span class="jp">${w[0]}</span> — ${esc(w[2])}`, mistakeLabel: '🔊' };
  });
  $$('[data-q]', el).forEach(b => b.onclick = () => { const bld = build(b.dataset.q); Quiz.run(el, { title: "Katakana so'zlar", area: 'loan', questions: bld(), regen: bld, onBack: () => kanaLoan(el) }); });
}

/* ---------------- SPEAK ---------------- */
Views.speak = (el, sub = 'phrases', param) => {
  const tabs = [['phrases', 'Iboralar'], ['dialogs', 'Dialoglar'], ['shadow', 'Shadowing'], ['review', 'Takrorlash']];
  const due = SRS.dueIds('p:').length;
  el.innerHTML = `${voiceNotice()}<div class="page-head"><h1>Gapirish — 話す</h1><p>Tayyor iboralar, rol o'yinlari va eshitib-takrorlash mashqlari.</p></div>
    <div class="tabs">${tabs.map(t => `<a class="tab ${t[0] === sub ? 'active' : ''}" href="#speak-${t[0]}" style="text-decoration:none;text-align:center">${t[1]}${t[0] === 'review' && due ? ` <span class="badge red">${due}</span>` : ''}</a>`).join('')}</div><div data-body></div>`;
  const body = $('[data-body]', el);
  ({ phrases: speakPhrases, dialogs: speakDialogs, shadow: speakShadow, review: speakReview }[sub] || speakPhrases)(body, param);
};

function markLearned(id, on) {
  Store.data.phrasesLearned[id] = on;
  if (on && !Store.data.srs[id]) { const c = SRS.fresh(); c.due = Date.now(); Store.data.srs[id] = c; }
  Store.save();
}

function speakPhrases(el) {
  const casual = S().casual;
  const render = () => {
    const q = st.phraseQuery.trim().toLowerCase();
    let list = PHRASES.filter(p => st.phraseCat === 'all' || (st.phraseCat === 'learned' ? Store.data.phrasesLearned[p.id] : p.cat === st.phraseCat));
    if (q) list = list.filter(p => [p.j, p.k, p.r, p.uz, p.cj || ''].some(s => s.toLowerCase().includes(q)));
    $('[data-list]', el).innerHTML = list.length ? list.map(p => {
      const useC = casual && p.cj; const j = useC ? p.cj : p.j; const r = useC ? p.cr : p.r;
      return `<div class="phrase ${Store.data.phrasesLearned[p.id] ? 'learned' : ''}">
        <div><div class="j">${esc(j)}</div>${!useC && p.k !== p.j ? `<div class="k">${esc(p.k)}</div>` : ''}<div class="r">${esc(r)}</div><div class="u">${esc(p.uz)}</div>
          ${p.cj ? `<div class="casual">${useC ? 'Rasmiy' : "Do'stona"}: <b>${esc(useC ? p.j : p.cj)}</b> <span class="r">${esc(useC ? p.r : p.cr)}</span></div>` : ''}
          ${p.note ? `<div class="note">ℹ️ ${esc(p.note)}</div>` : ''}</div>
        <div class="acts"><button class="btn sm icon" data-say="${esc(j)}" aria-label="Tinglash">🔊</button><button class="btn sm icon" data-say="${esc(j)}" data-rate="0.6" aria-label="Sekin">🐢</button><button class="btn sm icon" data-pr="${p.id}" aria-label="Mashq">🎤</button><button class="btn sm icon ${Store.data.phrasesLearned[p.id] ? 'on' : ''}" data-l="${p.id}" aria-label="O'rgandim" title="O'rgandim">✓</button></div>
      </div>`; }).join('') : '<p class="muted">Hech narsa topilmadi.</p>';
    $$('[data-pr]', el).forEach(b => b.onclick = () => { const p = PHRASES.find(x => x.id === b.dataset.pr); openPractice(casual && p.cj ? { j: p.cj, k: p.cj, r: p.cr, uz: p.uz, alt: [p.j] } : p); });
    $$('[data-l]', el).forEach(b => b.onclick = () => { const id = b.dataset.l; const on = !Store.data.phrasesLearned[id]; markLearned(id, on); toast(on ? "Takrorlash ro'yxatiga qo'shildi" : 'Belgi olib tashlandi'); render(); });
  };
  el.innerHTML = `<div class="row" style="margin-bottom:12px"><div style="flex:1;min-width:200px"><input type="search" data-q placeholder="Qidirish: yaponcha, romaji yoki o'zbekcha…" value="${esc(st.phraseQuery)}"></div>
      <div class="seg" data-form><button class="${casual ? '' : 'active'}" data-c="0">Rasmiy です/ます</button><button class="${casual ? 'active' : ''}" data-c="1">Do'stona</button></div></div>
    <div class="chips scroll" style="margin-bottom:16px"><button class="chip ${st.phraseCat === 'all' ? 'active' : ''}" data-cat="all">Hammasi</button>${PHRASE_CATS.map(c => `<button class="chip ${st.phraseCat === c.id ? 'active' : ''}" data-cat="${c.id}">${c.icon} ${c.name}</button>`).join('')}<button class="chip ${st.phraseCat === 'learned' ? 'active' : ''}" data-cat="learned">✓ O'rganilganlar (${phrasesLearnedCount()})</button></div>
    <p class="tiny">🎤 — yozib olish va solishtirish · ✓ — o'rgandim (takrorlash ro'yxatiga qo'shiladi)</p>
    <div class="phrase-list" data-list></div>`;
  $('[data-q]', el).oninput = e => { st.phraseQuery = e.target.value; render(); };
  $$('[data-cat]', el).forEach(b => b.onclick = () => { st.phraseCat = b.dataset.cat; speakPhrases(el); });
  $$('[data-c]', el).forEach(b => b.onclick = () => { S().casual = b.dataset.c === '1'; Store.save(); speakPhrases(el); });
  render();
}

function speakDialogs(el, param) {
  const d = DIALOGUES.find(x => x.id === param);
  if (!d) {
    el.innerHTML = `<p class="muted">Har bir dialogni avval tinglang va o'qing, keyin «Rol o'yini»da B (siz) rolini o'ynang.</p>
      <div class="dlg-list">${DIALOGUES.map((x, i) => { const r = Store.data.dialogues[x.id]; return `<a class="dlg-card" href="#speak-dialogs-${x.id}" style="color:inherit;text-decoration:none"><div class="row between"><span class="tiny">${i + 1}-dialog · ${x.lines.length} qator</span>${r ? `<span class="badge ok">✓ ${r.best}%</span>` : ''}</div><b>${esc(x.title)}</b><span>📍 ${esc(x.place)}</span></a>`; }).join('')}</div>`;
    return;
  }
  let mode = 'read', token = 0;
  const bubble = (l, i, extra = '') => `<div class="bubble ${l.s}" data-i="${i}" ${extra}><div class="who">${l.s === 'B' ? 'Siz' : 'Suhbatdosh'}</div><div class="j">${esc(l.j)}</div>${l.k !== l.j ? `<div class="k">${esc(l.k)}</div>` : ''}<div class="r">${esc(l.r)}</div><div class="u">${esc(l.uz)}</div>
    <div class="row" style="gap:4px;margin-top:6px"><button class="btn sm icon ghost" data-say="${esc(l.j)}" aria-label="Tinglash">🔊</button><button class="btn sm icon ghost" data-prl="${i}" aria-label="Mashq">🎤</button></div></div>`;
  const shell = () => {
    el.innerHTML = `<div class="row between"><a class="btn sm" href="#speak-dialogs">← Dialoglar</a><div class="seg" data-mode><button class="${mode === 'read' ? 'active' : ''}" data-m="read">📖 O'qish</button><button class="${mode === 'role' ? 'active' : ''}" data-m="role">🎭 Rol o'yini</button></div></div>
      <h2 style="margin-top:16px">${esc(d.title)}</h2><p class="small muted">📍 ${esc(d.place)} · Siz — <b>B</b> (o'ng tomonda)</p>
      <div class="chips" style="margin-bottom:14px">${[['kana', 'Kana o‘qilishi'], ['romaji', 'Romaji'], ['uz', 'Tarjima']].map(t => `<button class="chip ${S()[t[0]] ? 'active' : ''}" data-t="${t[0]}">${t[1]}</button>`).join('')}</div>
      <div data-stage></div>`;
    $$('[data-m]', el).forEach(b => b.onclick = () => { token++; Sound.stop(); mode = b.dataset.m; shell(); });
    $$('[data-t]', el).forEach(b => b.onclick = () => { S()[b.dataset.t] = !S()[b.dataset.t]; Store.save(); applyTheme(); b.classList.toggle('active'); });
    mode === 'read' ? readMode() : roleMode();
  };
  const bindLine = (root) => $$('[data-prl]', root).forEach(b => b.onclick = () => openPractice(d.lines[+b.dataset.prl]));
  const readMode = () => {
    const stg = $('[data-stage]', el);
    stg.innerHTML = `<div class="row" style="margin-bottom:12px"><button class="btn primary" data-all>▶ Hammasini tinglash</button><button class="btn" data-stop>⏹</button></div><div class="chat">${d.lines.map((l, i) => bubble(l, i)).join('')}</div>`;
    bindLine(stg);
    $('[data-stop]', stg).onclick = () => { token++; Sound.stop(); $$('.bubble', stg).forEach(b => b.classList.remove('playing')); };
    $('[data-all]', stg).onclick = async () => {
      const my = ++token;
      for (let i = 0; i < d.lines.length; i++) {
        if (my !== token) return;
        const b = $(`.bubble[data-i="${i}"]`, stg); $$('.bubble', stg).forEach(x => x.classList.remove('playing')); b.classList.add('playing'); b.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        await Sound.speak(d.lines[i].j); await new Promise(r => setTimeout(r, 450));
      }
      $$('.bubble', stg).forEach(x => x.classList.remove('playing'));
    };
  };
  const roleMode = () => {
    const stg = $('[data-stage]', el); const my = ++token;
    let i = 0, score = 0, asked = 0;
    const otherB = DIALOGUES.filter(x => x.id !== d.id).flatMap(x => x.lines.filter(l => l.s === 'B'));
    stg.innerHTML = `<div class="notice info small" style="margin-bottom:12px">Suhbatdosh gapiradi — siz to'g'ri javobni tanlang yoki 🎤 bilan aytib bering.</div><div class="chat" data-chat></div><div data-ask></div>`;
    const chat = $('[data-chat]', stg), ask = $('[data-ask]', stg);
    const step = async () => {
      if (my !== token) return;
      if (i >= d.lines.length) {
        const pct = asked ? Math.round(score / asked * 100) : 100;
        const prev = Store.data.dialogues[d.id]; Store.data.dialogues[d.id] = { done: true, best: Math.max(pct, prev ? prev.best : 0) }; Store.save();
        ask.innerHTML = `<div class="card result" style="margin-top:16px"><div class="score" style="color:${pct >= 80 ? 'var(--ok)' : 'var(--accent)'}">${pct}%</div><p class="muted">${score} / ${asked} javob birinchi urinishda to'g'ri</p><div class="row" style="justify-content:center"><button class="btn" data-again>Qaytadan</button><a class="btn primary" href="#speak-dialogs">Boshqa dialog</a></div></div>`;
        $('[data-again]', ask).onclick = () => roleMode();
        return;
      }
      const l = d.lines[i];
      if (l.s === 'A') {
        chat.insertAdjacentHTML('beforeend', bubble(l, i)); bindLine(chat);
        chat.lastElementChild.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        await Sound.speak(l.j); await new Promise(r => setTimeout(r, 300));
        i++; step(); return;
      }
      asked++; let first = true;
      const opts = shuffle([l, ...sample(otherB.filter(x => x.j !== l.j), 2)]);
      ask.innerHTML = `<div class="card" style="margin-top:14px"><div class="tiny">Sizning javobingiz${S().uz ? ` — ma'nosi: <b>${esc(l.uz)}</b>` : ''}</div>
        <div class="role-opts">${opts.map((o, k) => `<button class="opt text" data-k="${k}"><span class="jp" style="font-size:1.08rem">${esc(o.j)}</span><br><span class="small r" style="color:var(--accent)">${esc(o.r)}</span></button>`).join('')}</div>
        ${Sound.canRecognize() ? '<button class="btn" data-voice style="margin-top:10px;width:100%">🎤 Ovozda javob berish</button>' : ''}<div data-fb class="small" style="margin-top:8px"></div></div>`;
      const accept = async () => {
        if (first) score++;
        ask.innerHTML = '';
        chat.insertAdjacentHTML('beforeend', bubble(l, i)); bindLine(chat); chat.lastElementChild.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        await Sound.speak(l.j); await new Promise(r => setTimeout(r, 300)); i++; step();
      };
      $$('[data-k]', ask).forEach(b => b.onclick = () => {
        if (opts[+b.dataset.k] === l) { b.classList.add('correct'); setTimeout(accept, 350); }
        else { first = false; b.classList.add('wrong'); b.disabled = true; $('[data-fb]', ask).innerHTML = "<span style='color:var(--bad)'>Bu javob mos emas. Suhbatdosh nima deganini qayta tinglang.</span>"; Sound.speak(d.lines[i - 1]?.j || ''); }
      });
      $('[data-voice]', ask)?.addEventListener('click', async () => {
        const fb = $('[data-fb]', ask); fb.innerHTML = '<span class="rec-dot"></span> Gapiring…'; Sound.stop();
        try {
          const alts = await Sound.recognize(); const sim = similarity(alts, [l.j, l.k]);
          if (sim >= 60) { fb.innerHTML = `✓ ${sim}% — «${esc(alts[0])}»`; setTimeout(accept, 700); }
          else { first = false; fb.innerHTML = `<span style="color:var(--bad)">${sim}% — «${esc(alts[0])}». Yana urinib ko'ring yoki variantni tanlang.</span>`; }
        } catch (e) { fb.innerHTML = `<span style="color:var(--bad)">${e === 'network' ? 'Internet kerak.' : e === 'not-allowed' ? 'Mikrofonga ruxsat yo‘q.' : 'Eshitilmadi.'}</span>`; }
      });
    };
    step();
  };
  shell();
}

function speakShadow(el) {
  const sources = [...DIALOGUES.map(d => ['d:' + d.id, '🎭 ' + d.title, d.lines.map(l => ({ j: l.j, r: l.r, uz: l.uz }))]), ...PHRASE_CATS.map(c => ['c:' + c.id, c.icon + ' ' + c.name, PHRASES.filter(p => p.cat === c.id).map(p => ({ j: p.j, r: p.r, uz: p.uz }))])];
  const cfg = st.shadow || (st.shadow = { src: sources[0][0], rate: 0.9, hide: false });
  let token = 0;
  el.innerHTML = `<div class="card"><p class="small muted" style="margin-top:0"><b>Shadowing</b> — gapni eshitasiz va darhol uni ovoz chiqarib, xuddi shu ohangda takrorlaysiz. Gaplashish ravonligi va talaffuz uchun eng samarali usullardan biri.</p>
    <div class="grid g3"><div><div class="tiny" style="margin-bottom:6px">Material</div><select data-src>${sources.map(s => `<option value="${s[0]}" ${s[0] === cfg.src ? 'selected' : ''}>${esc(s[1])}</option>`).join('')}</select></div>
      <div><div class="tiny" style="margin-bottom:6px">Tezlik</div><div class="seg" data-rate>${[[0.7, 'Sekin'], [0.9, 'Normal'], [1.15, 'Tez']].map(r => `<button class="${cfg.rate === r[0] ? 'active' : ''}" data-v="${r[0]}">${r[1]}</button>`).join('')}</div></div>
      <div><div class="tiny" style="margin-bottom:6px">Qiyinlik</div><label class="check small"><input type="checkbox" data-hide ${cfg.hide ? 'checked' : ''}> Matnni yashirish (faqat quloq bilan)</label></div></div></div>
    <div class="card shadow-stage" data-stage><div class="muted">«Boshlash» tugmasini bosing. Har bir gapdan keyin takrorlash uchun pauza beriladi.</div></div>
    <div class="row" style="justify-content:center;margin-top:14px"><button class="btn primary" data-start style="min-width:160px">▶ Boshlash</button><button class="btn" data-stop>⏹ To'xtatish</button></div>`;
  $('[data-src]', el).onchange = e => { cfg.src = e.target.value; };
  $$('[data-rate] button', el).forEach(b => b.onclick = () => { cfg.rate = +b.dataset.v; $$('[data-rate] button', el).forEach(x => x.classList.toggle('active', x === b)); });
  $('[data-hide]', el).onchange = e => { cfg.hide = e.target.checked; };
  const stage = $('[data-stage]', el);
  const wait = (ms, my, bar) => new Promise(res => {
    const t0 = performance.now();
    const tick = () => { if (my !== token) return res(false); const p = Math.min(1, (performance.now() - t0) / ms); if (bar) bar.style.width = (p * 100) + '%'; p >= 1 ? res(true) : requestAnimationFrame(tick); };
    tick();
  });
  $('[data-stop]', el).onclick = () => { token++; Sound.stop(); stage.innerHTML = '<div class="muted">To‘xtatildi.</div>'; };
  $('[data-start]', el).onclick = async () => {
    const my = ++token; const lines = sources.find(s => s[0] === cfg.src)[2];
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      const txt = `<div class="j">${esc(l.j)}</div><div class="r">${esc(l.r)}</div><div class="u small muted">${esc(l.uz)}</div>`;
      stage.innerHTML = `<div class="tiny">${i + 1} / ${lines.length}</div><div class="phase listen">👂 Tinglang</div>${cfg.hide ? '<div class="j muted">・・・</div>' : txt}`;
      let dur = await Sound.speak(l.j, { rate: cfg.rate });
      if (my !== token) return;
      if (dur < 300) dur = 500 + l.j.length * 230 / cfg.rate;
      stage.innerHTML = `<div class="tiny">${i + 1} / ${lines.length}</div><div class="phase repeat">🗣 Endi siz takrorlang</div>${txt}<div class="countdown"><i></i></div>`;
      if (!(await wait(dur * 1.3 + 900, my, $('.countdown i', stage)))) return;
    }
    stage.innerHTML = `<div style="font-size:2rem">🎉</div><b>Tugadi!</b><div class="muted small">Yana bir marta tez rejimda yoki matnsiz urinib ko'ring.</div>`;
  };
}

function speakReview(el) {
  const due = SRS.dueIds('p:').map(id => PHRASES.find(p => p.id === id)).filter(Boolean);
  const dir = st.reviewDir;
  const addNew = () => {
    const fresh = PHRASES.filter(p => !Store.data.phrasesLearned[p.id]).slice(0, 5);
    fresh.forEach(p => markLearned(p.id, true)); toast(fresh.length + " ta yangi ibora qo'shildi"); speakReview(el);
  };
  const head = `<div class="row between" style="margin-bottom:14px"><div class="seg" data-dir><button class="${dir === 'uz2jp' ? 'active' : ''}" data-v="uz2jp">O'zbekcha → aytish</button><button class="${dir === 'jp2uz' ? 'active' : ''}" data-v="jp2uz">Yaponcha → ma'no</button></div><span class="small muted">${due.length} ta kutmoqda · ${phrasesLearnedCount()} ta ro'yxatda</span></div>`;
  if (!due.length) {
    el.innerHTML = head + `<div class="card flash"><div style="font-size:2rem">✅</div><b>Hozircha takrorlanadigan ibora yo'q</b><p class="muted small">Iboralar bo'limida ✓ belgisini bosing yoki pastdagi tugma bilan 5 ta yangi ibora qo'shing.</p><button class="btn primary" data-new>+ 5 ta yangi ibora</button></div>`;
    $('[data-new]', el).onclick = addNew; bindDir(); return;
  }
  const p = due[0];
  el.innerHTML = head + `<div class="card flash" data-card>
      ${dir === 'uz2jp' ? `<div class="tiny">Buni yaponcha qanday aytasiz? Ovoz chiqarib ayting.</div><div class="front">${esc(p.uz)}</div>` : `<div class="tiny">Ma'nosini eslang</div><div class="front jp">${esc(p.j)}</div><button class="btn sm" data-say="${esc(p.j)}">🔊</button>`}
      <button class="btn primary" data-show style="margin-top:10px">Javobni ko'rsatish</button>
    </div>`;
  bindDir();
  $('[data-show]', el).onclick = () => {
    const c = $('[data-card]', el);
    c.innerHTML = `<div class="tiny">${esc(p.uz)}</div><div class="front jp">${esc(p.j)}</div>${p.k !== p.j ? `<div class="k jp muted">${esc(p.k)}</div>` : ''}<div class="r" style="color:var(--accent)">${esc(p.r)}</div>
      <div class="row" style="justify-content:center"><button class="btn sm" data-say="${esc(p.j)}">🔊</button><button class="btn sm" data-prx>🎤 Mashq</button></div>
      <div class="grade" style="width:100%">${[[0, 'Qayta'], [1, 'Qiyin'], [2, 'Yaxshi'], [3, 'Oson']].map(g => `<button class="btn" data-gr="${g[0]}">${g[1]}<small>${SRS.nextIntervalLabel(p.id, g[0])}</small></button>`).join('')}</div>`;
    Sound.speak(p.j);
    $('[data-prx]', c).onclick = () => openPractice(p);
    $$('[data-gr]', c).forEach(b => b.onclick = () => { SRS.grade(p.id, +b.dataset.gr); speakReview(el); });
  };
  function bindDir() { $$('[data-dir] button', el).forEach(b => b.onclick = () => { st.reviewDir = b.dataset.v; speakReview(el); }); }
}

/* ---------------- PRONUNCIATION ---------------- */
Views.pron = (el, id) => {
  const L = PRONUNCIATION.find(x => x.id === id);
  if (!L) {
    el.innerHTML = `${voiceNotice()}<div class="page-head"><h1>Talaffuz — 発音</h1><p>O'zbek tilida gapiruvchilar ko'p xato qiladigan tovushlar va ularni to'g'rilash mashqlari.</p></div>
      <div class="lesson-grid">${PRONUNCIATION.map(p => `<a class="lcard ${Store.data.pron[p.id] ? 'done' : ''}" href="#pron-${p.id}" style="color:inherit;text-decoration:none"><div class="ic">${Store.data.pron[p.id] ? '✓' : p.icon}</div><div><b>${esc(p.title)}</b><span>${p.pairs ? 'Tinglash testi bor' : "Mashq so'zlari"}</span></div></a>`).join('')}</div>
      <div class="notice info small" style="margin-top:18px">🔈 Audio brauzerning sintez ovozi bilan ijro etiladi. U ona tilida so'zlashuvchi yozuvlari o'rnini bosa olmaydi, ayniqsa ohang (pitch accent) masalasida.</div>`;
    return;
  }
  el.innerHTML = `<a class="btn sm" href="#pron">← Talaffuz</a>
    <div class="page-head" style="margin-top:14px"><h1>${esc(L.title)}</h1></div>
    <div class="card"><p>${L.body}</p><ul class="small">${L.tips.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>
    <div class="section-head"><h2>Mashq so'zlari</h2><span class="small muted">bosing — tinglang, 🎤 — o'zingiz ayting</span></div>
    <div class="word-chips">${L.words.map((w, i) => `<span class="word-chip"><button class="btn sm icon ghost" data-say="${esc(w[0])}">🔊</button><span><span class="jp">${esc(w[1])}</span><small>${esc(w[2])} — ${esc(w[3])}</small></span><button class="btn sm icon ghost" data-pw="${i}">🎤</button></span>`).join('')}</div>
    ${L.pairs ? `<div class="section-head"><h2>Juftliklar</h2></div><div class="grid g2">${L.pairs.map(p => `<div class="card" style="margin:0"><div class="row between">${p.map(w => `<button class="word-chip" data-say="${esc(w[0])}"><span class="jp">${esc(w[1])}</span><span><b class="small">${esc(w[2])}</b><small>${esc(w[3])}</small></span></button>`).join('<span class="muted">vs</span>')}</div></div>`).join('')}</div>
      <div class="row" style="justify-content:center;margin-top:20px"><button class="btn primary" data-test>🎧 Tinglash testini boshlash</button></div>` : `<div class="row" style="justify-content:center;margin-top:20px"><button class="btn primary" data-done>${Store.data.pron[L.id] ? "✓ O'rganilgan" : "✓ O'rgandim"}</button></div>`}`;
  $$('[data-pw]', el).forEach(b => b.onclick = () => { const w = L.words[+b.dataset.pw]; openPractice({ j: w[0], k: w[1], r: w[2], uz: w[3] }); });
  $('[data-done]', el)?.addEventListener('click', () => { Store.data.pron[L.id] = true; Store.save(); toast("Belgilandi ✓"); App.render(); });
  $('[data-test]', el)?.addEventListener('click', () => {
    const build = () => Array.from({ length: 8 }, () => {
      const pair = L.pairs[Math.floor(Math.random() * L.pairs.length)]; const k = Math.random() < 0.5 ? 0 : 1; const w = pair[k];
      return { kind: 'mc', oneCol: true, prompt: `<div class="lbl">Qaysi so'zni eshitdingiz?</div><div class="big">🔊</div>`, audio: w[0],
        options: pair.map((x, i) => ({ label: `<span class="jp" style="font-size:1.3rem">${esc(x[1])}</span> <span class="small muted">${esc(x[2])} — ${esc(x[3])}</span>`, value: i, cls: 'text' })), answer: k, answerLabel: `${esc(w[1])} (${esc(w[2])})`, mistakeLabel: '🔊' };
    });
    Quiz.run(el, { title: L.title, area: 'pron', passPct: 75, questions: build(), regen: build, onBack: () => App.render(), onDone: r => { if (r.pass) { Store.data.pron[L.id] = true; Store.save(); } } });
  });
};

/* ---------------- GRAMMAR ---------------- */
Views.grammar = (el, id) => {
  const G = GRAMMAR.find(x => x.id === id);
  if (!G) {
    el.innerHTML = `<div class="page-head"><h1>Grammatika — 文法</h1><p>Faqat gaplashish uchun zarur bo'lgan minimal grammatika. Har bir mavzu: tuzilish, tushuntirish, misollar, keng tarqalgan xatolar va test.</p></div>
      <div class="lesson-grid">${GRAMMAR.map((g, i) => { const r = Store.data.grammar[g.id]; return `<a class="lcard ${r >= 75 ? 'done' : ''}" href="#grammar-${g.id}" style="color:inherit;text-decoration:none"><div class="ic">${r >= 75 ? '✓' : esc(g.jp)}</div><div><b>${esc(g.title)}</b><span>${i + 1}-mavzu${r != null ? ` · eng yaxshi: ${r}%` : ''}</span></div></a>`; }).join('')}</div>`;
    return;
  }
  const idx = GRAMMAR.indexOf(G); const nxt = GRAMMAR[idx + 1];
  el.innerHTML = `<div class="row between"><a class="btn sm" href="#grammar">← Grammatika</a>${nxt ? `<a class="btn sm" href="#grammar-${nxt.id}">Keyingi →</a>` : ''}</div>
    <div class="page-head" style="margin-top:14px"><h1>${esc(G.title)}</h1></div>
    <div class="pattern">${esc(G.pattern)}</div>
    <div class="card" style="margin-top:14px"><p style="margin:0">${G.body}</p></div>
    <div class="section-head"><h2>Misollar</h2></div>
    <div class="card" style="padding:4px 16px">${G.ex.map(e => `<div class="ex-row"><button class="btn sm icon" data-say="${esc(e[0])}" aria-label="Tinglash">🔊</button><div><div class="j">${esc(e[0])}</div>${e[1] && e[1] !== e[0] ? `<div class="k">${esc(e[1])}</div>` : ''}<div class="r">${esc(e[2])}</div><div class="u muted small">${esc(e[3])}</div></div></div>`).join('')}</div>
    <div class="section-head"><h2>Keng tarqalgan xatolar</h2></div>
    ${G.mistakes.map(m => `<div class="mistake">⚠️ ${esc(m)}</div>`).join('')}
    <div class="row" style="justify-content:center;margin-top:22px"><button class="btn primary" data-test>📝 Testni boshlash (${G.quiz.length} savol)</button></div>`;
  $('[data-test]', el).onclick = () => {
    const build = () => shuffle(G.quiz).map(q => {
      const isJp = q[1].some(o => /[぀-ヿ一-鿿]/.test(o));
      return { kind: 'mc', prompt: `<div class="mid">${esc(q[0])}</div>`, options: shuffle(q[1].map((o, i) => ({ label: esc(o), value: i, cls: isJp ? 'jp' : 'text' }))), answer: q[2], answerLabel: esc(q[1][q[2]]), mistakeLabel: `<span class="jp">${esc(q[0])}</span>`, explain: esc(q[3]) };
    });
    Quiz.run(el, { title: G.title, area: 'grammar', passPct: 75, questions: build(), regen: build, onBack: () => App.render(),
      onDone: r => { Store.data.grammar[G.id] = Math.max(r.pct, Store.data.grammar[G.id] || 0); Store.save(); } });
  };
};

/* ---------------- SETTINGS ---------------- */
Views.sozlamalar = (el) => {
  const s = S();
  el.innerHTML = `<div class="page-head"><h1>Sozlamalar</h1></div>
    <div class="card stack">
      <h3>Ko'rinish</h3>
      <div class="row between"><span>Mavzu</span><div class="seg" data-theme>${[['auto', 'Avto'], ['light', "Yorug'"], ['dark', "Qorong'i"]].map(t => `<button class="${s.theme === t[0] ? 'active' : ''}" data-v="${t[0]}">${t[1]}</button>`).join('')}</div></div>
      <label class="check"><input type="checkbox" data-set="romaji" ${s.romaji ? 'checked' : ''}> Romajini ko'rsatish (iboralar, dialoglar)</label>
      <label class="check"><input type="checkbox" data-set="kana" ${s.kana ? 'checked' : ''}> Kanji ostida kana o'qilishini ko'rsatish</label>
      <label class="check"><input type="checkbox" data-set="uz" ${s.uz ? 'checked' : ''}> O'zbekcha tarjimani ko'rsatish</label>
    </div>
    <div class="card stack">
      <h3>Ovoz</h3>
      ${Sound.supported ? (Sound.hasJa() ? `<div><div class="tiny" style="margin-bottom:6px">Yaponcha ovoz (${Sound.jaVoices.length} ta topildi)</div><select data-voice>${Sound.jaVoices.map(v => `<option value="${esc(v.voiceURI)}" ${Sound.voice() === v ? 'selected' : ''}>${esc(v.name)} (${esc(v.lang)})</option>`).join('')}</select></div>` : voiceNotice() || '<div class="notice">Yaponcha ovoz topilmadi.</div>') : '<div class="notice">Bu brauzer nutq sintezini qo‘llab-quvvatlamaydi.</div>'}
      <div><div class="row between"><span class="tiny">Nutq tezligi</span><b class="small" data-ratev>${s.rate.toFixed(2)}×</b></div><input type="range" min="0.5" max="1.3" step="0.05" value="${s.rate}" data-rate></div>
      <div class="row"><button class="btn" data-test>🔊 Sinab ko'rish: こんにちは</button><button class="btn" data-fix>🔄 Ovozni qayta ishga tushirish</button></div>
      <p class="tiny" style="margin:0">Sintez qilingan ovoz ona tilida so'zlashuvchi yozuvlari o'rnini bosa olmaydi. Ovozni tanish (🎤) faqat Chrome/Edge'da internet orqali ishlaydi${Sound.canRecognize() ? ' — bu brauzerda mavjud.' : ' — bu brauzerda mavjud emas.'}</p>
    </div>
    <div class="card stack">
      <h3>O'qish</h3>
      <div class="row between"><span>Kunlik maqsad</span><div class="seg" data-goal>${[10, 20, 30].map(g => `<button class="${s.goal === g ? 'active' : ''}" data-v="${g}">${g} daq</button>`).join('')}</div></div>
      <label class="check"><input type="checkbox" data-set="unlockAll" ${s.unlockAll ? 'checked' : ''}> Barcha kana darslarini ochish (testsiz)</label>
    </div>
    <div class="card stack">
      <h3>Ma'lumotlar</h3>
      <p class="small muted" style="margin:0">Progress faqat shu brauzerda saqlanadi. Boshqa qurilmaga o'tkazish uchun eksport qiling.</p>
      <div class="row"><button class="btn" data-exp>⬇ Progressni eksport (JSON)</button><label class="btn">⬆ Import (JSON)<input type="file" accept="application/json,.json" data-imp hidden></label><button class="btn" data-paste>📋 Matndan import</button><button class="btn" data-csv>⬇ Iboralar (CSV)</button></div>
      <button class="btn" data-reset style="color:var(--bad);align-self:flex-start">🗑 Progressni o'chirish</button>
    </div>
    <div class="card small muted"><b>Nihongo Start</b> — kana va gaplashish uchun bepul, oflayn ishlaydigan trenajer. Yozilish tartibi ma'lumotlari: <a href="https://kanjivg.tagaini.net" target="_blank" rel="noopener">KanjiVG</a> © Ulrich Apel, CC BY-SA 3.0. Qo'lyozmani avtomatik tanish yo'q — yozish mashqida o'zingizni baholaysiz. Testlar original mashqlar, rasmiy JLPT savollari emas.</div>`;
  $$('[data-theme] button', el).forEach(b => b.onclick = () => { s.theme = b.dataset.v; Store.save(); applyTheme(); Views.sozlamalar(el); });
  $$('[data-goal] button', el).forEach(b => b.onclick = () => { s.goal = +b.dataset.v; Store.save(); Views.sozlamalar(el); });
  $$('[data-set]', el).forEach(c => c.onchange = () => { s[c.dataset.set] = c.checked; Store.save(); applyTheme(); });
  $('[data-voice]', el)?.addEventListener('change', e => { s.voice = e.target.value; Store.save(); Sound.speak('こんにちは'); });
  $('[data-rate]', el).oninput = e => { s.rate = +e.target.value; $('[data-ratev]', el).textContent = s.rate.toFixed(2) + '×'; Store.save(); };
  $('[data-test]', el).onclick = () => Sound.speak('こんにちは');
  $('[data-fix]', el).onclick = () => { Sound.reset(); Sound.speak('はい、だいじょうぶです'); toast('Ovoz qayta ishga tushirildi'); };
  $('[data-exp]', el).onclick = () => {
    const json = Store.export();
    download(`nihongo-progress-${Store.dateKey()}.json`, json, 'application/json');
    modal(`<h3>Progress eksporti</h3><p class="small muted">Fayl yuklab olinmagan bo'lsa, matnni nusxalab saqlang. Import qilishda shu matnni pastdagi «Matndan import» oynasiga qo'yasiz.</p><textarea readonly style="width:100%;height:180px;font-family:monospace;font-size:.75rem;padding:8px;border-radius:8px;border:1px solid var(--line);background:var(--surface-2)">${esc(json)}</textarea><div class="row" style="margin-top:10px"><button class="btn primary" data-copy>📋 Nusxa olish</button></div>`,
      m => { $('[data-copy]', m).onclick = async () => { try { await navigator.clipboard.writeText(json); toast('Nusxa olindi ✓'); } catch (e) { $('textarea', m).select(); toast('Matnni belgilab, Ctrl+C bosing'); } }; });
  };
  $('[data-paste]', el).onclick = () => modal(`<h3>Matndan import</h3><p class="small muted">Eksport qilingan JSON matnini shu yerga qo'ying.</p><textarea style="width:100%;height:180px;font-family:monospace;font-size:.75rem;padding:8px;border-radius:8px;border:1px solid var(--line);background:var(--surface)"></textarea><div class="row" style="margin-top:10px"><button class="btn primary" data-do>Import qilish</button></div>`,
    (m, close) => { $('[data-do]', m).onclick = () => { try { Store.import($('textarea', m).value); applyTheme(); close(); toast('Progress tiklandi ✓'); App.render(); } catch (err) { toast('Xato: ' + err.message); } }; });
  $('[data-csv]', el).onclick = () => {
    const rows = [['category', 'japanese', 'kana', 'romaji', 'uzbek', 'casual', 'casual_romaji', 'learned']].concat(PHRASES.map(p => [p.cat, p.j, p.k, p.r, p.uz, p.cj || '', p.cr || '', Store.data.phrasesLearned[p.id] ? 1 : 0]));
    download('nihongo-phrases.csv', '﻿' + rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n'), 'text/csv');
  };
  $('[data-imp]', el).onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = () => { try { Store.import(rd.result); applyTheme(); toast('Progress tiklandi ✓'); App.render(); } catch (err) { toast('Xato: ' + err.message); } };
    rd.readAsText(f);
  };
  $('[data-reset]', el).onclick = () => confirmBox("Barcha progress, SRS va sozlamalar o'chiriladi. Bu amalni qaytarib bo'lmaydi. Avval eksport qilishni tavsiya qilamiz.", "Ha, o'chirish", () => { Store.reset(); applyTheme(); toast("Progress o'chirildi"); location.hash = '#home'; App.render(); });
};

/* ================== APP SHELL ================== */
const NAV = [['home', 'Bosh sahifa', '家'], ['kana', 'Kana', 'あ'], ['speak', 'Gapirish', '話'], ['pron', 'Talaffuz', '音'], ['grammar', 'Grammatika', '文'], ['sozlamalar', 'Sozlamalar', '⚙']];
const App = {
  route: 'home',
  init() {
    Store.load(); applyTheme(); Sound.init(); Timer.start();
    Sound.onVoices(() => { if (['home', 'speak', 'pron', 'sozlamalar'].includes(this.route) && !$('.overlay') && !$('.quiz')) this.render(); });
    const navHtml = (items) => items.map(n => `<a class="nav-btn" href="#${n[0]}" data-nav="${n[0]}" style="text-decoration:none"><span class="ic">${n[2]}</span><span>${n[1]}</span></a>`).join('');
    $('[data-sidenav]').innerHTML = navHtml(NAV);
    $('[data-bottomnav]').innerHTML = navHtml(NAV.slice(0, 5));
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-say]');
      if (b) { e.preventDefault(); Sound.speak(b.dataset.say, b.dataset.rate ? { rate: +b.dataset.rate } : {}); }
    });
    matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', applyTheme);
    addEventListener('hashchange', () => this.render());
    this.render();
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && window.top === window.self) {
      navigator.serviceWorker.register('service-worker.js').catch(() => { });
    }
  },
  render() {
    const parts = (location.hash.replace(/^#\/?/, '') || 'home').split(/[-\/]/);
    const r = Views[parts[0]] ? parts[0] : 'home';
    this.route = r; Sound.stop();
    $$('[data-nav]').forEach(b => b.classList.toggle('active', b.dataset.nav === r));
    $$('[data-streak], [data-streak-m]').forEach(x => x.textContent = '🔥 ' + Store.streak());
    const main = $('#main'); main.innerHTML = '';
    try { Views[r](main, parts[1], parts.slice(2).join('-') || undefined); }
    catch (err) { console.error(err); main.innerHTML = `<div class="card"><h3>Xatolik yuz berdi</h3><p class="small muted">${esc(err.message)}</p><a class="btn" href="#home">Bosh sahifa</a></div>`; }
    window.scrollTo(0, 0);
  },
  refreshHomeTime() { const b = $('[data-today]'); if (b) b.textContent = Math.floor(Store.day().sec / 60); },
};
document.addEventListener('DOMContentLoaded', () => App.init());
