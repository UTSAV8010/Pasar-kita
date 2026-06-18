(function ($) {
    "use strict";

    // Spinner (page loader)
    var spinner = function () {
        const spinnerEl = document.getElementById("spinner");
        if (!spinnerEl) {
            return;
        }

        if (!spinnerEl.dataset.loaderReady) {
            spinnerEl.dataset.loaderReady = "1";
            spinnerEl.innerHTML = '<div class="loader-wrap" role="status" aria-live="polite"><span class="loader-dot"></span><span class="loader-dot"></span><span class="loader-dot"></span><span class="loader-bar" aria-hidden="true"></span></div>';
        }

        const root = document.documentElement;
        const primary = getComputedStyle(root).getPropertyValue("--primary").trim() || "#fea116";
        const toRgb = function (color) {
            if (!color) return null;
            if (color.startsWith("#")) {
                let hex = color.replace("#", "");
                if (hex.length === 3) {
                    hex = hex.split("").map((c) => c + c).join("");
                }
                if (hex.length !== 6) return null;
                const r = parseInt(hex.slice(0, 2), 16);
                const g = parseInt(hex.slice(2, 4), 16);
                const b = parseInt(hex.slice(4, 6), 16);
                return { r, g, b };
            }
            const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
            if (!match) return null;
            return { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]) };
        };
        const rgb = toRgb(primary);
        if (rgb) {
            const mix = function (channel) {
                return Math.round(channel + (255 - channel) * 0.84);
            };
            const bg = "rgb(" + mix(rgb.r) + ", " + mix(rgb.g) + ", " + mix(rgb.b) + ")";
            root.style.setProperty("--loader-bg", bg);
            root.style.setProperty("--loader-dot", primary);
        }

        $(window).on("load", function () {
            setTimeout(function () {
                if ($('#spinner').length > 0) {
                    $('#spinner').removeClass('show');
                }
            }, 250);
        });
    };
    spinner();
    
    
    // Initiate the wowjs
    new WOW().init();

    // Card skeleton loading (frontend cards)
    const skeletonSelector = ".card, .category-card, .room-item, .testimonial-item, .service-item, .team-item, .restro-card";
    const skeletonTargets = Array.from(document.querySelectorAll(skeletonSelector));

    const clearSkeleton = function (el) {
        el.classList.remove("skeleton-loading");
    };

    if (skeletonTargets.length) {
        skeletonTargets.forEach(function (el) {
            el.classList.add("skeleton-loading");

            const images = Array.from(el.querySelectorAll("img"));
            if (!images.length) {
                setTimeout(function () {
                    clearSkeleton(el);
                }, 300);
                return;
            }

            let loadedCount = 0;
            const done = function () {
                loadedCount += 1;
                if (loadedCount >= images.length) {
                    clearSkeleton(el);
                }
            };

            images.forEach(function (img) {
                if (img.complete) {
                    done();
                } else {
                    img.addEventListener("load", done, { once: true });
                    img.addEventListener("error", done, { once: true });
                }
            });
        });

        if (document.readyState === "complete" || document.readyState === "interactive") {
            skeletonTargets.forEach(clearSkeleton);
        } else {
            window.addEventListener("load", function () {
                skeletonTargets.forEach(clearSkeleton);
            });
        }
    }


    // Sticky Navbar
    
    $(window).scroll(function () {
        if ($(this).scrollTop() > 0) {
            $('.navbar').addClass('sticky-top shadow-sm');
        } else {
            $('.navbar').removeClass('sticky-top shadow-sm');
        }
    }); 
    
    
    // Dropdown on mouse hover
    const $dropdown = $(".dropdown");
    const $dropdownToggle = $(".dropdown-toggle");
    const $dropdownMenu = $(".dropdown-menu");
    const showClass = "show";
    
    $(window).on("load resize", function() {
        if (this.matchMedia("(min-width: 992px)").matches) {
            $dropdown.hover(
            function() {
                const $this = $(this);
                $this.addClass(showClass);
                $this.find($dropdownToggle).attr("aria-expanded", "true");
                $this.find($dropdownMenu).addClass(showClass);
            },
            function() {
                const $this = $(this);
                $this.removeClass(showClass);
                $this.find($dropdownToggle).attr("aria-expanded", "false");
                $this.find($dropdownMenu).removeClass(showClass);
            }
            );
        } else {
            $dropdown.off("mouseenter mouseleave");
        }
    });

    // Mobile drawer navigation (all pages with #navbarCollapse)
    const setupMobileDrawerNav = function () {
        const navCollapse = document.getElementById("navbarCollapse");
        const navToggler = document.querySelector('[data-bs-target="#navbarCollapse"], [aria-controls="navbarCollapse"]');

        if (!navCollapse || !navToggler) {
            return;
        }

        const nav = navToggler.closest(".navbar");
        if (!nav) {
            return;
        }

        const brandImg = nav.querySelector(".navbar-brand img");
        const logoSrc = brandImg ? brandImg.getAttribute("src") : "images/logo2.png";
        const logoAlt = brandImg ? (brandImg.getAttribute("alt") || "Logo") : "Logo";

        let mobileTitle = navCollapse.querySelector(".mobile-menu-title");
        if (!mobileTitle) {
            mobileTitle = document.createElement("div");
            mobileTitle.className = "mobile-menu-title d-lg-none";
            navCollapse.prepend(mobileTitle);
        }

        mobileTitle.innerHTML = '<span class="mobile-menu-logo"><img src="' + logoSrc + '" alt="' + logoAlt + '"></span><button type="button" class="mobile-close-btn" aria-label="Close menu"><i class="fa fa-times"></i></button>';

        let navBackdrop = nav.parentElement.querySelector(".mobile-menu-backdrop");
        if (!navBackdrop) {
            navBackdrop = document.createElement("div");
            navBackdrop.className = "mobile-menu-backdrop d-lg-none";
            nav.insertAdjacentElement("afterend", navBackdrop);
        }

        const navCloseBtn = navCollapse.querySelector(".mobile-close-btn");

        const updateToggleIcon = function (isOpen) {
            const icon = navToggler.querySelector(".fa");
            if (icon) {
                icon.classList.toggle("fa-bars", !isOpen);
                icon.classList.toggle("fa-times", isOpen);
            }
        };

        const openNav = function () {
            navCollapse.classList.add("show");
            document.body.classList.add("mobile-nav-open");
            navBackdrop.classList.add("show");
            updateToggleIcon(true);
        };

        const closeNav = function () {
            navCollapse.classList.remove("show");
            document.body.classList.remove("mobile-nav-open");
            navBackdrop.classList.remove("show");
            navCollapse.querySelectorAll(".dropdown-menu.show").forEach(function (m) {
                m.classList.remove("show");
            });
            navCollapse.querySelectorAll(".dropdown-toggle[aria-expanded='true']").forEach(function (t) {
                t.setAttribute("aria-expanded", "false");
            });
            updateToggleIcon(false);
        };

        if (!navCollapse.dataset.mobileDrawerBound) {
            navToggler.removeAttribute("data-bs-toggle");
            navToggler.setAttribute("aria-controls", "navbarCollapse");
            navToggler.setAttribute("aria-expanded", "false");

            navToggler.addEventListener("click", function (e) {
                if (window.innerWidth >= 992) {
                    return;
                }
                e.preventDefault();
                if (navCollapse.classList.contains("show")) {
                    closeNav();
                } else {
                    openNav();
                }
            });

            if (navCloseBtn) {
                navCloseBtn.addEventListener("click", function (e) {
                    e.preventDefault();
                    closeNav();
                });
            }

            navBackdrop.addEventListener("click", function () {
                closeNav();
            });

            navCollapse.querySelectorAll(".nav-link, .dropdown-item, .btn").forEach(function (el) {
                el.addEventListener("click", function () {
                    if (window.innerWidth < 992 && !el.classList.contains("dropdown-toggle")) {
                        closeNav();
                    }
                });
            });

            // Reliable mobile submenu toggle
            navCollapse.querySelectorAll(".dropdown-toggle").forEach(function (toggle) {
                toggle.removeAttribute("data-bs-toggle");
                toggle.setAttribute("aria-expanded", "false");
            });

            navCollapse.addEventListener("click", function (e) {
                const toggle = e.target.closest(".dropdown-toggle");
                if (!toggle || window.innerWidth >= 992) {
                    return;
                }
                e.preventDefault();
                e.stopPropagation();

                const parent = toggle.closest(".dropdown");
                const menu = parent ? parent.querySelector(".dropdown-menu") : null;
                if (!menu) {
                    return;
                }

                const willOpen = !menu.classList.contains("show");
                navCollapse.querySelectorAll(".dropdown-menu.show").forEach(function (m) {
                    m.classList.remove("show");
                });
                navCollapse.querySelectorAll(".dropdown-toggle[aria-expanded='true']").forEach(function (t) {
                    t.setAttribute("aria-expanded", "false");
                });

                if (willOpen) {
                    menu.classList.add("show");
                    toggle.setAttribute("aria-expanded", "true");
                }
            });

            window.addEventListener("resize", function () {
                if (window.innerWidth >= 992) {
                    closeNav();
                }
            });

            navCollapse.dataset.mobileDrawerBound = "1";
        }
    };
    setupMobileDrawerNav();

    // Remove inner-page hero headers and keep home hero only
    document.querySelectorAll(".hero-header").forEach(function (hero) {
        if (hero.querySelector(".breadcrumb")) {
            hero.remove();
        }
    });

    // Keep header identical to home style on all pages
    document.querySelectorAll('#navbarCollapse > a.nav-item.nav-link[href="login.php"]').forEach(function (el) {
        el.remove();
    });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Facts counter
    $('[data-toggle="counter-up"]').counterUp({
        delay: 10,
        time: 2000
    });


    // Modal Video
    $(document).ready(function () {
        var $videoSrc;
        $('.btn-play').click(function () {
            $videoSrc = $(this).data("src");
        });
        console.log($videoSrc);

        $('#videoModal').on('shown.bs.modal', function (e) {
            $("#video").attr('src', $videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0");
        })

        $('#videoModal').on('hide.bs.modal', function (e) {
            $("#video").attr('src', $videoSrc);
        })
    });


    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        center: true,
        margin: 24,
        dots: true,
        loop: true,
        nav : false,
        responsive: {
            0:{
                items:1
            },
            768:{
                items:2
            },
            992:{
                items:3
            }
        }
    });
    
})(jQuery);
