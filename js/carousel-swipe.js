/* Swipe left/right to change slides on touch screens (Bootstrap 3 carousels). */
(function ($) {
  $(function () {
    $('.carousel').each(function () {
      var $c = $(this), x0 = 0, y0 = 0, moved = false;
      $c.on('touchstart', function (e) {
        var t = e.originalEvent.touches[0]; x0 = t.clientX; y0 = t.clientY; moved = true;
      });
      $c.on('touchend', function (e) {
        if (!moved) return; moved = false;
        var t = e.originalEvent.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
          $c.carousel(dx < 0 ? 'next' : 'prev');
        }
      });
    });
  });
})(jQuery);
