(() => {
  "use strict";

  const form = document.getElementById("material-submission-form");
  const status = document.getElementById("submission-status");
  const fileInput = document.getElementById("submission-files");
  const fileStatus = document.getElementById("submission-file-status");

  const pagesScanned = document.getElementById("pages-scanned");

  let scannedCount = 1;

  setInterval(() => {
    scannedCount += 1;

    if (pagesScanned) {
      pagesScanned.textContent = String(scannedCount).padStart(3, "0");
    }
  }, 2000);

  if (!form) return;

  fileInput?.addEventListener("change", () => {
    const files = [...fileInput.files];

    if (!fileStatus) return;

    if (files.length === 0) {
      fileStatus.textContent = "No files selected";
      return;
    }

    if (files.length === 1) {
      fileStatus.textContent = files[0].name;
      return;
    }

    fileStatus.textContent = `${files.length} files selected`;
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (!fileInput?.files.length) {
      if (status) {
        status.textContent = "Please select at least one file.";
      }
      return;
    }

    if (status) {
      status.textContent =
        "Form ready. Backend connection is required before materials can be submitted.";
    }
  });
})();
