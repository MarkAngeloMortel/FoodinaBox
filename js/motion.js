/* Motion + navigation behaviour
   - navbar hides on scroll down, returns on scroll up
   - hamburger / mobile menu open state (CSS does the morph + fade/slide)
   - scroll-spy: highlights the current section in the navbar and the phone bottom bar
   - smooth scrolling that stops below the fixed navbar */
(function ($) {
  'use strict';

  var doc = document, root = doc.documentElement, win = window;
  var nav = doc.querySelector('.navbar-fixed-top');
  if (!nav) return;

  var collapseEl = doc.getElementById('bs-example-navbar-collapse-1');
  var reduceMotion = win.matchMedia && win.matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* Sections in page order. The contact block starts at the social bar above the map. */
  var SECTIONS = ['top', 'story', 'menu', 'beer', 'reviews', 'featured', 'reservation', 'contact'];

  /* ---------- Navbar height, shared with CSS as --nav-h ---------- */
  var navH = 70;
  function measureNav() {
    if (nav.classList.contains('nav-open')) return;          // menu open = taller; keep the closed height
    if (collapseEl && collapseEl.classList.contains('collapsing')) return;   // mid-animation = wrong height
    navH = nav.offsetHeight || navH;
    root.style.setProperty('--nav-h', navH + 'px');
  }

  /* ---------- Helpers ---------- */
  function docHeight() { return Math.max(doc.body.scrollHeight, root.scrollHeight); }
  function maxScroll() { return Math.max(0, docHeight() - win.innerHeight); }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function scrollY() { return win.pageYOffset || root.scrollTop || 0; }

  function sectionEl(id) {
    if (id === 'contact') return doc.querySelector('.social_connect') || doc.getElementById('contact');
    return doc.getElementById(id);
  }
  function sectionTop(id) {
    if (id === 'top') return 0;
    var el = sectionEl(id);
    return el ? el.getBoundingClientRect().top + scrollY() : Infinity;
  }

  /* ---------- Navbar show / hide ---------- */
  var hidden = false, lastY = scrollY(), menuOpen = false, locked = false;
  function showNav() { if (hidden) { hidden = false; nav.classList.remove('nav-hidden'); } }
  function hideNav() { if (!hidden) { hidden = true; nav.classList.add('nav-hidden'); } }

  function updateNavbar() {
    var y = clamp(scrollY(), 0, maxScroll());
    nav.classList.toggle('nav-scrolled', y > 10);
    if (locked || menuOpen) { showNav(); lastY = y; return; }
    var dy = y - lastY;
    if (Math.abs(dy) < 8) return;                             // ignore jitter; small moves add up
    if (y <= navH || dy < 0) showNav(); else hideNav();
    lastY = y;
  }

  /* Keyboard users tabbing into the navbar always get it back */
  nav.addEventListener('focusin', showNav);

  /* ---------- Mobile menu state (CSS animates from .nav-open) ---------- */
  if (collapseEl) {
    $(collapseEl)
      .on('show.bs.collapse', function (e) {
        if (e.target !== collapseEl) return;
        menuOpen = true; nav.classList.add('nav-open'); showNav();
      })
      .on('hide.bs.collapse', function (e) {
        if (e.target !== collapseEl) return;
        menuOpen = false; nav.classList.remove('nav-open'); lastY = scrollY();
      })
      .on('hidden.bs.collapse', function () { setTimeout(measureNav, 30); });   // Bootstrap 3.2 fires this before it resets its classes
  }
  function closeMenu() {
    if (collapseEl && menuOpen) $(collapseEl).collapse('hide');
  }

  /* ---------- Scroll-spy: navbar links + bottom bar ---------- */
  var current = null;
  function currentSection() {
    var vh = win.innerHeight;
    var marker = scrollY() + Math.max(navH + 40, vh * 0.35);  // a section counts once it fills the upper third
    var found = 'top';
    for (var i = 0; i < SECTIONS.length; i++) {
      if (sectionTop(SECTIONS[i]) <= marker) found = SECTIONS[i];
    }
    if (scrollY() + vh >= docHeight() - 2) found = 'contact';
    return found;
  }

  function setActive(id) {
    if (id === current) return;
    current = id;
    var links = doc.querySelectorAll('.main-nav a'), i, on;
    for (i = 0; i < links.length; i++) {
      on = links[i].getAttribute('href') === '#' + id;
      links[i].classList.toggle('navactive', on);
      if (on) links[i].setAttribute('aria-current', 'location'); else links[i].removeAttribute('aria-current');
    }
    var bar = doc.querySelectorAll('.mbar a[data-nav]');
    for (i = 0; i < bar.length; i++) {
      on = bar[i].getAttribute('data-nav') === '#' + id;
      bar[i].classList.toggle('is-active', on);
      if (on) bar[i].setAttribute('aria-current', 'location'); else bar[i].removeAttribute('aria-current');
    }
  }

  function updateSpy() { if (!locked) setActive(currentSection()); }

  /* ---------- Smooth scrolling ---------- */
  var raf = 0;
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }   // easeInOutCubic

  function cancelScroll() {
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    if (locked) { locked = false; lastY = scrollY(); updateSpy(); }
  }

  /* targetFn is re-read every frame, so late-loading images can't leave us short */
  function scrollToTarget(targetFn, done) {
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    var start = scrollY();
    var first = clamp(targetFn(), 0, maxScroll());
    var dist = Math.abs(first - start);
    function finish() {
      raf = 0; locked = false; lastY = scrollY();
      updateSpy();
      if (done) done();
    }
    locked = true; showNav();
    if (reduceMotion || dist < 2) { win.scrollTo(0, first); finish(); return; }
    var dur = clamp(dist * 0.4, 450, 1000), t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      var end = clamp(targetFn(), 0, maxScroll());
      win.scrollTo(0, start + (end - start) * ease(p));
      if (p < 1) raf = requestAnimationFrame(step); else finish();
    }
    raf = requestAnimationFrame(step);
  }

  /* The user grabbing the page ends the animation */
  ['wheel', 'touchstart', 'mousedown', 'keydown'].forEach(function (ev) {
    win.addEventListener(ev, function () { if (raf) cancelScroll(); }, { passive: true });
  });

  $(doc).on('click', 'a[href^="#"]:not([data-slide]):not([data-toggle])', function (e) {
    var a = this, hash = a.hash, el, isTop = false;
    if (hash.length > 1) {
      el = doc.getElementById(decodeURIComponent(hash.slice(1)));
      if (!el) return;                                        // unknown anchor: leave the browser alone
    } else if (a.getAttribute('href') === '#') {
      isTop = true;                                           // plain "#" (brand logo) = back to top
    } else { return; }

    e.preventDefault();
    closeMenu();

    /* Hero buttons and the bottom bar aim a little lower, and highlight the section they belong to */
    var gap = $(a).is('.hero-btn, .mbar-link') ? 10 : 0;
    var id = isTop ? 'top' : ($(a).data('nav') || hash).replace('#', '');
    if (SECTIONS.indexOf(id) !== -1) setActive(id);

    scrollToTarget(function () {
      if (isTop) return 0;
      return el.getBoundingClientRect().top + scrollY() - (navH + gap);
    }, function () {
      try { history.replaceState(null, '', isTop ? (location.pathname + location.search) : hash); } catch (err) {}
    });
  });

  /* ---------- Wire up ---------- */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; updateNavbar(); updateSpy(); });
  }
  win.addEventListener('scroll', onScroll, { passive: true });
  win.addEventListener('resize', function () { measureNav(); onScroll(); });
  win.addEventListener('load', function () { measureNav(); updateSpy(); });

  measureNav();
  updateNavbar();
  setActive(currentSection());
})(jQuery);
