// Book behavior: theme, review mode, table sort, search, mobile navigation.
(() => {
  "use strict";

  const store = {
    get(key, fallback) {
      try {
        const value = localStorage.getItem("book." + key);
        return value === null ? fallback : JSON.parse(value);
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem("book." + key, JSON.stringify(value));
      } catch {
        // Private browsing: the page works without stored preferences.
      }
    },
  };

  // Theme: stored choice wins, otherwise the system preference.
  const root = document.documentElement;
  const storedTheme = store.get("theme", null);
  if (storedTheme === "dark" || storedTheme === "light") {
    root.dataset.theme = storedTheme;
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    root.dataset.theme = "dark";
  }
  document.getElementById("themeToggle")?.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    store.set("theme", root.dataset.theme);
  });

  // Review mode: reveals the review notes on every page.
  const reviewToggle = document.getElementById("reviewToggle");
  const reviewOn = store.get("review", false);
  document.body.classList.toggle("review", reviewOn);
  reviewToggle?.setAttribute("aria-pressed", String(reviewOn));
  reviewToggle?.addEventListener("click", () => {
    const on = !document.body.classList.contains("review");
    document.body.classList.toggle("review", on);
    reviewToggle.setAttribute("aria-pressed", String(on));
    store.set("review", on);
  });

  // Mobile navigation.
  const navToggle = document.getElementById("navToggle");
  navToggle?.addEventListener("click", () => {
    const open = !document.body.classList.contains("nav-open");
    document.body.classList.toggle("nav-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  });

  // Sortable index tables. A header button sorts by its column; the status
  // column sorts by the cell's data value so the order is stable.
  document.querySelectorAll("table.sortable").forEach((table) => {
    const body = table.querySelector("tbody");
    if (!body) return;
    table.querySelectorAll("th button[data-sort]").forEach((button) => {
      button.addEventListener("click", () => {
        const column = Number(button.dataset.sort);
        const ascending = button.dataset.direction !== "asc";
        table.querySelectorAll("th button[data-sort]").forEach((other) => {
          other.dataset.direction = "";
          other.querySelector(".arrow")?.remove();
        });
        button.dataset.direction = ascending ? "asc" : "desc";
        button.insertAdjacentHTML("beforeend", `<span class="arrow" aria-hidden="true">${ascending ? " ▲" : " ▼"}</span>`);
        const rows = [...body.querySelectorAll("tr")];
        rows.sort((a, b) => {
          const left = a.cells[column];
          const right = b.cells[column];
          const l = (left?.dataset.value ?? left?.textContent ?? "").trim();
          const r = (right?.dataset.value ?? right?.textContent ?? "").trim();
          const order = l.localeCompare(r, undefined, { numeric: true });
          return ascending ? order : -order;
        });
        body.replaceChildren(...rows);
      });
    });
  });

  // Search page: filter the generated index over titles and ids. The index
  // is embedded in the page, so search works when the site opens as files;
  // over http the page falls back to search.json when no embed is present.
  const searchBox = document.getElementById("search-results");
  if (searchBox) {
    const input = document.getElementById("q");
    const params = new URLSearchParams(window.location.search);
    const initial = params.get("q") || "";
    if (input && initial) input.value = initial;
    const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[char]);
    let entries = Array.isArray(window.bookSearchIndex) ? window.bookSearchIndex : null;
    const render = () => {
      const query = (input?.value || "").trim().toLowerCase();
      if (!query) {
        searchBox.innerHTML = "<p>Type above to search.</p>";
        return;
      }
      if (entries === null) {
        searchBox.innerHTML = "<p>Loading the search index.</p>";
        return;
      }
      const words = query.split(/\s+/);
      const matches = entries.filter((entry) => {
        const haystack = `${entry.title} ${entry.id} ${entry.type}`.toLowerCase();
        return words.every((word) => haystack.includes(word));
      }).slice(0, 100);
      if (matches.length === 0) {
        searchBox.innerHTML = "<p>No record matches.</p>";
        return;
      }
      searchBox.innerHTML = `<p>${matches.length} match${matches.length === 1 ? "" : "es"}.</p>` +
        matches.map((entry) =>
          `<div class="result"><a href="${escapeHtml(entry.url)}">${escapeHtml(entry.title)}</a> ` +
          `<span class="mono dim">${escapeHtml(entry.id)}</span></div>`).join("");
    };
    if (entries === null) {
      fetch("search.json")
        .then((response) => {
          if (!response.ok) throw new Error("missing index");
          return response.json();
        })
        .then((data) => {
          entries = Array.isArray(data) ? data : [];
          render();
        })
        .catch(() => {
          searchBox.innerHTML = "<p>The search index could not be loaded.</p>";
        });
    } else {
      render();
    }
    input?.addEventListener("input", render);
  }
})();
