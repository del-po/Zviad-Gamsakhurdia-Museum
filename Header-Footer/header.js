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

      initializeLiveClock();
      initializeHeartbeat();
    } catch (error) {
      console.error("Unable to load header:", error);
    }
  }

  /* =======================================================
     BURGER / MOBILE NAVIGATION
     ======================================================= */

  function initializeHeader() {
    const burgerMenu = headerSlot.querySelector(".header-burger-menu");

    const headerMenu = headerSlot.querySelector(".header-menu");

    if (!burgerMenu || !headerMenu) {
      return;
    }

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

  /* =======================================================
     LIVE TBILISI CLOCK
     ======================================================= */

  function initializeLiveClock() {
    const clock = headerSlot.querySelector("#museum-header-clock");

    const date = headerSlot.querySelector("#museum-header-date");

    if (!clock || !date) {
      return;
    }

    const timeFormatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Tbilisi",

      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",

      hour12: false,
    });

    const dateFormatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Tbilisi",

      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    function updateClock() {
      const now = new Date();

      const timeText = timeFormatter.format(now);

      const dateText = dateFormatter.format(now);

      clock.textContent = timeText;

      clock.dateTime = now.toISOString();

      date.textContent = dateText;
    }

    updateClock();

    window.setInterval(updateClock, 1000);
  }

  function initializeHeartbeat() {
    const svg = headerSlot.querySelector(".museum-header__heartbeat-svg");

    const shape = headerSlot.querySelector("#museumHeartbeatShape");

    const pulseLayer = headerSlot.querySelector("[data-heartbeat-pulses]");

    if (!svg || !shape || !pulseLayer) return;

    const svgNS = "http://www.w3.org/2000/svg";

    const totalLength = shape.getTotalLength();

    /*
     * Length of the luminous tail.
     * Larger number = longer fading trail.
     */
    const trailLength = totalLength * 0.4;

    /*
     * How long one pulse takes to cross.
     */
    const pulseDuration = 950;

    /*
     * How often a NEW heartbeat is created.
     *
     * This is deliberately shorter than pulseDuration,
     * so there is no visible "finish -> restart" moment.
     */
    const pulseInterval = 1500;

    let pulseId = 0;

    function createPulse() {
      pulseId += 1;

      const id = `museumHeartbeatGradient-${pulseId}`;

      /* -----------------------------------------
       Create gradient for THIS individual pulse
       ----------------------------------------- */

      const gradient = document.createElementNS(svgNS, "linearGradient");

      gradient.setAttribute("id", id);

      gradient.setAttribute("gradientUnits", "userSpaceOnUse");

      gradient.setAttribute("x1", "0");

      gradient.setAttribute("y1", "0");

      gradient.setAttribute("x2", "1");

      gradient.setAttribute("y2", "0");

      /*
       * Tail -> head
       */

      const gradientStops = [
        {
          offset: "0%",
          color: "#fedd00",
          opacity: "0",
        },

        {
          offset: "18%",
          color: "#fedd00",
          opacity: "0.12",
        },

        {
          offset: "38%",
          color: "#fedd00",
          opacity: "0.35",
        },

        {
          offset: "58%",
          color: "#fedd00",
          opacity: "0.7",
        },

        {
          offset: "75%",
          color: "#fedd00",
          opacity: "1",
        },

        {
          offset: "88%",
          color: "#ffe84a",
          opacity: "1",
        },

        {
          offset: "96%",
          color: "#fff6a0",
          opacity: "1",
        },

        {
          offset: "100%",
          color: "#ffffff",
          opacity: "1",
        },
      ];

      gradientStops.forEach((stopData) => {
        const stop = document.createElementNS(svgNS, "stop");

        stop.setAttribute("offset", stopData.offset);

        stop.setAttribute("stop-color", stopData.color);

        stop.setAttribute("stop-opacity", stopData.opacity);

        gradient.appendChild(stop);
      });

      svg.querySelector("defs").appendChild(gradient);

      /* -----------------------------------------
       Create active copy of heartbeat path
       ----------------------------------------- */

      const pulse = document.createElementNS(svgNS, "use");

      pulse.setAttribute("href", "#museumHeartbeatShape");

      pulse.setAttribute("class", "museum-header__heartbeat-pulse");

      pulse.setAttribute("stroke", `url(#${id})`);

      /*
       * Only this short portion of the complete
       * heartbeat path will be visible.
       */
      pulse.style.strokeDasharray = `${trailLength} ${totalLength + trailLength}`;

      pulseLayer.appendChild(pulse);

      const startTime = performance.now();

      function animatePulse(now) {
        const elapsed = now - startTime;

        const progress = Math.min(elapsed / pulseDuration, 1);

        /*
         * Very slight easing while retaining
         * monitor-like continuous movement.
         */
        const distance = progress * totalLength;

        /*
         * Move the visible segment along the path.
         */
        pulse.style.strokeDashoffset = `${-distance}`;

        /*
         * Find where the HEAD currently is.
         */
        const headPoint = shape.getPointAtLength(
          Math.min(distance + trailLength, totalLength),
        );

        /*
         * Find where the TAIL currently is.
         */
        const tailPoint = shape.getPointAtLength(Math.max(distance, 0));

        /*
         * Move this pulse's gradient with the pulse.
         *
         * x1 = faded tail
         * x2 = bright head
         */
        gradient.setAttribute("x1", tailPoint.x.toFixed(2));

        gradient.setAttribute("x2", headPoint.x.toFixed(2));

        /*
         * Keep gradient horizontal.
         * That works nicely because our ECG always
         * progresses from left -> right.
         */
        gradient.setAttribute("y1", "13");

        gradient.setAttribute("y2", "13");

        if (progress < 1) {
          requestAnimationFrame(animatePulse);
        } else {
          /*
           * This impulse is finished.
           * Remove it instead of resetting it.
           */
          pulse.remove();

          gradient.remove();
        }
      }

      requestAnimationFrame(animatePulse);
    }

    /*
     * Create first heartbeat immediately.
     */
    createPulse();

    /*
     * Then continuously CREATE NEW heartbeats.
     *
     * They are individual pulses — we are not
     * restarting the same animation.
     */
    window.setInterval(createPulse, pulseInterval);
  }

  loadHeader();
})();
