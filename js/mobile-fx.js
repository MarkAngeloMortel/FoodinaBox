/* Mobile effects: heading reveal, fade-up on scroll. Phones only; skipped for "reduce motion". */
(function () {
  if (!window.matchMedia('(max-width:767px)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion:reduce)').matches || !('IntersectionObserver' in window)) return;
  var de = document.documentElement; de.classList.add('fx');
  var sel = ['.background_content h1', '.rating-summary', '.review-card', '.img-section img', '.img-section .ph',
             '.text-content .desc-text', '.info-chips', '#filter-list', '#reservation .right-text', '.contact_item'];
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll(sel.join(',')).forEach(function (el, i) {
    el.classList.add('fx-rv');
    var sib = Array.prototype.indexOf.call(el.parentNode.children, el);
    el.style.transitionDelay = Math.min(sib, 3) * 80 + 'ms';
    io.observe(el);
  });
})();
