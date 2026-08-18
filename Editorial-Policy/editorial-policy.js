(() => {
  "use strict";

  const evidenceBoard = document.querySelector("[data-evidence-board]");

  if (!evidenceBoard) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (prefersReducedMotion) {
    evidenceBoard.classList.add("is-running");
    return;
  }

  let replayTimer;

  function playEvidenceSequence() {
    evidenceBoard.classList.remove("is-running");

    void evidenceBoard.offsetWidth;

    evidenceBoard.classList.add("is-running");

    window.clearTimeout(replayTimer);

    replayTimer = window.setTimeout(() => {
      playEvidenceSequence();
    }, 10500);
  }

  if (!("IntersectionObserver" in window)) {
    playEvidenceSequence();
    return;
  }

  const observer = new IntersectionObserver(
    ([entry], currentObserver) => {
      if (!entry.isIntersecting) return;

      playEvidenceSequence();

      currentObserver.disconnect();
    },
    {
      threshold: 0.25,
    },
  );

  observer.observe(evidenceBoard);
})();
