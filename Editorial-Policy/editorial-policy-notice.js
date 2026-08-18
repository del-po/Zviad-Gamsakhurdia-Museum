(() => {
  "use strict";

  const noticeSlots = document.querySelectorAll(
    "[data-editorial-policy-notice]",
  );

  if (!noticeSlots.length) return;

  async function loadEditorialPolicyNotice() {
    try {
      const response = await fetch(
        "/Editorial-Policy/editorial-policy-notice.html",
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();

      noticeSlots.forEach((slot) => {
        slot.innerHTML = html;
      });
    } catch (error) {
      console.error("Unable to load editorial policy notice:", error);
    }
  }

  loadEditorialPolicyNotice();
})();
