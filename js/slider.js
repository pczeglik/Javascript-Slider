var Slider = (function ($) {
    "use strict";
    var defaults = {
            slider: 'slider',
            nav: 'slider-nav',
            slides: 'slides',
            slide: 'slide',
            pager: 'slider-pager',
            pagerElementClass: 'pager-element',
            pagerCurrentClass: 'current',

            timeToSlide: 5000,
            displayPager: false,
            displayNav: false,
            autoStart: false
        },
        Constr = function (opts) {
            this.config = (opts !== 'undefined')
                ? $.extend({}, defaults, opts)
                : $.extend({}, defaults);
            this.init();
        };

    // Initialize Slider
    Constr.prototype.init = function () {
        this.currentSlide = -1;
        this.isSlideDisabled = false;

        this.slides = $('.' + this.config.slide);
        this.slidesCount = this.countSlides();

        this.config.displayNav && this.displayNav();
        this.config.displayPager && this.generatePager();
        this.config.autoStart && this.start();

        this.registerEvents();

        if (this.currentSlide === -1) {
            this.currentSlide = 0;
            $(this.slides[0]).css({
                left: 0
            });
            $('.' + this.config.slides).fadeIn(1000);
        }
    };

    // CONTROL

    // Start sliding
    Constr.prototype.start = function () {
        var self = this;
        this.interval = setInterval(function () {
            self.next();
        }, this.config.timeToSlide);
    };

    // Stop sliding
    Constr.prototype.stop = function () {
        if (this.setinterval !== 'undefined') {
            clearInterval(this.interval);
        }
    };

    // Slide to next slide
    Constr.prototype.next = function (next) {
        if (typeof next !== 'undefined') {
            this.goTo(1, next);
        } else {
            this.goTo(1);
        }
    };

    // Slide to previous slide
    Constr.prototype.prev = function (prev) {
        if (typeof prev !== 'undefined') {
            this.goTo(-1, prev);
        } else {
            this.goTo(-1);
        }
    };

    // Go to slide
    Constr.prototype.goTo = function (dir, go) {
        var current = this.currentSlide,
            last = this.slidesCount - 1,
            next;
        if (typeof go !== 'undefined') {
            this.animate(dir, current, go);
            this.currentSlide = go;
        } else {
            if (dir === 1) {
                next = (current === last) ? 0 : current + 1;
            } else if (dir === -1) {
                next = (current === 0) ? last : current - 1;
            }
            this.animate(dir, current, next);
            this.currentSlide = next;
        }
        this.pagerSetCurrentElement();
    };

    // Go to slide when user clicks on pager nav's element
    Constr.prototype.pagerGoTo = function (slide) {
        var current = this.currentSlide,
            clicked = slide - 1;
        this.stop();
        if (clicked < current) {
            this.prev(clicked);
        } else if (clicked > current) {
            this.next(clicked);
        }
        this.start();
    };

    // Animate slides move
    Constr.prototype.animate = function (dir, first, second) {
        var self = this;
        $(this.slides[second]).css({
            left: dir * 960
        });
        $(this.slides[first]).animate({
            left: dir * -960
        }, 1000, 'easeInOutExpo');
        $(this.slides[second]).animate({
            left: 0
        }, 1000, 'easeInOutExpo', function () {
            self.isSlideDisabled = false;
        });
    };

    // APPERIANCE

    // Display nav
    Constr.prototype.displayNav = function () {
        $('.' + this.config.nav).fadeIn();
    };

    // Generate pager
    Constr.prototype.generatePager = function () {
        var wrap,
            slidesCount = this.countSlides(),
            cfg = this.config,
            i;

        if (slidesCount !== 'undefined') {
            wrap = $('<ul>');
            for (i = 1; i <= slidesCount; i += 1) {
                if (i === 1) {
                    $('<li>').addClass(cfg.pagerElementClass + ' ' + cfg.pagerCurrentClass).text(i).appendTo(wrap);
                } else {
                    $('<li>').addClass(cfg.pagerElementClass).text(i).appendTo(wrap);
                }
            }
            wrap.appendTo($('.' + cfg.pager));
        }
        this.setPagerPos();
    };

    // Positioning pager on page
    Constr.prototype.setPagerPos = function () {
        var pagerWidth = this.getPagerWidth(),
            pagerLeft = ~~((960 - pagerWidth) / 2) + 'px';
        $('.' + this.config.pager).css({
            width: pagerWidth,
            left: pagerLeft
        });
    };

    // Indicate current slide on pager
    Constr.prototype.pagerSetCurrentElement = function () {
        var cfg = this.config,
            pagerElements = $('.' + cfg.pager).find('li');
        if (cfg.displayPager) {
            $('.' + cfg.pager).find('.' + cfg.pagerCurrentClass).removeClass(cfg.pagerCurrentClass);
            $(pagerElements[this.currentSlide]).addClass(cfg.pagerCurrentClass);
        }
    };

    // EVENTS

    /*
	 * Register event
	 *
	 * @param $elem {jQuery object}
	 * @param event {string} jQuery event
	 * @param callback {function}
	 *
	 * @return {jQuery object} or {array} of jQuery objects
	*/
    Constr.prototype.registerEvent = function ($elem, event, callback) {
        $elem.on(event, callback);
    };

    // Register Events
    Constr.prototype.registerEvents = function () {
        var self = this,
            navElements = $('.' + this.config.nav).find('a');

        // Register event for click pager nav's element
        this.registerEvent(navElements, 'click', function (e) {
            if (!self.isSlideDisabled) {
                if ($(this).hasClass('next')) {
                    self.next();
                } else {
                    self.prev();
                }
                self.isSlideDisabled = true;
            }
            e.preventDefault();
            e.stopPropagation();
        });

        // Stop sliding when user enter slider nav's element
        this.registerEvent(navElements, 'mouseenter', function () {
            self.stop();
        });

        // Start sliding when user leave slider nav's element
        this.registerEvent(navElements, 'mouseleave', function () {
            self.start();
        });

        // Click on pager element
        this.registerEvent($('.' + self.config.pagerElementClass), 'click', function () {
            var index;
            if (!self.isSlideDisabled) {
                index = parseInt($(this).text(), 10);
                self.pagerGoTo(index);
                self.isSlideDisabled = true;
            }
        });
    };

    // HELPERS

    /*
	 * Count slides
	 * @return {int}
	*/
    Constr.prototype.countSlides = function () {
        return $('.' + this.config.slides).find('.' + this.config.slide).length;
    };

    /*
	 * Get pager width
	 * @return {int}
	*/
    Constr.prototype.getPagerWidth = function () {
        return $('.' + this.config.pager).width();
    };

    return Constr;
}(jQuery));
