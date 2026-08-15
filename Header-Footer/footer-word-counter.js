const footerMessage = document.getElementById("footer-contact-message");
const footerWordCount = document.getElementById("footer-contact-word-count");

if (footerMessage && footerWordCount) {
  footerMessage.addEventListener("input", () => {
    let words = footerMessage.value.trim().split(/\s+/).filter(Boolean);

    if (words.length > 100) {
      words = words.slice(0, 100);
      footerMessage.value = words.join(" ");
    }

    footerWordCount.textContent = words.length;
  });
}
