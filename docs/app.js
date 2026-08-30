const STATUS_LABELS = {
  open: "Open",
  rolling: "Rolling",
  closed: "Closed",
  paused: "Paused",
  invite: "Invite",
  gated: "Gated",
  "see-site": "See site",
};

const CATEGORY_LABELS = {
  ai: "AI",
  "dev-tool": "Dev tool",
  other: "Other",
};

const state = {
  programs: [],
  asOf: "31 Aug 2026",
  search: "",
  status: "all",
  category: "all",
  showStudent: false,
};

const els = {
  asOf: document.getElementById("as-of"),
  featured: document.getElementById("featured-list"),
  index: document.getElementById("index-list"),
  featuredHead: document.getElementById("featured-head"),
  indexHead: document.getElementById("index-head"),
  empty: document.getElementById("empty"),
  progressText: document.getElementById("progress-text"),
  progressFill: document.getElementById("progress-fill"),
  search: document.getElementById("search"),
  studentToggle: document.getElementById("student-toggle"),
  statusFilters: document.getElementById("status-filters"),
  categoryFilters: document.getElementById("category-filters"),
  themeToggle: document.getElementById("theme-toggle"),
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isGated(program) {
  return Boolean(program.studentOnly || program.gatedReason || program.status === "gated");
}

function matches(program) {
  if (!state.showStudent && program.studentOnly) return false;
  if (state.status !== "all") {
    if (state.status === "gated") {
      if (!isGated(program)) return false;
    } else if (program.status !== state.status) {
      return false;
    }
  }
  if (state.category !== "all" && program.category !== state.category) return false;
  if (state.search) {
    const hay = [
      program.name,
      program.company,
      program.product,
      program.whatTheyDo,
      program.eligibility,
      program.statusNote,
      program.perks,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!hay.includes(state.search)) return false;
  }
  return true;
}

function stampHtml(program) {
  const stamps = [`<span class="stamp ${program.status}">${STATUS_LABELS[program.status] || program.status}</span>`];
  if (program.studentOnly || program.gatedReason === "student") {
    stamps.push('<span class="stamp gated">Gated</span>');
  } else if (program.gatedReason === "audience" && program.status !== "gated") {
    stamps.push('<span class="stamp gated">Gated</span>');
  }
  return stamps.join("");
}

function linkLabel(url) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function renderEntry(program, index, compact) {
  const applyDifferent = program.applyUrl && program.applyUrl !== program.url;
  const perks = program.featured && program.perks
    ? `<div><dt>Published support</dt><dd>${escapeHtml(program.perks)}</dd></div>`
    : "";
  const note = program.statusNote
    ? `<div><dt>Status note</dt><dd>${escapeHtml(program.statusNote)}</dd></div>`
    : "";

  return `
    <article class="entry ${compact ? "compact" : "featured"}" data-id="${escapeHtml(program.id)}">
      <div class="entry-top">
        <span class="entry-num">${String(index).padStart(2, "0")}</span>
        <div class="stamps">${stampHtml(program)}</div>
      </div>
      <h3>${escapeHtml(program.name)}</h3>
      <p class="product">${escapeHtml(program.product)}</p>
      <dl class="facts">
        <div><dt>What ambassadors do</dt><dd>${escapeHtml(program.whatTheyDo)}</dd></div>
        <div><dt>Eligibility</dt><dd>${escapeHtml(program.eligibility)}</dd></div>
        ${perks}
        ${note}
      </dl>
      <div class="links">
        <a href="${escapeHtml(program.url)}" rel="noopener noreferrer">Official · ${escapeHtml(linkLabel(program.url))}</a>
        ${applyDifferent ? `<a href="${escapeHtml(program.applyUrl)}" rel="noopener noreferrer">Apply · ${escapeHtml(linkLabel(program.applyUrl))}</a>` : ""}
      </div>
    </article>
  `;
}

function renderChips(container, options, current, onPick) {
  container.innerHTML = options
    .map(([value, label]) => (
      `<button type="button" class="chip" data-value="${value}" aria-pressed="${value === current}">${label}</button>`
    ))
    .join("");
  container.querySelectorAll(".chip").forEach((button) => {
    button.addEventListener("click", () => onPick(button.dataset.value));
  });
}

function render() {
  const visible = state.programs.filter(matches);
  const featured = visible.filter((program) => program.featured);
  const rest = visible.filter((program) => !program.featured);
  const hidden = state.programs.length - visible.length;

  els.featured.innerHTML = featured.map((program, i) => renderEntry(program, i + 1, false)).join("");
  els.index.innerHTML = rest.map((program, i) => renderEntry(program, featured.length + i + 1, true)).join("");
  els.featuredHead.hidden = featured.length === 0;
  els.indexHead.hidden = rest.length === 0;
  els.empty.hidden = visible.length > 0;

  const ratio = state.programs.length ? visible.length / state.programs.length : 0;
  els.progressFill.style.width = `${Math.round(ratio * 100)}%`;
  els.progressText.textContent = `${visible.length} showing · ${hidden} filtered · ${state.programs.length} in the ledger · ${state.asOf}`;
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  els.themeToggle.textContent = theme === "dark" ? "Paper" : "Ink";
  localStorage.setItem("ledger-theme", theme);
}

function initFilters() {
  renderChips(
    els.statusFilters,
    [["all", "All"], ...Object.entries(STATUS_LABELS)],
    state.status,
    (value) => {
      state.status = value;
      initFilters();
      render();
    }
  );
  renderChips(
    els.categoryFilters,
    [["all", "All"], ...Object.entries(CATEGORY_LABELS)],
    state.category,
    (value) => {
      state.category = value;
      initFilters();
      render();
    }
  );
}

els.search.addEventListener("input", (event) => {
  state.search = event.target.value.trim().toLowerCase();
  render();
});

els.studentToggle.addEventListener("change", (event) => {
  state.showStudent = event.target.checked;
  render();
});

els.themeToggle.addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
});

const savedTheme = localStorage.getItem("ledger-theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
applyTheme(savedTheme || (prefersDark ? "dark" : "light"));

initFilters();

fetch("./programs.json")
  .then((response) => {
    if (!response.ok) throw new Error(`Could not read programs.json (${response.status})`);
    return response.json();
  })
  .then((data) => {
    state.programs = data.programs || [];
    state.asOf = data.asOf || state.asOf;
    els.asOf.textContent = `As of ${state.asOf}`;
    render();
  })
  .catch((error) => {
    els.progressText.textContent = error.message;
    els.empty.hidden = false;
    els.empty.textContent = "The ledger file did not load. If you opened the HTML as a file, serve the docs folder instead.";
  });
