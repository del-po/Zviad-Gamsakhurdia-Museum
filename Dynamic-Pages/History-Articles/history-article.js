const page = document.querySelector("[data-article-page]");
const articleElement = document.getElementById("history-article");
const statusElement = document.getElementById("article-status");
const descriptionMeta = document.getElementById("page-description");

const elements = {
  breadcrumbs: document.getElementById("article-breadcrumbs"),
  label: document.getElementById("article-label"),
  title: document.getElementById("article-title"),
  introduction: document.getElementById("article-introduction"),
  period: document.getElementById("article-period"),
  category: document.getElementById("article-category"),
  heroFigure: document.getElementById("article-hero-figure"),
  heroImage: document.getElementById("article-hero-image"),
  heroCaption: document.getElementById("article-hero-caption"),
  sectionNavigation: document.getElementById("article-section-navigation"),
  sections: document.getElementById("article-sections"),
  relatedLinks: document.getElementById("article-related-links"),
};

function getSlug() {
  const parameters = new URLSearchParams(window.location.search);

  return parameters.get("slug")?.trim() || "upbringing";
}

function createTextElement(tagName, className, text) {
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  element.textContent = text;

  return element;
}

function renderBreadcrumbs(items = []) {
  elements.breadcrumbs.replaceChildren();

  items.forEach((item, index) => {
    const isLast = index === items.length - 1;

    if (item.href && !isLast) {
      const link = createTextElement("a", "", item.label);

      link.href = item.href;

      elements.breadcrumbs.append(link);
    } else {
      const current = createTextElement("span", "", item.label);

      if (isLast) {
        current.setAttribute("aria-current", "page");
      }

      elements.breadcrumbs.append(current);
    }

    if (!isLast) {
      const separator = createTextElement("span", "", "/");

      separator.setAttribute("aria-hidden", "true");

      elements.breadcrumbs.append(separator);
    }
  });
}

function renderHeroImage(image) {
  if (!image?.src) {
    elements.heroFigure.hidden = true;

    return;
  }

  elements.heroFigure.hidden = false;

  elements.heroImage.src = image.src;
  elements.heroImage.alt = image.alt || "";

  elements.heroCaption.textContent = image.caption || "";
  elements.heroCaption.hidden = !image.caption;
}

function renderSectionNavigation(sections = []) {
  elements.sectionNavigation.replaceChildren();

  sections.forEach((section) => {
    const link = document.createElement("a");

    link.href = `#${section.id}`;

    link.append(
      createTextElement("span", "", section.number || ""),
      createTextElement("strong", "", section.title),
    );

    elements.sectionNavigation.append(link);
  });
}

function renderSectionImage(image) {
  const figure = createTextElement("figure", "history-article__figure", "");

  const img = document.createElement("img");

  img.src = image.src;
  img.alt = image.alt || "";
  img.loading = "lazy";

  figure.append(img);

  if (image.caption) {
    figure.append(createTextElement("figcaption", "", image.caption));
  }

  return figure;
}

function renderQuote(quote) {
  const blockquote = createTextElement(
    "blockquote",
    "history-article__quote",
    "",
  );

  blockquote.append(createTextElement("p", "", quote.text));

  if (quote.source) {
    blockquote.append(createTextElement("cite", "", quote.source));
  }

  return blockquote;
}

function renderSections(sections = []) {
  elements.sections.replaceChildren();

  sections.forEach((section) => {
    const sectionElement = document.createElement("section");

    sectionElement.className = "history-article__section reveal-on-scroll";

    sectionElement.id = section.id;

    const heading = document.createElement("header");

    heading.className = "history-article__section-heading";

    heading.append(
      createTextElement(
        "span",
        "history-article__section-number",
        section.number || "",
      ),

      createTextElement("p", "section-label", section.label || ""),

      createTextElement("h2", "", section.title),
    );

    const copy = createTextElement("div", "history-article__section-copy", "");

    (section.paragraphs || []).forEach((paragraph) => {
      copy.append(createTextElement("p", "", paragraph));
    });

    sectionElement.append(heading, copy);

    if (section.image?.src) {
      sectionElement.append(renderSectionImage(section.image));
    }

    if (section.quote?.text) {
      sectionElement.append(renderQuote(section.quote));
    }

    elements.sections.append(sectionElement);
  });
}

function renderRelatedLinks(items = []) {
  elements.relatedLinks.replaceChildren();

  items.forEach((item) => {
    const link = document.createElement("a");

    link.href = item.href;

    link.append(
      createTextElement("span", "", item.label),
      createTextElement("b", "", "↗"),
    );

    elements.relatedLinks.append(link);
  });
}

function setupRevealObserver() {
  const revealElements = [...document.querySelectorAll(".reveal-on-scroll")];

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => {
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
      threshold: 0.08,
      rootMargin: "0px 0px -55px",
    },
  );

  revealElements.forEach((element) => {
    observer.observe(element);
  });
}

function scrollToRequestedSection() {
  if (!window.location.hash) {
    return;
  }

  const target = document.querySelector(window.location.hash);

  if (!target) {
    return;
  }

  requestAnimationFrame(() => {
    target.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
}

function renderArticle(article) {
  document.title = article.documentTitle || article.title;

  if (descriptionMeta) {
    descriptionMeta.content = article.description || article.introduction || "";
  }

  renderBreadcrumbs(article.breadcrumbs);

  elements.label.textContent = article.label || "";

  elements.title.textContent = article.title || "";

  elements.introduction.textContent = article.introduction || "";

  elements.period.textContent = article.period || "";

  elements.category.textContent = article.category || "";

  renderHeroImage(article.heroImage);

  renderSectionNavigation(article.sections);

  renderSections(article.sections);

  renderRelatedLinks(article.related);

  statusElement.hidden = true;
  articleElement.hidden = false;

  page?.classList.add("is-loaded");

  setupRevealObserver();

  scrollToRequestedSection();
}

function showError(message) {
  statusElement.textContent = message;

  statusElement.classList.add("is-error");
}

async function loadArticle() {
  try {
    const response = await fetch("./history-articles.json", {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Content request failed with status ${response.status}.`);
    }

    const articles = await response.json();

    const slug = getSlug();

    const article = articles[slug];

    if (!article) {
      showError(`The requested historical article “${slug}” was not found.`);

      return;
    }

    renderArticle(article);
  } catch (error) {
    console.error(error);

    showError(
      "The article could not be loaded. Open the website through a local or hosted web server rather than directly as a file.",
    );
  }
}

loadArticle();
