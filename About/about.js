const header = document.getElementById("site-header");
const menuButton = document.querySelector(".menu-button");
const mainNavigation = document.getElementById("main-navigation");
const aboutPage = document.querySelector(".about-page");
const revealElements = [...document.querySelectorAll(".reveal-on-scroll")];
const methodSteps = [...document.querySelectorAll("[data-method-step]")];
const methodPanels = [...document.querySelectorAll("[data-method-panel]")];
const methodProgress = document.getElementById("methodology-progress");

function updateHeader() {
  header?.classList.toggle("is-scrolled", window.scrollY > 18);
}

function setMenu(open) {
  if (!menuButton || !mainNavigation) return;

  menuButton.setAttribute("aria-expanded", String(open));
  mainNavigation.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
}

function closeMenu() {
  setMenu(false);
}

function updatePageProgress() {
  if (!aboutPage) return;

  const maximumScroll = Math.max(
    1,
    document.documentElement.scrollHeight - window.innerHeight,
  );
  const progress = Math.min(1, Math.max(0, window.scrollY / maximumScroll));

  aboutPage.style.setProperty("--about-progress", progress.toFixed(4));
  aboutPage.style.setProperty(
    "--about-angle",
    `${(progress * 44).toFixed(2)}deg`,
  );
  aboutPage.style.setProperty(
    "--about-angle-reverse",
    `${(progress * 31).toFixed(2)}deg`,
  );
}

function setMethodStep(index) {
  const safeIndex = Math.min(
    methodPanels.length - 1,
    Math.max(0, Number(index) || 0),
  );

  methodSteps.forEach((step, stepIndex) => {
    const active = stepIndex === safeIndex;
    step.classList.toggle("active", active);
    step.setAttribute("aria-pressed", String(active));
  });

  methodPanels.forEach((panel, panelIndex) => {
    const active = panelIndex === safeIndex;
    panel.classList.toggle("active", active);
    panel.hidden = !active;
  });

  if (methodProgress) {
    const denominator = Math.max(1, methodSteps.length - 1);
    methodProgress.style.height = `${(safeIndex / denominator) * 100}%`;
  }
}

function setupRevealObserver() {
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -55px",
    },
  );

  revealElements.forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index % 3, 2) * 70}ms`;
    observer.observe(element);
  });
}

menuButton?.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  setMenu(!isOpen);
});

mainNavigation?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

methodSteps.forEach((step) => {
  step.addEventListener("click", () => {
    setMethodStep(step.dataset.methodStep);
  });
});

window.addEventListener(
  "scroll",
  () => {
    updateHeader();
    updatePageProgress();
  },
  { passive: true },
);

window.addEventListener("resize", () => {
  if (window.innerWidth > 860) closeMenu();
  updatePageProgress();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

updateHeader();
updatePageProgress();
setMethodStep(0);
setupRevealObserver();
