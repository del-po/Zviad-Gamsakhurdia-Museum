const header = document.getElementById("site-header");
const menuButton = document.querySelector(".menu-button");
const mainNavigation = document.getElementById("main-navigation");
const policiesPage = document.querySelector(".policies-page");
const revealElements = [...document.querySelectorAll(".reveal-on-scroll")];
const policyLinks = [...document.querySelectorAll("[data-policy-link]")];
const policySections = [...document.querySelectorAll("[data-policy-section]")];
const printButton = document.getElementById("policy-print-button");

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
  if (!policiesPage) return;

  const maximumScroll = Math.max(
    1,
    document.documentElement.scrollHeight - window.innerHeight,
  );
  const progress = Math.min(1, Math.max(0, window.scrollY / maximumScroll));

  policiesPage.style.setProperty("--policy-progress", progress.toFixed(4));
  policiesPage.style.setProperty(
    "--policy-rotation",
    `${(progress * 48).toFixed(2)}deg`,
  );
}

function setActivePolicy(sectionId) {
  policyLinks.forEach((link) => {
    const active = link.dataset.policyLink === sectionId;
    link.classList.toggle("active", active);
    if (active) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function setupPolicyObserver() {
  if (!("IntersectionObserver" in window) || policySections.length === 0) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (visible[0]) {
        setActivePolicy(visible[0].target.dataset.policySection);
      }
    },
    {
      threshold: [0.08, 0.2, 0.45],
      rootMargin: "-25% 0px -55%",
    },
  );

  policySections.forEach((section) => observer.observe(section));
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
      threshold: 0.08,
      rootMargin: "0px 0px -50px",
    },
  );

  revealElements.forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index % 3, 2) * 65}ms`;
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

policyLinks.forEach((link) => {
  link.addEventListener("click", () => {
    setActivePolicy(link.dataset.policyLink);
  });
});

printButton?.addEventListener("click", () => window.print());

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
setupPolicyObserver();
setupRevealObserver();
