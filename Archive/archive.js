const header = document.getElementById("site-header");
const menuButton = document.querySelector(".menu-button");
const mainNavigation = document.getElementById("main-navigation");
const archivePage = document.querySelector(".archive-page");
const revealElements = [...document.querySelectorAll(".reveal-on-scroll")];

const archiveQuery = document.getElementById("archive-query");
const archiveFilters = [...document.querySelectorAll("[data-archive-filter]")];
const archiveRecords = [...document.querySelectorAll(".archive-record")];
const archiveNoResults = document.getElementById("archive-no-results");
const archiveResultCount = document.getElementById("archive-result-count");
const archiveActiveSummary = document.getElementById("archive-active-summary");

const minimumYearInput = document.getElementById("date-min");
const maximumYearInput = document.getElementById("date-max");
const minimumYearOutput = document.getElementById("date-min-output");
const maximumYearOutput = document.getElementById("date-max-output");
const dateRangeFill = document.getElementById("date-range-fill");
const dateResetButton = document.getElementById("date-reset");
const dateResultDescription = document.getElementById("date-result-description");
const datePresetButtons = [...document.querySelectorAll("[data-date-from][data-date-to]")];
const collectionJumpButtons = [...document.querySelectorAll("[data-collection-jump]")];
const featuredFocusButtons = [...document.querySelectorAll("[data-record-focus]")];
const recordToggleButtons = [...document.querySelectorAll(".record-toggle")];

const ARCHIVE_START_YEAR = Number(minimumYearInput?.min ?? 1939);
const ARCHIVE_END_YEAR = Number(maximumYearInput?.max ?? 1993);

let activeCategory = "all";
let searchTerm = "";
let minimumYear = ARCHIVE_START_YEAR;
let maximumYear = ARCHIVE_END_YEAR;

function normalizeText(value) {
  return String(value ?? "")
    .toLocaleLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function updateHeader() {
  header?.classList.toggle("is-scrolled", window.scrollY > 18);
}

function updatePageProgress() {
  if (!archivePage) return;

  const maximumScroll = Math.max(
    1,
    document.documentElement.scrollHeight - window.innerHeight,
  );
  const progress = Math.min(1, Math.max(0, window.scrollY / maximumScroll));

  archivePage.style.setProperty("--archive-progress", progress.toFixed(4));
  archivePage.style.setProperty(
    "--archive-angle",
    `${(progress * 55).toFixed(2)}deg`,
  );
  archivePage.style.setProperty(
    "--archive-angle-reverse",
    `${(progress * 38).toFixed(2)}deg`,
  );
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

function categoryLabel(category) {
  const labels = {
    all: "All material types",
    document: "Documents",
    correspondence: "Correspondence",
    photograph: "Photographs",
    audiovisual: "Audio / moving image",
    publication: "Press / publications",
    government: "Government / political records",
  };

  return labels[category] ?? category;
}

function updateFilterCounts() {
  archiveFilters.forEach((button) => {
    const category = button.dataset.archiveFilter;
    const count =
      category === "all"
        ? archiveRecords.length
        : archiveRecords.filter((record) => record.dataset.category === category)
            .length;

    const countElement = button.querySelector("span");
    if (countElement) countElement.textContent = String(count).padStart(2, "0");
  });
}

function activateFilter(category) {
  activeCategory = category;

  archiveFilters.forEach((button) => {
    const isActive = button.dataset.archiveFilter === category;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  updateArchiveResults();
}

function updateDateScale() {
  if (
    !minimumYearInput ||
    !maximumYearInput ||
    !minimumYearOutput ||
    !maximumYearOutput ||
    !dateRangeFill
  ) {
    return;
  }

  minimumYear = Number(minimumYearInput.value);
  maximumYear = Number(maximumYearInput.value);

  if (minimumYear > maximumYear) {
    minimumYear = maximumYear;
    minimumYearInput.value = String(minimumYear);
  }

  const totalYears = ARCHIVE_END_YEAR - ARCHIVE_START_YEAR;
  const leftPercentage =
    ((minimumYear - ARCHIVE_START_YEAR) / totalYears) * 100;
  const rightPercentage =
    ((maximumYear - ARCHIVE_START_YEAR) / totalYears) * 100;

  minimumYearOutput.value = String(minimumYear);
  minimumYearOutput.textContent = String(minimumYear);
  maximumYearOutput.value = String(maximumYear);
  maximumYearOutput.textContent = String(maximumYear);

  dateRangeFill.style.left = `${leftPercentage}%`;
  dateRangeFill.style.width = `${Math.max(0, rightPercentage - leftPercentage)}%`;

  minimumYearInput.style.zIndex =
    minimumYear > ARCHIVE_END_YEAR - 5 ? "5" : "3";
  maximumYearInput.style.zIndex = "4";

  datePresetButtons.forEach((button) => {
    const isActive =
      Number(button.dataset.dateFrom) === minimumYear &&
      Number(button.dataset.dateTo) === maximumYear;
    button.classList.toggle("active", isActive);
  });

  if (dateResultDescription) {
    if (
      minimumYear === ARCHIVE_START_YEAR &&
      maximumYear === ARCHIVE_END_YEAR
    ) {
      dateResultDescription.textContent =
        "Showing the complete archival period.";
    } else if (minimumYear === maximumYear) {
      dateResultDescription.textContent = `Showing records dated ${minimumYear}.`;
    } else {
      dateResultDescription.textContent = `Showing records dated from ${minimumYear} through ${maximumYear}.`;
    }
  }
}

function updateArchiveResults() {
  let visibleCount = 0;

  archiveRecords.forEach((record) => {
    const recordYear = Number(record.dataset.year);
    const recordCategory = record.dataset.category ?? "";
    const searchableText = normalizeText(
      `${record.dataset.search ?? ""} ${record.textContent ?? ""}`,
    );

    const matchesCategory =
      activeCategory === "all" || recordCategory === activeCategory;
    const matchesDate =
      recordYear >= minimumYear && recordYear <= maximumYear;
    const matchesSearch = !searchTerm || searchableText.includes(searchTerm);
    const isVisible = matchesCategory && matchesDate && matchesSearch;

    record.classList.toggle("is-hidden", !isVisible);
    record.setAttribute("aria-hidden", String(!isVisible));

    if (isVisible) visibleCount += 1;
  });

  if (archiveResultCount) archiveResultCount.textContent = String(visibleCount);
  if (archiveNoResults) archiveNoResults.hidden = visibleCount !== 0;
  if (archiveActiveSummary) {
    const querySummary = searchTerm ? ` · “${searchTerm}”` : "";
    archiveActiveSummary.textContent = `${categoryLabel(activeCategory)} · ${minimumYear}—${maximumYear}${querySummary}`;
  }
}

function setDateRange(fromYear, toYear) {
  if (!minimumYearInput || !maximumYearInput) return;

  const safeFrom = Math.max(
    ARCHIVE_START_YEAR,
    Math.min(Number(fromYear), ARCHIVE_END_YEAR),
  );
  const safeTo = Math.max(
    safeFrom,
    Math.min(Number(toYear), ARCHIVE_END_YEAR),
  );

  minimumYearInput.value = String(safeFrom);
  maximumYearInput.value = String(safeTo);
  updateDateScale();
  updateArchiveResults();
}

function focusRecord(recordId) {
  const record = document.querySelector(`[data-record-id="${recordId}"]`);
  if (!record) return;

  const recordYear = Number(record.dataset.year);
  const recordCategory = record.dataset.category ?? "all";

  searchTerm = "";
  if (archiveQuery) archiveQuery.value = "";
  activateFilter(recordCategory);
  setDateRange(recordYear, recordYear);

  requestAnimationFrame(() => {
    record.scrollIntoView({ behavior: "smooth", block: "center" });
    record.classList.add("is-focused");
    window.setTimeout(() => record.classList.remove("is-focused"), 1800);
  });
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
      rootMargin: "0px 0px -55px",
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

archiveFilters.forEach((button) => {
  button.addEventListener("click", () => {
    activateFilter(button.dataset.archiveFilter ?? "all");
  });
});

archiveQuery?.addEventListener("input", (event) => {
  searchTerm = normalizeText(event.currentTarget.value);
  updateArchiveResults();
});

minimumYearInput?.addEventListener("input", () => {
  if (Number(minimumYearInput.value) > Number(maximumYearInput?.value)) {
    minimumYearInput.value = maximumYearInput?.value ?? minimumYearInput.value;
  }
  updateDateScale();
  updateArchiveResults();
});

maximumYearInput?.addEventListener("input", () => {
  if (Number(maximumYearInput.value) < Number(minimumYearInput?.value)) {
    maximumYearInput.value = minimumYearInput?.value ?? maximumYearInput.value;
  }
  updateDateScale();
  updateArchiveResults();
});

dateResetButton?.addEventListener("click", () => {
  setDateRange(ARCHIVE_START_YEAR, ARCHIVE_END_YEAR);
});

datePresetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setDateRange(button.dataset.dateFrom, button.dataset.dateTo);
  });
});

collectionJumpButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activateFilter(button.dataset.collectionJump ?? "all");
    document
      .getElementById("search-the-archive")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

featuredFocusButtons.forEach((button) => {
  button.addEventListener("click", () => {
    focusRecord(button.dataset.recordFocus);
  });
});

recordToggleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const detailsId = button.getAttribute("aria-controls");
    const details = detailsId ? document.getElementById(detailsId) : null;
    if (!details) return;

    const isExpanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!isExpanded));
    details.hidden = isExpanded;
    button.closest(".archive-record")?.classList.toggle("is-expanded", !isExpanded);

    const symbol = button.querySelector("span");
    if (symbol) symbol.textContent = isExpanded ? "+" : "−";
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
updateFilterCounts();
updateDateScale();
updateArchiveResults();
setupRevealObserver();
