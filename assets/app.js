document.addEventListener("DOMContentLoaded", () => {
  const year = document.querySelector("[data-year]");
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  const copyButton = document.querySelector("[data-copy]");
  if (copyButton) {
    copyButton.addEventListener("click", () => {
      const value = copyButton.getAttribute("data-copy");
      if (!value) {
        return;
      }
      navigator.clipboard.writeText(value).then(() => {
        copyButton.textContent = "Link copied";
        setTimeout(() => {
          copyButton.textContent = "Copy shareable link";
        }, 2000);
      });
    });
  }
});
