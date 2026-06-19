(function () {
    var mobileButton = document.querySelector('.mobile-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (mobileButton && mobileNav) {
        mobileButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function startHero() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var nextIndex = Number(dot.getAttribute('data-hero-dot')) || 0;
                showSlide(nextIndex);
                startHero();
            });
        });

        startHero();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupFilter(form) {
        var list = document.querySelector('[data-filter-list]');

        if (!form || !list) {
            return;
        }

        var input = form.querySelector('input');
        var select = form.querySelector('select');
        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';

        if (input && initial) {
            input.value = initial;
        }

        function matches(card, query) {
            if (!query) {
                return true;
            }

            var data = [
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-category'),
                card.getAttribute('data-region'),
                card.getAttribute('data-keywords')
            ].map(normalize).join(' ');

            return data.indexOf(query) !== -1;
        }

        function apply() {
            var query = normalize(input ? input.value : '');
            var mode = select ? select.value : 'default';
            var sorted = cards.slice();

            if (mode === 'year-desc') {
                sorted.sort(function (a, b) {
                    return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
                });
            }

            if (mode === 'year-asc') {
                sorted.sort(function (a, b) {
                    return Number(a.getAttribute('data-year')) - Number(b.getAttribute('data-year'));
                });
            }

            if (mode === 'title') {
                sorted.sort(function (a, b) {
                    return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-Hans-CN');
                });
            }

            sorted.forEach(function (card) {
                card.classList.toggle('is-hidden', !matches(card, query));
                list.appendChild(card);
            });
        }

        if (input) {
            input.addEventListener('input', apply);
        }

        if (select) {
            select.addEventListener('change', apply);
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            apply();
        });

        apply();
    }

    setupFilter(document.querySelector('[data-local-filter]'));
    setupFilter(document.querySelector('[data-search-filter]'));

    function setupPlayer(shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('.play-trigger');

        if (!video || !button) {
            return;
        }

        var source = video.getAttribute('data-src');
        var hlsInstance = null;
        var initialized = false;

        function initialize() {
            if (initialized) {
                return;
            }

            initialized = true;

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                video.src = source;
            }
        }

        function play() {
            initialize();
            shell.classList.add('playing');
            var promise = video.play();

            if (promise && promise.catch) {
                promise.catch(function () {
                    shell.classList.remove('playing');
                });
            }
        }

        button.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            shell.classList.add('playing');
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                shell.classList.remove('playing');
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
})();
