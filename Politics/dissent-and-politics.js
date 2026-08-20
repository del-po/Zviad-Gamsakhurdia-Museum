(() => {
  "use strict";

  const periodLinks = [...document.querySelectorAll(".period-link")];

  const historyPeriods = [
    ...document.querySelectorAll("[data-history-period]"),
  ];

  const revealElements = [...document.querySelectorAll(".reveal-on-scroll")];

  /* =========================================================
     HERO
     ========================================================= */

  const heroVisual = document.querySelector("[data-politics-hero]");

  const heroStages = [...document.querySelectorAll("[data-hero-stage]")];

  const heroMarkers = [...document.querySelectorAll("[data-hero-marker]")];

  const heroStatus = document.querySelector("[data-hero-status]");

  /* =========================================================
     PERIOD VISUALS
     ========================================================= */

  const dissentVisuals = [
    ...document.querySelectorAll("[data-dissent-visual]"),
  ];

  const movementVisuals = [
    ...document.querySelectorAll("[data-movement-visual]"),
  ];

  const presidencyVisuals = [
    ...document.querySelectorAll("[data-presidency-visual]"),
  ];

  /* =========================================================
     REDUCED MOTION
     ========================================================= */

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  /* =========================================================
     HERO CONFIGURATION
     ========================================================= */

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

  /* =========================================================
     PERIOD NAVIGATION
     ========================================================= */

  function activatePeriod(periodId) {
    if (!periodId) return;

    periodLinks.forEach((link) => {
      const isActive = link.dataset.period === periodId;

      link.classList.toggle("active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function setupPeriodNavigation() {
    periodLinks.forEach((link) => {
      link.addEventListener("click", () => {
        const periodId = link.dataset.period;

        if (periodId) {
          activatePeriod(periodId);
        }
      });
    });
  }

  function setupPeriodObserver() {
    if (!("IntersectionObserver" in window) || historyPeriods.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries.length === 0) {
          return;
        }

        const activePeriod = visibleEntries[0].target.dataset.historyPeriod;

        if (activePeriod) {
          activatePeriod(activePeriod);
        }
      },
      {
        threshold: [0.2, 0.35, 0.5],
        rootMargin: "-18% 0px -52%",
      },
    );

    historyPeriods.forEach((period) => {
      observer.observe(period);
    });
  }

  /* =========================================================
     REVEAL ON SCROLL
     ========================================================= */

  function setupRevealObserver() {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealElements.forEach((element) => {
        element.style.removeProperty("transition-delay");
        element.classList.add("is-visible");
      });

      return;
    }

    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

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
      const delay = Math.min(index % 3, 2) * 70;

      element.style.transitionDelay = `${delay}ms`;

      observer.observe(element);
    });
  }

  /* =========================================================
     PERIOD ONE
     DISSENT ANIMATION
     ========================================================= */

  function restartDissentAnimation(visual) {
    visual.classList.remove("is-dissent-active");

    /*
     * Force the browser to apply the reset before
     * restoring the active class.
     */
    void visual.offsetWidth;

    visual.classList.add("is-dissent-active");
  }

  function setupDissentAnimation() {
    if (dissentVisuals.length === 0) {
      return;
    }

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
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

  /* =========================================================
     PERIOD TWO
     INDEPENDENCE MOVEMENT ANIMATION
     ========================================================= */

  function restartMovementAnimation(visual) {
    visual.classList.remove("is-movement-active");

    /*
     * Force the reset to be rendered before
     * starting the animation again.
     */
    void visual.offsetWidth;

    visual.classList.add("is-movement-active");
  }

  function setupMovementAnimation() {
    if (movementVisuals.length === 0) {
      return;
    }

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      movementVisuals.forEach((visual) => {
        visual.classList.add("is-movement-active");
      });

      return;
    }

    movementVisuals.forEach((visual) => {
      visual.classList.add("is-movement-ready");
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const visual = entry.target;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.28) {
            if (!visual.classList.contains("is-movement-active")) {
              restartMovementAnimation(visual);
            }

            return;
          }

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

  /* =========================================================
     PERIOD THREE
     PRESIDENCY / OVERTHROW ANIMATION
     ========================================================= */

  function restartPresidencyAnimation(visual) {
    visual.classList.remove("is-presidency-active");

    /*
     * Force the browser to apply the reset before
     * restoring the active class.
     */
    void visual.offsetWidth;

    visual.classList.add("is-presidency-active");
  }

  function setupPresidencyAnimation() {
    if (presidencyVisuals.length === 0) {
      return;
    }

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      presidencyVisuals.forEach((visual) => {
        visual.classList.add("is-presidency-active");
      });

      return;
    }

    presidencyVisuals.forEach((visual) => {
      visual.classList.add("is-presidency-ready");
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const visual = entry.target;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.28) {
            if (!visual.classList.contains("is-presidency-active")) {
              restartPresidencyAnimation(visual);
            }

            return;
          }

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

  /* =========================================================
     POLITICS HERO
     ========================================================= */

  function restartHeroScanner() {
    if (!heroVisual || prefersReducedMotion) {
      return;
    }

    heroVisual.classList.remove("is-scanning");

    void heroVisual.offsetWidth;

    heroVisual.classList.add("is-scanning");
  }

  function setHeroStage(stageNumber) {
    if (!heroVisual || heroStages.length === 0) {
      return;
    }

    const normalizedStage = Math.min(3, Math.max(1, Number(stageNumber) || 1));

    activeHeroStage = normalizedStage;

    heroVisual.dataset.activeStage = String(normalizedStage);

    heroStages.forEach((stage) => {
      const isActive = Number(stage.dataset.heroStage) === normalizedStage;

      stage.classList.toggle("is-active", isActive);

      stage.classList.remove("is-entering");

      if (isActive && !prefersReducedMotion) {
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
    if (heroStageTimer === null) {
      return;
    }

    window.clearTimeout(heroStageTimer);

    heroStageTimer = null;
  }

  function scheduleNextHeroStage() {
    clearHeroStageTimer();

    if (
      prefersReducedMotion ||
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
    if (!heroVisual) {
      return;
    }

    const shouldPause =
      prefersReducedMotion ||
      !heroIsVisible ||
      heroIsHovered ||
      document.hidden;

    if (shouldPause) {
      clearHeroStageTimer();
    } else {
      scheduleNextHeroStage();
    }
  }

  function setupHeroAnimation() {
    if (!heroVisual || heroStages.length === 0) {
      return;
    }

    setHeroStage(1);

    if (prefersReducedMotion) {
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

  /* =========================================================
     INITIALIZATION
     ========================================================= */

  setupPeriodNavigation();

  setupPeriodObserver();

  setupRevealObserver();

  setupDissentAnimation();

  setupMovementAnimation();

  setupPresidencyAnimation();

  setupHeroAnimation();
})();
