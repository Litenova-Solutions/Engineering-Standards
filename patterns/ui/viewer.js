/* The registry viewer. Reads the embedded data, renders one view at a time,
   and keeps the reviewer's choices in one file. */
(function () {
  "use strict";

  var DATA = JSON.parse(document.getElementById("registry-data").textContent);
  var doc = document;
  var root = doc.documentElement;

  // ---------- data ----------
  var ITEMS = [];
  var BY_ID = {};
  DATA.categories.forEach(function (cat, ci) {
    cat.items.forEach(function (item) {
      item.cat = cat;
      item.index = ITEMS.length;
      item.catIndex = ci;
      ITEMS.push(item);
      BY_ID[item.id] = item;
    });
  });
  var TOTAL_OPTIONS = ITEMS.reduce(function (s, i) { return s + i.variants.length; }, 0);

  // ---------- storage ----------
  function load(key, fallback) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
  }
  function store(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* private window */ }
  }

  var UI_KEY = "ui-patterns.viewer.v1";
  var CHOICES_KEY = "ui-patterns.choices.v1";
  var ui = Object.assign(
    { view: "overview", item: ITEMS[0].id, opt: 0, theme: "light", width: "1280", scale: true, canvas: "natural",
      nav: true, filter: "all", showScope: "item", showWhy: true, showCanvas: "full" },
    load(UI_KEY, {})
  );
  var choices = Object.assign({ items: {}, notes: "", updated: null }, load(CHOICES_KEY, {}));

  function saveUi() { store(UI_KEY, ui); }

  // ---------- helpers ----------
  function el(tag, attrs, kids) {
    var n = doc.createElement(tag);
    if (attrs) for (var k in attrs) {
      var v = attrs[k];
      if (v == null || v === false) continue;
      if (k === "class") n.className = v;
      else if (k === "html") n.innerHTML = v;
      else if (k === "text") n.textContent = v;
      else if (k.slice(0, 2) === "on") n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? "" : v);
    }
    (kids || []).forEach(function (c) { if (c != null) n.appendChild(typeof c === "string" ? doc.createTextNode(c) : c); });
    return n;
  }
  function $(sel) { return doc.querySelector(sel); }
  function plain(html) { var d = doc.createElement("div"); d.innerHTML = html || ""; return d.textContent.replace(/\s+/g, " ").trim(); }
  function letter(i) { return "abcdefghijklmnopqrstuvwxyz"[i] || "v" + (i + 1); }
  function clampOpt(item, i) { return Math.max(0, Math.min(item.variants.length - 1, i)); }
  function currentItem() { return BY_ID[ui.item] || ITEMS[0]; }

  function itemChoice(item) { return choices.items[item.id] || { choice: null, shortlist: [], note: "" }; }
  function isChosen(item, v) { return itemChoice(item).choice === v.id; }
  function isShort(item, v) { return itemChoice(item).shortlist.indexOf(v.id) >= 0; }
  function decidedCount() {
    return ITEMS.filter(function (i) { return itemChoice(i).choice; }).length;
  }

  function flash(text) {
    var t = el("div", { class: "toast-msg", role: "status", text: text });
    doc.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 1800);
  }

  function tagsFor(item, v, compact) {
    var out = [];
    if (isChosen(item, v)) out.push(el("span", { class: "tag mine", text: "★ Your choice" }));
    else if (isShort(item, v)) out.push(el("span", { class: "tag short", text: "Shortlisted" }));
    if (v.pick) out.push(el("span", { class: "tag rec", text: compact ? "Recommended" : "Recommended" }));
    if (v.shipped) out.push(el("span", { class: "tag ship", text: "Ships today" }));
    if (!!v.author) out.push(el("span", { class: "tag new", text: "New option" }));
    return out;
  }

  // ---------- the shell theme ----------
  function applyShellTheme() {
    var dark = ui.theme === "dark" || (ui.theme === "both" && matchMedia("(prefers-color-scheme: dark)").matches);
    root.classList.toggle("dark", dark);
  }

  // ---------- mock frames ----------
  var frames = {};
  var seq = 0;
  function frameDoc(v, theme, full) {
    var cls = (v.bodyClass || "") + (full ? " fit-full" : "");
    return "<!doctype html><html lang=\"en\"" + (theme === "dark" ? " class=\"dark\"" : "") + "><head><meta charset=\"utf-8\">" +
      "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><style>" + DATA.sheet + "</style></head>" +
      "<body class=\"" + cls + "\"><div class=\"mock-canvas\">" + v.html + "</div><script>" + DATA.boot + "<\/script></body></html>";
  }

  /** One iframe at a real viewport width, scaled down when the room is smaller. */
  function makeFrame(v, theme, width, room, opts) {
    opts = opts || {};
    var scale = opts.scale && width > room ? room / width : 1;
    var name = "mf" + (++seq);
    var iframe = el("iframe", { name: name, title: v.name + ", " + theme, tabindex: opts.focusable ? null : "-1" });
    var startH = opts.minHeight || 400;
    iframe.style.width = width + "px";
    iframe.style.height = startH + "px";
    if (scale < 1) iframe.style.transform = "scale(" + scale + ")";
    var wrap = el("div", { class: "fwrap " + theme + "-frame" }, [iframe]);
    wrap.style.width = Math.floor(width * scale) + "px";
    wrap.style.height = Math.ceil(startH * scale) + "px";
    frames[name] = { iframe: iframe, wrap: wrap, scale: scale, minHeight: opts.minHeight || 0, onOverflow: opts.onOverflow };
    iframe.srcdoc = frameDoc(v, theme, opts.full);
    return wrap;
  }

  addEventListener("message", function (e) {
    var d = e.data;
    if (!d || !d.mockId || !frames[d.mockId]) return;
    var f = frames[d.mockId];
    if (!f.iframe.isConnected) { delete frames[d.mockId]; return; }
    var h = Math.max(d.mockHeight, f.minHeight);
    f.iframe.style.height = h + "px";
    f.wrap.style.height = Math.ceil(h * f.scale) + "px";
    if (f.onOverflow) f.onOverflow(d.overflow);
  });

  function pruneFrames() {
    for (var k in frames) if (!frames[k].iframe.isConnected) delete frames[k];
  }

  /** A mock drawn for a phone or a narrow panel renders at that viewport whatever the preset. */
  function fixedWidth(v) {
    if (/w-phone/.test(v.bodyClass || "")) return 390;
    if (/w-narrow/.test(v.bodyClass || "")) return 480;
    if (/w-tablet/.test(v.bodyClass || "")) return 768;
    return 0;
  }

  /** The width the preset asks for, or the room itself when the preset is Fit. */
  function presetWidth(room) { return ui.width === "fit" ? Math.floor(room) : Number(ui.width); }

  /** Light, dark, or both side by side (stacked when side by side would be unreadable). */
  function renderFrames(host, v, room, opts) {
    opts = opts || {};
    host.innerHTML = "";
    var themes = ui.theme === "both" ? ["light", "dark"] : [ui.theme];
    var gap = 16;
    var both = themes.length === 2;
    var colRoom = both ? (room - gap) / 2 : room;
    var w = fixedWidth(v) || (ui.width === "fit" ? Math.floor(colRoom) : Number(ui.width));
    var stack = both && ui.scale && w > colRoom && colRoom / w < 0.55;
    if (stack) { colRoom = room; if (ui.width === "fit" && !fixedWidth(v)) w = Math.floor(room); }
    host.classList.toggle("stack", !!stack);
    themes.forEach(function (theme) {
      var label = el("div", { class: "frame-label" });
      var effective = ui.scale && w > colRoom ? Math.round((colRoom / w) * 100) : 100;
      label.appendChild(doc.createTextNode(theme + " · " + w + " px" + (effective < 100 ? " · shown at " + effective + "%" : "")));
      var warn = el("span", { class: "warn" });
      label.appendChild(warn);
      var frame = makeFrame(v, theme, w, colRoom, {
        scale: ui.scale, full: ui.canvas === "full", focusable: true,
        onOverflow: function (px) { warn.textContent = px > 1 ? "scrolls sideways by " + px + " px" : ""; },
      });
      host.appendChild(opts.labels === false ? frame : el("div", { class: "frame-col" }, [label, frame]));
    });
  }

  // ---------- the top bar ----------
  function segmented(name, value, options, onPick) {
    var seg = el("div", { class: "seg", role: "group", "aria-label": name });
    options.forEach(function (o) {
      seg.appendChild(el("button", {
        type: "button", "aria-pressed": String(o[0] === value), title: o[2] || null, text: o[1],
        onclick: function () { onPick(o[0]); },
      }));
    });
    return seg;
  }

  function renderTop() {
    var top = $("#top");
    top.innerHTML = "";
    top.appendChild(el("button", {
      class: "b ghost icon", type: "button", "aria-label": "Toggle the index", title: "Toggle the index (n)",
      text: "☰", onclick: toggleNav,
    }));
    top.appendChild(el("div", { class: "brand" }, [
      el("span", { class: "brand-mark", text: "E" }),
      el("span", { class: "hide-sm" }, [el("b", { text: "UI pattern library" }),
        el("small", { text: ITEMS.length + " items · " + TOTAL_OPTIONS + " options · built " + DATA.built })]),
    ]));
    top.appendChild(el("div", { class: "ctl" }, [segmented("View", ui.view, [
      ["overview", "Overview"], ["browse", "Browse", "One option at a time (b)"], ["compare", "Compare", "Every option of the item (g)"],
    ], function (v) { go({ view: v }); })]));
    top.appendChild(el("button", { class: "b sm", type: "button", title: "Slideshow at your full screen width (p)", text: "▶ Slideshow", onclick: function () { openShow(); } }));
    top.appendChild(el("span", { class: "spacer" }));
    top.appendChild(el("div", { class: "ctl" }, [el("span", { class: "cap hide-sm", text: "Theme" }), segmented("Theme", ui.theme, [
      ["light", "Light"], ["dark", "Dark"], ["both", "Both", "Light and dark side by side"],
    ], function (v) { ui.theme = v; saveUi(); applyShellTheme(); renderTop(); renderView(true); })]));
    top.appendChild(el("div", { class: "ctl" }, [el("span", { class: "cap hide-sm", text: "Viewport" }), segmented("Viewport", ui.width, [
      ["390", "390", "Phone"], ["768", "768", "Tablet"], ["1280", "1280", "Laptop"], ["1600", "1600", "Desktop"], ["1920", "1920", "Wide desktop"], ["fit", "Fit", "As wide as the room on your screen"],
    ], function (v) { ui.width = v; saveUi(); renderTop(); renderView(true); })]));
    top.appendChild(el("div", { class: "ctl hide-sm" }, [segmented("Scale", ui.scale ? "on" : "off", [
      ["on", "Scale to fit", "Shrink a wide viewport to the room"], ["off", "1:1", "Real pixels, scroll sideways"],
    ], function (v) { ui.scale = v === "on"; saveUi(); renderTop(); renderView(true); })]));
    top.appendChild(el("div", { class: "ctl hide-sm" }, [segmented("Canvas", ui.canvas, [
      ["natural", "Content 1180", "The application's content width cap"], ["full", "Uncapped", "The mock fills the whole viewport"],
    ], function (v) { ui.canvas = v; saveUi(); renderTop(); renderView(true); })]));
    var n = decidedCount();
    top.appendChild(el("button", { class: "b sm", type: "button", title: "Your choices and the file they are written to (o)", onclick: openPanel }, [
      el("span", { class: "progress-pill" }, [
        el("span", { class: "bar-meter" }, [(function () { var i = el("i"); i.style.width = (100 * n / ITEMS.length) + "%"; return i; })()]),
        el("span", { text: n + "/" + ITEMS.length + " chosen" }),
      ]),
    ]));
    top.appendChild(el("span", { class: "save-state " + saveStateClass(), id: "save-state", title: saveStateText(), text: saveStateText() }));
  }

  function toggleNav() {
    if (matchMedia("(max-width: 860px)").matches) $("#app").classList.toggle("nav-open");
    else { ui.nav = !ui.nav; saveUi(); $("#app").classList.toggle("nav-collapsed", !ui.nav); renderView(true); }
  }

  // ---------- the index ----------
  var query = "";
  function matches(item) {
    if (ui.filter === "open" && itemChoice(item).choice) return false;
    if (ui.filter === "chosen" && !itemChoice(item).choice) return false;
    if (ui.filter === "new" && !item.added && !item.variants.some(function (v) { return !!v.author; })) return false;
    if (!query) return true;
    return item.hay.indexOf(query) >= 0;
  }
  function dotFor(item) {
    var c = itemChoice(item);
    return el("span", { class: "dot" + (c.choice ? " chosen" : c.shortlist.length ? " short" : ""), "aria-hidden": "true" });
  }
  function renderNav() {
    var list = $("#nav-list");
    list.innerHTML = "";
    $("#nav-filter").querySelectorAll("button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.f === ui.filter));
    });
    DATA.categories.forEach(function (cat) {
      var items = cat.items.filter(matches);
      if (!items.length) return;
      var done = cat.items.filter(function (i) { return itemChoice(i).choice; }).length;
      var box = el("div", { class: "nav-cat" }, [el("button", {
        type: "button", class: "nav-cat-h", onclick: function () { go({ view: "overview" }); setTimeout(function () { var c = doc.getElementById("cat-" + cat.id); if (c) c.scrollIntoView(); }, 30); },
      }, [cat.title, el("span", { class: "n", text: done + "/" + cat.items.length })])]);
      items.forEach(function (item) {
        box.appendChild(el("button", {
          class: "nav-item", type: "button", "aria-current": String(ui.view !== "overview" && item.id === ui.item),
          title: item.title, onclick: function () { go({ item: item.id, opt: firstOpt(item), view: ui.view === "overview" ? "browse" : ui.view }); $("#app").classList.remove("nav-open"); },
        }, [dotFor(item), el("span", { class: "t", text: item.title }), item.added ? el("span", { class: "new", text: "NEW" }) : null,
          el("span", { class: "n", text: String(item.variants.length) })]));
      });
      list.appendChild(box);
    });
    if (!list.children.length) list.appendChild(el("p", { class: "crumb", style: "padding:10px", text: "Nothing matches. Clear the search or the filter." }));
    var cur = list.querySelector('[aria-current="true"]');
    if (cur && cur.scrollIntoViewIfNeeded) cur.scrollIntoViewIfNeeded(false);
  }
  function firstOpt(item) {
    var c = itemChoice(item);
    var i = c.choice ? item.variants.findIndex(function (v) { return v.id === c.choice; }) : -1;
    return i >= 0 ? i : 0;
  }

  // ---------- views ----------
  var mainEl;
  function roomOf(host) {
    var cs = getComputedStyle(host);
    return host.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  }

  function renderView(keepScroll) {
    var y = keepScroll ? mainEl.scrollTop : 0;
    var hostIn = $("#main-in");
    hostIn.innerHTML = "";
    pruneFrames();
    if (ui.view === "overview") renderOverview(hostIn);
    else if (ui.view === "compare") renderCompare(hostIn);
    else renderBrowse(hostIn);
    renderNav();
    mainEl.scrollTop = y;
  }

  function itemHead(item, host) {
    var c = itemChoice(item);
    var chosen = c.choice && item.variants.find(function (v) { return v.id === c.choice; });
    var head = el("div", { class: "item-head" });
    var left = el("div", {}, [
      el("div", { class: "crumb" }, [
        el("button", { type: "button", text: item.cat.title, onclick: function () { go({ view: "overview" }); } }),
        el("span", { text: "›" }), el("span", { text: "Item " + (item.index + 1) + " of " + ITEMS.length }),
      ]),
      el("h1", {}, [el("span", { text: item.title }),
        item.shipped ? el("span", { class: "tag ship", text: "Ships today" }) : null,
        item.added ? el("span", { class: "tag new", text: "New item" }) : null,
        item.floorplan ? el("span", { class: "tag", text: item.floorplan }) : null,
        chosen ? el("span", { class: "tag mine", text: "★ " + chosen.letter.toUpperCase() + " · " + chosen.name }) : null]),
      el("p", { class: "why", html: item.why }),
      item.verdict ? el("div", { class: "verdict" }, [el("b", { text: "Assessment" }), el("span", { html: item.verdict })]) : null,
    ]);
    head.appendChild(left);
    head.appendChild(el("div", { class: "head-acts" }, [
      el("button", { class: "b sm", type: "button", text: "‹ Item", title: "Previous item ([)", onclick: function () { hopItem(-1); } }),
      el("button", { class: "b sm", type: "button", text: "Item ›", title: "Next item (])", onclick: function () { hopItem(1); } }),
    ]));
    host.appendChild(head);
  }

  function renderBrowse(host) {
    var item = currentItem();
    ui.opt = clampOpt(item, ui.opt);
    var v = item.variants[ui.opt];
    itemHead(item, host);

    var strip = el("div", { class: "opts", role: "tablist", "aria-label": "Options for " + item.title });
    item.variants.forEach(function (o, i) {
      strip.appendChild(el("button", {
        class: "opt" + (isChosen(item, o) ? " is-mine" : ""), role: "tab", type: "button",
        "aria-selected": String(i === ui.opt), onclick: function () { go({ opt: i }); },
      }, [
        el("span", { class: "row" }, [el("span", { class: "letter", text: o.letter.toUpperCase() }), el("span", { class: "name", text: o.name })]),
        (function () { var t = tagsFor(item, o, true); return t.length ? el("span", { class: "tags" }, t) : null; })(),
      ]));
    });
    host.appendChild(strip);

    host.appendChild(el("div", { class: "stage-bar" }, [
      el("div", { class: "title" }, [el("span", { class: "letter", text: v.letter.toUpperCase() }), el("span", { text: v.name })].concat(tagsFor(item, v))),
      el("div", { class: "right" }, [
        el("span", { class: "crumb", text: "Option " + (ui.opt + 1) + " of " + item.variants.length }),
        el("button", { class: "b sm", type: "button", text: "←", title: "Previous option (←)", "aria-label": "Previous option", onclick: function () { stepOpt(-1); } }),
        el("button", { class: "b sm", type: "button", text: "→", title: "Next option (→)", "aria-label": "Next option", onclick: function () { stepOpt(1); } }),
        chooseButton(item, v, "sm"),
        el("button", { class: "b sm", type: "button", text: "▶ Full screen", title: "Slideshow from this option (p)", onclick: function () { openShow(); } }),
      ]),
    ]));

    var stage = el("div", { class: "stage" });
    host.appendChild(stage);
    renderFrames(stage, v, roomOf(stage) || 1000);

    var detail = el("div", { class: "detail" });
    detail.appendChild(el("div", { class: "card" }, [
      el("h3", { text: "Why this option" }), el("p", { html: v.rationale }),
      el("h3", { text: "What it costs" }), el("p", { html: v.tradeoff }),
    ]));
    detail.appendChild(decideCard(item, v));
    host.appendChild(detail);
  }

  function chooseButton(item, v, size) {
    var mine = isChosen(item, v);
    return el("button", {
      class: "b " + (size || "") + (mine ? " gold" : " primary"), type: "button", title: "Choose this option (c)",
      text: mine ? "★ Chosen" : "Choose " + v.letter.toUpperCase(),
      onclick: function () { toggleChoice(item, v); },
    });
  }

  function decideCard(item, v) {
    var c = itemChoice(item);
    var chosen = c.choice && item.variants.find(function (o) { return o.id === c.choice; });
    var shorts = item.variants.filter(function (o) { return c.shortlist.indexOf(o.id) >= 0; });
    var ta = el("textarea", { placeholder: "Notes for whoever implements this item: what to change in the chosen option, what to borrow from another one, and edge cases.", "aria-label": "Notes for " + item.title });
    ta.value = c.note || "";
    ta.addEventListener("input", function () { setNote(item, ta.value); });
    return el("div", { class: "card decide" }, [
      el("h3", { text: "Your decision" }),
      el("div", { class: "acts" }, [
        chooseButton(item, v),
        el("button", { class: "b", type: "button", title: "Shortlist this option (s)", text: isShort(item, v) ? "Remove from shortlist" : "Shortlist", onclick: function () { toggleShort(item, v); } }),
        chosen ? el("button", { class: "b ghost", type: "button", text: "Clear choice", onclick: function () { setChoice(item, null); } }) : null,
      ]),
      el("p", { class: "mine-line", html: chosen
        ? "Chosen: <b>" + chosen.letter.toUpperCase() + " · " + escapeHtml(chosen.name) + "</b>"
        : "No option chosen for this item yet." }),
      shorts.length ? el("p", { class: "mine-line", text: "Shortlist: " + shorts.map(function (o) { return o.letter.toUpperCase() + " " + o.name; }).join(", ") }) : null,
      ta,
    ]);
  }
  function escapeHtml(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function renderCompare(host) {
    var item = currentItem();
    itemHead(item, host);
    var room = roomOf($("#main-in"));
    var minCard = ui.theme === "both" ? 720 : 480;
    var cols = Math.max(1, Math.min(4, Math.floor((room + 16) / (minCard + 16))));
    var grid = el("div", { class: "grid" });
    grid.style.gridTemplateColumns = "repeat(" + cols + ", minmax(0, 1fr))";
    host.appendChild(grid);
    var cardRoom = Math.floor((room - (cols - 1) * 16) / cols) - 24 - 2;
    var themes = ui.theme === "both" ? ["light", "dark"] : [ui.theme];
    var w = ui.width === "fit" ? 1280 : Number(ui.width);
    var each = themes.length === 2 ? (cardRoom - 10) / 2 : cardRoom;
    item.variants.forEach(function (v, i) {
      var gstage = el("div", { class: "gstage", title: "Open this option", onclick: function () { go({ view: "browse", opt: i }); } });
      themes.forEach(function (theme) { gstage.appendChild(makeFrame(v, theme, fixedWidth(v) || w, each, { scale: true, full: ui.canvas === "full" })); });
      grid.appendChild(el("article", { class: "gcard" + (isChosen(item, v) ? " is-mine" : "") }, [
        el("header", {}, [el("span", { class: "letter tag", text: v.letter.toUpperCase() }), el("span", { class: "name", text: v.name })]
          .concat(tagsFor(item, v), [chooseButton(item, v, "sm")])),
        gstage,
        el("div", { class: "gfoot", html: v.rationale }),
      ]));
    });
  }

  function renderOverview(host) {
    var n = decidedCount();
    var newItems = ITEMS.filter(function (i) { return i.added; }).length;
    var newOpts = ITEMS.reduce(function (s, i) { return s + i.variants.filter(function (v) { return !!v.author; }).length; }, 0);
    host.appendChild(el("section", { class: "hero" }, [
      el("h1", { text: "Business application UI, pattern by pattern" }),
      el("p", { text: "Every recurring screen, element and scenario in a business application, with several ways to draw each one. Every mock renders in its own frame at a real viewport width, in semantic tokens and one neutral cast: Acme Supply, its back office, and Maria Garcia's order SO-1042 for EUR 125.00." }),
      el("p", { text: "Choose one option per item. Your choices, shortlists and notes are written to one file, ui-pattern-choices.json, which is the brief for implementing them." }),
      el("div", { class: "acts" }, [
        el("button", { class: "b primary", type: "button", text: "Start with the first open item", onclick: function () {
          var next = ITEMS.find(function (i) { return !itemChoice(i).choice; }) || ITEMS[0];
          go({ view: "browse", item: next.id, opt: 0 });
        } }),
        el("button", { class: "b", type: "button", text: "▶ Slideshow of everything", onclick: function () { ui.showScope = "all"; openShow(); } }),
        el("button", { class: "b", type: "button", text: "Choices and file", onclick: openPanel }),
      ]),
    ]));
    host.appendChild(el("div", { class: "stats" }, [
      stat("Items", ITEMS.length), stat("Options", TOTAL_OPTIONS), stat("Chosen", n + " of " + ITEMS.length),
      stat("Items added in this pass", newItems), stat("Options added in this pass", newOpts),
    ]));
    host.appendChild(el("div", { class: "keys" }, [
      key("← →", "previous and next option"), key("[ ]", "previous and next item"), key("c", "choose the option on screen"),
      key("s", "shortlist it"), key("p", "slideshow at full screen width"), key("g / b", "compare all, or browse one"),
      key("t", "light, dark, both"), key("1 to 6", "390, 768, 1280, 1600, 1920, fit"), key("/", "search"), key("o", "your choices and the file"),
    ]));
    var cats = el("div", { class: "cats" });
    DATA.categories.forEach(function (cat) {
      var done = cat.items.filter(function (i) { return itemChoice(i).choice; }).length;
      var ul = el("ul");
      cat.items.forEach(function (item) {
        var c = itemChoice(item);
        var chosen = c.choice && item.variants.find(function (v) { return v.id === c.choice; });
        ul.appendChild(el("li", {}, [el("button", { type: "button", onclick: function () { go({ view: "browse", item: item.id, opt: firstOpt(item) }); } }, [
          dotFor(item), el("span", { text: item.title }), item.added ? el("span", { class: "tag new", text: "New" }) : null,
          el("span", { class: "pickname", text: chosen ? chosen.letter.toUpperCase() + " · " + chosen.name : item.variants.length + " options" }),
        ])]));
      });
      cats.appendChild(el("section", { class: "catcard", id: "cat-" + cat.id }, [
        el("h2", {}, [el("span", { text: cat.title }), el("span", { class: "n", text: done + "/" + cat.items.length + " chosen" })]),
        el("p", { text: cat.intro }), ul,
      ]));
    });
    host.appendChild(cats);
  }
  function stat(l, f) { return el("div", { class: "stat" }, [el("div", { class: "l", text: l }), el("div", { class: "f", text: String(f) })]); }
  function key(k, t) { return el("span", {}, [el("kbd", { text: k }), " " + t]); }

  // ---------- navigation ----------
  function go(patch) {
    if (patch.item && patch.item !== ui.item && patch.opt == null) patch.opt = 0;
    Object.assign(ui, patch);
    saveUi();
    writeHash();
    renderTop();
    renderView(patch.opt != null && patch.item == null && patch.view == null);
  }
  function stepOpt(d) {
    var item = currentItem();
    var n = item.variants.length;
    go({ opt: (ui.opt + d + n) % n });
  }
  function hopItem(d) {
    var visible = ITEMS.filter(matches);
    var list = visible.length ? visible : ITEMS;
    var i = list.indexOf(currentItem());
    var next = list[(i + d + list.length) % list.length];
    go({ item: next.id, opt: firstOpt(next), view: ui.view === "overview" ? "browse" : ui.view });
  }
  function writeHash() {
    var h = ui.view === "overview" ? "" : "#" + ui.item + "/" + letter(ui.opt) + (ui.view === "compare" ? "/compare" : "");
    if (location.hash !== h) history.replaceState(null, "", h || location.pathname + location.search);
  }
  function readHash() {
    var m = location.hash.replace(/^#/, "").split("/");
    if (!m[0] || !BY_ID[m[0]]) return;
    ui.item = m[0];
    var idx = m[1] ? "abcdefghijklmnopqrstuvwxyz".indexOf(m[1]) : 0;
    ui.opt = clampOpt(BY_ID[m[0]], idx < 0 ? 0 : idx);
    ui.view = m[2] === "compare" ? "compare" : "browse";
  }

  // ---------- choices ----------
  function touch(item, c) {
    choices.items[item.id] = c;
    choices.updated = new Date().toISOString();
    store(CHOICES_KEY, choices);
    persist();
  }
  function setChoice(item, vid) {
    var c = Object.assign({ choice: null, shortlist: [], note: "" }, itemChoice(item));
    c.choice = vid;
    touch(item, c);
    renderTop(); renderView(true);
  }
  function toggleChoice(item, v) {
    var mine = isChosen(item, v);
    setChoice(item, mine ? null : v.id);
    flash(mine ? "Choice cleared for " + item.title : "Chose " + v.letter.toUpperCase() + " for " + item.title);
  }
  function toggleShort(item, v) {
    var c = Object.assign({ choice: null, shortlist: [], note: "" }, itemChoice(item));
    c.shortlist = c.shortlist.slice();
    var i = c.shortlist.indexOf(v.id);
    if (i >= 0) c.shortlist.splice(i, 1); else c.shortlist.push(v.id);
    touch(item, c);
    renderView(true);
  }
  var noteTimer;
  function setNote(item, text) {
    var c = Object.assign({ choice: null, shortlist: [], note: "" }, itemChoice(item));
    c.note = text;
    choices.items[item.id] = c;
    choices.updated = new Date().toISOString();
    store(CHOICES_KEY, choices);
    clearTimeout(noteTimer);
    noteTimer = setTimeout(persist, 600);
  }

  /** The file: every item, decided or not, so the implementer sees what is still open. */
  function exportDoc() {
    var decisions = ITEMS.map(function (item) {
      var c = itemChoice(item);
      var v = c.choice && item.variants.find(function (o) { return o.id === c.choice; });
      var rec = item.variants.find(function (o) { return o.pick; });
      return {
        category: item.cat.title,
        itemId: item.id,
        item: item.title,
        question: plain(item.why),
        status: v ? "chosen" : "open",
        chosen: v ? {
          id: v.id, letter: v.letter.toUpperCase(), name: v.name, rationale: plain(v.rationale), tradeoff: plain(v.tradeoff),
          wasRecommended: !!v.pick, shipsToday: !!v.shipped, addedInReview: !!v.author,
          link: "ui-patterns.html#" + item.id + "/" + v.letter,
        } : null,
        recommended: rec ? { id: rec.id, letter: rec.letter.toUpperCase(), name: rec.name } : null,
        shortlist: (c.shortlist || []).map(function (id) {
          var o = item.variants.find(function (x) { return x.id === id; });
          return o ? { id: o.id, letter: o.letter.toUpperCase(), name: o.name } : null;
        }).filter(Boolean),
        note: c.note || "",
      };
    });
    return {
      registry: "UI pattern library",
      file: "ui-pattern-choices.json",
      registryBuilt: DATA.built,
      updated: choices.updated || new Date().toISOString(),
      summary: { items: ITEMS.length, chosen: decidedCount(), open: ITEMS.length - decidedCount() },
      generalNotes: choices.notes || "",
      howToUse: "Each decision names the option the reviewer chose for one item of the registry. Implement the chosen option in apps/admin, honour the note, and open the link to see the mock. An item with status open has no decision yet.",
      decisions: decisions,
    };
  }
  function importDoc(obj) {
    var next = { items: {}, notes: obj.generalNotes || obj.notes || "", updated: obj.updated || new Date().toISOString() };
    if (Array.isArray(obj.decisions)) {
      obj.decisions.forEach(function (d) {
        var item = BY_ID[d.itemId];
        if (!item) return;
        var ids = item.variants.map(function (v) { return v.id; });
        var chosen = d.chosen && ids.indexOf(d.chosen.id) >= 0 ? d.chosen.id : null;
        var shortlist = (d.shortlist || []).map(function (s) { return s.id; }).filter(function (id) { return ids.indexOf(id) >= 0; });
        if (chosen || shortlist.length || d.note) next.items[item.id] = { choice: chosen, shortlist: shortlist, note: d.note || "" };
      });
    } else if (obj.items) next.items = obj.items;
    choices = next;
    store(CHOICES_KEY, choices);
  }

  // Where the file goes. A local server writes it beside the registry; otherwise
  // the File System Access API writes to a file the reviewer picked once.
  var sink = { mode: "none", handle: null, state: "Choices are kept in this browser only", ok: false, last: null };
  var SERVER = location.protocol.indexOf("http") === 0;

  function saveStateText() { return sink.state; }
  function saveStateClass() { return sink.ok ? "ok" : "warn"; }
  function updateSaveState(text, ok) {
    sink.state = text; sink.ok = ok;
    var s = $("#save-state");
    if (s) { s.textContent = text; s.title = text; s.className = "save-state " + (ok ? "ok" : "warn"); }
    var p = $("#file-state");
    if (p) p.textContent = text;
  }

  var persistTimer;
  function persist() {
    clearTimeout(persistTimer);
    persistTimer = setTimeout(writeNow, 150);
  }
  function stamp() { return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }); }
  function writeNow() {
    var body = JSON.stringify(exportDoc(), null, 2) + "\n";
    if (sink.mode === "server") {
      fetch("choices", { method: "POST", headers: { "Content-Type": "application/json" }, body: body })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (r) { updateSaveState("Written to " + r.path + " at " + stamp(), true); })
        .catch(function (e) { updateSaveState("Could not write the file (" + e.message + "). Kept in this browser.", false); });
    } else if (sink.mode === "fs" && sink.handle) {
      sink.handle.createWritable().then(function (w) {
        return w.write(body).then(function () { return w.close(); });
      }).then(function () { updateSaveState("Written to " + sink.handle.name + " at " + stamp(), true); })
        .catch(function (e) { updateSaveState("Lost access to " + sink.handle.name + ". Reconnect it in Choices.", false); sink.mode = "none"; });
    } else {
      updateSaveState("Kept in this browser. Connect a file in Choices (o).", false);
    }
  }

  // The file handle survives a reload in IndexedDB; permission is asked again on a click.
  function idb(fn) {
    return new Promise(function (res, rej) {
      if (!window.indexedDB) return rej(new Error("no indexedDB"));
      var r = indexedDB.open("ui-patterns", 1);
      r.onupgradeneeded = function () { r.result.createObjectStore("kv"); };
      r.onsuccess = function () { var tx = r.result.transaction("kv", "readwrite"); fn(tx.objectStore("kv"), res, rej); };
      r.onerror = function () { rej(r.error); };
    });
  }
  function saveHandle(h) { return idb(function (s, res) { s.put(h, "file"); res(); }).catch(function () {}); }
  function loadHandle() { return idb(function (s, res) { var q = s.get("file"); q.onsuccess = function () { res(q.result || null); }; q.onerror = function () { res(null); }; }).catch(function () { return null; }); }

  function connectFile() {
    if (!window.showSaveFilePicker) { flash("This browser cannot write files. Use Download, or open it through serve.mjs."); return; }
    window.showSaveFilePicker({ suggestedName: "ui-pattern-choices.json", types: [{ description: "JSON", accept: { "application/json": [".json"] } }] })
      .then(function (h) { sink.handle = h; sink.mode = "fs"; saveHandle(h); writeNow(); renderPanel(); })
      .catch(function () {});
  }
  function openExistingFile() {
    if (!window.showOpenFilePicker) { $("#import-input").click(); return; }
    window.showOpenFilePicker({ types: [{ description: "JSON", accept: { "application/json": [".json"] } }] })
      .then(function (hs) { var h = hs[0]; return h.getFile().then(function (f) { return f.text(); }).then(function (t) {
        importDoc(JSON.parse(t)); sink.handle = h; sink.mode = "fs"; saveHandle(h);
        return h.requestPermission ? h.requestPermission({ mode: "readwrite" }) : "granted";
      }).then(function () { writeNow(); renderAll(); renderPanel(); flash("Loaded and connected " + h.name); }); })
      .catch(function (e) { if (e && e.name !== "AbortError") flash("Could not read that file: " + e.message); });
  }
  function reconnect() {
    if (!sink.handle) return;
    sink.handle.requestPermission({ mode: "readwrite" }).then(function (p) {
      if (p === "granted") { sink.mode = "fs"; writeNow(); renderPanel(); }
    });
  }
  function download() {
    var blob = new Blob([JSON.stringify(exportDoc(), null, 2) + "\n"], { type: "application/json" });
    var a = el("a", { href: URL.createObjectURL(blob), download: "ui-pattern-choices.json" });
    doc.body.appendChild(a); a.click(); a.remove();
  }

  function initSink() {
    if (SERVER) {
      return fetch("choices", { cache: "no-store" }).then(function (r) {
        if (!r.ok || r.headers.get("X-Registry-Server") !== "1") throw new Error("no server");
        sink.mode = "server";
        return r.json();
      }).then(function (r) {
        if (r.data) {
          var mine = choices.updated ? Date.parse(choices.updated) : 0;
          var theirs = r.data.updated ? Date.parse(r.data.updated) : 0;
          if (theirs >= mine) importDoc(r.data);
        }
        updateSaveState("Writing to " + r.path, true);
        writeNow();
      }).catch(function () { return initHandle(); });
    }
    return initHandle();
  }
  function initHandle() {
    return loadHandle().then(function (h) {
      if (!h) { updateSaveState("Kept in this browser. Connect a file in Choices (o).", false); return; }
      sink.handle = h;
      return h.queryPermission({ mode: "readwrite" }).then(function (p) {
        if (p === "granted") { sink.mode = "fs"; writeNow(); }
        else updateSaveState("Click Reconnect in Choices to keep writing " + h.name, false);
      });
    });
  }

  // ---------- the choices panel ----------
  function openPanel() { $("#panel-wrap").hidden = false; renderPanel(); }
  function closePanel() { $("#panel-wrap").hidden = true; }
  function renderPanel() {
    var body = $("#panel-body");
    if (!body || $("#panel-wrap").hidden) return;
    body.innerHTML = "";
    var acts = el("div", { class: "acts" });
    if (sink.mode === "server") acts.appendChild(el("span", { class: "crumb", text: "The local server writes the file on every change." }));
    else {
      if (sink.handle && sink.mode !== "fs") acts.appendChild(el("button", { class: "b sm primary", type: "button", text: "Reconnect " + sink.handle.name, onclick: reconnect }));
      acts.appendChild(el("button", { class: "b sm" + (sink.handle ? "" : " primary"), type: "button", text: sink.mode === "fs" ? "Write to another file…" : "Write to a file…", onclick: connectFile }));
      acts.appendChild(el("button", { class: "b sm", type: "button", text: "Open an existing file…", onclick: openExistingFile }));
    }
    acts.appendChild(el("button", { class: "b sm", type: "button", text: "Download a copy", onclick: download }));
    acts.appendChild(el("button", { class: "b sm", type: "button", text: "Load from a file", onclick: function () { $("#import-input").click(); } }));
    body.appendChild(el("div", { class: "file-box" }, [
      el("p", { class: "where", html: "One file holds every decision: <code>ui-pattern-choices.json</code>. Each entry names the item, the chosen option with its rationale and cost, the shortlist, and your note." }),
      el("p", { class: "hint-line", id: "file-state", text: sink.state }),
      acts,
      sink.mode === "server" ? null : el("p", { class: "hint-line", html: "To write straight into the repository instead, run <code>node standards/patterns/ui/serve.mjs</code> and open the address it prints." }),
    ]));
    var notes = el("textarea", { placeholder: "General notes for the whole application: direction, tone, things that apply to every pattern.", "aria-label": "General notes" });
    notes.value = choices.notes || "";
    notes.addEventListener("input", function () { choices.notes = notes.value; choices.updated = new Date().toISOString(); store(CHOICES_KEY, choices); clearTimeout(noteTimer); noteTimer = setTimeout(persist, 600); });
    body.appendChild(el("h4", { text: "General notes" }));
    body.appendChild(notes);
    DATA.categories.forEach(function (cat) {
      body.appendChild(el("h4", { text: cat.title }));
      cat.items.forEach(function (item) {
        var c = itemChoice(item);
        var v = c.choice && item.variants.find(function (o) { return o.id === c.choice; });
        body.appendChild(el("div", { class: "drow" }, [dotFor(item),
          el("button", { type: "button", text: item.title, onclick: function () { closePanel(); go({ view: "browse", item: item.id, opt: firstOpt(item) }); } }),
          el("span", { class: "v" + (v ? " set" : ""), text: v ? v.letter.toUpperCase() + " · " + v.name + (c.note ? " · note" : "") : c.shortlist.length ? c.shortlist.length + " shortlisted" : "Open" })]));
      });
    });
    body.appendChild(el("div", { style: "margin-top:18px" }, [el("button", { class: "b sm ghost", type: "button", text: "Clear every choice", onclick: function () {
      if (!confirm("Clear every choice, shortlist and note? The file is rewritten empty.")) return;
      choices = { items: {}, notes: "", updated: new Date().toISOString() }; store(CHOICES_KEY, choices); persist(); renderAll(); renderPanel();
    } })]));
  }

  // ---------- the slideshow ----------
  var show = { seq: [], at: 0 };
  function buildSeq() {
    var item = currentItem();
    var scope = ui.showScope;
    var items = scope === "item" ? [item] : scope === "category" ? item.cat.items : ITEMS;
    var seq = [];
    items.forEach(function (it) {
      it.variants.forEach(function (v, i) {
        if (scope === "recommended" && !v.pick) return;
        if (scope === "mine" && !isChosen(it, v) && !isShort(it, v)) return;
        seq.push({ item: it, opt: i });
      });
    });
    return seq;
  }
  function openShow() {
    show.seq = buildSeq();
    if (!show.seq.length) { ui.showScope = "item"; show.seq = buildSeq(); }
    var i = show.seq.findIndex(function (s) { return s.item.id === ui.item && s.opt === ui.opt; });
    show.at = Math.max(0, i);
    $("#show").hidden = false;
    if (doc.documentElement.requestFullscreen && !doc.fullscreenElement) doc.documentElement.requestFullscreen().catch(function () {});
    renderShow();
  }
  function closeShow() {
    $("#show").hidden = true;
    if (doc.fullscreenElement) doc.exitFullscreen().catch(function () {});
    pruneFrames();
    renderTop(); renderView(true);
  }
  function renderShow() {
    var s = show.seq[show.at];
    if (!s) return;
    var item = s.item, v = item.variants[s.opt];
    ui.item = item.id; ui.opt = s.opt; saveUi(); writeHash();
    var stage = $("#show-stage");
    stage.innerHTML = "";
    stage.scrollTop = 0;
    var room = innerWidth;
    var themes = ui.theme === "both" ? ["light", "dark"] : [ui.theme];
    stage.classList.toggle("both", themes.length === 2);
    var col = themes.length === 2 ? Math.floor(room / 2) : room;
    var w = fixedWidth(v) || (ui.width === "fit" ? col : Number(ui.width));
    var minH = innerHeight - 60;
    themes.forEach(function (theme) {
      var f = makeFrame(v, theme, w, col, { scale: true, full: ui.showCanvas === "full", minHeight: Math.floor(minH / (ui.scale && w > col ? col / w : 1)) });
      stage.appendChild(el("div", { class: "both-col" }, [f]));
    });
    var bar = $("#show-bar");
    bar.innerHTML = "";
    var scopeSel = el("select", { "aria-label": "What the slideshow steps through", onchange: function () {
      ui.showScope = scopeSel.value; saveUi(); show.seq = buildSeq();
      if (!show.seq.length) { flash("Nothing in that scope yet"); ui.showScope = "item"; show.seq = buildSeq(); }
      show.at = Math.max(0, show.seq.findIndex(function (x) { return x.item.id === item.id && x.opt === s.opt; })); renderShow();
    } });
    [["item", "This item"], ["category", "This category"], ["all", "Everything"], ["recommended", "Recommended only"], ["mine", "My choices and shortlist"]]
      .forEach(function (o) { scopeSel.appendChild(el("option", { value: o[0], text: o[1], selected: o[0] === ui.showScope })); });
    bar.appendChild(el("button", { class: "b sm", type: "button", text: "✕ Close", title: "Close (Esc)", onclick: closeShow }));
    bar.appendChild(el("div", { class: "where" }, [
      el("div", { class: "t" }, [el("span", { text: v.letter.toUpperCase() + " · " + v.name })].concat(tagsFor(item, v))),
      el("div", { class: "s", text: item.cat.title + " › " + item.title + " · option " + (s.opt + 1) + " of " + item.variants.length }),
    ]));
    bar.appendChild(el("span", { class: "count", text: (show.at + 1) + " / " + show.seq.length }));
    bar.appendChild(scopeSel);
    bar.appendChild(segmented("Theme", ui.theme, [["light", "Light"], ["dark", "Dark"], ["both", "Both"]], function (t) { ui.theme = t; saveUi(); applyShellTheme(); renderShow(); }));
    bar.appendChild(segmented("Viewport", ui.width, [["390", "390"], ["768", "768"], ["1280", "1280"], ["1600", "1600"], ["1920", "1920"], ["fit", "Screen"]], function (t) { ui.width = t; saveUi(); renderShow(); }));
    bar.appendChild(segmented("Canvas", ui.showCanvas, [["natural", "1180 cap"], ["full", "Uncapped"]], function (t) { ui.showCanvas = t; saveUi(); renderShow(); }));
    bar.appendChild(el("button", { class: "b sm", type: "button", text: ui.showWhy ? "Hide notes" : "Notes (i)", onclick: function () { ui.showWhy = !ui.showWhy; saveUi(); renderShow(); } }));
    bar.appendChild(el("button", { class: "b sm", type: "button", text: isShort(item, v) ? "Shortlisted" : "Shortlist", onclick: function () { toggleShort(item, v); renderShow(); } }));
    bar.appendChild(chooseButton(item, v, "sm"));
    bar.querySelector(".b.primary, .b.gold").addEventListener("click", function () { setTimeout(renderShow, 0); });
    bar.appendChild(el("button", { class: "b sm icon", type: "button", text: "←", "aria-label": "Previous", onclick: function () { stepShow(-1); } }));
    bar.appendChild(el("button", { class: "b sm icon", type: "button", text: "→", "aria-label": "Next", onclick: function () { stepShow(1); } }));
    var why = $("#show-why");
    why.hidden = !ui.showWhy;
    why.innerHTML = "";
    why.appendChild(el("b", { text: "Why" })); why.appendChild(el("p", { html: v.rationale }));
    why.appendChild(el("b", { text: "Costs" })); why.appendChild(el("p", { html: v.tradeoff }));
  }
  function stepShow(d) {
    show.at = (show.at + d + show.seq.length) % show.seq.length;
    renderShow();
  }
  function hopShow(d) {
    var cur = show.seq[show.at].item;
    var i = show.at;
    do { i = (i + d + show.seq.length) % show.seq.length; } while (show.seq[i].item === cur && i !== show.at);
    if (d < 0) { var it = show.seq[i].item; while (i > 0 && show.seq[i - 1].item === it) i--; }
    show.at = i; renderShow();
  }

  // ---------- keys ----------
  doc.addEventListener("keydown", function (e) {
    var t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT")) {
      if (e.key === "Escape") t.blur();
      return;
    }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var inShow = !$("#show").hidden;
    var k = e.key;
    if (inShow) {
      var s = show.seq[show.at];
      if (k === "Escape") closeShow();
      else if (k === "ArrowRight" || k === " " || k === "PageDown") stepShow(1);
      else if (k === "ArrowLeft" || k === "PageUp") stepShow(-1);
      else if (k === "ArrowDown" || k === "]") hopShow(1);
      else if (k === "ArrowUp" || k === "[") hopShow(-1);
      else if (k === "c" || k === "Enter") { toggleChoice(s.item, s.item.variants[s.opt]); renderShow(); }
      else if (k === "s") { toggleShort(s.item, s.item.variants[s.opt]); renderShow(); }
      else if (k === "i") { ui.showWhy = !ui.showWhy; saveUi(); renderShow(); }
      else if (k === "t") { ui.theme = { light: "dark", dark: "both", both: "light" }[ui.theme]; saveUi(); applyShellTheme(); renderShow(); }
      else if ("123456".indexOf(k) >= 0) { ui.width = ["390", "768", "1280", "1600", "1920", "fit"][+k - 1]; saveUi(); renderShow(); }
      else return;
      e.preventDefault();
      return;
    }
    if (!$("#panel-wrap").hidden) { if (k === "Escape") closePanel(); return; }
    var item = currentItem();
    if (k === "/") { $("#q").focus(); }
    else if (k === "ArrowRight" && ui.view !== "overview") stepOpt(1);
    else if (k === "ArrowLeft" && ui.view !== "overview") stepOpt(-1);
    else if (k === "]") hopItem(1);
    else if (k === "[") hopItem(-1);
    else if (k === "c" && ui.view !== "overview") toggleChoice(item, item.variants[ui.opt]);
    else if (k === "s" && ui.view !== "overview") toggleShort(item, item.variants[ui.opt]);
    else if (k === "p") openShow();
    else if (k === "g") go({ view: "compare" });
    else if (k === "b") go({ view: "browse" });
    else if (k === "o") openPanel();
    else if (k === "n") toggleNav();
    else if (k === "t") { ui.theme = { light: "dark", dark: "both", both: "light" }[ui.theme]; saveUi(); applyShellTheme(); renderTop(); renderView(true); }
    else if ("123456".indexOf(k) >= 0) { ui.width = ["390", "768", "1280", "1600", "1920", "fit"][+k - 1]; saveUi(); renderTop(); renderView(true); }
    else return;
    e.preventDefault();
  });

  // ---------- boot ----------
  ITEMS.forEach(function (item) {
    item.hay = [item.title, plain(item.why), item.cat.title, item.verdict || ""].concat(item.variants.map(function (v) { return v.name + " " + v.rationale; })).join(" ").toLowerCase();
  });
  function renderAll() { renderTop(); renderView(true); }

  mainEl = $("#main");
  readHash();
  applyShellTheme();
  $("#app").classList.toggle("nav-collapsed", !ui.nav);
  $("#q").addEventListener("input", function (e) { query = e.target.value.trim().toLowerCase(); renderNav(); });
  $("#q").addEventListener("keydown", function (e) {
    if (e.key === "Enter") { var first = ITEMS.find(matches); if (first) { go({ item: first.id, opt: 0, view: ui.view === "overview" ? "browse" : ui.view }); e.target.blur(); } }
  });
  $("#nav-filter").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    ui.filter = b.dataset.f; saveUi(); renderNav();
  });
  $("#panel-close").addEventListener("click", closePanel);
  $("#panel-scrim").addEventListener("click", closePanel);
  $("#import-input").addEventListener("change", function (e) {
    var f = e.target.files[0]; if (!f) return;
    f.text().then(function (t) { importDoc(JSON.parse(t)); persist(); renderAll(); renderPanel(); flash("Loaded " + f.name); })
      .catch(function (err) { flash("Could not read that file: " + err.message); });
    e.target.value = "";
  });
  addEventListener("hashchange", function () { readHash(); renderAll(); });
  var resizeTimer;
  addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { if (!$("#show").hidden) renderShow(); else renderView(true); }, 160);
  });
  doc.addEventListener("fullscreenchange", function () { if (!$("#show").hidden) setTimeout(renderShow, 60); });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyShellTheme);

  renderTop();
  renderView();
  initSink().then(function () { renderTop(); });
})();
