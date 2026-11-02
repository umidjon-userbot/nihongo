/* =========================================================
   QUIZ ENGINE — multiple choice, typing, timed (speed) mode
   question = { id?, kind: 'mc'|'type', prompt, audio?, options?: [{label, value, cls}],
                answer, accept?: [], explain?, after?, optCls? }
   ========================================================= */
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const sample = (a, n) => shuffle(a).slice(0, n);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const Quiz = {
  run(el, cfg) {
    const st = { i: 0, correct: 0, wrong: [], times: [], t0: 0, locked: false, started: performance.now() };
    const qs = cfg.questions;
    if (!qs.length) { el.innerHTML = `<div class="card"><p>Savollar topilmadi. Avval bir nechta harf yoki ibora o'rganing.</p>${cfg.onBack ? '<button class="btn" data-back>Orqaga</button>' : ''}</div>`; el.querySelector('[data-back]')?.addEventListener('click', cfg.onBack); return; }

    const show = () => {
      const q = qs[st.i]; st.locked = false;
      const pct = Math.round(st.i / qs.length * 100);
      const opts = q.kind === 'type'
        ? `<form class="stack" data-typeform><input class="type-input" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="romaji yozing…" aria-label="Javob"><button class="btn primary" style="width:100%">Tekshirish</button></form>`
        : `<div class="opts ${q.oneCol ? 'one' : ''}">${q.options.map((o, k) => `<button class="opt ${o.cls || q.optCls || ''}" data-v="${k}">${o.label}</button>`).join('')}</div>`;
      el.innerHTML = `
        <div class="quiz fade-in">
          <div class="quiz-top">
            ${cfg.onBack ? '<button class="btn sm icon ghost" data-back aria-label="Chiqish">✕</button>' : ''}
            <div class="progress"><i style="width:${pct}%"></i></div>
            <span class="small muted">${st.i + 1}/${qs.length}</span>
          </div>
          <div class="card">
            <div class="q-prompt">${q.prompt}
              ${q.audio ? `<div style="margin-top:12px"><button class="btn sm" data-replay>🔊 Qayta eshitish</button></div>` : ''}
            </div>
            ${opts}
            <div data-fb></div>
          </div>
        </div>`;
      el.querySelector('[data-back]')?.addEventListener('click', () => { Sound.stop(); cfg.onBack(); });
      if (q.audio) { Sound.speak(q.audio); el.querySelector('[data-replay]').onclick = () => Sound.speak(q.audio, { rate: 0.75 }); }
      st.t0 = performance.now();
      if (q.kind === 'type') {
        const f = el.querySelector('[data-typeform]'); const inp = f.querySelector('input');
        setTimeout(() => inp.focus(), 50);
        f.onsubmit = e => {
          e.preventDefault(); if (st.locked) { next(); return; }
          const v = inp.value.trim().toLowerCase().replace(/[^a-zāīūēō']/g, '');
          if (!v) return;
          const ok = [q.answer, ...(q.accept || [])].map(x => String(x).toLowerCase()).includes(v);
          inp.disabled = true; inp.style.borderColor = ok ? 'var(--ok)' : 'var(--bad)';
          f.querySelector('button').textContent = 'Keyingisi →';
          f.querySelector('button').disabled = false; inp.disabled = true;
          answer(ok, q);
          setTimeout(() => f.querySelector('button').focus(), 30);
        };
      } else {
        el.querySelectorAll('.opt').forEach(b => b.onclick = () => {
          if (st.locked) return;
          const ok = q.options[+b.dataset.v].value === q.answer;
          el.querySelectorAll('.opt').forEach(x => {
            x.disabled = true;
            if (q.options[+x.dataset.v].value === q.answer) x.classList.add('correct');
          });
          if (!ok) b.classList.add('wrong');
          answer(ok, q);
        });
      }
    };

    const answer = (ok, q) => {
      st.locked = true;
      const dt = performance.now() - st.t0; st.times.push(dt);
      if (ok) st.correct++; else { st.wrong.push(q); Store.addMistake({ area: cfg.area || 'quiz', q: q.mistakeLabel || q.answer, a: q.answerLabel || q.answer }); }
      if (q.id) SRS.quiz(q.id, ok); else { Store.answer(ok); Store.save(); }
      if (q.onAnswer) q.onAnswer(ok);
      const fb = el.querySelector('[data-fb]');
      fb.innerHTML = `<div class="feedback ${ok ? 'ok' : 'bad'}">${ok ? "✓ To'g'ri!" : '✗ Noto‘g‘ri. To‘g‘ri javob: <b>' + (q.answerLabel || esc(q.answer)) + '</b>'}${q.explain ? '<div class="small" style="margin-top:4px;color:var(--ink)">' + q.explain + '</div>' : ''}</div>
        ${ok && !cfg.speed ? '' : '<button class="btn primary" style="width:100%;margin-top:12px" data-next>Keyingisi →</button>'}`;
      if (q.after) Sound.speak(q.after);
      const nb = fb.querySelector('[data-next]');
      if (nb) { nb.onclick = next; if (q.kind !== 'type') nb.focus(); }
      if (ok && !cfg.speed) setTimeout(() => { if (st.locked && qs[st.i] === q) next(); }, q.after ? 1100 : 750);
      if (ok && cfg.speed) setTimeout(() => { if (st.locked && qs[st.i] === q) next(); }, 250);
    };

    const next = () => { if (!st.locked) return; st.i++; st.i >= qs.length ? finish() : show(); };

    const finish = () => {
      Sound.stop();
      const pct = Math.round(st.correct / qs.length * 100);
      const avg = st.times.length ? (st.times.reduce((a, b) => a + b, 0) / st.times.length / 1000) : 0;
      const pass = pct >= (cfg.passPct || 80);
      const result = { correct: st.correct, total: qs.length, pct, avg, pass, wrong: st.wrong };
      el.innerHTML = `
        <div class="quiz fade-in"><div class="card result">
          <div class="tiny">${esc(cfg.title || 'Natija')}</div>
          <div class="score" style="color:${pass ? 'var(--ok)' : 'var(--accent)'}">${pct}%</div>
          <p class="muted">${st.correct} / ${qs.length} to'g'ri${cfg.speed ? ` · o'rtacha <b>${avg.toFixed(2)} s</b> bir savolga` : ''}</p>
          ${cfg.passPct ? `<p>${pass ? '🎉 Dars topshirildi! Keyingi dars ochildi.' : `Topshirish uchun kamida ${cfg.passPct}% kerak. Yana urinib ko'ring.`}</p>` : `<p>${pct === 100 ? 'Ajoyib! 🎉' : pct >= 80 ? 'Yaxshi natija!' : pct >= 50 ? "Yomon emas — xatolarni takrorlang." : "Davom eting — takrorlash yordam beradi."}</p>`}
          ${st.wrong.length ? `<div class="mistake-list"><div class="tiny" style="border:0">Xatolar:</div>${st.wrong.map(q => `<div><span>${q.mistakeLabel || ''}</span><span class="muted">→</span><b>${q.answerLabel || esc(q.answer)}</b></div>`).join('')}</div>` : ''}
          <div class="row" style="justify-content:center;margin-top:18px">
            ${st.wrong.length ? '<button class="btn" data-retry-wrong>Xatolarni qayta</button>' : ''}
            <button class="btn" data-again>Yana</button>
            ${cfg.onBack ? '<button class="btn primary" data-done>Tayyor</button>' : ''}
          </div>
        </div></div>`;
      el.querySelector('[data-again]').onclick = () => Quiz.run(el, { ...cfg, questions: cfg.regen ? cfg.regen() : shuffle(qs) });
      el.querySelector('[data-retry-wrong]')?.addEventListener('click', () => Quiz.run(el, { ...cfg, passPct: null, onDone: null, regen: null, questions: shuffle(st.wrong) }));
      el.querySelector('[data-done]')?.addEventListener('click', cfg.onBack);
      cfg.onDone && cfg.onDone(result);
    };
    show();
  },
};
