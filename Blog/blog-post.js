(() => {
  "use strict";

  const repository = window.ZG_BLOG;
  const posts = repository?.posts || {};
  const order = Array.isArray(repository?.order) ? repository.order : [];

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
  const requestedId = params.get("post") || order[0] || "";
  const post = posts[requestedId];
  let headingObserver = null;

  function normalizeSlug(value) {
    return String(value || "")
      .toLocaleLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function createTextElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    element.textContent = text || "";
    return element;
  }

  function appendInlineText(container, text) {
    container.textContent = text || "";
  }

  function getBlockText(block) {
    if (!block) return "";
    if (Array.isArray(block.items)) return block.items.join(" ");
    return `${block.text || ""} ${block.title || ""} ${block.caption || ""}`;
  }

  function calculateReadingTime(currentPost) {
    const words = [
      currentPost.title,
      currentPost.deck,
      ...(currentPost.blocks || []).map(getBlockText),
    ]
      .join(" ")
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;

    return Math.max(1, Math.ceil(words / 210));
  }

  function createHeading(block) {
    const level = block.level === 3 ? 3 : 2;
    const heading = createTextElement(`h${level}`, "", block.text);
    heading.id = block.id || normalizeSlug(block.text);
    heading.dataset.tocHeading = "true";
    return heading;
  }

  function createQuote(block) {
    const wrapper = document.createElement("figure");
    wrapper.className = "article-quote";

    const quote = createTextElement("blockquote", "", block.text);
    wrapper.appendChild(quote);

    if (block.cite) {
      wrapper.appendChild(createTextElement("cite", "", block.cite));
    }

    return wrapper;
  }

  function createList(block) {
    const list = document.createElement(block.ordered ? "ol" : "ul");
    (block.items || []).forEach((item) => {
      list.appendChild(createTextElement("li", "", item));
    });
    return list;
  }

  function createNote(block) {
    const note = document.createElement("aside");
    note.className = "article-note";
    note.appendChild(createTextElement("strong", "", block.title || "Note"));
    note.appendChild(createTextElement("p", "", block.text));
    return note;
  }

  function createFigure(block, index) {
    const figure = document.createElement("figure");
    figure.className = "article-figure";

    const image = document.createElement("img");
    image.src = block.src;
    image.alt = block.alt || "";
    image.loading = "lazy";
    image.decoding = "async";
    figure.appendChild(image);

    if (block.caption || block.credit) {
      const caption = document.createElement("figcaption");
      caption.appendChild(
        createTextElement("span", "", block.label || `Figure ${index + 1}`),
      );
      caption.appendChild(
        createTextElement(
          "span",
          "",
          [block.caption, block.credit].filter(Boolean).join(" — "),
        ),
      );
      figure.appendChild(caption);
    }

    return figure;
  }

  function renderBody(currentPost) {
    if (!elements.body) return;

    elements.body.replaceChildren();
    let figureIndex = 0;

    (currentPost.blocks || []).forEach((block) => {
      let node = null;

      switch (block.type) {
        case "lead":
          node = createTextElement("p", "article-lead", block.text);
          break;
        case "heading":
          node = createHeading(block);
          break;
        case "paragraph":
          node = createTextElement("p", "", block.text);
          break;
        case "quote":
          node = createQuote(block);
          break;
        case "list":
          node = createList(block);
          break;
        case "note":
          node = createNote(block);
          break;
        case "figure":
          if (block.src) {
            node = createFigure(block, figureIndex);
            figureIndex += 1;
          }
          break;
        default:
          break;
      }

      if (node) elements.body.appendChild(node);
    });
  }

  function renderToc() {
    if (!elements.toc || !elements.body) return;
    elements.toc.replaceChildren();

    const headings = [...elements.body.querySelectorAll("[data-toc-heading]")];

    headings.forEach((heading) => {
      const link = document.createElement("a");
      link.href = `#${heading.id}`;
      link.textContent = heading.textContent;
      link.dataset.target = heading.id;
      elements.toc.appendChild(link);
    });

    setupHeadingObserver(headings);
  }

  function setupHeadingObserver(headings) {
    headingObserver?.disconnect();

    if (!("IntersectionObserver" in window) || headings.length === 0) return;

    headingObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

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

    headings.forEach((heading) => headingObserver.observe(heading));
  }

  function renderSources(currentPost) {
    if (!elements.sources || !elements.sourcesSection) return;

    const sources = Array.isArray(currentPost.sources) ? currentPost.sources : [];
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
        content.appendChild(createTextElement("strong", "", source.label));
      }

      if (source.note) {
        content.appendChild(createTextElement("small", "", source.note));
      }

      item.appendChild(content);
      elements.sources.appendChild(item);
    });
  }

  function setPaginationLink(anchor, targetId) {
    if (!anchor) return;
    const target = posts[targetId];

    if (!target) {
      anchor.hidden = true;
      anchor.removeAttribute("href");
      return;
    }

    anchor.hidden = false;
    anchor.href = `./blog-post.html?post=${encodeURIComponent(target.id)}`;
    const title = anchor.querySelector("strong");
    if (title) title.textContent = target.title;
  }

  function renderPagination(currentPost) {
    const currentIndex = order.indexOf(currentPost.id);
    const previousId = currentIndex > 0 ? order[currentIndex - 1] : null;
    const nextId = currentIndex >= 0 && currentIndex < order.length - 1
      ? order[currentIndex + 1]
      : null;

    setPaginationLink(elements.previous, previousId);
    setPaginationLink(elements.next, nextId);
  }

  function createRelatedCard(relatedPost) {
    const article = document.createElement("article");
    article.className = "related-card";

    const link = document.createElement("a");
    link.href = `./blog-post.html?post=${encodeURIComponent(relatedPost.id)}`;

    const meta = document.createElement("div");
    meta.className = "related-card__meta";
    meta.appendChild(createTextElement("span", "", relatedPost.category));
    meta.appendChild(createTextElement("time", "", relatedPost.displayDate));
    meta.querySelector("time").dateTime = relatedPost.date;

    link.appendChild(meta);
    link.appendChild(createTextElement("h3", "", relatedPost.title));
    link.appendChild(createTextElement("p", "", relatedPost.deck));
    article.appendChild(link);

    return article;
  }

  function renderRelated(currentPost) {
    if (!elements.related || !elements.relatedSection) return;

    const relatedPosts = (currentPost.related || [])
      .map((id) => posts[id])
      .filter(Boolean)
      .slice(0, 3);

    elements.related.replaceChildren();
    elements.relatedSection.hidden = relatedPosts.length === 0;
    relatedPosts.forEach((item) => elements.related.appendChild(createRelatedCard(item)));
  }

  function updateStructuredData(currentPost) {
    const oldSchema = document.getElementById("article-schema");
    oldSchema?.remove();

    const schema = document.createElement("script");
    schema.id = "article-schema";
    schema.type = "application/ld+json";
    schema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: currentPost.title,
      description: currentPost.deck,
      datePublished: currentPost.date,
      author: {
        "@type": "Organization",
        name: currentPost.author,
      },
      publisher: {
        "@type": "Organization",
        name: "Zviad Gamsakhurdia Digital Museum",
      },
      mainEntityOfPage: window.location.href,
    });
    document.head.appendChild(schema);
  }

  function renderPost(currentPost) {
    document.title = `${currentPost.title} | Zviad Gamsakhurdia Digital Museum`;

    if (elements.description) {
      elements.description.setAttribute("content", currentPost.deck || "");
    }

    appendInlineText(elements.category, currentPost.category);
    appendInlineText(elements.title, currentPost.title);
    appendInlineText(elements.deck, currentPost.deck);
    appendInlineText(elements.author, currentPost.author || "Digital Museum Editorial Team");
    appendInlineText(elements.heroLabel, currentPost.heroLabel || currentPost.category);
    appendInlineText(elements.heroNumber, currentPost.heroNumber || "00");

    const minutes = currentPost.readingTime || calculateReadingTime(currentPost);
    appendInlineText(elements.readingTime, `${minutes} min read`);

    if (elements.date) {
      elements.date.dateTime = currentPost.date || "";
      elements.date.textContent = currentPost.displayDate || currentPost.date || "";
    }

    if (elements.heroVisual) {
      const categoryClass = `category-${normalizeSlug(currentPost.category)}`;
      elements.heroVisual.classList.add(categoryClass);
    }

    renderBody(currentPost);
    renderToc();
    renderSources(currentPost);
    renderPagination(currentPost);
    renderRelated(currentPost);

    if (elements.editorialNote && elements.editorialNoteText) {
      elements.editorialNote.hidden = !currentPost.editorialNote;
      elements.editorialNoteText.textContent = currentPost.editorialNote || "";
    }

    updateStructuredData(currentPost);
  }

  function showNotFound() {
    document.title = "Article Not Found | Zviad Gamsakhurdia Digital Museum";
    elements.articleHero?.setAttribute("hidden", "");
    elements.articleLayout?.setAttribute("hidden", "");
    elements.pagination?.setAttribute("hidden", "");
    if (elements.relatedSection) elements.relatedSection.hidden = true;
    if (elements.notFound) elements.notFound.hidden = false;
  }

  function updateHeader() {
    elements.header?.classList.toggle("is-scrolled", window.scrollY > 18);
  }

  function updateReadingProgress() {
    if (!elements.progressBar || !elements.body) return;

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
    if (!elements.menuButton || !elements.navigation) return;
    elements.menuButton.setAttribute("aria-expanded", String(open));
    elements.navigation.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
  }

  async function copyCurrentLink() {
    const url = window.location.href;

    try {
      await navigator.clipboard.writeText(url);
      if (elements.copyStatus) elements.copyStatus.textContent = "Link copied.";
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
    if (window.innerWidth > 860) setMenu(false);
    updateReadingProgress();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });

  if (post) {
    renderPost(post);
  } else {
    showNotFound();
  }

  updateHeader();
  updateReadingProgress();
})();
