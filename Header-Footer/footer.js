(() => {
  "use strict";

  const footerSlot = document.querySelector("[data-footer]");

  if (!footerSlot) return;

  async function loadFooter() {
    try {
      const response = await fetch("/Header-Footer/footer.html");

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      footerSlot.innerHTML = await response.text();

      initializeFooter();
    } catch (error) {
      console.error("Unable to load footer:", error);
    }
  }

  function initializeFooter() {
    const footerMessage = footerSlot.querySelector("#footer-contact-message");
    const footerWordCount = footerSlot.querySelector(
      "#footer-contact-word-count",
    );

    if (!footerMessage || !footerWordCount) return;

    footerMessage.addEventListener("input", () => {
      let words = footerMessage.value.trim().split(/\s+/).filter(Boolean);

      if (words.length > 100) {
        words = words.slice(0, 100);
        footerMessage.value = words.join(" ");
      }

      footerWordCount.textContent = words.length;
    });
  }

  loadFooter();
})();
