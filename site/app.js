const siteHeader = document.querySelector(".header");
const siteNav = document.querySelector("#site-nav");
const navToggle = document.querySelector(".nav-toggle");
const navToggleText = navToggle?.querySelector(".nav-toggle-text");

function setNavigationOpen(open) {
  if (!siteHeader || !navToggle) return;
  siteHeader.classList.toggle("nav-open", open);
  navToggle.setAttribute("aria-expanded", String(open));
  if (navToggleText) navToggleText.textContent = open ? "Close" : "Menu";
}

navToggle?.addEventListener("click", () => {
  setNavigationOpen(navToggle.getAttribute("aria-expanded") !== "true");
});

for (const link of siteNav?.querySelectorAll("a") || []) {
  link.addEventListener("click", () => setNavigationOpen(false));
}

document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    navToggle?.getAttribute("aria-expanded") === "true"
  ) {
    setNavigationOpen(false);
    navToggle.focus();
  }
});

document.addEventListener("click", (event) => {
  if (
    navToggle?.getAttribute("aria-expanded") === "true" &&
    siteHeader &&
    !siteHeader.contains(event.target)
  )
    setNavigationOpen(false);
});

const desktopNavigation = window.matchMedia("(min-width: 761px)");
desktopNavigation.addEventListener?.("change", (event) => {
  if (event.matches) setNavigationOpen(false);
});

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
      announce("Copied to your clipboard.");
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
      "Opening PicoRunner. If nothing happens, use “Button not working?” below.",
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
      "PicoRunner will show you this app’s details before you choose to install it.";
    repositoryNode.textContent = repository;
    button.href = `picorunner://install?repository=${encodeURIComponent(repository)}`;
    button.hidden = false;
    button.addEventListener("click", () => {
      announce("Opening PicoRunner. You can review the app before installing.");
    });
    source.href = repository;
    source.hidden = false;
    error.textContent = "";
  } else {
    summary.textContent = "This launch link is incomplete.";
    repositoryNode.textContent = "This link is missing a valid GitHub app address.";
    error.textContent =
      "Ask the app’s creator for a new link.";
  }
}

// Accessible manifest format tabs: selection follows keyboard focus.
const manifestTabs = [...document.querySelectorAll('.manifest-tabs [role="tab"]')];
function selectManifestTab(selected) {
  for (const tab of manifestTabs) {
    const active = tab === selected;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
  }
}
manifestTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectManifestTab(tab));
  tab.addEventListener('keydown', (event) => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % manifestTabs.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + manifestTabs.length) % manifestTabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = manifestTabs.length - 1;
    else return;
    event.preventDefault();
    selectManifestTab(manifestTabs[next]);
    manifestTabs[next].focus();
  });
});

// An in-app walkthrough: search, click, prepare, then launch. No real apps are installed.
for (const showcase of document.querySelectorAll('[data-product-showcase]')) {
  const tabs = [...showcase.querySelectorAll('[role="tab"]')];
  const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
  const caption = showcase.querySelector('[data-product-caption]');
  const toggle = showcase.querySelector('[data-product-autoplay]');
  const cursor = showcase.querySelector('.product-demo-cursor');
  const search = showcase.querySelector('[data-demo-search]');
  const input = showcase.querySelector('[data-demo-url]');
  const progress = showcase.querySelector('[data-demo-progress]');
  const library = panels[2];
  const runningCard = library.querySelector('.product-card:last-child');
  const runningStatus = runningCard.querySelector('.product-status');
  const startLabel = runningCard.querySelector('.product-start');
  const runningCount = library.querySelector('.product-stats > div:nth-child(2) b');
  const memory = library.querySelector('.product-stats > div:nth-child(3) b');
  const runningFilter = library.querySelector('.product-filters > span:nth-child(2) b');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = motion.matches;
  let visible = false;
  let elapsed = 0;
  let previous = 0;
  let selected = -1;
  let frame = 0;
  const duration = 18000;
  const select = index => {
    if (selected === index) return;
    selected = index;
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
    });
    caption.textContent = tabs[index].dataset.description;
  };
  const draw = () => {
    const t = elapsed;
    select(t < 5000 ? 0 : t < 11000 ? 1 : 2);
    let action = 'browse', x = 93, y = 85;
    if (t >= 1000 && t < 2800) { action = 'search'; x = 80; y = 32; }
    else if (t >= 2800 && t < 5000) { action = t > 4250 ? 'choose-click' : 'choose'; x = 24; y = 81; }
    else if (t >= 5000 && t < 7000) { action = 'type'; x = 49; y = 48; }
    else if (t >= 7000 && t < 7800) { action = 'install-click'; x = 63; y = 64; }
    else if (t >= 7800 && t < 11000) { action = 'installing'; x = 77; y = 76; }
    else if (t >= 11000 && t < 12800) { action = 'library'; x = 92; y = 85; }
    else if (t >= 12800 && t < 14000) { action = 'start-click'; x = 82; y = 81; }
    else if (t >= 14000) { action = t > 15900 ? 'open-click' : 'running'; x = 82; y = 81; }
    showcase.dataset.demoAction = action;
    cursor.style.left = x + '%'; cursor.style.top = y + '%';
    const query = 'Moodist';
    search.textContent = t < 1400 ? 'Search apps…' : query.slice(0, Math.max(0, Math.floor((t - 1400) / 130)));
    const url = 'https://github.com/remvze/moodist';
    input.textContent = url.slice(0, Math.max(0, Math.floor((t - 5300) / 45)));
    const preparation = Math.min(1, Math.max(0, (t - 7800) / 2800));
    progress.style.width = (preparation * 100) + '%';
    showcase.querySelectorAll('[data-demo-step]').forEach((step, i) => step.classList.toggle('complete', preparation >= (i + 1) / 3));
    const running = t >= 14000;
    runningCard.classList.toggle('demo-running', running);
    runningStatus.textContent = running ? '● Running' : '● Stopped';
    startLabel.lastChild.textContent = running ? ' Open' : ' Start';
    runningCount.textContent = running ? '1' : '0';
    runningFilter.textContent = running ? '1' : '0';
    memory.textContent = running ? '128 MB' : '0 MB';
    showcase.style.setProperty('--demo-progress', (t / duration * 100) + '%');
  };
  const tick = now => {
    frame = 0;
    if (previous) elapsed = (elapsed + Math.min(now - previous, 100)) % duration;
    previous = now;
    draw();
    frame = requestAnimationFrame(tick);
  };
  const schedule = () => {
    cancelAnimationFrame(frame); frame = 0; previous = 0;
    const playing = !paused && visible && !document.hidden && !motion.matches;
    showcase.classList.toggle('demo-playing', playing);
    if (playing) frame = requestAnimationFrame(tick);
  };
  const updateToggle = () => {
    toggle.setAttribute('aria-label', paused ? 'Play animation' : 'Pause animation');
    toggle.firstElementChild.textContent = paused ? '▶' : 'Ⅱ';
    schedule();
  };
  const jump = index => {
    elapsed = [0, 5200, 11200][index];
    draw(); updateToggle();
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => jump(index));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault(); jump(next); tabs[next].focus();
    });
  });
  for (const link of document.querySelectorAll('[data-demo-jump]')) {
    link.addEventListener('click', event => {
      event.preventDefault();
      jump(Number(link.dataset.demoJump));
      showcase.querySelector('.product-preview').scrollIntoView({behavior: motion.matches ? 'instant' : 'smooth', block: 'start'});
    });
  }
  toggle.hidden = false;
  toggle.addEventListener('click', () => { paused = !paused; updateToggle(); });
  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', () => { paused = motion.matches; updateToggle(); });
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }, {threshold: .25}).observe(showcase);
  draw(); updateToggle();
}
