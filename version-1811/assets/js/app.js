(function () {
    var body = document.body;
    var prefix = body ? body.getAttribute("data-prefix") || "" : "";

    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function setupNavigation() {
        var toggle = $(".nav-toggle");
        var nav = $(".main-nav");
        if (!toggle || !nav) {
            return;
        }

        toggle.addEventListener("click", function () {
            var isOpen = nav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    function setupHero() {
        var slides = $all("[data-hero-slide]");
        if (slides.length === 0) {
            return;
        }

        var dots = $all("[data-hero-target]");
        var prev = $(".hero-prev");
        var next = $(".hero-next");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-target")) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        start();
    }

    function setupSearchForms() {
        $all(".js-search-form").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                var query = input ? input.value.trim() : "";
                if (!query) {
                    event.preventDefault();
                    if (input) {
                        input.focus();
                    }
                    return;
                }
                form.setAttribute("action", prefix + "search.html");
            });
        });
    }

    function setupFiltering() {
        var lists = $all(".js-filter-list");
        if (lists.length === 0) {
            return;
        }

        var input = $(".filter-input");
        var queryInput = $(".js-query-input");
        var count = $(".filter-count");
        var chips = $all(".filter-chip");
        var activeYear = "all";

        function getQueryFromUrl() {
            try {
                return new URLSearchParams(window.location.search).get("q") || "";
            } catch (error) {
                return "";
            }
        }

        function setInitialQuery() {
            var query = getQueryFromUrl();
            if (query && queryInput) {
                queryInput.value = query;
            } else if (query && input) {
                input.value = query;
            }
        }

        function applyFilter() {
            var keyword = normalize(input ? input.value : "");
            var visible = 0;

            lists.forEach(function (list) {
                $all(".movie-card", list).forEach(function (card) {
                    var text = normalize(card.getAttribute("data-search"));
                    var year = card.getAttribute("data-year") || "";
                    var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var matchesYear = activeYear === "all" || year === activeYear;
                    var shouldShow = matchesKeyword && matchesYear;
                    card.classList.toggle("is-hidden", !shouldShow);
                    if (shouldShow) {
                        visible += 1;
                    }
                });
            });

            if (count) {
                count.textContent = "显示 " + visible + " 部";
            }
        }

        if (input) {
            input.addEventListener("input", applyFilter);
        }

        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                chips.forEach(function (item) {
                    item.classList.remove("is-active");
                });
                chip.classList.add("is-active");
                activeYear = chip.getAttribute("data-filter") || "all";
                applyFilter();
            });
        });

        setInitialQuery();
        applyFilter();
    }

    function setupPlayers() {
        $all(".player").forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector(".player-start");
            var status = player.querySelector(".player-status");
            var source = player.getAttribute("data-video-url");
            var hlsInstance = null;

            if (!video || !button || !source) {
                return;
            }

            function setStatus(message) {
                if (status) {
                    status.textContent = message || "";
                }
            }

            function attachSource() {
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    return Promise.resolve();
                }

                if (window.Hls && window.Hls.isSupported()) {
                    if (hlsInstance) {
                        hlsInstance.destroy();
                    }
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    return Promise.resolve();
                }

                video.src = source;
                return Promise.resolve();
            }

            button.addEventListener("click", function () {
                button.disabled = true;
                setStatus("正在加载播放源…");
                attachSource()
                    .then(function () {
                        video.controls = true;
                        button.classList.add("is-hidden");
                        var playPromise = video.play();
                        if (playPromise && typeof playPromise.then === "function") {
                            return playPromise;
                        }
                        return null;
                    })
                    .then(function () {
                        setStatus("");
                    })
                    .catch(function () {
                        button.disabled = false;
                        button.classList.remove("is-hidden");
                        setStatus("播放源已绑定，如浏览器拦截自动播放，请再次点击播放按钮。");
                    });
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupNavigation();
        setupHero();
        setupSearchForms();
        setupFiltering();
        setupPlayers();
    });
}());
