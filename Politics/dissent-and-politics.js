const header = document.getElementById("site-header");
const menuButton = document.querySelector(".menu-button");
const mainNavigation = document.getElementById("main-navigation");
const periodLinks = [...document.querySelectorAll(".period-link")];
const historyPeriods = [...document.querySelectorAll("[data-history-period]")];
const revealElements = [...document.querySelectorAll(".reveal-on-scroll")];
const politicsPage = document.querySelector(".politics-page");

const heroVisual = document.querySelector("[data-politics-hero]");

const heroStages = [...document.querySelectorAll("[data-hero-stage]")];

const heroMarkers = [...document.querySelectorAll("[data-hero-marker]")];

const heroStatus = document.querySelector("[data-hero-status]");
const dissentVisuals = [...document.querySelectorAll("[data-dissent-visual]")];
const movementVisuals = [
  ...document.querySelectorAll("[data-movement-visual]"),
];
const presidencyVisuals = [
  ...document.querySelectorAll("[data-presidency-visual]"),
];

const dissentPrefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const movementPrefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const presidencyPrefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const heroPrefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const heroStageDescriptions = {
  1: "Underground political record",
  2: "National movement and referendum",
  3: "Restored state and presidency",
};

const heroStageDuration = 4600;

let activeHeroStage = 1;
let heroStageTimer = null;
let heroIsVisible = true;
let heroIsHovered = false;

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

function activatePeriod(periodId) {
  periodLinks.forEach((link) => {
    const isActive = link.dataset.period === periodId;
    link.classList.toggle("active", isActive);
    link.setAttribute("aria-current", isActive ? "true" : "false");
  });
}

function setupPeriodObserver() {
  if (!("IntersectionObserver" in window) || historyPeriods.length === 0)
    return;

  const observer = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (visibleEntries.length === 0) return;

      const activePeriod = visibleEntries[0].target.dataset.historyPeriod;
      if (activePeriod) activatePeriod(activePeriod);
    },
    {
      threshold: [0.2, 0.35, 0.5],
      rootMargin: "-18% 0px -52%",
    },
  );

  historyPeriods.forEach((period) => observer.observe(period));
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

function updatePageProgress() {
  if (!politicsPage) return;

  const maximumScroll = Math.max(
    1,
    document.documentElement.scrollHeight - window.innerHeight,
  );
  const progress = Math.min(1, Math.max(0, window.scrollY / maximumScroll));

  politicsPage.style.setProperty("--politics-progress", progress.toFixed(4));
}

function restartDissentAnimation(visual) {
  visual.classList.remove("is-dissent-active");

  void visual.offsetWidth;

  visual.classList.add("is-dissent-active");
}

function setupDissentAnimation() {
  if (dissentVisuals.length === 0) return;

  if (dissentPrefersReducedMotion || !("IntersectionObserver" in window)) {
    dissentVisuals.forEach((visual) => {
      visual.classList.add("is-dissent-active");
    });

    return;
  }

  dissentVisuals.forEach((visual) => {
    visual.classList.add("is-dissent-ready");
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const visual = entry.target;

        if (entry.isIntersecting && entry.intersectionRatio >= 0.32) {
          if (!visual.classList.contains("is-dissent-active")) {
            restartDissentAnimation(visual);
          }

          return;
        }

        if (!entry.isIntersecting) {
          visual.classList.remove("is-dissent-active");
        }
      });
    },
    {
      threshold: [0, 0.32, 0.6],
      rootMargin: "-8% 0px -12%",
    },
  );

  dissentVisuals.forEach((visual) => {
    observer.observe(visual);
  });
}

function restartMovementAnimation(visual) {
  visual.classList.remove("is-movement-active");

  /*
    Reading offsetWidth forces the browser to apply
    the reset before the active class is restored.
    This allows the sequence to replay.
  */
  void visual.offsetWidth;

  visual.classList.add("is-movement-active");
}

function setupMovementAnimation() {
  if (movementVisuals.length === 0) return;

  /*
    Without IntersectionObserver, or when reduced motion
    is requested, display the completed composition.
  */
  if (movementPrefersReducedMotion || !("IntersectionObserver" in window)) {
    movementVisuals.forEach((visual) => {
      visual.classList.add("is-movement-active");
    });

    return;
  }

  /*
    The ready class places every component in its
    initial animation position.
  */
  movementVisuals.forEach((visual) => {
    visual.classList.add("is-movement-ready");
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const visual = entry.target;

        /*
          Begin the sequence only after a meaningful
          portion of the visual is visible.
        */
        if (entry.isIntersecting && entry.intersectionRatio >= 0.28) {
          if (!visual.classList.contains("is-movement-active")) {
            restartMovementAnimation(visual);
          }

          return;
        }

        /*
          Reset after the visitor has substantially
          left the visual so it can replay on return.
        */
        if (!entry.isIntersecting || entry.intersectionRatio <= 0.08) {
          visual.classList.remove("is-movement-active");
        }
      });
    },
    {
      threshold: [0, 0.08, 0.28, 0.6],
      rootMargin: "-6% 0px -10%",
    },
  );

  movementVisuals.forEach((visual) => {
    observer.observe(visual);
  });
}

function restartPresidencyAnimation(visual) {
  visual.classList.remove("is-presidency-active");

  /*
    Forces the browser to apply the reset before
    restoring the active class, allowing replay.
  */
  void visual.offsetWidth;

  visual.classList.add("is-presidency-active");
}

function setupPresidencyAnimation() {
  if (presidencyVisuals.length === 0) return;

  /*
    When reduced motion is preferred, or when
    IntersectionObserver is unavailable, show
    the completed composition without replaying it.
  */
  if (presidencyPrefersReducedMotion || !("IntersectionObserver" in window)) {
    presidencyVisuals.forEach((visual) => {
      visual.classList.add("is-presidency-active");
    });

    return;
  }

  /*
    Places all animated components in their
    initial positions before the visual enters.
  */
  presidencyVisuals.forEach((visual) => {
    visual.classList.add("is-presidency-ready");
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const visual = entry.target;

        /*
          Begin the sequence when a meaningful
          portion of the visual is visible.
        */
        if (entry.isIntersecting && entry.intersectionRatio >= 0.28) {
          if (!visual.classList.contains("is-presidency-active")) {
            restartPresidencyAnimation(visual);
          }

          return;
        }

        /*
          Remove the active class after the visitor
          leaves, so the animation can replay later.
        */
        if (!entry.isIntersecting || entry.intersectionRatio <= 0.08) {
          visual.classList.remove("is-presidency-active");
        }
      });
    },
    {
      threshold: [0, 0.08, 0.28, 0.6],
      rootMargin: "-6% 0px -10%",
    },
  );

  presidencyVisuals.forEach((visual) => {
    observer.observe(visual);
  });
}

function restartHeroScanner() {
  if (!heroVisual || heroPrefersReducedMotion) return;

  heroVisual.classList.remove("is-scanning");

  void heroVisual.offsetWidth;

  heroVisual.classList.add("is-scanning");
}

function setHeroStage(stageNumber) {
  if (!heroVisual || heroStages.length === 0) return;

  const normalizedStage = Math.min(3, Math.max(1, Number(stageNumber) || 1));

  activeHeroStage = normalizedStage;

  heroVisual.dataset.activeStage = String(normalizedStage);

  heroStages.forEach((stage) => {
    const isActive = Number(stage.dataset.heroStage) === normalizedStage;

    stage.classList.toggle("is-active", isActive);
    stage.classList.remove("is-entering");

    if (isActive && !heroPrefersReducedMotion) {
      void stage.offsetWidth;
      stage.classList.add("is-entering");
    }
  });

  heroMarkers.forEach((marker) => {
    const isActive = Number(marker.dataset.heroMarker) === normalizedStage;

    marker.classList.toggle("is-active", isActive);
  });

  if (heroStatus) {
    heroStatus.textContent = heroStageDescriptions[normalizedStage];
  }

  restartHeroScanner();
}

function clearHeroStageTimer() {
  if (heroStageTimer === null) return;

  window.clearTimeout(heroStageTimer);
  heroStageTimer = null;
}

function scheduleNextHeroStage() {
  clearHeroStageTimer();

  if (
    heroPrefersReducedMotion ||
    !heroVisual ||
    !heroIsVisible ||
    heroIsHovered ||
    document.hidden
  ) {
    return;
  }

  heroStageTimer = window.setTimeout(() => {
    const nextStage = activeHeroStage === 3 ? 1 : activeHeroStage + 1;

    setHeroStage(nextStage);
    scheduleNextHeroStage();
  }, heroStageDuration);
}

function updateHeroAnimationState() {
  if (!heroVisual) return;

  const shouldPause =
    heroPrefersReducedMotion ||
    !heroIsVisible ||
    heroIsHovered ||
    document.hidden;

  heroVisual.classList.toggle("is-paused", shouldPause);

  if (shouldPause) {
    clearHeroStageTimer();
  } else {
    scheduleNextHeroStage();
  }
}

function setupHeroAnimation() {
  if (!heroVisual || heroStages.length === 0) return;

  setHeroStage(1);

  if (heroPrefersReducedMotion) {
    heroVisual.classList.add("is-paused");
    return;
  }

  heroVisual.addEventListener("mouseenter", () => {
    heroIsHovered = true;
    updateHeroAnimationState();
  });

  heroVisual.addEventListener("mouseleave", () => {
    heroIsHovered = false;
    updateHeroAnimationState();
  });

  if ("IntersectionObserver" in window) {
    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        heroIsVisible = Boolean(entry?.isIntersecting);
        updateHeroAnimationState();
      },
      {
        threshold: 0.12,
      },
    );

    heroObserver.observe(heroVisual);
  }

  document.addEventListener("visibilitychange", updateHeroAnimationState);

  scheduleNextHeroStage();
}

menuButton?.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  setMenu(!isOpen);
});

mainNavigation?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

periodLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const periodId = link.dataset.period;
    if (periodId) activatePeriod(periodId);
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
setupPeriodObserver();
setupRevealObserver();
setupDissentAnimation();
setupMovementAnimation();
setupPresidencyAnimation();
setupHeroAnimation();
