(() => {
  "use strict";

  const BLOG_API_URL =
    "https://script.google.com/macros/s/AKfycbxPDWn9c6D81WMC8Qjqus3ZsWEVnbSWZBlGCPYLNcjyMl2jYhUD4PZMng4tb_rrTeyX8Q/exec";

  const elements = {
    header: document.getElementById("site-header"),
    menuButton: document.querySelector(".menu-button"),
    navigation: document.getElementById("main-navigation"),
    description: document.getElementById("page-description"),
    progressBar: document.getElementById("reading-progress-bar"),
    category: document.getElementById("article-category"),
    date: document.getElementById("article-date"),
    readingTime: document.getElementById("article-reading-time"),
    title: document.getElementById("article-title"),
    deck: document.getElementById("article-deck"),
    author: document.getElementById("article-author"),
    heroVisual: document.getElementById("article-hero-visual"),
    heroLabel: document.getElementById("article-hero-label"),
    heroNumber: document.getElementById("article-hero-number"),
    body: document.getElementById("article-body"),
    toc: document.getElementById("article-toc"),
    sourcesSection: document.getElementById("article-sources-section"),
    sources: document.getElementById("article-sources"),
    editorialNote: document.getElementById("article-editorial-note"),
    editorialNoteText: document.getElementById("article-editorial-note-text"),
    previous: document.getElementById("previous-post"),
    next: document.getElementById("next-post"),
    relatedSection: document.getElementById("related-posts-section"),
    related: document.getElementById("related-posts"),
    copyButton: document.getElementById("copy-link-button"),
    copyStatus: document.getElementById("copy-link-status"),
    notFound: document.getElementById("article-not-found"),
    articleHero: document.querySelector(".article-hero"),
    articleLayout: document.querySelector(".article-layout"),
    pagination: document.querySelector(".article-pagination"),
  };

  const params = new URLSearchParams(window.location.search);
  const requestedSlug = params.get("post") || "";

  let currentPost = null;
  let allPosts = [];
  let headingObserver = null;

  function createTextElement(tagName, className, text) {
    const element = document.createElement(tagName);

    if (className) {
      element.className = className;
    }

    element.textContent = text || "";

    return element;
  }

  function calculateReadingTime(text) {
    const words = String(text || "")
      .replace(/<[^>]*>/g, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;

    return Math.max(1, Math.ceil(words / 210));
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

  function showNotFound() {
    elements.articleHero?.setAttribute("hidden", "");
    elements.articleLayout?.setAttribute("hidden", "");
    elements.pagination?.setAttribute("hidden", "");

    if (elements.relatedSection) {
      elements.relatedSection.hidden = true;
    }

    if (elements.notFound) {
      elements.notFound.hidden = false;
    }
  }

  function renderBody(post) {
    if (!elements.body) return;

    elements.body.innerHTML = post.content || "";

    const headings = [...elements.body.querySelectorAll("h2, h3")];

    headings.forEach((heading, index) => {
      if (!heading.id) {
        heading.id =
          heading.textContent
            ?.toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-") || `section-${index + 1}`;
      }

      heading.dataset.tocHeading = "true";
    });
  }

  function renderToc() {
    if (!elements.toc || !elements.body) return;

    const headings = [
      ...elements.body.querySelectorAll('[data-toc-heading="true"]'),
    ];

    elements.toc.replaceChildren();

    if (headings.length === 0) {
      elements.toc.closest("section")?.setAttribute("hidden", "");
      return;
    }

    elements.toc.closest("section")?.removeAttribute("hidden");

    headings.forEach((heading) => {
      const item = document.createElement("li");
      const link = document.createElement("a");

      link.href = `#${heading.id}`;
      link.dataset.target = heading.id;
      link.textContent = heading.textContent || "";

      item.appendChild(link);
      elements.toc.appendChild(item);
    });

    headingObserver?.disconnect();

    if (!("IntersectionObserver" in window)) return;

    headingObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length === 0) return;

        const activeId = visible[0].target.id;

        elements.toc?.querySelectorAll("a").forEach((link) => {
          link.classList.toggle("active", link.dataset.target === activeId);
        });
      },
      {
        rootMargin: "-18% 0px -68%",
        threshold: 0,
      },
    );

    headings.forEach((heading) => {
      headingObserver.observe(heading);
    });
  }

  function renderSources(post) {
    if (!elements.sources || !elements.sourcesSection) {
      return;
    }

    const sources = Array.isArray(post.sources) ? post.sources : [];

    elements.sources.replaceChildren();
    elements.sourcesSection.hidden = sources.length === 0;

    sources.forEach((source) => {
      const item = document.createElement("li");
      const content = document.createElement("div");

      if (source.href) {
        const link = createTextElement("a", "", source.label || source.href);

        link.href = source.href;

        if (/^https?:\/\//i.test(source.href)) {
          link.target = "_blank";
          link.rel = "noopener noreferrer";
        }

        content.appendChild(link);
      } else {
        content.appendChild(
          createTextElement("strong", "", source.label || ""),
        );
      }

      if (source.note) {
        content.appendChild(createTextElement("small", "", source.note));
      }

      item.appendChild(content);
      elements.sources.appendChild(item);
    });
  }

  function setPaginationLink(anchor, post) {
    if (!anchor) return;

    if (!post) {
      anchor.hidden = true;
      anchor.removeAttribute("href");
      return;
    }

    anchor.hidden = false;
    anchor.href = `./blog-post.html?post=${encodeURIComponent(post.slug)}`;

    const title = anchor.querySelector("strong");

    if (title) {
      title.textContent = post.title || "";
    }
  }

  function renderPagination(post) {
    if (!Array.isArray(allPosts)) return;

    const currentIndex = allPosts.findIndex((item) => item.slug === post.slug);

    const previousPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;

    const nextPost =
      currentIndex >= 0 && currentIndex < allPosts.length - 1
        ? allPosts[currentIndex + 1]
        : null;

    setPaginationLink(elements.previous, previousPost);
    setPaginationLink(elements.next, nextPost);
  }

  function createRelatedCard(post) {
    const article = document.createElement("article");
    article.className = "related-card";

    const link = document.createElement("a");

    link.href = `./blog-post.html?post=${encodeURIComponent(post.slug)}`;

    const meta = document.createElement("div");
    meta.className = "related-card__meta";

    meta.appendChild(createTextElement("span", "", post.category || "Journal"));

    const time = createTextElement("time", "", formatDate(post.date));

    time.dateTime = post.date || "";

    meta.appendChild(time);

    link.appendChild(meta);

    link.appendChild(createTextElement("h3", "", post.title || ""));

    link.appendChild(createTextElement("p", "", post.deck || ""));

    article.appendChild(link);

    return article;
  }

  function renderRelated(post) {
    if (!elements.related || !elements.relatedSection) {
      return;
    }

    const candidates = allPosts
      .filter((item) => item.slug !== post.slug)
      .slice(0, 3);

    elements.related.replaceChildren();

    elements.relatedSection.hidden = candidates.length === 0;

    candidates.forEach((item) => {
      elements.related.appendChild(createRelatedCard(item));
    });
  }

  function updateStructuredData(post) {
    document.getElementById("article-schema")?.remove();

    const schema = document.createElement("script");

    schema.id = "article-schema";
    schema.type = "application/ld+json";

    schema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.deck,
      datePublished: post.date,
      author: {
        "@type": "Organization",
        name: post.author || "Digital Museum Editorial Team",
      },
      publisher: {
        "@type": "Organization",
        name: "Zviad Gamsakhurdia Digital Museum",
      },
      mainEntityOfPage: window.location.href,
    });

    document.head.appendChild(schema);
  }

  function renderPost(post) {
    currentPost = post;

    document.title = `${post.title} | Zviad Gamsakhurdia Digital Museum`;

    elements.description?.setAttribute("content", post.deck || "");

    elements.category.textContent = post.category || "Journal";

    elements.title.textContent = post.title || "";

    elements.deck.textContent = post.deck || "";

    elements.author.textContent =
      post.author || "Digital Museum Editorial Team";

    if (elements.date) {
      elements.date.dateTime = post.date || "";

      elements.date.textContent = formatDate(post.date);
    }

    const minutes = calculateReadingTime(post.content || "");

    if (elements.readingTime) {
      elements.readingTime.textContent = `${minutes} min read`;
    }

    if (elements.heroVisual) {
      const categoryClass = `category-${String(post.category || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")}`;

      elements.heroVisual.classList.add(categoryClass);
    }

    if (elements.heroLabel) {
      elements.heroLabel.textContent = post.category || "Journal";
    }

    if (elements.heroNumber) {
      const index = allPosts.findIndex((item) => item.slug === post.slug);

      elements.heroNumber.textContent = String(index + 1).padStart(2, "0");
    }

    renderBody(post);
    renderToc();
    renderSources(post);
    renderPagination(post);
    renderRelated(post);
    updateStructuredData(post);
  }

  function updateHeader() {
    elements.header?.classList.toggle("is-scrolled", window.scrollY > 18);
  }

  function updateReadingProgress() {
    if (!elements.progressBar || !elements.body) {
      return;
    }

    const bodyRect = elements.body.getBoundingClientRect();

    const articleTop = window.scrollY + bodyRect.top;

    const articleHeight = elements.body.offsetHeight;

    const viewportMarker = window.scrollY + window.innerHeight * 0.22;

    const progress = Math.min(
      1,
      Math.max(0, (viewportMarker - articleTop) / Math.max(1, articleHeight)),
    );

    elements.progressBar.style.transform = `scaleX(${progress})`;
  }

  function setMenu(open) {
    if (!elements.menuButton || !elements.navigation) {
      return;
    }

    elements.menuButton.setAttribute("aria-expanded", String(open));

    elements.navigation.classList.toggle("is-open", open);

    document.body.classList.toggle("menu-open", open);
  }

  async function copyCurrentLink() {
    const url = window.location.href;

    try {
      await navigator.clipboard.writeText(url);

      if (elements.copyStatus) {
        elements.copyStatus.textContent = "Link copied.";
      }
    } catch {
      const temporaryInput = document.createElement("textarea");

      temporaryInput.value = url;
      temporaryInput.setAttribute("readonly", "");

      temporaryInput.style.position = "fixed";
      temporaryInput.style.opacity = "0";

      document.body.appendChild(temporaryInput);

      temporaryInput.select();

      const copied = document.execCommand("copy");

      temporaryInput.remove();

      if (elements.copyStatus) {
        elements.copyStatus.textContent = copied
          ? "Link copied."
          : "Copy the URL from your browser address bar.";
      }
    }
  }

  async function recordPostView(slug) {
    if (!slug) return;

    try {
      await fetch(
        `${BLOG_API_URL}?action=recordView&slug=${encodeURIComponent(slug)}`,
        {
          cache: "no-store",
        },
      );
    } catch (error) {
      console.error("Unable to record post view:", error);
    }
  }

  async function loadPost() {
    if (!requestedSlug) {
      showNotFound();
      return;
    }

    try {
      const [postResponse, postsResponse] = await Promise.all([
        fetch(
          `${BLOG_API_URL}?action=getPost&slug=${encodeURIComponent(
            requestedSlug,
          )}`,
          {
            cache: "no-store",
          },
        ),

        fetch(`${BLOG_API_URL}?action=getPosts`, {
          cache: "no-store",
        }),
      ]);

      if (!postResponse.ok) {
        throw new Error(`Post request failed: HTTP ${postResponse.status}`);
      }

      if (!postsResponse.ok) {
        throw new Error(`Posts request failed: HTTP ${postsResponse.status}`);
      }

      const post = await postResponse.json();
      const posts = await postsResponse.json();

      if (!post || post.error || !post.title) {
        showNotFound();
        return;
      }

      allPosts = Array.isArray(posts) ? posts : [];

      renderPost(post);
      recordPostView(post.slug);
    } catch (error) {
      console.error("Unable to load blog post:", error);

      showNotFound();
    }
  }

  elements.menuButton?.addEventListener("click", () => {
    const open = elements.menuButton.getAttribute("aria-expanded") !== "true";

    setMenu(open);
  });

  elements.navigation?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  elements.copyButton?.addEventListener("click", copyCurrentLink);

  window.addEventListener(
    "scroll",
    () => {
      updateHeader();
      updateReadingProgress();
    },
    { passive: true },
  );

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) {
      setMenu(false);
    }

    updateReadingProgress();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenu(false);
    }
  });

  updateHeader();
  loadPost();
})();
