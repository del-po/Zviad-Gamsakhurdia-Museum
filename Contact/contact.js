const CONTACT_ENDPOINT = "";

const header = document.getElementById("site-header");
const menuButton = document.querySelector(".menu-button");
const mainNavigation = document.getElementById("main-navigation");
const contactPage = document.querySelector(".contact-page");
const revealElements = [...document.querySelectorAll(".reveal-on-scroll")];
const routeButtons = [...document.querySelectorAll("[data-route-target]")];
const formSection = document.getElementById("contact-form-section");
const contactForm = document.getElementById("contact-form");
const typeSelect = document.getElementById("contact-type");
const subjectInput = document.getElementById("contact-subject");
const messageInput = document.getElementById("contact-message");
const messageCounter = document.getElementById("message-counter");
const fileInput = document.getElementById("contact-files");
const fileDrop = document.getElementById("file-drop");
const selectedFilesList = document.getElementById("selected-files");
const formStatus = document.getElementById("contact-form-status");
const submitButton = contactForm?.querySelector("button[type='submit']");

const MAX_FILES = 5;
const MAX_TOTAL_BYTES = 25 * 1024 * 1024;
const allowedExtensions = new Set([
  "pdf",
  "jpg",
  "jpeg",
  "png",
  "webp",
  "tif",
  "tiff",
  "doc",
  "docx",
  "txt",
  "mp3",
  "wav",
  "m4a",
  "mp4",
  "mov",
]);

const routeSubjects = {
  material: "Archival material contribution",
  correction: "Correction request",
  research: "Research or institutional collaboration",
  rights: "Rights, privacy or access concern",
  general: "General inquiry",
};

let selectedFiles = [];

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

function updatePageProgress() {
  if (!contactPage) return;

  const maximumScroll = Math.max(
    1,
    document.documentElement.scrollHeight - window.innerHeight,
  );
  const progress = Math.min(1, Math.max(0, window.scrollY / maximumScroll));

  contactPage.style.setProperty("--contact-progress", progress.toFixed(4));
  contactPage.style.setProperty(
    "--contact-rotation",
    `${(progress * 4.2).toFixed(2)}deg`,
  );
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
      threshold: 0.09,
      rootMargin: "0px 0px -45px",
    },
  );

  revealElements.forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index % 4, 3) * 55}ms`;
    observer.observe(element);
  });
}

function setRoute(route, { scroll = true } = {}) {
  if (!routeSubjects[route]) return;

  routeButtons.forEach((button) => {
    const active = button.dataset.routeTarget === route;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  if (typeSelect) {
    typeSelect.value = route;
    clearFieldError(typeSelect);
  }

  if (subjectInput && !subjectInput.value.trim()) {
    subjectInput.value = routeSubjects[route];
  }

  if (scroll) {
    formSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function updateCounter() {
  if (!messageInput || !messageCounter) return;
  messageCounter.value = `${messageInput.value.length.toLocaleString()} / 1,500`;
  messageCounter.textContent = messageCounter.value;
}

function getFileExtension(filename) {
  const parts = filename.toLowerCase().split(".");
  return parts.length > 1 ? parts.pop() : "";
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validateFiles(files) {
  const errors = [];

  if (files.length > MAX_FILES) {
    errors.push(`Select no more than ${MAX_FILES} files.`);
  }

  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  if (totalBytes > MAX_TOTAL_BYTES) {
    errors.push("The combined file size must not exceed 25 MB.");
  }

  const unsupported = files.filter(
    (file) => !allowedExtensions.has(getFileExtension(file.name)),
  );
  if (unsupported.length > 0) {
    errors.push(`Unsupported file type: ${unsupported[0].name}`);
  }

  return errors;
}

function renderSelectedFiles() {
  if (!selectedFilesList) return;
  selectedFilesList.replaceChildren();

  selectedFiles.forEach((file, index) => {
    const item = document.createElement("li");

    const name = document.createElement("span");
    name.textContent = file.name;

    const size = document.createElement("small");
    size.textContent = formatFileSize(file.size);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.setAttribute("aria-label", `Remove ${file.name}`);
    removeButton.textContent = "×";
    removeButton.addEventListener("click", () => {
      selectedFiles.splice(index, 1);
      syncFileInput();
      renderSelectedFiles();
      setFieldMessage("contact-files", "");
    });

    item.append(name, size, removeButton);
    selectedFilesList.append(item);
  });
}

function syncFileInput() {
  if (!fileInput || !("DataTransfer" in window)) return;

  const transfer = new DataTransfer();
  selectedFiles.forEach((file) => transfer.items.add(file));
  fileInput.files = transfer.files;
}

function acceptFiles(incomingFiles) {
  const candidates = [...incomingFiles];
  const combined = [...selectedFiles, ...candidates];
  const errors = validateFiles(combined);

  if (errors.length > 0) {
    setFieldMessage("contact-files", errors[0]);
    return;
  }

  selectedFiles = combined;
  syncFileInput();
  renderSelectedFiles();
  setFieldMessage("contact-files", "");
}

function fieldErrorElement(field) {
  return document.getElementById(`${field.id}-error`);
}

function setFieldMessage(fieldId, message) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(`${fieldId}-error`);

  if (field) field.setAttribute("aria-invalid", String(Boolean(message)));
  if (error) error.textContent = message;
}

function clearFieldError(field) {
  if (!field?.id) return;
  setFieldMessage(field.id, "");
}

function validateField(field) {
  if (!field) return true;

  const value = field.type === "checkbox" ? field.checked : field.value.trim();
  let message = "";

  if (field.required && !value) {
    message = field.type === "checkbox" ? "Consent is required." : "This field is required.";
  } else if (field.type === "email" && value) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value)) message = "Enter a valid email address.";
  } else if (field.type === "url" && value) {
    try {
      const url = new URL(value);
      if (!/^https?:$/.test(url.protocol)) throw new Error("Unsupported protocol");
    } catch {
      message = "Enter a complete http:// or https:// link.";
    }
  } else if (field.id === "contact-message" && value.length < 20) {
    message = "Please provide at least 20 characters of context.";
  }

  setFieldMessage(field.id, message);
  return !message;
}

function validateForm() {
  if (!contactForm) return false;

  const requiredFields = [
    document.getElementById("contact-name"),
    document.getElementById("contact-email"),
    document.getElementById("contact-type"),
    document.getElementById("contact-subject"),
    document.getElementById("contact-message"),
    document.getElementById("contact-consent"),
  ];

  const sourceField = document.getElementById("contact-source");
  const validity = requiredFields.map(validateField);
  validity.push(validateField(sourceField));

  const fileErrors = validateFiles(selectedFiles);
  setFieldMessage("contact-files", fileErrors[0] || "");
  validity.push(fileErrors.length === 0);

  return validity.every(Boolean);
}

function showStatus(message, type = "") {
  if (!formStatus) return;

  formStatus.hidden = false;
  formStatus.textContent = message;
  formStatus.classList.toggle("is-error", type === "error");
  formStatus.classList.toggle("is-success", type === "success");
  formStatus.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

async function sendForm(formData) {
  if (!CONTACT_ENDPOINT) {
    showStatus(
      "The contact interface is complete, but no server endpoint is connected yet. Add your Cloud Function or other secure form endpoint to CONTACT_ENDPOINT in Contact/contact.js before publishing.",
      "error",
    );
    return;
  }

  const response = await fetch(CONTACT_ENDPOINT, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`The server returned status ${response.status}.`);
  }

  showStatus(
    "Your message has been submitted for project review. Please retain your own copy of any original material.",
    "success",
  );

  contactForm.reset();
  selectedFiles = [];
  renderSelectedFiles();
  updateCounter();
  routeButtons.forEach((button) => button.classList.remove("active"));
}

routeButtons.forEach((button) => {
  button.setAttribute("aria-pressed", "false");
  button.addEventListener("click", () => {
    setRoute(button.dataset.routeTarget);
  });
});

menuButton?.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  setMenu(!isOpen);
});

mainNavigation?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

messageInput?.addEventListener("input", () => {
  updateCounter();
  clearFieldError(messageInput);
});

contactForm?.querySelectorAll("input, select, textarea").forEach((field) => {
  field.addEventListener("blur", () => validateField(field));
  field.addEventListener("input", () => clearFieldError(field));
  field.addEventListener("change", () => clearFieldError(field));
});

fileInput?.addEventListener("change", () => {
  acceptFiles(fileInput.files || []);
});

["dragenter", "dragover"].forEach((eventName) => {
  fileDrop?.addEventListener(eventName, (event) => {
    event.preventDefault();
    fileDrop.classList.add("is-dragging");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  fileDrop?.addEventListener(eventName, (event) => {
    event.preventDefault();
    fileDrop.classList.remove("is-dragging");
  });
});

fileDrop?.addEventListener("drop", (event) => {
  acceptFiles(event.dataTransfer?.files || []);
});

contactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!validateForm()) {
    showStatus("Please correct the marked fields before submitting.", "error");
    const firstInvalid = contactForm.querySelector('[aria-invalid="true"]');
    firstInvalid?.focus();
    return;
  }

  const formData = new FormData(contactForm);
  selectedFiles.forEach((file) => formData.append("attachments", file));

  try {
    if (submitButton) submitButton.disabled = true;
    await sendForm(formData);
  } catch (error) {
    console.error(error);
    showStatus(
      "The message could not be submitted. Check the endpoint configuration and try again.",
      "error",
    );
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
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
updateCounter();
setupRevealObserver();
