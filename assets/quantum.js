// Tiny quantum toolkit + canvas helpers shared by the interactive demos.
// Complex numbers are [re, im] pairs; a qubit is [alpha, beta]; a gate is [[a,b],[c,d]].
(function () {
  const TAU = Math.PI * 2;
  const c = (r, i = 0) => [r, i];

  const C = {
    add: (a, b) => [a[0] + b[0], a[1] + b[1]],
    mul: (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]],
    conj: (a) => [a[0], -a[1]],
    scale: (a, s) => [a[0] * s, a[1] * s],
    abs2: (a) => a[0] * a[0] + a[1] * a[1],
    abs: (a) => Math.hypot(a[0], a[1]),
    arg: (a) => Math.atan2(a[1], a[0]),
    exp: (t) => [Math.cos(t), Math.sin(t)], // e^{it}
  };

  function num(x, d = 3) {
    if (Math.abs(x) < 0.5 * Math.pow(10, -d)) x = 0;
    return x.toFixed(d).replace(/\.?0+$/, "") || "0";
  }
  // complex -> string such as "0.707+0.707i"
  function cfmt(z, d = 3) {
    const r = num(z[0], d), i = num(z[1], d);
    if (i === "0") return r;
    const ia = num(Math.abs(z[1]), d);
    const imag = (ia === "1" ? "" : ia) + "i";
    if (r === "0") return (z[1] < 0 ? "-" : "") + imag;
    return r + (z[1] < 0 ? "-" : "+") + imag;
  }
  // complex -> LaTeX, parenthesised when it has both parts
  function ctex(z, d = 3) {
    const s = cfmt(z, d);
    return /.[+-]/.test(s) ? "(" + s + ")" : s;
  }

  const Q = {
    C, num, cfmt, ctex, TAU,
    ket: (theta, phi) => [c(Math.cos(theta / 2)), C.scale(C.exp(phi), Math.sin(theta / 2))],
    apply: (U, p) => [
      C.add(C.mul(U[0][0], p[0]), C.mul(U[0][1], p[1])),
      C.add(C.mul(U[1][0], p[0]), C.mul(U[1][1], p[1])),
    ],
    matMul: (A, B) =>
      [0, 1].map((i) => [0, 1].map((j) => C.add(C.mul(A[i][0], B[0][j]), C.mul(A[i][1], B[1][j])))),
    bloch(p) {
      const ab = C.mul(C.conj(p[0]), p[1]);
      return [2 * ab[0], 2 * ab[1], C.abs2(p[0]) - C.abs2(p[1])];
    },
    // exp(-i a/2 n.sigma): rotation by angle a about unit axis n
    axisRot(n, a) {
      const co = Math.cos(a / 2), s = Math.sin(a / 2);
      return [
        [c(co, -s * n[2]), c(-s * n[1], -s * n[0])],
        [c(s * n[1], -s * n[0]), c(co, s * n[2])],
      ];
    },
    matTex(U, d = 3) {
      const e = (z) => cfmt(z, d);
      return `\\begin{pmatrix}${e(U[0][0])} & ${e(U[0][1])} \\\\ ${e(U[1][0])} & ${e(U[1][1])}\\end{pmatrix}`;
    },
    css: (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim(),
    tex(el, s, display = false) {
      if (window.katex) katex.render(s, el, { throwOnError: false, displayMode: display });
      else el.textContent = s;
    },
  };
  const r2 = Math.SQRT1_2;
  Q.gates = {
    X: [[c(0), c(1)], [c(1), c(0)]],
    Y: [[c(0), c(0, -1)], [c(0, 1), c(0)]],
    Z: [[c(1), c(0)], [c(0), c(-1)]],
    H: [[c(r2), c(r2)], [c(r2), c(-r2)]],
    S: [[c(1), c(0)], [c(0), c(0, 1)]],
    Sdg: [[c(1), c(0)], [c(0), c(0, -1)]],
    T: [[c(1), c(0)], [c(0), C.exp(Math.PI / 4)]],
    Tdg: [[c(1), c(0)], [c(0), C.exp(-Math.PI / 4)]],
  };
  // each named gate = rotation of the Bloch sphere (axis, angle) - used for animation
  Q.gateRot = {
    X: { n: [1, 0, 0], a: Math.PI }, Y: { n: [0, 1, 0], a: Math.PI }, Z: { n: [0, 0, 1], a: Math.PI },
    H: { n: [r2, 0, r2], a: Math.PI },
    S: { n: [0, 0, 1], a: Math.PI / 2 }, Sdg: { n: [0, 0, 1], a: -Math.PI / 2 },
    T: { n: [0, 0, 1], a: Math.PI / 4 }, Tdg: { n: [0, 0, 1], a: -Math.PI / 4 },
  };
  Q.gateTex = { Sdg: "S^\\dagger", Tdg: "T^\\dagger" };

  // ---- canvas helper: crisp on HiDPI, redraws on resize and on theme change ----
  const redrawers = [];
  Q.fit = function (canvas, draw) {
    const aspect = parseFloat(canvas.dataset.aspect || "1");
    const api = {
      redraw() {
        const dpr = window.devicePixelRatio || 1;
        const w = canvas.clientWidth, h = Math.round(w * aspect);
        if (!w) return;
        canvas.style.height = h + "px";
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        const ctx = canvas.getContext("2d");
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        draw(ctx, w, h);
      },
    };
    new ResizeObserver(() => api.redraw()).observe(canvas);
    redrawers.push(api);
    api.redraw();
    return api;
  };
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () =>
    setTimeout(() => redrawers.forEach((r) => r.redraw()), 50));

  // ---- Bloch sphere view (drag to rotate the camera) ----
  Q.BlochView = class {
    constructor(canvas, opts = {}) {
      this.cv = canvas;
      this.yaw = opts.yaw ?? -0.55;
      this.pitch = opts.pitch ?? 0.35;
      this.vec = opts.vec || [0, 0, 1];
      this.trail = [];
      let drag = null;
      canvas.addEventListener("pointerdown", (e) => {
        drag = [e.clientX, e.clientY];
        canvas.setPointerCapture(e.pointerId);
        canvas.style.cursor = "grabbing";
      });
      canvas.addEventListener("pointermove", (e) => {
        if (!drag) return;
        this.yaw += (e.clientX - drag[0]) * 0.01;
        this.pitch = Math.max(-1.4, Math.min(1.4, this.pitch + (e.clientY - drag[1]) * 0.01));
        drag = [e.clientX, e.clientY];
        this.api.redraw();
      });
      const up = () => { drag = null; canvas.style.cursor = "grab"; };
      canvas.addEventListener("pointerup", up);
      canvas.addEventListener("pointercancel", up);
      this.api = Q.fit(canvas, (ctx, w, h) => this.draw(ctx, w, h));
    }
    set(vec, keepTrail = true) {
      this.vec = vec;
      if (keepTrail) { this.trail.push(vec); if (this.trail.length > 800) this.trail.shift(); }
      this.api.redraw();
    }
    clearTrail() { this.trail = []; this.api.redraw(); }
    proj(v) {
      const cy = Math.cos(this.yaw), sy = Math.sin(this.yaw), cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
      const x1 = v[0] * cy - v[1] * sy, y1 = v[0] * sy + v[1] * cy;
      return { sx: x1, su: v[2] * cp + y1 * sp, d: -y1 * cp + v[2] * sp };
    }
    draw(ctx, w, h) {
      const R = Math.min(w, h) * 0.34, cx = w / 2, cy = h / 2;
      const P = (v) => { const p = this.proj(v); return { x: cx + R * p.sx, y: cy - R * p.su, d: p.d }; };
      const muted = Q.css("--muted"), grid = Q.css("--grid");
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU);
      ctx.fillStyle = Q.css("--sphere"); ctx.fill();
      ctx.strokeStyle = muted; ctx.lineWidth = 1.2; ctx.stroke();
      // great circles
      const circle = (f, col) => {
        ctx.strokeStyle = col; ctx.lineWidth = 1;
        let prev = null;
        for (let k = 0; k <= 96; k++) {
          const p = P(f((k / 96) * TAU));
          if (prev) {
            ctx.globalAlpha = (p.d + prev.d) / 2 >= 0 ? 0.95 : 0.25;
            ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(p.x, p.y); ctx.stroke();
          }
          prev = p;
        }
        ctx.globalAlpha = 1;
      };
      circle((t) => [Math.cos(t), Math.sin(t), 0], muted);
      circle((t) => [Math.cos(t), 0, Math.sin(t)], grid);
      circle((t) => [0, Math.cos(t), Math.sin(t)], grid);
      // axes + labels
      ctx.font = "12px system-ui, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      const axes = [
        [[1, 0, 0], "|+⟩"], [[-1, 0, 0], "|−⟩"], [[0, 1, 0], "|+i⟩"], [[0, -1, 0], "|−i⟩"],
        [[0, 0, 1], "|0⟩"], [[0, 0, -1], "|1⟩"],
      ];
      ctx.strokeStyle = muted; ctx.lineWidth = 1;
      for (const [v, lab] of axes) {
        const e = P(v), o = P([0, 0, 0]);
        ctx.globalAlpha = e.d >= 0 ? 0.8 : 0.3;
        ctx.beginPath(); ctx.moveTo(o.x, o.y); ctx.lineTo(e.x, e.y); ctx.stroke();
        const l = P(v.map((q) => q * 1.2));
        ctx.fillStyle = Q.css("--fg"); ctx.fillText(lab, l.x, l.y);
      }
      ctx.globalAlpha = 1;
      // trail
      if (this.trail.length > 1) {
        ctx.strokeStyle = Q.css("--accent3"); ctx.lineWidth = 2; ctx.beginPath();
        this.trail.forEach((v, i) => { const p = P(v); i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); });
        ctx.stroke();
      }
      // state vector with projections
      const v = this.vec, tip = P(v), o = P([0, 0, 0]), foot = P([v[0], v[1], 0]);
      ctx.setLineDash([4, 4]); ctx.strokeStyle = Q.css("--accent"); ctx.lineWidth = 1; ctx.globalAlpha = 0.6;
      ctx.beginPath(); ctx.moveTo(o.x, o.y); ctx.lineTo(foot.x, foot.y); ctx.lineTo(tip.x, tip.y); ctx.stroke();
      ctx.setLineDash([]); ctx.globalAlpha = 1;
      ctx.strokeStyle = Q.css("--accent"); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(o.x, o.y); ctx.lineTo(tip.x, tip.y); ctx.stroke();
      ctx.fillStyle = Q.css("--accent"); ctx.beginPath(); ctx.arc(tip.x, tip.y, 6, 0, TAU); ctx.fill();
    }
  };
  window.Q = Q;
})();
