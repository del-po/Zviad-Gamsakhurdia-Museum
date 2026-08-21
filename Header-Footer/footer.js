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
      initializeFooterHeartbeat();
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

  function initializeFooterHeartbeat() {
    const svg = footerSlot.querySelector(".site-footer__heartbeat-svg");

    const shape = footerSlot.querySelector("#footerHeartbeatShape");

    const pulseLayer = footerSlot.querySelector(
      "[data-footer-heartbeat-pulses]",
    );

    if (!svg || !shape || !pulseLayer) return;

    const svgNS = "http://www.w3.org/2000/svg";

    const totalLength = shape.getTotalLength();

    /*
     * Same pulse proportions as header.
     */
    const trailLength = totalLength * 0.28;

    const pulseDuration = 950;

    const pulseInterval = 1500;

    let pulseId = 0;

    function createPulse() {
      pulseId += 1;

      const gradientId = `footerHeartbeatGradient-${pulseId}`;

      const gradient = document.createElementNS(svgNS, "linearGradient");

      gradient.setAttribute("id", gradientId);
      gradient.setAttribute("gradientUnits", "userSpaceOnUse");

      gradient.setAttribute("x1", "0");
      gradient.setAttribute("y1", "13");
      gradient.setAttribute("x2", "1");
      gradient.setAttribute("y2", "13");

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

      const pulse = document.createElementNS(svgNS, "use");

      pulse.setAttribute("href", "#footerHeartbeatShape");

      pulse.setAttribute("class", "site-footer__heartbeat-pulse");

      pulse.setAttribute("stroke", `url(#${gradientId})`);

      pulse.style.strokeDasharray = `${trailLength} ${totalLength + trailLength}`;

      pulseLayer.appendChild(pulse);

      const startTime = performance.now();

      function animatePulse(now) {
        const elapsed = now - startTime;

        const progress = Math.min(elapsed / pulseDuration, 1);

        const distance = progress * totalLength;

        pulse.style.strokeDashoffset = `${-distance}`;

        const headPoint = shape.getPointAtLength(
          Math.min(distance + trailLength, totalLength),
        );

        const tailPoint = shape.getPointAtLength(Math.max(distance, 0));

        gradient.setAttribute("x1", tailPoint.x.toFixed(2));

        gradient.setAttribute("x2", headPoint.x.toFixed(2));

        if (progress < 1) {
          requestAnimationFrame(animatePulse);
        } else {
          pulse.remove();
          gradient.remove();
        }
      }

      requestAnimationFrame(animatePulse);
    }

    createPulse();

    window.setInterval(createPulse, pulseInterval);
  }

  loadFooter();
})();
