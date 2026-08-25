function fitNewsWindow(container) {
  const visibleItems = Number.parseInt(container.dataset.visibleItems, 10);
  const rows = container.querySelectorAll("tbody > tr");

  if (!visibleItems || rows.length <= visibleItems) {
    container.style.removeProperty("height");
    return;
  }

  const setHeightFromRows = () => {
    const containerTop = container.getBoundingClientRect().top;
    const visibleBottom = rows[visibleItems - 1].getBoundingClientRect().bottom;
    container.style.height = `${Math.round(visibleBottom - containerTop)}px`;
  };

  container.style.removeProperty("height");
  setHeightFromRows();
  requestAnimationFrame(setHeightFromRows);
}

function fitNewsWindows() {
  document.querySelectorAll(".news-scroll-window").forEach(fitNewsWindow);
}

let newsResizeFrame;
window.addEventListener("resize", () => {
  cancelAnimationFrame(newsResizeFrame);
  newsResizeFrame = requestAnimationFrame(fitNewsWindows);
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", fitNewsWindows);
} else {
  fitNewsWindows();
}

document.fonts?.ready.then(fitNewsWindows);
