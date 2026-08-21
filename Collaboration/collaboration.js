(() => {
  "use strict";

  const collaborationSlots = document.querySelectorAll("[data-collaboration]");

  if (!collaborationSlots.length) return;

  async function loadCollaboration() {
    try {
      const response = await fetch("/Collaboration/collaboration.html");

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();

      collaborationSlots.forEach((slot) => {
        slot.innerHTML = html;

        const panel = slot.querySelector(".collaboration-panel");

        if (!panel) return;

        const theme = String(
          slot.dataset.collaborationTheme || "",
        ).toLowerCase();

        if (theme === "light" || theme === "white") {
          panel.classList.add("collaboration-panel--light");
        }

        const prefersReducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;

        if (prefersReducedMotion || !("IntersectionObserver" in window)) {
          panel.classList.add("is-visible");
          return;
        }

        const observer = new IntersectionObserver(
          ([entry], currentObserver) => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add("is-visible");
            currentObserver.unobserve(entry.target);
          },
          {
            threshold: 0.1,
            rootMargin: "0px 0px -55px",
          },
        );

        observer.observe(panel);
      });
    } catch (error) {
      console.error("Unable to load collaboration component:", error);
    }
  }

  loadCollaboration();
})();
