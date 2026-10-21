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

// A catalog walkthrough driven by explicit app states, with targets measured from the UI.
for (const showcase of document.querySelectorAll('[data-product-showcase]')) {
  import(showcase.dataset.demoModel).then(({demoFrameAt, DEMO_DURATION, CHAPTER_STARTS}) => {
    const tabs = [...showcase.querySelectorAll('[role="tab"]')];
    const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
    const caption = showcase.querySelector('[data-product-caption]');
    const toggle = showcase.querySelector('[data-product-autoplay]');
    const cursor = showcase.querySelector('.product-demo-cursor');
    const title = showcase.querySelector('[data-demo-title]');
    const hint = showcase.querySelector('[data-demo-hint]');
    const newApp = panels[2].querySelector('[data-demo-new-app]');
    const runningStatus = newApp.querySelector('.product-status');
    const startLabel = newApp.querySelector('.product-start');
    const stats = panels[2].querySelectorAll('.product-stats b');
    const filters = panels[2].querySelectorAll('.product-filters b');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let paused = motion.matches, visible = false, elapsed = 0, previous = 0, selected = -1, frame = 0;
    let lastStep = '', pointerTarget = null;
    const positionPointer = () => {
      if (!pointerTarget) { cursor.style.opacity = '0'; return; }
      const target = pointerTarget.getBoundingClientRect();
      const viewport = showcase.querySelector('.product-preview').getBoundingClientRect();
      cursor.style.opacity = '1';
      cursor.style.left = `${target.left + target.width / 2 - viewport.left}px`;
      cursor.style.top = `${target.top + target.height / 2 - viewport.top}px`;
    };
    const draw = () => {
      const state = demoFrameAt(elapsed);
      if (selected !== state.chapter) {
        selected = state.chapter;
        tabs.forEach((tab, i) => {
          tab.setAttribute('aria-selected', String(i === selected)); tab.tabIndex = i === selected ? 0 : -1;
          panels[i].hidden = i !== selected;
        });
        caption.textContent = tabs[selected].dataset.description;
      }
      showcase.dataset.demoAction = state.id;
      showcase.dataset.demoFiltered = String(state.filtered);
      showcase.dataset.demoClick = String(Boolean(state.click));
      showcase.dataset.demoResetting = String(state.resetting);
      showcase.querySelectorAll('[data-demo-search]').forEach(node => { node.textContent = state.query || 'Search apps…'; });
      if (state.title) { title.textContent = state.title; hint.textContent = state.hint; }
      showcase.querySelectorAll('[data-demo-step]').forEach((node, i) => node.classList.toggle('complete', state.completed[i]));
      newApp.hidden = !state.installed;
      newApp.classList.toggle('demo-running', state.running);
      runningStatus.textContent = state.running ? '● Running' : '● Stopped';
      startLabel.lastChild.textContent = state.running ? ' Open' : ' Start';
      stats[0].textContent = String(state.installedCount); stats[1].textContent = String(state.runningCount);
      stats[1].nextElementSibling.textContent = state.runningCount === 1 ? 'active app' : 'active apps';
      stats[2].textContent = state.running ? '—' : '0 MB';
      filters[0].textContent = String(state.installedCount); filters[1].textContent = String(state.runningCount);
      if (state.id !== lastStep) {
        lastStep = state.id;
        pointerTarget = state.target ? panels[selected].querySelector(`[data-demo-target="${state.target}"]`) : null;
        positionPointer();
      }
    };
    const tick = now => {
      frame = 0;
      if (previous) elapsed = Math.min(elapsed + Math.min(now - previous, 100), DEMO_DURATION);
      previous = now; draw();
      if (elapsed >= DEMO_DURATION) { paused = true; updateToggle(); return; }
      frame = requestAnimationFrame(tick);
    };
    const schedule = () => {
      cancelAnimationFrame(frame); frame = 0; previous = 0;
      const playing = !paused && visible && !document.hidden && !motion.matches;
      showcase.classList.toggle('demo-playing', playing);
      if (playing) frame = requestAnimationFrame(tick);
    };
    const updateToggle = () => {
      toggle.setAttribute('aria-label', elapsed >= DEMO_DURATION ? 'Replay animation' : paused ? 'Play animation' : 'Pause animation');
      toggle.firstElementChild.textContent = paused ? '▶' : 'Ⅱ'; schedule();
    };
    const jump = index => { elapsed = CHAPTER_STARTS[index]; draw(); updateToggle(); };
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
    for (const link of document.querySelectorAll('[data-demo-jump]')) link.addEventListener('click', event => {
      event.preventDefault(); jump(Number(link.dataset.demoJump));
      showcase.querySelector('.product-preview').scrollIntoView({behavior: motion.matches ? 'instant' : 'smooth', block:'start'});
    });
    toggle.hidden = false; toggle.addEventListener('click', () => {
      if (elapsed >= DEMO_DURATION) { elapsed = 0; draw(); }
      paused = !paused; updateToggle();
    });
    window.addEventListener('resize', positionPointer, {passive:true});
    document.addEventListener('visibilitychange', schedule);
    motion.addEventListener('change', () => { paused = motion.matches; updateToggle(); });
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }, {threshold:.25}).observe(showcase);
    draw(); updateToggle();
  }).catch(error => console.error('PicoRunner preview could not start:', error));
}

// Home illustrations reveal once; only visible artwork receives scroll-linked updates.
if (document.querySelector('.pick-art') && 'IntersectionObserver' in window) {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  const revealTargets = [...document.querySelectorAll('.featured-catalog .section-heading, .featured-catalog .app-card, .journey-copy, .journey-path > article, .help-window, .help-copy, .faq > div, .closing')];
  const artwork = [...document.querySelectorAll('.pick-art')];
  const visibleArtwork = new Set();
  let motionFrame = 0;
  const paint = () => {
    motionFrame = 0;
    if (preference.matches || document.hidden) return;
    for (const element of visibleArtwork) {
      const rect = element.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
      element.style.setProperty('--scroll-drift', ((progress - .5) * 18).toFixed(2));
      element.style.setProperty('--scroll-tilt', ((progress - .5) * 3).toFixed(2));
    }
  };
  const requestPaint = () => {
    if (!preference.matches && !motionFrame && !document.hidden) motionFrame = requestAnimationFrame(paint);
  };
  const revealObserver = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.classList.add('is-revealed');
      revealObserver.unobserve(entry.target);
    }
  }, {threshold: .12, rootMargin: '0px 0px -32px 0px'});
  revealTargets.forEach(element => {
    element.setAttribute('data-home-reveal', '');
    if (element.matches('.featured-catalog .app-card')) {
      const index = [...element.parentElement.children].indexOf(element);
      element.style.setProperty('--reveal-delay', (index * 80) + 'ms');
    }
    revealObserver.observe(element);
  });
  const artworkObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) visibleArtwork.add(entry.target);
      else visibleArtwork.delete(entry.target);
    }
    requestPaint();
  }, {rootMargin: '60px 0px'});
  artwork.forEach(element => artworkObserver.observe(element));
  const syncPreference = () => {
    root.classList.toggle('scroll-motion', !preference.matches);
    if (preference.matches) { cancelAnimationFrame(motionFrame); motionFrame = 0; }
    else requestPaint();
  };
  preference.addEventListener('change', syncPreference);
  window.addEventListener('scroll', requestPaint, {passive: true});
  window.addEventListener('resize', requestPaint, {passive: true});
  document.addEventListener('visibilitychange', requestPaint);
  syncPreference();
}
