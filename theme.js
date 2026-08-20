/* Dark mode toggle. The initial theme is applied inline in index.html's
 * <head> (before this script loads) to avoid a flash of the wrong theme.
 */
(function () {
  const root = document.documentElement;
  const btn = document.getElementById("themeToggle");

  function render(theme) {
    btn.textContent = theme === "dark" ? "☀️" : "🌙";
    btn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
    btn.title = btn.getAttribute("aria-label");
  }

  render(root.getAttribute("data-theme") || "light");

  btn.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("qa-growth-theme", next);
    render(next);
  });
})();
