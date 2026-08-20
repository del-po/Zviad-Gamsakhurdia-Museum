(() => {
  "use strict";

  const familyPage = document.querySelector(".family-page");

  if (!familyPage) return;

  const familyLinks = [...familyPage.querySelectorAll("[data-family-link]")];

  const familyChapters = [
    ...familyPage.querySelectorAll("[data-family-chapter]"),
  ];

  const revealElements = [...familyPage.querySelectorAll(".reveal-on-scroll")];

  const reducedMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );

  /* =========================================================
   FAMILY CHAPTER NAVIGATION
   ========================================================= */

  function clearActiveChapter() {
    familyLinks.forEach((link) => {
      link.classList.remove("active");
      link.removeAttribute("aria-current");
    });
  }

  function activateChapter(chapterId) {
    if (!chapterId) return;

    familyLinks.forEach((link) => {
      const isActive = link.dataset.familyLink === chapterId;

      link.classList.toggle("active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function setupChapterNavigation() {
    // Every fresh page load begins with no selected chapter.
    clearActiveChapter();

    familyLinks.forEach((link) => {
      link.addEventListener("click", () => {
        const chapterId = link.dataset.familyLink;

        if (chapterId) {
          activateChapter(chapterId);
        }
      });
    });
  }

  /* =========================================================
     REVEAL-ON-SCROLL
     ========================================================= */

  function setupRevealObserver() {
    const revealAll = () => {
      revealElements.forEach((element) => {
        element.style.removeProperty("transition-delay");
        element.classList.add("is-visible");
      });
    };

    if (
      reducedMotionQuery.matches ||
      !("IntersectionObserver" in window) ||
      revealElements.length === 0
    ) {
      revealAll();
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -55px 0px",
      },
    );

    revealElements.forEach((element, index) => {
      const delay = (index % 3) * 70;

      element.style.transitionDelay = `${delay}ms`;

      revealObserver.observe(element);
    });

    const handleReducedMotionChange = (event) => {
      if (!event.matches) return;

      revealObserver.disconnect();
      revealAll();
    };

    reducedMotionQuery.addEventListener?.("change", handleReducedMotionChange, {
      once: true,
    });
  }

  /* =========================================================
     LITERARY LIBRARY DATA
     ========================================================= */

  const literaryWorks = [
    {
      id: "selected-novel",
      title: "Selected Novel",
      category: "Novel",
      year: "Digital edition",
      language: "English",
      source: "Demonstration text — replace with an authorized edition",

      pages: [
        {
          kicker: "Editorial note",
          heading: "About this digital edition",

          paragraphs: [
            "This is demonstration content for the virtual book reader.",
            "Replace these paragraphs with the authorized text, translation, source information and editorial notes from your database.",
          ],
        },

        {
          kicker: "Chapter one",
          heading: "Opening page",

          paragraphs: [
            "The reader can display real literary text here as ordinary HTML.",
            "The text remains selectable, searchable, translatable and accessible while the surrounding interface creates the appearance of a physical book.",
          ],
        },

        {
          kicker: "Chapter one",
          heading: "Continuation",

          paragraphs: [
            "Longer works should be divided into chapters, sections or prepared digital pages.",
            "Each page record may contain a heading, one or more paragraphs, footnotes and source information.",
          ],
        },

        {
          kicker: "Edition information",
          heading: "Source and provenance",

          paragraphs: [
            "Record the publication, edition, translator, date, archive source and copyright status for every text.",
            "This information can later be loaded directly from the museum database.",
          ],
        },
      ],
    },

    {
      id: "selected-poetry",
      title: "Selected Poetry",
      category: "Poetry",
      year: "Digital edition",
      language: "Georgian",
      source: "Demonstration text — replace with authorized poems",

      pages: [
        {
          kicker: "Collection",
          heading: "Selected poems",

          paragraphs: [
            "A poetry edition can preserve line breaks by storing each stanza separately.",
            "The page renderer can later be extended with a dedicated poetry layout.",
          ],
        },

        {
          kicker: "Poem one",
          heading: "Insert poem title",

          paragraphs: [
            "Insert the authorized poem text here.",
            "Each array entry currently creates a separate paragraph.",
          ],
        },

        {
          kicker: "Poem two",
          heading: "Insert poem title",

          paragraphs: [
            "The database may contain the original Georgian text and one or more translations.",
            "A language selector can be added after the database is connected.",
          ],
        },
      ],
    },

    {
      id: "letters-and-essays",
      title: "Letters and Essays",
      category: "Archive",
      year: "Selected materials",
      language: "English",
      source: "Demonstration archive record",

      pages: [
        {
          kicker: "Archival introduction",
          heading: "Letters and essays",

          paragraphs: [
            "This section can contain correspondence, essays, manuscript fragments and editorial annotations.",
            "Every archival item should identify its date, recipient, collection and publication status.",
          ],
        },

        {
          kicker: "Document one",
          heading: "Insert document title",

          paragraphs: [
            "Insert the transcribed document here.",
            "A facsimile image can also be linked to the transcription from this page.",
          ],
        },
      ],
    },
  ];

  /* =========================================================
     LITERARY LIBRARY
     ========================================================= */

  function setupLiteraryLibrary() {
    const library = familyPage.querySelector("[data-literary-library]");

    if (!library || literaryWorks.length === 0) return;

    const workList = library.querySelector("[data-literary-work-list]");

    const leftPage = library.querySelector("[data-left-page]");

    const rightPage = library.querySelector("[data-right-page]");

    const previousButton = library.querySelector("[data-previous-page]");

    const nextButton = library.querySelector("[data-next-page]");

    const titleElement = library.querySelector("[data-reader-title]");

    const categoryElement = library.querySelector("[data-reader-category]");

    const yearElement = library.querySelector("[data-reader-year]");

    const languageElement = library.querySelector("[data-reader-language]");

    const sourceElement = library.querySelector("[data-reader-source]");

    const progressElement = library.querySelector("[data-reader-progress]");

    const statusElement = library.querySelector("[data-reader-status]");

    const turningPage = library.querySelector("[data-turning-page]");

    const turningTitle = library.querySelector("[data-turning-title]");

    const turningExcerpt = library.querySelector("[data-turning-excerpt]");

    const requiredElements = [
      workList,
      leftPage,
      rightPage,
      previousButton,
      nextButton,
      titleElement,
      categoryElement,
      yearElement,
      languageElement,
      sourceElement,
      progressElement,
      statusElement,
      turningPage,
      turningTitle,
      turningExcerpt,
    ];

    if (requiredElements.some((element) => !element)) {
      return;
    }

    const singlePageQuery = window.matchMedia("(max-width: 760px)");

    let activeWork = literaryWorks[0];
    let currentPageIndex = 0;
    let isTurning = false;

    function getPageStep() {
      return singlePageQuery.matches ? 1 : 2;
    }

    function getLastPageStart() {
      const step = getPageStep();

      return Math.floor((activeWork.pages.length - 1) / step) * step;
    }

    function createWorkButton(work, index) {
      const button = document.createElement("button");

      const number = document.createElement("span");

      const copy = document.createElement("div");

      const title = document.createElement("strong");

      const category = document.createElement("small");

      button.type = "button";
      button.className = "literary-library__work-button";

      button.dataset.literaryWork = work.id;

      button.setAttribute("aria-pressed", "false");

      number.textContent = String(index + 1).padStart(2, "0");

      title.textContent = work.title;

      category.textContent = `${work.category} / ${work.language}`;

      copy.append(title, category);

      button.append(number, copy);

      button.addEventListener("click", () => {
        selectWork(work.id);
      });

      return button;
    }

    function renderCatalogue() {
      workList.replaceChildren();

      literaryWorks.forEach((work, index) => {
        workList.append(createWorkButton(work, index));
      });
    }

    function renderPage(pageElement, page, pageNumber) {
      const runningTitle = pageElement.querySelector("[data-running-title]");

      const pageBody = pageElement.querySelector("[data-page-body]");

      const numberElement = pageElement.querySelector("[data-page-number]");

      if (!runningTitle || !pageBody || !numberElement) {
        return;
      }

      pageBody.replaceChildren();

      if (!page) {
        pageElement.classList.add("is-empty");

        runningTitle.textContent = "";
        numberElement.textContent = "";

        return;
      }

      pageElement.classList.remove("is-empty");

      runningTitle.textContent = activeWork.title;

      numberElement.textContent = String(pageNumber).padStart(2, "0");

      if (page.kicker) {
        const kicker = document.createElement("small");

        kicker.textContent = page.kicker;

        pageBody.append(kicker);
      }

      if (page.heading) {
        const heading = document.createElement("h5");

        heading.textContent = page.heading;

        pageBody.append(heading);
      }

      (page.paragraphs ?? []).forEach((paragraphText) => {
        const paragraph = document.createElement("p");

        paragraph.textContent = paragraphText;

        pageBody.append(paragraph);
      });
    }

    function renderReader() {
      currentPageIndex = Math.min(currentPageIndex, getLastPageStart());

      const step = getPageStep();

      const firstPage = activeWork.pages[currentPageIndex];

      const secondPage = activeWork.pages[currentPageIndex + 1];

      titleElement.textContent = activeWork.title;

      categoryElement.textContent = activeWork.category;

      yearElement.textContent = activeWork.year;

      languageElement.textContent = activeWork.language;

      sourceElement.textContent = activeWork.source;

      renderPage(leftPage, firstPage, currentPageIndex + 1);

      renderPage(rightPage, secondPage, currentPageIndex + 2);

      if (step === 1) {
        progressElement.textContent = `Page ${currentPageIndex + 1} / ${activeWork.pages.length}`;
      } else {
        const endingPage = Math.min(
          currentPageIndex + 2,
          activeWork.pages.length,
        );

        progressElement.textContent = `Pages ${currentPageIndex + 1}–${endingPage} / ${activeWork.pages.length}`;
      }

      previousButton.disabled = currentPageIndex === 0;

      nextButton.disabled = currentPageIndex >= getLastPageStart();

      library.querySelectorAll("[data-literary-work]").forEach((button) => {
        const isActive = button.dataset.literaryWork === activeWork.id;

        button.classList.toggle("is-active", isActive);

        button.setAttribute("aria-pressed", String(isActive));
      });

      statusElement.textContent = `${activeWork.title}. ${progressElement.textContent}.`;
    }

    function selectWork(workId) {
      const selectedWork = literaryWorks.find((work) => work.id === workId);

      if (!selectedWork || selectedWork === activeWork) {
        return;
      }

      activeWork = selectedWork;
      currentPageIndex = 0;
      isTurning = false;

      turningPage.classList.remove("is-turning-next", "is-turning-previous");

      renderReader();
    }

    function prepareTurningPage(direction) {
      const step = getPageStep();

      const sourceIndex =
        direction === "next"
          ? Math.min(currentPageIndex + step - 1, activeWork.pages.length - 1)
          : Math.max(currentPageIndex - step, 0);

      const sourcePage = activeWork.pages[sourceIndex];

      turningTitle.textContent = sourcePage?.heading || activeWork.title;

      turningExcerpt.textContent =
        sourcePage?.paragraphs?.join(" ").slice(0, 320) || "";
    }

    function turnPage(direction) {
      if (isTurning) return;

      const step = getPageStep();

      const destination =
        direction === "next"
          ? Math.min(currentPageIndex + step, getLastPageStart())
          : Math.max(currentPageIndex - step, 0);

      if (destination === currentPageIndex) {
        return;
      }

      if (reducedMotionQuery.matches) {
        currentPageIndex = destination;

        renderReader();

        return;
      }

      isTurning = true;

      prepareTurningPage(direction);

      turningPage.classList.remove("is-turning-next", "is-turning-previous");

      /*
       * Force a reflow so the CSS animation
       * reliably restarts on repeated turns.
       */
      void turningPage.offsetWidth;

      turningPage.classList.add(
        direction === "next" ? "is-turning-next" : "is-turning-previous",
      );

      let completed = false;

      const finishTurn = () => {
        if (completed) return;

        completed = true;

        currentPageIndex = destination;

        isTurning = false;

        turningPage.classList.remove("is-turning-next", "is-turning-previous");

        renderReader();
      };

      turningPage.addEventListener("animationend", finishTurn, {
        once: true,
      });

      /*
       * Safety fallback:
       * prevents the reader becoming stuck
       * if animationend is interrupted.
       */
      window.setTimeout(finishTurn, 850);
    }

    previousButton.addEventListener("click", () => {
      turnPage("previous");
    });

    nextButton.addEventListener("click", () => {
      turnPage("next");
    });

    library.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();

        turnPage("previous");
      } else if (event.key === "ArrowRight") {
        event.preventDefault();

        turnPage("next");
      }
    });

    singlePageQuery.addEventListener("change", () => {
      isTurning = false;

      turningPage.classList.remove("is-turning-next", "is-turning-previous");

      const step = getPageStep();

      currentPageIndex = Math.floor(currentPageIndex / step) * step;

      currentPageIndex = Math.min(currentPageIndex, getLastPageStart());

      renderReader();
    });

    renderCatalogue();
    renderReader();
  }

  /* =========================================================
     BOOK FULL VIEW
     ========================================================= */

  function setupBookFullView() {
    const bookReader = familyPage.querySelector("[data-book-reader]");

    const fullViewButton = familyPage.querySelector("[data-book-fullscreen]");

    const fullViewLabel = familyPage.querySelector("[data-fullscreen-label]");

    if (!bookReader || !fullViewButton) {
      return;
    }

    function setBookFullView(open, restoreFocus = false) {
      bookReader.classList.toggle("is-full-view", open);

      document.body.classList.toggle("book-full-view-open", open);

      fullViewButton.setAttribute("aria-pressed", String(open));

      fullViewButton.setAttribute(
        "aria-label",
        open ? "Exit book full view" : "Open book in full view",
      );

      if (fullViewLabel) {
        fullViewLabel.textContent = open ? "Exit full view" : "Full view";
      }

      if (restoreFocus && !open) {
        fullViewButton.focus({
          preventScroll: true,
        });
      }
    }

    fullViewButton.addEventListener("click", () => {
      const isOpen = bookReader.classList.contains("is-full-view");

      setBookFullView(!isOpen);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") {
        return;
      }

      if (!bookReader.classList.contains("is-full-view")) {
        return;
      }

      event.preventDefault();

      setBookFullView(false, true);
    });
  }

  /* =========================================================
     INITIALIZATION
     ========================================================= */

  setupChapterNavigation();
  setupRevealObserver();
  setupLiteraryLibrary();
  setupBookFullView();
})();
