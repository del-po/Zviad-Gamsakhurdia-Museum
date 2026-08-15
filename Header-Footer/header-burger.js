const burgerMenu = document.querySelector(".header-burger-menu");
const headerMenu = document.querySelector(".header-menu");

if (burgerMenu && headerMenu) {
  function setMenuState(isOpen) {
    headerMenu.classList.toggle("open", isOpen);
    document.body.classList.toggle("menu-open", isOpen);

    burgerMenu.setAttribute("aria-expanded", String(isOpen));
    burgerMenu.setAttribute(
      "aria-label",
      isOpen ? "Close navigation menu" : "Open navigation menu",
    );

    headerMenu.setAttribute("aria-hidden", String(!isOpen));
  }

  burgerMenu.addEventListener("click", () => {
    const isCurrentlyOpen = headerMenu.classList.contains("open");

    setMenuState(!isCurrentlyOpen);
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
    }
  });

  setMenuState(false);
}
