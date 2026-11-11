// Renders LaTeX ($...$ inline, $$...$$ display) with KaTeX once the page is parsed.
document.addEventListener("DOMContentLoaded", () => {
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
