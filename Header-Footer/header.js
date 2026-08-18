(() => {
  "use strict";

  const headerSlot = document.querySelector("[data-header]");

  if (!headerSlot) return;

  async function loadHeader() {
    try {
      const response = await fetch("/Header-Footer/header.html");

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      headerSlot.innerHTML = await response.text();

      initializeHeader();
    } catch (error) {
      console.error("Unable to load header:", error);
    }
  }

  function initializeHeader() {
    const burgerMenu = headerSlot.querySelector(".header-burger-menu");
    const headerMenu = headerSlot.querySelector(".header-menu");

    if (!burgerMenu || !headerMenu) return;

    function setMenuState(isOpen) {
      headerMenu.classList.toggle("open", isOpen);
      document.body.classList.toggle("menu-open", isOpen);

      burgerMenu.setAttribute("aria-expanded", String(isOpen));

      burgerMenu.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu",
      );

      if (window.innerWidth <= 750) {
        headerMenu.setAttribute("aria-hidden", String(!isOpen));
      } else {
        headerMenu.removeAttribute("aria-hidden");
      }
    }

    burgerMenu.addEventListener("click", () => {
      const isOpen = headerMenu.classList.contains("open");

      setMenuState(!isOpen);
    });

    headerMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        setMenuState(false);
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setMenuState(false);
        burgerMenu.focus();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 750) {
        setMenuState(false);
      } else {
        headerMenu.setAttribute(
          "aria-hidden",
          String(!headerMenu.classList.contains("open")),
        );
      }
    });

    setMenuState(false);
  }

  loadHeader();
})();
