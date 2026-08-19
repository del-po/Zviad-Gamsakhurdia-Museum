(() => {
  "use strict";

  const home = document.querySelector("[data-home-cover]");

  if (!home) return;

  const menu = document.querySelector("[data-home-menu]");

  const menuButton = document.querySelector("[data-home-menu-button]");

  const closeButton = document.querySelector("[data-home-menu-close]");

  const portrait = document.querySelector("[data-drag-portrait]");

  const portraitImage = document.querySelector("[data-drag-portrait-image]");

  /* =====================================================
     FULLSCREEN MENU
     ===================================================== */

  function openMenu() {
    if (!menu || !menuButton) return;

    menu.classList.add("is-open");

    menu.setAttribute("aria-hidden", "false");

    menuButton.setAttribute("aria-expanded", "true");

    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    if (!menu || !menuButton) return;

    menu.classList.remove("is-open");

    menu.setAttribute("aria-hidden", "true");

    menuButton.setAttribute("aria-expanded", "false");

    document.body.style.overflow = "";
  }

  menuButton?.addEventListener("click", openMenu);

  closeButton?.addEventListener("click", closeMenu);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu?.classList.contains("is-open")) {
      closeMenu();

      menuButton?.focus();
    }
  });

  /* =====================================================
     DRAGGABLE PORTRAIT
     ===================================================== */

  if (!portrait || !portraitImage) {
    return;
  }

  let dragging = false;

  let activePointerId = null;

  let startPointerX = 0;
  let startPointerY = 0;

  let startingX = 0;
  let startingY = 0;

  let currentX = 0;
  let currentY = 0;

  let previousPointerX = 0;

  /* =====================================================
     HELPERS
     ===================================================== */

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  }

  function applyTransform(x, y, rotation = -1.5) {
    portrait.style.setProperty("--drag-x", `${x}px`);

    portrait.style.setProperty("--drag-y", `${y}px`);

    portrait.style.setProperty("--drag-rotation", `${rotation}deg`);
  }

  /* =====================================================
     COORDINATE SYSTEM

     Find the exact center of the visible photograph,
     convert that point into Home-page coordinates,
     and move the full horizontal and vertical lines there.
     ===================================================== */

  function updateCoordinates() {
    const homeRect = home.getBoundingClientRect();

    const imageRect = portraitImage.getBoundingClientRect();

    const centerX = imageRect.left - homeRect.left + imageRect.width / 2;

    const centerY = imageRect.top - homeRect.top + imageRect.height / 2;

    home.style.setProperty("--coordinate-x", `${centerX}px`);

    home.style.setProperty("--coordinate-y", `${centerY}px`);
  }

  /* =====================================================
     KEEP IMAGE WITHIN HOME CANVAS
     ===================================================== */

  function constrainToCanvas() {
    const canvasRect = home.getBoundingClientRect();

    const portraitRect = portrait.getBoundingClientRect();

    const padding = 18;

    let adjustmentX = 0;
    let adjustmentY = 0;

    const leftBoundary = canvasRect.left + padding;

    const rightBoundary = canvasRect.right - padding;

    const topBoundary = canvasRect.top + padding;

    const bottomBoundary = canvasRect.bottom - padding;

    if (portraitRect.left < leftBoundary) {
      adjustmentX += leftBoundary - portraitRect.left;
    }

    if (portraitRect.right > rightBoundary) {
      adjustmentX -= portraitRect.right - rightBoundary;
    }

    if (portraitRect.top < topBoundary) {
      adjustmentY += topBoundary - portraitRect.top;
    }

    if (portraitRect.bottom > bottomBoundary) {
      adjustmentY -= portraitRect.bottom - bottomBoundary;
    }

    if (adjustmentX === 0 && adjustmentY === 0) {
      return;
    }

    currentX += adjustmentX;
    currentY += adjustmentY;

    applyTransform(currentX, currentY);
  }

  /* =====================================================
     START DRAG
     ===================================================== */

  function startDrag(event) {
    /*
     * For a mouse, only the primary button
     * starts dragging.
     */

    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    /*
     * Disable dragging while the menu is open.
     */

    if (menu?.classList.contains("is-open")) {
      return;
    }

    dragging = true;

    activePointerId = event.pointerId;

    startPointerX = event.clientX;

    startPointerY = event.clientY;

    previousPointerX = event.clientX;

    startingX = currentX;

    startingY = currentY;

    portrait.classList.add("is-dragging");

    portrait.setPointerCapture(activePointerId);

    event.preventDefault();
  }

  /* =====================================================
     DRAG
     ===================================================== */

  function movePortrait(event) {
    if (!dragging) return;

    if (event.pointerId !== activePointerId) {
      return;
    }

    const deltaX = event.clientX - startPointerX;

    const deltaY = event.clientY - startPointerY;

    currentX = startingX + deltaX;

    currentY = startingY + deltaY;

    /*
     * Small physical tilt responding to
     * horizontal movement.
     */

    const horizontalMovement = event.clientX - previousPointerX;

    const rotation = clamp(horizontalMovement * 0.28, -4, 4);

    applyTransform(currentX, currentY, rotation);

    /*
     * Prevent the image from disappearing
     * outside the Home canvas.
     */

    constrainToCanvas();

    /*
     * IMPORTANT:
     * Move both dotted coordinate axes to
     * the photograph's new center.
     */

    updateCoordinates();

    previousPointerX = event.clientX;

    event.preventDefault();
  }

  /* =====================================================
     END DRAG
     ===================================================== */

  function endDrag(event) {
    if (!dragging) return;

    if (event.pointerId !== activePointerId) {
      return;
    }

    dragging = false;

    portrait.classList.remove("is-dragging");

    /*
     * Image stays where it was released,
     * but returns to its subtle resting angle.
     */

    applyTransform(currentX, currentY, -1.5);

    /*
     * Keep axes perfectly synchronized
     * after resting rotation is restored.
     */

    updateCoordinates();

    if (portrait.hasPointerCapture(activePointerId)) {
      portrait.releasePointerCapture(activePointerId);
    }

    activePointerId = null;
  }

  /* =====================================================
     POINTER EVENTS
     ===================================================== */

  portrait.addEventListener("pointerdown", startDrag);

  portrait.addEventListener("pointermove", movePortrait);

  portrait.addEventListener("pointerup", endDrag);

  portrait.addEventListener("pointercancel", endDrag);

  portrait.addEventListener("lostpointercapture", () => {
    if (!dragging) return;

    dragging = false;

    activePointerId = null;

    portrait.classList.remove("is-dragging");

    applyTransform(currentX, currentY, -1.5);

    updateCoordinates();
  });

  /* =====================================================
     DISABLE NATIVE IMAGE DRAG
     ===================================================== */

  portrait.addEventListener("dragstart", (event) => {
    event.preventDefault();
  });

  /* =====================================================
     INITIAL COORDINATE POSITION
     ===================================================== */

  function initializeCoordinates() {
    window.requestAnimationFrame(() => {
      updateCoordinates();
    });
  }

  initializeCoordinates();

  /*
   * Recalculate when the photograph finishes loading,
   * in case its final rendered dimensions changed.
   */

  const image = portraitImage.querySelector("img");

  if (image) {
    if (image.complete) {
      initializeCoordinates();
    } else {
      image.addEventListener("load", initializeCoordinates, {
        once: true,
      });
    }
  }

  /* =====================================================
     RESIZE
     ===================================================== */

  window.addEventListener(
    "resize",
    () => {
      window.requestAnimationFrame(() => {
        constrainToCanvas();
        updateCoordinates();
      });
    },
    {
      passive: true,
    },
  );
})();
