(() => {
  "use strict";

  const BLOG_API_URL =
    "https://script.google.com/macros/s/AKfycbxPDWn9c6D81WMC8Qjqus3ZsWEVnbSWZBlGCPYLNcjyMl2jYhUD4PZMng4tb_rrTeyX8Q/exec";

  const header = document.getElementById("site-header");
  const menuButton = document.querySelector(".menu-button");
  const mainNavigation = document.getElementById("main-navigation");
  const filterButtons = [...document.querySelectorAll(".filter-button")];
  const searchInput = document.getElementById("article-search");
  const noResults = document.getElementById("no-results");
  const postsGrid = document.getElementById("posts-grid");
  const revealElements = [...document.querySelectorAll(".reveal-on-scroll")];

  let activeFilter = "all";
  let searchTerm = "";
  let posts = [];

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

  function normalizeText(value) {
    return String(value || "")
      .toLocaleLowerCase()
      .trim();
  }

  function normalizeCategory(value) {
    return normalizeText(value).replace(/\s+/g, "-");
  }

  function formatDate(date) {
    if (!date) return "";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function createPostCard(post) {
    const article = document.createElement("article");
    article.className = "post-card reveal-on-scroll";
    article.dataset.category = normalizeCategory(post.category);

    const searchableText = [post.title, post.author, post.category, post.date]
      .filter(Boolean)
      .join(" ");

    article.dataset.search = searchableText;

    const link = document.createElement("a");
    link.className = "post-card__link";
    link.href = `./blog-post.html?post=${encodeURIComponent(post.slug)}`;

    const visual = document.createElement("div");
    visual.className = "post-card__visual";
    visual.setAttribute("aria-hidden", "true");

    if (post.image) {
      const image = document.createElement("img");
      image.src = post.image;
      image.alt = "";
      image.loading = "lazy";
      image.decoding = "async";
      visual.appendChild(image);
    } else {
      const visualWord = document.createElement("span");
      visualWord.className = "visual-word";
      visualWord.textContent = normalizeCategory(post.category)
        .toUpperCase()
        .slice(0, 12);

      visual.appendChild(visualWord);
    }

    const content = document.createElement("div");
    content.className = "post-card__content";

    const meta = document.createElement("div");
    meta.className = "post-card__meta";

    const category = document.createElement("span");
    category.textContent = post.category || "Journal";

    const time = document.createElement("time");
    time.dateTime = post.date || "";
    time.textContent = formatDate(post.date);

    meta.appendChild(category);
    meta.appendChild(time);

    const title = document.createElement("h3");
    title.textContent = post.title || "Untitled";

    const description = document.createElement("p");
    description.textContent = post.deck || "";

    const action = document.createElement("span");
    action.className = "post-card__action";
    action.textContent = "Open entry ";

    const arrow = document.createElement("b");
    arrow.textContent = "↗";
    action.appendChild(arrow);

    content.appendChild(meta);
    content.appendChild(title);
    content.appendChild(description);
    content.appendChild(action);

    link.appendChild(visual);
    link.appendChild(content);
    article.appendChild(link);

    return article;
  }

  function renderPosts() {
    if (!postsGrid) return;

    postsGrid.replaceChildren();

    posts.forEach((post) => {
      postsGrid.appendChild(createPostCard(post));
    });

    updatePosts();
    setupRevealObserver();
  }

  function updatePosts() {
    const postCards = [...document.querySelectorAll(".post-card")];

    let visibleCount = 0;

    postCards.forEach((card) => {
      const category = card.dataset.category || "";

      const searchableText = normalizeText(
        `${card.dataset.search || ""} ${card.textContent || ""}`,
      );

      const matchesCategory =
        activeFilter === "all" || category === activeFilter;

      const matchesSearch =
        searchTerm.length === 0 || searchableText.includes(searchTerm);

      const isVisible = matchesCategory && matchesSearch;

      card.classList.toggle("is-hidden", !isVisible);
      card.setAttribute("aria-hidden", String(!isVisible));

      if (isVisible) {
        visibleCount += 1;
      }
    });

    if (noResults) {
      noResults.hidden = visibleCount !== 0;
    }
  }

  function updateFilterCounts() {
    const counts = {};

    posts.forEach((post) => {
      const category = normalizeCategory(post.category);
      counts[category] = (counts[category] || 0) + 1;
    });

    filterButtons.forEach((button) => {
      const filter = button.dataset.filter || "all";
      const count = filter === "all" ? posts.length : counts[filter] || 0;

      const countElement = button.querySelector("span");

      if (countElement) {
        countElement.textContent = String(count).padStart(2, "0");
      }
    });
  }

  function activateFilter(button) {
    activeFilter = button.dataset.filter || "all";

    filterButtons.forEach((candidate) => {
      const isActive = candidate === button;

      candidate.classList.toggle("active", isActive);
      candidate.setAttribute("aria-pressed", String(isActive));
    });

    updatePosts();
  }

  function setupRevealObserver() {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const elements = [...document.querySelectorAll(".reveal-on-scroll")];

    if (reducedMotion || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
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
        threshold: 0.12,
        rootMargin: "0px 0px -60px",
      },
    );

    elements.forEach((element, index) => {
      element.style.transitionDelay = `${Math.min(index % 3, 2) * 70}ms`;
      observer.observe(element);
    });
  }

  async function loadPosts() {
    if (!postsGrid) return;

    try {
      postsGrid.setAttribute("aria-busy", "true");

      const response = await fetch(`${BLOG_API_URL}?action=getPosts`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid posts response");
      }

      posts = data;

      renderPosts();
      updateFilterCounts();
    } catch (error) {
      console.error("Unable to load blog posts:", error);

      postsGrid.innerHTML = "";

      if (noResults) {
        noResults.hidden = false;
        noResults.textContent = "Unable to load journal entries.";
      }
    } finally {
      postsGrid.removeAttribute("aria-busy");
    }
  }

  menuButton?.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    setMenu(!isOpen);
  });

  mainNavigation?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  filterButtons.forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      String(button.classList.contains("active")),
    );

    button.addEventListener("click", () => activateFilter(button));
  });

  searchInput?.addEventListener("input", (event) => {
    searchTerm = normalizeText(event.currentTarget.value);
    updatePosts();
  });

  window.addEventListener("scroll", updateHeader, {
    passive: true,
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) {
      closeMenu();
    }
  });

  updateHeader();
  loadPosts();
})();
