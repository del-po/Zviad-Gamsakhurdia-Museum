const mainNavigation = document.querySelector(".main-navigation");
const museumLink = document.querySelector(".museum-link");

if (mainNavigation && museumLink) {
  const museumText = document.createElement("span");

  museumText.textContent = museumLink.textContent.trim();
  museumText.style.display = "inline-block";
  museumText.style.transition = "none";

  museumLink.textContent = "";
  museumLink.appendChild(museumText);

  let animationFrame = null;

  function updateMuseumText() {
    const navigationBottom = mainNavigation.getBoundingClientRect().bottom;

    const containerPosition = museumLink.getBoundingClientRect();

    const containerStyles = getComputedStyle(museumLink);

    const paddingTop = parseFloat(containerStyles.paddingTop) || 0;

    const paddingBottom = parseFloat(containerStyles.paddingBottom) || 0;

    const containerTop = containerPosition.top + paddingTop;

    const containerBottom =
      containerPosition.bottom - paddingBottom - museumText.offsetHeight;

    const maximumTop = Math.max(containerTop, containerBottom);

    const textTop = Math.min(
      Math.max(containerTop, navigationBottom),
      maximumTop,
    );

    const movement = textTop - containerTop;

    museumText.style.transform = `translateY(${movement}px)`;

    animationFrame = null;
  }

  function requestUpdate() {
    if (animationFrame === null) {
      animationFrame = requestAnimationFrame(updateMuseumText);
    }
  }

  window.addEventListener("scroll", requestUpdate, {
    passive: true,
  });

  window.addEventListener("resize", requestUpdate);

  requestUpdate();
}
