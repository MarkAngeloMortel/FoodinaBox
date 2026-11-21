/* Mobile parallax: banner and hero photos move slower than the page.
   Only runs on phones (<=767px); desktop keeps its own CSS. */
(function () {
  var mq = window.matchMedia('(max-width:767px)');
  var items = [], ticking = false, reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  function build() {
    document.querySelectorAll('.background_content, .starter_container').forEach(function (el) {
      if (el.classList.contains('has-plx')) return;
      var bg = getComputedStyle(el).backgroundImage;
      if (!bg || bg === 'none') return;
      var layer = document.createElement('div');
      layer.className = 'plx-layer';
      layer.style.backgroundImage = bg;
      el.insertBefore(layer, el.firstChild);
      el.classList.add('has-plx');
      items.push({ el: el, layer: layer, hero: el.classList.contains('starter_container') });
    });
  }

  function update() {
    ticking = false;
    if (!mq.matches || reduce) { items.forEach(function (it) { it.layer.style.transform = ''; }); return; }
    var vh = window.innerHeight, y = window.pageYOffset;
    items.forEach(function (it) {
      var r = it.el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      var t;
      if (it.hero) t = Math.min(80, Math.max(0, y * 0.25));
      else t = -Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / vh)) * 30;
      it.layer.style.transform = 'translate3d(0,' + t.toFixed(1) + 'px,0)';
    });
  }

  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }

  function init() {
    build();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
