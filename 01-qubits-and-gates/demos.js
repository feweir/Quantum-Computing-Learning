// Interactive demos for Chapter 1. Depends on assets/quantum.js (global Q) and KaTeX.
(function () {
  const { C, num, cfmt, ctex, TAU, tex } = Q;
  const $ = (id) => document.getElementById(id);
  const PI = Math.PI;
  const fmtPi = (x) => num(x, 2) + " π";
  const deg = (r) => num((r * 180) / PI, 1);

  // =============================================================== Demo 1: complex plane
  (function () {
    let z = [1.2, 0.8], ang = 0, down = false;
    const cv = $("cplx"), RANGE = 2.4;
    const view = Q.fit(cv, (ctx, w, h) => {
      const S = w / 2 / RANGE, ox = w / 2, oy = h / 2;
      const X = (p) => [ox + S * p[0], oy - S * p[1]];
      ctx.lineWidth = 1; ctx.strokeStyle = Q.css("--grid");
      for (let k = -2; k <= 2; k++) {
        ctx.beginPath(); ctx.moveTo(ox + k * S, 0); ctx.lineTo(ox + k * S, h); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, oy - k * S); ctx.lineTo(w, oy - k * S); ctx.stroke();
      }
      ctx.strokeStyle = Q.css("--muted"); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(0, oy); ctx.lineTo(w, oy); ctx.moveTo(ox, 0); ctx.lineTo(ox, h); ctx.stroke();
      ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.arc(ox, oy, S, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = Q.css("--muted"); ctx.font = "12px system-ui"; ctx.textAlign = "left";
      ctx.fillText("Re", w - 22, oy - 6); ctx.fillText("Im", ox + 6, 12);
      ctx.fillText("unit circle (|z| = 1)", ox + S * 0.72, oy - S * 0.72 - 6);
      const arrow = (p, col, hollow) => {
        const [x, y] = X(p);
        ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = hollow ? 1.5 : 3;
        if (!hollow) { ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(x, y); ctx.stroke(); }
        ctx.beginPath(); ctx.arc(x, y, 6, 0, TAU);
        hollow ? ctx.stroke() : ctx.fill();
      };
      const w2 = C.mul(z, C.exp(ang * PI));
      arrow([z[0], -z[1]], Q.css("--muted"), true);
      if (ang > 0) {
        ctx.strokeStyle = Q.css("--accent3"); ctx.lineWidth = 1.5;
        const r0 = Math.hypot(z[0], z[1]) * S, a0 = C.arg(z);
        ctx.beginPath(); ctx.arc(ox, oy, r0, -a0, -(a0 + ang * PI), true); ctx.stroke();
        arrow(w2, Q.css("--accent3"), false);
      }
      arrow(z, Q.css("--accent"), false);
      ctx.fillStyle = Q.css("--accent"); ctx.fillText("z", X(z)[0] + 9, X(z)[1] - 4);
      ctx.fillStyle = Q.css("--muted"); ctx.fillText("z̄", X([z[0], -z[1]])[0] + 9, X([z[0], -z[1]])[1] + 4);
      if (ang > 0) { ctx.fillStyle = Q.css("--accent3"); ctx.fillText("w", X(w2)[0] + 9, X(w2)[1] - 4); }
    });
    const readout = () => {
      const w2 = C.mul(z, C.exp(ang * PI));
      $("cplx-ang-o").textContent = fmtPi(ang);
      const el = $("cplx-out");
      el.innerHTML = "<div></div><div></div><div></div>";
      tex(el.children[0], `z = ${cfmt(z, 2)}\\quad \\bar z = ${cfmt(C.conj(z), 2)}`);
      tex(el.children[1], `|z| = \\sqrt{a^2+b^2} = ${num(C.abs(z), 3)}\\quad |z|^2 = ${num(C.abs2(z), 3)}\\quad \\arg z = ${deg(C.arg(z))}^\\circ`);
      tex(el.children[2], `w = z\\,e^{i\\varphi} = ${cfmt(w2, 2)}\\quad |w| = ${num(C.abs(w2), 3)}\\ (\\text{same length!})`);
    };
    const move = (e) => {
      const r = cv.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * 2 * RANGE;
      const y = -((e.clientY - r.top) / r.height - 0.5) * 2 * RANGE;
      z = [Math.max(-2.3, Math.min(2.3, x)), Math.max(-2.3, Math.min(2.3, y))];
      view.redraw(); readout();
    };
    cv.addEventListener("pointerdown", (e) => { down = true; cv.setPointerCapture(e.pointerId); move(e); });
    cv.addEventListener("pointermove", (e) => down && move(e));
    cv.addEventListener("pointerup", () => (down = false));
    $("cplx-ang").addEventListener("input", (e) => { ang = +e.target.value; view.redraw(); readout(); });
    readout();
  })();

  // =============================================================== Demo 2: state explorer
  (function () {
    const view = new Q.BlochView($("bloch1"));
    const th = $("th"), ph = $("ph"), gm = $("gm");
    function update() {
      const t = +th.value * PI, p = +ph.value * PI, g = +gm.value * PI;
      $("th-o").textContent = fmtPi(+th.value);
      $("ph-o").textContent = fmtPi(+ph.value);
      $("gm-o").textContent = fmtPi(+gm.value);
      const k = Q.ket(t, p), eg = C.exp(g);
      const psi = [C.mul(eg, k[0]), C.mul(eg, k[1])];
      view.set(Q.bloch(psi), false);
      const p0 = C.abs2(psi[0]), p1 = C.abs2(psi[1]);
      tex($("st-ket"), `|\\psi\\rangle = ${ctex(psi[0], 3)}\\,|0\\rangle + ${ctex(psi[1], 3)}\\,|1\\rangle`);
      tex($("st-amp"),
        `\\alpha: |\\alpha| = ${num(C.abs(psi[0]), 3)},\\ \\arg = ${deg(C.arg(psi[0]))}^\\circ \\qquad ` +
        `\\beta: |\\beta| = ${num(C.abs(psi[1]), 3)},\\ \\arg = ${deg(C.arg(psi[1]))}^\\circ`);
      $("bar0").style.width = p0 * 100 + "%"; $("bar1").style.width = p1 * 100 + "%";
      $("bar0t").textContent = `P(0) = |α|² = ${num(p0, 3)}`;
      $("bar1t").textContent = `P(1) = |β|² = ${num(p1, 3)}`;
      const v = Q.bloch(psi);
      tex($("st-xyz"), `(x,y,z)=(\\langle X\\rangle,\\langle Y\\rangle,\\langle Z\\rangle)=(${v.map((q) => num(q, 3)).join(",\\ ")})`);
    }
    [th, ph, gm].forEach((s) => s.addEventListener("input", update));
    $("presets").addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      th.value = b.dataset.t; ph.value = b.dataset.p; update();
    });
    update();
  })();

  // =============================================================== Demo 3: gate lab
  (function () {
    const view = new Q.BlochView($("bloch2"));
    let psi, total, seq, token = 0;
    const I2 = [[[1, 0], [0, 0]], [[0, 0], [1, 0]]];
    function reset(t = 0, p = 0) {
      psi = Q.ket(t * PI, p * PI); total = I2; seq = []; token++;
      view.trail = []; view.set(Q.bloch(psi), false); show();
    }
    function show() {
      const names = seq.map((s) => s.tex);
      tex($("g-seq"), names.length ? `\\text{sequence: } ${names.join(" \\to ")}` : "\\text{sequence: (none yet) — click a gate}");
      const prod = names.length ? [...names].reverse().join("\\,") : "I";
      tex($("g-mat"), `U_{\\text{total}} = ${prod} = ${Q.matTex(total, 3)}`);
      const v = Q.bloch(psi);
      tex($("g-state"), `|\\psi\\rangle = ${ctex(psi[0], 3)}|0\\rangle + ${ctex(psi[1], 3)}|1\\rangle,\\quad \\vec r = (${v.map((q) => num(q, 2)).join(",\\ ")})`);
    }
    function run(U, texName, rot) {
      const start = psi, my = ++token;
      psi = Q.apply(U, psi); total = Q.matMul(U, total); seq.push({ tex: texName });
      show();
      const t0 = performance.now(), dur = 650;
      (function step(now) {
        if (my !== token) return;
        const t = Math.min(1, (now - t0) / dur), e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const cur = t >= 1 ? psi : Q.apply(Q.axisRot(rot.n, rot.a * e), start);
        view.set(Q.bloch(cur), true);
        if (t < 1) requestAnimationFrame(step);
      })(t0);
    }
    $("gatebtns").addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      const g = b.dataset.g;
      run(Q.gates[g], Q.gateTex[g] || g, Q.gateRot[g]);
    });
    $("startbtns").addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      reset(+b.dataset.t, +b.dataset.p);
    });
    $("greset").addEventListener("click", () => reset());
    const rang = $("rang");
    const updAng = () => ($("rang-o").textContent = fmtPi(+rang.value));
    rang.addEventListener("input", updAng); updAng();
    $("rapply").addEventListener("click", () => {
      const ax = +$("rax").value, a = +rang.value * PI;
      const n = [0, 0, 0]; n[ax] = 1;
      run(Q.axisRot(n, a), `R_${"xyz"[ax]}(${num(+rang.value, 2)}\\pi)`, { n, a });
    });
    reset();
  })();

  // =============================================================== Demo 4: shot noise
  (function () {
    let k = 0, N = 0, hist = [], view = null;
    const prob = () => {
      const t = +$("mth").value * PI, p = +$("mph").value * PI;
      const r = Q.bloch(Q.ket(t, p)), n = +$("mbasis").value;
      return (1 + r[n]) / 2; // probability of outcome "0" (eigenvalue +1) in the chosen basis
    };
    function draw(ctx, w, h) {
      const p = prob(), L = 42, B = 26, T = 10, Rr = 10, W = w - L - Rr, H = h - B - T;
      const maxN = Math.max(10, N), lx = Math.log10(maxN);
      const X = (n) => L + (Math.log10(Math.max(1, n)) / lx) * W, Y = (v) => T + (1 - v) * H;
      ctx.font = "11px system-ui"; ctx.fillStyle = Q.css("--muted"); ctx.strokeStyle = Q.css("--grid"); ctx.lineWidth = 1;
      ctx.textAlign = "right";
      for (let v = 0; v <= 1.001; v += 0.25) { ctx.beginPath(); ctx.moveTo(L, Y(v)); ctx.lineTo(L + W, Y(v)); ctx.stroke(); ctx.fillText(v.toFixed(2), L - 6, Y(v) + 4); }
      ctx.textAlign = "center";
      const sup = ["⁰", "¹", "²", "³", "⁴", "⁵"];
      for (let e = 0; e <= Math.min(5, lx); e++) ctx.fillText("10" + sup[e], X(Math.pow(10, e)), h - 12);
      ctx.fillText("shots N", L + W / 2, h - 0);
      // 2-sigma band
      ctx.fillStyle = Q.css("--accent"); ctx.globalAlpha = 0.15; ctx.beginPath();
      const cols = Math.max(40, Math.floor(W / 3));
      const pts = []; for (let i = 0; i <= cols; i++) pts.push(Math.pow(10, (i / cols) * lx));
      pts.forEach((n, i) => { const s = 2 * Math.sqrt(p * (1 - p) / n); const x = X(n), y = Y(Math.min(1, p + s)); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
      [...pts].reverse().forEach((n) => { const s = 2 * Math.sqrt(p * (1 - p) / n); ctx.lineTo(X(n), Y(Math.max(0, p - s))); });
      ctx.fill(); ctx.globalAlpha = 1;
      ctx.strokeStyle = Q.css("--accent"); ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(L, Y(p)); ctx.lineTo(L + W, Y(p)); ctx.stroke(); ctx.setLineDash([]);
      if (hist.length) {
        ctx.strokeStyle = Q.css("--accent3"); ctx.lineWidth = 2; ctx.beginPath();
        for (let i = 0; i <= cols; i++) { const n = Math.min(hist.length, Math.max(1, Math.round(pts[i]))); const x = X(n), y = Y(hist[n - 1]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        ctx.stroke();
      }
      ctx.fillStyle = Q.css("--muted"); ctx.textAlign = "left"; ctx.fillText("estimate p̂(0) (orange) vs true p (dashed) ± 2/√N band", L + 4, T + 10);
    }
    function refresh() {
      const p = prob();
      $("mth-o").textContent = fmtPi(+$("mth").value); $("mph-o").textContent = fmtPi(+$("mph").value);
      tex($("m-theory"), `\\text{true } p(0) = \\tfrac{1+\\langle ${"XYZ"[+$("mbasis").value]}\\rangle}{2} = ${num(p, 3)}`);
      const f0 = N ? k / N : 0;
      $("mb0").style.width = f0 * 100 + "%"; $("mb1").style.width = (N ? 1 - f0 : 0) * 100 + "%";
      $("mb0t").textContent = `0 : ${k}`; $("mb1t").textContent = `1 : ${N - k}`;
      const sig = N ? Math.sqrt(p * (1 - p) / N) : 0;
      tex($("m-est"), N ? `N=${N},\\ \\hat p(0) = ${num(f0, 3)} \\pm ${num(sig, 3)}\\ (\\approx 1/\\sqrt N\\text{ scale})` : "N=0\\ \\text{(no shots yet)}");
      view.redraw();
    }
    function fire(n) {
      const p = prob();
      for (let i = 0; i < n && hist.length < 200000; i++) { if (Math.random() < p) k++; N++; hist.push(k / N); }
      refresh();
    }
    function reset() { k = 0; N = 0; hist = []; refresh(); }
    $("shotbtns").addEventListener("click", (e) => { const b = e.target.closest("button[data-n]"); if (b) fire(+b.dataset.n); });
    $("mreset").addEventListener("click", reset);
    ["mth", "mph", "mbasis"].forEach((id) => $(id).addEventListener("input", reset));
    view = Q.fit($("mchart"), draw);
    reset();
  })();

  // =============================================================== Demo 5: interference
  (function () {
    const ph = $("iph");
    const phasors = Q.fit($("ph-cv"), (ctx, w, h) => {
      const phi = +ph.value * PI, S = Math.min(w, h) * 0.62, ox = w * 0.2, oy = h * 0.55;
      const X = (z) => [ox + S * z[0], oy - S * z[1]];
      ctx.strokeStyle = Q.css("--grid"); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(8, oy); ctx.lineTo(w - 8, oy); ctx.moveTo(ox, 8); ctx.lineTo(ox, h - 8); ctx.stroke();
      ctx.fillStyle = Q.css("--muted"); ctx.font = "12px system-ui"; ctx.textAlign = "left";
      ctx.fillText("Re", w - 24, oy - 6); ctx.fillText("Im", ox + 6, 16);
      ctx.fillText("amplitude of |0⟩ in the complex plane", 10, h - 8);
      const a = [0.5, 0], b = C.mul([0.5, 0], C.exp(phi)), s = C.add(a, b);
      const arrow = (p, q, col, wd, dash) => {
        const [x1, y1] = X(p), [x2, y2] = X(q);
        ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = wd; ctx.setLineDash(dash || []);
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.setLineDash([]);
        ctx.beginPath(); ctx.arc(x2, y2, 4, 0, TAU); ctx.fill();
      };
      arrow([0, 0], a, Q.css("--accent"), 3);
      arrow(a, s, Q.css("--accent3"), 3);
      arrow([0, 0], s, Q.css("--accent2"), 2, [5, 4]);
      ctx.fillStyle = Q.css("--accent"); ctx.fillText("path 1: ½", X([0.25, 0])[0] - 10, X([0.25, 0])[1] + 18);
      ctx.fillStyle = Q.css("--accent3"); ctx.fillText("path 2: ½·e^{iφ}", X(C.add(a, C.scale(b, 0.5)))[0] + 8, X(C.add(a, C.scale(b, 0.5)))[1]);
      ctx.fillStyle = Q.css("--accent2"); ctx.fillText("sum", X(C.scale(s, 0.5))[0] - 30, X(C.scale(s, 0.5))[1] - 8);
    });
    const curve = Q.fit($("pc-cv"), (ctx, w, h) => {
      const phi = +ph.value * PI, L = 40, B = 30, T = 12, R = 12, W = w - L - R, H = h - B - T;
      const X = (t) => L + (t / TAU) * W, Y = (v) => T + (1 - v) * H;
      ctx.strokeStyle = Q.css("--grid"); ctx.lineWidth = 1; ctx.fillStyle = Q.css("--muted"); ctx.font = "11px system-ui"; ctx.textAlign = "right";
      for (let v = 0; v <= 1; v += 0.5) { ctx.beginPath(); ctx.moveTo(L, Y(v)); ctx.lineTo(L + W, Y(v)); ctx.stroke(); ctx.fillText(v.toFixed(1), L - 6, Y(v) + 4); }
      ctx.textAlign = "center";
      [["0", 0], ["π", PI], ["2π", TAU]].forEach(([l, t]) => ctx.fillText(l, X(t), h - 12));
      ctx.fillText("φ", L + W / 2, h - 0); ctx.textAlign = "left"; ctx.fillText("P(0) = cos²(φ/2)", L + 6, T + 10);
      ctx.strokeStyle = Q.css("--accent"); ctx.lineWidth = 2; ctx.beginPath();
      for (let i = 0; i <= 100; i++) { const t = (i / 100) * TAU, x = X(t), y = Y(Math.pow(Math.cos(t / 2), 2)); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
      ctx.fillStyle = Q.css("--accent3"); ctx.beginPath(); ctx.arc(X(phi), Y(Math.pow(Math.cos(phi / 2), 2)), 6, 0, TAU); ctx.fill();
    });
    function update() {
      const v = +ph.value, phi = v * PI, amp = C.scale(C.add([1, 0], C.exp(phi)), 0.5), p0 = C.abs2(amp);
      $("iph-o").textContent = fmtPi(v);
      tex($("i-out"), `\\langle 0|\\psi\\rangle = \\tfrac12(1+e^{i\\phi}) = ${cfmt(amp, 3)}\\ \\Rightarrow\\ P(0)=|\\cdot|^2 = ${num(p0, 3)} = \\cos^2(\\phi/2),\\quad P(1) = ${num(1 - p0, 3)}` +
        (p0 > 0.999 ? "\\quad\\textbf{constructive}" : p0 < 0.001 ? "\\quad\\textbf{destructive}" : ""));
      phasors.redraw(); curve.redraw();
    }
    ph.addEventListener("input", update); update();
  })();
})();
