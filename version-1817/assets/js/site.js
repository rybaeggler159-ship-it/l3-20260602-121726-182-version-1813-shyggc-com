(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-nav]");
        if (toggle && nav) {
            toggle.addEventListener("click", function () {
                nav.classList.toggle("open");
            });
        }

        var slider = document.querySelector("[data-hero-slider]");
        if (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
            var active = 0;

            function show(index) {
                active = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("active", slideIndex === active);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("active", dotIndex === active);
                });
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    show(index);
                });
            });

            if (slides.length > 1) {
                window.setInterval(function () {
                    show(active + 1);
                }, 5200);
            }
        }

        var input = document.querySelector("[data-filter-input]");
        var select = document.querySelector("[data-filter-select]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));

        function filterCards() {
            var keyword = input ? input.value.trim().toLowerCase() : "";
            var typeValue = select ? select.value : "";

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-type")
                ].join(" ").toLowerCase();
                var cardType = card.getAttribute("data-type") || "";
                var matchesText = !keyword || text.indexOf(keyword) !== -1;
                var matchesType = !typeValue || cardType === typeValue;
                card.classList.toggle("hidden-card", !(matchesText && matchesType));
            });
        }

        if (input) {
            input.addEventListener("input", filterCards);
        }
        if (select) {
            select.addEventListener("change", filterCards);
        }
    });
}());
