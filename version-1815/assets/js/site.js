document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector(".nav-toggle");
    var mobileNav = document.getElementById("mobileNav");

    if (toggle && mobileNav) {
        toggle.addEventListener("click", function () {
            var opened = mobileNav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    setupHero();
    setupFilters();
    applyQuerySearch();
});

function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
        return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, current) {
            slide.classList.toggle("is-active", current === index);
        });
        dots.forEach(function (dot, current) {
            dot.classList.toggle("is-active", current === index);
        });
    }

    function start() {
        stop();
        timer = window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function stop() {
        if (timer) {
            window.clearInterval(timer);
        }
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            show(Number(dot.getAttribute("data-hero-dot")) || 0);
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

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
}

function setupFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
    var years = Array.prototype.slice.call(document.querySelectorAll("[data-year-filter]"));

    inputs.forEach(function (input) {
        input.addEventListener("input", filterCards);
    });

    years.forEach(function (select) {
        select.addEventListener("change", filterCards);
    });
}

function applyQuerySearch() {
    var input = document.querySelector("[data-filter-input]");
    if (!input) {
        return;
    }

    var query = new URLSearchParams(window.location.search).get("q");
    if (query) {
        input.value = query;
        filterCards();
    }
}

function filterCards() {
    var input = document.querySelector("[data-filter-input]");
    var year = document.querySelector("[data-year-filter]");
    var list = document.querySelector("[data-filter-list]");
    var empty = document.querySelector("[data-empty-state]");

    if (!list) {
        return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll(".searchable-card"));
    var keyword = input ? input.value.trim().toLowerCase() : "";
    var selectedYear = year ? year.value : "";
    var visible = 0;

    cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var cardYear = card.getAttribute("data-year") || "";
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedYear = !selectedYear || cardYear === selectedYear;
        var matched = matchedKeyword && matchedYear;
        card.classList.toggle("is-filter-hidden", !matched);
        if (matched) {
            visible += 1;
        }
    });

    if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
    }
}

function initPlayer(source) {
    var video = document.getElementById("movieVideo");
    var button = document.querySelector(".play-cover");
    var hlsInstance = null;

    if (!video || !source) {
        return;
    }

    function attachSource() {
        if (video.getAttribute("data-ready") === "1") {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (typeof Hls !== "undefined" && Hls.isSupported()) {
            hlsInstance = new Hls();
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
        } else {
            video.src = source;
        }

        video.setAttribute("data-ready", "1");
    }

    function playVideo() {
        attachSource();
        if (button) {
            button.classList.add("is-hidden");
        }
        var action = video.play();
        if (action && typeof action.catch === "function") {
            action.catch(function () {});
        }
    }

    if (button) {
        button.addEventListener("click", playVideo);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            playVideo();
        }
    });

    video.addEventListener("play", function () {
        if (button) {
            button.classList.add("is-hidden");
        }
    });

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
