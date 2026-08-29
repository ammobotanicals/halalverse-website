/* Halal Verse — interface behaviour. No external libraries. */
(function () {
  "use strict";

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("main-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.getAttribute("data-open") === "true";
      nav.setAttribute("data-open", String(!open));
      toggle.setAttribute("aria-expanded", String(!open));
    });

    nav.addEventListener("click", function (e) {
      if (e.target.closest("a") && window.innerWidth <= 1020) {
        nav.setAttribute("data-open", "false");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.getAttribute("data-open") === "true") {
        nav.setAttribute("data-open", "false");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  /* ---------- Transparent header turns solid on scroll ---------- */
  var header = document.getElementById("site-header");
  if (header && header.classList.contains("site-header--over")) {
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Forms return to THIS host ----------
     The redirect field ships with the production URL so it still works
     without JavaScript. On any other host — a preview deploy, a local
     server — point it at that host instead, or testers get bounced to
     the live domain. */
  document.querySelectorAll('form input[name="redirect"]').forEach(function (input) {
    input.value = window.location.origin + "/thank-you/";
  });

  /* ---------- WhatsApp click tracking, ready for GA4 ---------- */
  document.addEventListener("click", function (e) {
    var link = e.target.closest && e.target.closest('a[href*="wa.me"]');
    if (!link) return;
    if (typeof window.gtag === "function") {
      window.gtag("event", "whatsapp_click", {
        placement: link.getAttribute("data-where") || "untagged",
        page: window.location.pathname
      });
    }
  });

  /* ---------- Motion ----------
     Elements fade up as they enter the viewport. Everything degrades to
     plain visible content when JavaScript, IntersectionObserver or motion
     preferences say no. Markup stays clean: the attributes are added here. */

  var wantsMotion = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!wantsMotion || !("IntersectionObserver" in window)) return;

  /* [selector, milliseconds of stagger between siblings] */
  var GROUPS = [
    [".hero__inner > *", 110],
    [".sec-head > *", 70],
    [".gateway__copy > *", 80],
    [".gateway__media", 0],
    [".card", 90],
    [".track__item", 90],
    [".logo-grid li", 45],
    [".halal__copy > *", 70],
    [".halal__pattern", 120],
    [".step", 80],
    [".gallery img", 45],
    [".faq details", 60],
    [".form-card", 0],
    [".form-aside > *", 90],
    [".contact-info > *", 80],
    [".page-head .wrap > *", 80],
    [".footer-cta > *", 100],
    [".track", 0]
  ];

  GROUPS.forEach(function (group) {
    var nodes = document.querySelectorAll(group[0]);
    var step = group[1];
    var perParent = new Map();

    Array.prototype.forEach.call(nodes, function (el) {
      var parent = el.parentNode;
      var i = perParent.get(parent) || 0;
      perParent.set(parent, i + 1);
      if (group[0] !== ".track") el.setAttribute("data-reveal", "");
      el.style.setProperty("--d", i * step + "ms");
    });
  });

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );

  document.querySelectorAll("[data-reveal], .track").forEach(function (el) {
    observer.observe(el);
  });

  /* The hero is above the fold — reveal it right away rather than waiting
     for a scroll that may never happen. */
  requestAnimationFrame(function () {
    document.querySelectorAll(".hero__inner > *").forEach(function (el) {
      el.classList.add("is-in");
    });
  });

  /* Safety net: anything already on screen after load is shown even if the
     observer never fired. Content must never be stuck invisible. */
  window.addEventListener("load", function () {
    setTimeout(function () {
      document.querySelectorAll("[data-reveal]:not(.is-in)").forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add("is-in");
      });
    }, 400);
  });
})();
