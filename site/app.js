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
    `${visible} ${visible === 1 ? "app" : "apps"}`;
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
      "Opening PicoRunner. If nothing happens, use “Didn’t open?” below.",
    );
  });

const githubRepository = (value) => {
  const match = value
    .trim()
    .replace(/\.git\/?$/, "")
    .match(
      /^https:\/\/github\.com\/([A-Za-z0-9_][A-Za-z0-9_.-]*)\/([A-Za-z0-9_][A-Za-z0-9_.-]*)\/?$/,
    );
  return match ? `https://github.com/${match[1]}/${match[2]}` : null;
};

const badgeForm = document.querySelector("#badge-generator");
badgeForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.querySelector("#badge-repository");
  const error = document.querySelector("#badge-error");
  const output = document.querySelector("#badge-output");
  const code = document.querySelector("#badge-markdown");
  const repository = githubRepository(input.value);
  if (!repository) {
    error.textContent = "Enter a public GitHub repository URL with an owner and repository name.";
    output.hidden = true;
    return;
  }
  const launch = `${location.origin}/launch/?repository=${encodeURIComponent(repository)}`;
  code.textContent = `[![Launch on PicoRunner](${location.origin}/badges/launch.svg)](${launch})`;
  error.textContent = "";
  output.hidden = false;
});

document.querySelector("#copy-badge")?.addEventListener("click", async () => {
  const value = document.querySelector("#badge-markdown")?.textContent || "";
  if (!value) return;
  try {
    await navigator.clipboard.writeText(value);
    announce("README badge copied.");
  } catch {
    announce("Copy was blocked. Select the badge Markdown and press ⌘C.");
  }
});

const launchPage = document.querySelector("[data-launch-page]");
if (launchPage) {
  const repository = githubRepository(
    new URLSearchParams(location.search).get("repository") || "",
  );
  const summary = document.querySelector("#launch-summary");
  const repositoryNode = document.querySelector("#launch-repository");
  const button = document.querySelector("#launch-button");
  const source = document.querySelector("#launch-source");
  const error = document.querySelector("#launch-error");
  if (repository) {
    summary.textContent =
      "PicoRunner will show the repository and its setup for review before downloading anything.";
    repositoryNode.textContent = repository;
    button.href = `picorunner://install?repository=${encodeURIComponent(repository)}`;
    button.hidden = false;
    button.addEventListener("click", () => {
      announce("Opening PicoRunner. You will review the repository in the app.");
    });
    source.href = repository;
    source.hidden = false;
    error.textContent = "";
  } else {
    summary.textContent = "This launch link is incomplete.";
    repositoryNode.textContent = "No valid public GitHub repository was provided.";
    error.textContent =
      "Ask the project maintainer for a new Launch on PicoRunner link.";
  }
}
