const search = document.querySelector("#search");
const filters = [...document.querySelectorAll("[data-category-filter]")];
const cards = [...document.querySelectorAll("[data-app-card]")];
let category = "All";
function filterApps() {
  const query = (search?.value || "").trim().toLowerCase();
  let visible = 0;
  for (const card of cards) {
    card.hidden = !(
      (category === "All" || card.dataset.category === category) &&
      card.dataset.search.includes(query)
    );
    if (!card.hidden) visible++;
  }
  document.querySelector("#result-count").textContent =
    `${visible} ${visible === 1 ? "app" : "apps"} to explore`;
  document.querySelector("#empty").hidden = visible > 0;
  for (const button of filters)
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.categoryFilter === category),
    );
}
search?.addEventListener("input", filterApps);
for (const button of filters)
  button.addEventListener("click", () => {
    category = button.dataset.categoryFilter;
    filterApps();
  });
document.querySelector("#clear-search")?.addEventListener("click", () => {
  search.value = "";
  category = "All";
  filterApps();
  search.focus();
});
let noticeTimer;
function announce(message) {
  const node = document.querySelector("#announcement");
  clearTimeout(noticeTimer);
  node.textContent = message;
  noticeTimer = setTimeout(() => {
    node.textContent = "";
  }, 7000);
}
for (const button of document.querySelectorAll("[data-copy]"))
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      announce("Command copied. Paste it into your agent or Mac terminal.");
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(button.parentElement.querySelector("code"));
      selection.removeAllRanges();
      selection.addRange(range);
      announce(
        "Copy was blocked. The command is selected; press ⌘C to copy it.",
      );
    }
  });
for (const link of document.querySelectorAll("[data-install]"))
  link.addEventListener("click", () => {
    announce(
      "Opening NodeLauncher. If nothing happens, use “Didn’t open?” below.",
    );
  });
