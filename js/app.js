/* ProfitMap directory app — 100% client-side, $0 infra. */
(function () {
  "use strict";

  var BAND_ORDER = { "$1-5K MRR": 1, "$5-20K MRR": 2, "$20-50K MRR": 3, "$50-100K MRR": 4, "$100K+ MRR": 5 };
  var entries = [];

  var CONFIG = (window.PROFITMAP_CONFIG || {});
  var PAYMENT_LINK_CONFIGURED = typeof CONFIG.paymentLinkUrl === "string" &&
    CONFIG.paymentLinkUrl.indexOf("REPLACE_ME") === -1;

  /* Privacy-friendly analytics: inject Plausible only when a real domain
     is configured. No script tag, no cookies, no tracking when unconfigured. */
  function initAnalytics() {
    var domain = CONFIG.plausibleDomain;
    if (typeof domain !== "string" || domain.indexOf("REPLACE_ME") !== -1) return;
    var s = document.createElement("script");
    s.defer = true;
    s.setAttribute("data-domain", domain);
    s.src = "https://plausible.io/js/script.js";
    document.head.appendChild(s);
  }

  /* Guarded event tracker — no-op until Plausible is configured and loaded. */
  function track(eventName, props) {
    try {
      if (typeof window.plausible === "function") window.plausible(eventName, { props: props || {} });
    } catch (err) { /* analytics must never break the page */ }
  }

  var $ = function (id) { return document.getElementById(id); };
  var cardsEl = $("cards"), searchEl = $("search"),
      nicheEl = $("filter-niche"), bandEl = $("filter-band"),
      pricingEl = $("filter-pricing"), sortEl = $("sort"),
      countEl = $("result-count");

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function bandRank(e) { return BAND_ORDER[e.revenue_band] || 0; }

  function filtered() {
    var q = searchEl.value.trim().toLowerCase();
    var n = nicheEl.value, b = bandEl.value, p = pricingEl.value;
    var out = entries.filter(function (e) {
      if (n && e.niche !== n) return false;
      if (b && e.revenue_band !== b) return false;
      if (p && e.pricing_model !== p) return false;
      if (q) {
        var hay = (e.name + " " + e.founder + " " + e.tech_stack + " " + e.niche + " " + e.description).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
    var s = sortEl.value;
    out.sort(function (a, b2) {
      if (s === "name") return a.name.localeCompare(b2.name);
      if (s === "band-asc") return bandRank(a) - bandRank(b2);
      return bandRank(b2) - bandRank(a);
    });
    return out;
  }

  function cardHTML(e) {
    return '<article class="card" data-id="' + esc(e.id) + '" tabindex="0" role="button" aria-label="Details for ' + esc(e.name) + '">' +
      '<h3>' + esc(e.name) + '</h3>' +
      '<p class="founder">by ' + esc(e.founder) + ' · team of ' + esc(e.team_size) + '</p>' +
      '<div class="tags"><span class="tag band">' + esc(e.revenue_band) + '</span>' +
      '<span class="tag niche">' + esc(e.niche) + '</span>' +
      '<span class="tag">' + esc(e.pricing_model) + '</span></div>' +
      '<p class="desc">' + esc(e.description) + '</p>' +
      '</article>';
  }

  function render() {
    var list = filtered();
    cardsEl.innerHTML = list.map(cardHTML).join("");
    countEl.textContent = list.length + " of " + entries.length + " products";
  }

  function openModal(e) {
    var channels = e.acquisition_channels.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("");
    $("modal-body").innerHTML =
      '<h2><a href="' + esc(e.url) + '" target="_blank" rel="noopener">' + esc(e.name) + '</a></h2>' +
      '<p class="founder">by ' + esc(e.founder) + ' · team of ' + esc(e.team_size) + '</p>' +
      '<p>' + esc(e.description) + '</p>' +
      '<dl class="kv">' +
      '<dt>Revenue</dt><dd><strong>' + esc(e.revenue_band) + '</strong> — ' + esc(e.revenue_note) + '</dd>' +
      '<dt>Pricing</dt><dd>' + esc(e.pricing_model) + ' · ' + esc(e.price_point) + '</dd>' +
      '<dt>Tech stack</dt><dd>' + esc(e.tech_stack) + '</dd>' +
      '<dt>Niche</dt><dd>' + esc(e.niche) + '</dd>' +
      '<dt>Source</dt><dd>' + esc(e.verified_source) + '</dd>' +
      '</dl>' +
      '<h3>Where the first users came from</h3><ul class="channels">' + channels + '</ul>';
    $("modal-backdrop").hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeModal() { $("modal-backdrop").hidden = true; document.body.style.overflow = ""; }

  /* Niche scores: avg band rank weighted against entry count.
     score = avgBandRank * 20 scaled by scarcity bonus. */
  function renderNiches() {
    var byNiche = {};
    entries.forEach(function (e) {
      var g = byNiche[e.niche] || (byNiche[e.niche] = { n: 0, sum: 0 });
      g.n += 1; g.sum += bandRank(e);
    });
    var rows = Object.keys(byNiche).map(function (k) {
      var g = byNiche[k];
      var avg = g.sum / g.n;
      var score = Math.round(avg * 20 * (1 + 1 / (1 + g.n))); // scarcity bonus for thin niches
      return { niche: k, n: g.n, avg: avg, score: Math.min(score, 100) };
    }).sort(function (a, b) { return b.score - a.score; });
    var max = Math.max.apply(null, rows.map(function (r) { return r.score; })) || 1;
    $("niche-grid").innerHTML = rows.map(function (r) {
      return '<div class="niche-card"><h3>' + esc(r.niche) + '</h3>' +
        '<div class="score">' + r.score + '<span style="font-size:.9rem;color:var(--muted)">/100</span></div>' +
        '<div class="bar"><div style="width:' + Math.round(r.score / max * 100) + '%"></div></div>' +
        '<div class="meta">' + r.n + ' tracked · avg band ' + r.avg.toFixed(1) + '/5</div></div>';
    }).join("");
  }

  function populateNicheFilter() {
    var niches = [];
    entries.forEach(function (e) { if (niches.indexOf(e.niche) === -1) niches.push(e.niche); });
    niches.sort().forEach(function (n) {
      var o = document.createElement("option"); o.textContent = n; nicheEl.appendChild(o);
    });
  }

  /* Local persistence helpers ($0 backend: localStorage until real backend exists) */
  function saveLocal(key, obj) {
    try {
      var arr = JSON.parse(localStorage.getItem(key) || "[]");
      arr.push(Object.assign({ at: new Date().toISOString() }, obj));
      localStorage.setItem(key, JSON.stringify(arr));
      return true;
    } catch (err) { return false; }
  }

  /* $49 Deep-Dive checkout: real Stripe Payment Link when configured,
     graceful "notify me" fallback until Justin pastes his link in config.js. */
  function wireCheckout() {
    var btn = document.getElementById("deepdive-buy");
    if (!btn) return;
    if (PAYMENT_LINK_CONFIGURED) {
      btn.href = CONFIG.paymentLinkUrl;
      btn.target = "_blank";
      btn.rel = "noopener";
      btn.addEventListener("click", function () {
        track("DeepDiveCheckoutClick", { product: "deep-dive-report", price: "49" });
      });
    } else {
      btn.addEventListener("click", function (ev) {
        ev.preventDefault();
        var email = prompt("Checkout isn't live yet — enter your email and we'll notify you when the $49 report is ready:");
        if (email && /.+@.+\..+/.test(email)) {
          saveLocal("profitmap_interest", { product: "deep-dive", email: email });
          btn.textContent = "✓ You're on the list";
        }
      });
    }
  }

  /* $12/mo Pro checkout: real Stripe Payment Link when configured,
     graceful "notify me" fallback until then. */
  function wirePro() {
    var btn = document.getElementById("pro-buy");
    if (!btn) return;
    var configured = typeof CONFIG.profitmapProLinkUrl === "string" &&
      CONFIG.profitmapProLinkUrl.indexOf("REPLACE_ME") === -1;
    if (configured) {
      btn.href = CONFIG.profitmapProLinkUrl;
      btn.target = "_blank";
      btn.rel = "noopener";
      btn.addEventListener("click", function () {
        track("ProCheckoutClick", { product: "profitmap-pro", price: "12" });
      });
    } else {
      btn.addEventListener("click", function (ev) {
        ev.preventDefault();
        var email = prompt("Checkout isn't live yet — enter your email and we'll notify you when Pro opens:");
        if (email && /.+@.+\..+/.test(email)) {
          saveLocal("profitmap_interest", { product: "pro", email: email });
          btn.textContent = "\u2713 You're on the list";
        }
      });
    }
  }

  function init() {
    initAnalytics();
    wireCheckout();
    wirePro();
    fetch("data/directory.json").then(function (r) { return r.json(); }).then(function (d) {
      entries = d.entries || [];
      $("stat-entries").textContent = entries.length + "+";
      populateNicheFilter();
      render();
      renderNiches();
    }).catch(function () {
      cardsEl.innerHTML = "<p>Could not load directory data.</p>";
    });

    [searchEl, nicheEl, bandEl, pricingEl, sortEl].forEach(function (el) {
      el.addEventListener("input", render);
      el.addEventListener("change", render);
    });

    cardsEl.addEventListener("click", function (ev) {
      var card = ev.target.closest(".card");
      if (!card) return;
      var e = entries.filter(function (x) { return x.id === card.getAttribute("data-id"); })[0];
      if (e) openModal(e);
    });
    cardsEl.addEventListener("keydown", function (ev) {
      if (ev.key !== "Enter" && ev.key !== " ") return;
      var card = ev.target.closest(".card");
      if (!card) return;
      ev.preventDefault();
      var e = entries.filter(function (x) { return x.id === card.getAttribute("data-id"); })[0];
      if (e) openModal(e);
    });
    $("modal-close").addEventListener("click", closeModal);
    $("modal-backdrop").addEventListener("click", function (ev) {
      if (ev.target.id === "modal-backdrop") closeModal();
    });
    document.addEventListener("keydown", function (ev) { if (ev.key === "Escape") closeModal(); });

    $("submit-form").addEventListener("submit", function (ev) {
      ev.preventDefault();
      var fd = new FormData(ev.target), obj = {};
      fd.forEach(function (v, k) { obj[k] = v; });
      if (saveLocal("profitmap_submissions", obj)) {
        $("submit-note").textContent = "✓ Received — we'll review and add verified listings in the weekly update.";
        ev.target.reset();
      } else {
        $("submit-note").textContent = "Couldn't save locally — email your listing to the ProfitMap team instead.";
      }
    });

    $("digest-form").addEventListener("submit", function (ev) {
      ev.preventDefault();
      var fd = new FormData(ev.target);
      if (saveLocal("profitmap_digest", { email: fd.get("email") })) {
        $("digest-note").textContent = "✓ You're on the list. First digest lands this week.";
        ev.target.reset();
      } else {
        $("digest-note").textContent = "Couldn't save — please try again.";
      }
    });

    document.querySelectorAll("[data-interest]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var email = prompt("Enter your email and we'll notify you at launch:");
        if (email && /.+@.+\..+/.test(email)) {
          saveLocal("profitmap_interest", { product: btn.getAttribute("data-interest"), email: email });
          btn.textContent = "✓ You're on the list";
          btn.disabled = true;
        }
      });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
