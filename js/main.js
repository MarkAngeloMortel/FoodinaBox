/* Page setup. Scrolling, nav highlighting and the navbar behaviour live in js/motion.js */
$(document).ready(function () {
	// Menu filter: open on Breakfast
	$('#portfolio').mixitup({
		targetSelector: '.item',
		transitionSpeed: 350
	});
	$('#portfolio').mixitup('filter', 'breakfast');

	// Menu tabs: ARIA state, roving tabindex, heading + panel label follow the active tab.
	// MixItUp handles the filtering itself; this only keeps the accessibility layer in sync.
	var $tabs = $('#filter-list .filter');
	function selectTab(el) {
		$tabs.attr({'aria-selected': 'false', tabindex: '-1'});
		$(el).attr({'aria-selected': 'true', tabindex: '0'});
		$('#menu-section-title').text($(el).text());
		$('#menu-panel').attr('aria-labelledby', el.id);
		// On phones the tab row scrolls sideways: keep the active tab in view
		if (el.scrollIntoView) { try { el.scrollIntoView({inline: 'center', block: 'nearest', behavior: 'smooth'}); } catch (e) {} }
	}
	$('#filter-list').on('click', '.filter', function () { selectTab(this); });
	// Arrow keys move between tabs, Enter/Space selects (APG "manual activation")
	$('#filter-list').on('keydown', '.filter', function (e) {
		var i = $tabs.index(this), last = $tabs.length - 1, to = null;
		if (e.key === 'ArrowRight') to = i === last ? 0 : i + 1;
		else if (e.key === 'ArrowLeft') to = i === 0 ? last : i - 1;
		else if (e.key === 'Home') to = 0;
		else if (e.key === 'End') to = last;
		else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $(this).trigger('click'); return; }
		if (to !== null) { e.preventDefault(); $tabs.eq(to).trigger('focus'); }
	});

	// jQuery UI's script is not included in js/, so only call the datepicker when it exists
	if ($.fn.datepicker) { $("#datepicker").datepicker(); }
});

/* Reviews slider: keep every slide the same height so the page doesn't jump */
(function ($) {
    function equalizeReviews() {
        var $items = $('#carousel-reviews .carousel-inner > .item');
        if (!$items.length) return;
        $items.css('min-height', '');
        var max = 0;
        $items.each(function () {
            var $i = $(this), wasActive = $i.hasClass('active');
            if (!wasActive) $i.css({display: 'block', visibility: 'hidden', position: 'absolute', width: '100%'});
            max = Math.max(max, $i.outerHeight());
            if (!wasActive) $i.css({display: '', visibility: '', position: '', width: ''});
        });
        $items.css('min-height', max + 'px');
    }
    $(window).on('load resize', equalizeReviews);
})(jQuery);
