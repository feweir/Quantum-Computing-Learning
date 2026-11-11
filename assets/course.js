// 1) Syntax highlighting (Vercel/Geist code theme) for <pre><code class="language-…"> blocks.
// 2) LaTeX rendering ($…$ inline, $$…$$ display) with KaTeX.
(function () {
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const PY_KW = new Set("and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield".split(" "));
  const PY_CONST = new Set(["True", "False", "None", "self"]);

  const grammars = {
    python: /(#[^\n]*)|("""[\s\S]*?"""|'''[\s\S]*?'''|f?"(?:\\.|[^"\\\n])*"|f?'(?:\\.|[^'\\\n])*')|(\b\d[\d_]*\.?\d*(?:e[+-]?\d+)?\b)|(@?[A-Za-z_]\w*)(\s*\()?|([^\sA-Za-z_\d]+|\s+)/g,
    bash: /(#[^\n]*)|("(?:\\.|[^"\\\n])*"|'[^'\n]*')|(\s--?[A-Za-z][\w-]*)|(\b\d+\b)|([^\s"'#\d-]+|\s+|-)/g,
  };

  function hlPython(src) {
    return src.replace(grammars.python, (m, com, str, num, id, call, other) => {
      if (com) return `<span class="tk-c">${esc(com)}</span>`;
      if (str) return `<span class="tk-s">${esc(str)}</span>`;
      if (num) return `<span class="tk-n">${num}</span>`;
      if (id) {
        const tail = call ? esc(call) : "";
        if (PY_KW.has(id)) return `<span class="tk-k">${id}</span>${tail}`;
        if (PY_CONST.has(id)) return `<span class="tk-n">${id}</span>${tail}`;
        if (call) return `<span class="tk-f">${id}</span>${tail}`;
        return id;
      }
      return `<span class="tk-p">${esc(other ?? m)}</span>`;
    });
  }

  function hlBash(src) {
    let first = true;
    return src.replace(grammars.bash, (m, com, str, flag, num, other) => {
      if (m.includes("\n")) first = true;
      if (com) return `<span class="tk-c">${esc(com)}</span>`;
      if (str) { first = false; return `<span class="tk-s">${esc(str)}</span>`; }
      if (flag) return `<span class="tk-n">${esc(flag)}</span>`;
      if (num) return `<span class="tk-n">${num}</span>`;
      if (first && /\S/.test(m)) { first = false; return `<span class="tk-f">${esc(m)}</span>`; }
      return esc(m);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("pre code").forEach((el) => {
      const lang = (el.className.match(/language-(\w+)/) || [])[1];
      const src = el.textContent;
      if (lang === "python") el.innerHTML = hlPython(src);
      else if (lang === "bash") el.innerHTML = hlBash(src);
      el.setAttribute("translate", "no");
    });

    if (!window.renderMathInElement) {
      console.warn("KaTeX failed to load (offline?) - formulas show as raw LaTeX.");
      return;
    }
    renderMathInElement(document.body, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
      ],
      throwOnError: false,
    });
    document.documentElement.dataset.mathReady = "1";
  });
})();
