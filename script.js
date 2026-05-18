document.addEventListener('DOMContentLoaded', () => {

    // ── Lenis Smooth Scroll ──
    const lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        touchMultiplier: 2,
    });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

    // ── AOS ──
    AOS.init({ duration: 1000, easing: 'ease-out-cubic', once: true, offset: 80 });

    // ── Smooth Scrolling for Anchor Links ──
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            // Special handling for the fixed contact section reveal
            if (targetId === '#contact') {
                lenis.scrollTo('bottom', { duration: 1.5, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
                return;
            }
            
            const target = document.querySelector(targetId);
            if (target) {
                lenis.scrollTo(target, { duration: 1.2 });
            }
        });
    });

    // ── Swiper Testimonials ──
    new Swiper('.testimonial-slider', {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        autoplay: { delay: 5000, disableOnInteraction: false },
        pagination: { el: '.swiper-pagination', clickable: true },
    });

    // ── Navbar scroll state (Grandeur style) ──
    const navbar = document.getElementById('navbar');
    
    lenis.on('scroll', (e) => {
        const currentScrollY = e.scroll;
        
        // Add solid background if not at the very top
        navbar.classList.toggle('scrolled', currentScrollY > 60);

        // Hide on scroll down (direction 1), show on scroll up (direction -1)
        if (currentScrollY > 100 && e.direction === 1) {
            navbar.classList.add('hidden');
        } else if (e.direction === -1 || currentScrollY <= 100) {
            navbar.classList.remove('hidden');
        }
    });

    // ── Mobile menu ──
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeMenu = document.getElementById('closeMenu');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => mobileMenu.classList.add('open'));
        closeMenu.addEventListener('click', () => mobileMenu.classList.remove('open'));
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => mobileMenu.classList.remove('open'));
        });
    }

    // ── Smooth anchor scrolling via Lenis ──
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const id = this.getAttribute('href');
            if (id === '#') return;
            const target = document.querySelector(id);
            if (target) lenis.scrollTo(target, { offset: -80 });
        });
    });

    // ── Counter animation (Buttery-smooth 1.5-second easing) ──
    const counters = document.querySelectorAll('.counter');
    const animateCounters = () => {
        counters.forEach(c => {
            const target = +c.dataset.target;
            const duration = 1500; // exactly 1.5 seconds
            let startTime = null;

            const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

            const step = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / duration, 1);
                const eased = easeOutCubic(progress);
                c.innerText = Math.floor(eased * target);
                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    c.innerText = target + '+';
                }
            };
            requestAnimationFrame(step);
        });
    };
    const statsEl = document.querySelector('.about-stats');
    if (statsEl) {
        const obs = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) { animateCounters(); obs.disconnect(); }
        }, { threshold: 0.1 });
        obs.observe(statsEl);
    }

    // ── FAQ accordion ──
    document.querySelectorAll('.faq-q').forEach(q => {
        q.addEventListener('click', () => {
            const item = q.parentElement;
            const wasOpen = item.classList.contains('open');
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
            if (!wasOpen) item.classList.add('open');
        });
    });

    // ── Back to top ──
    const backTop = document.getElementById('backTop');
    if (backTop) {
        window.addEventListener('scroll', () => {
            backTop.classList.toggle('show', window.scrollY > 500);
        });
        backTop.addEventListener('click', () => lenis.scrollTo(0));
    }


    // ── Contact Section Smooth Fade Reveal ──
    const contactSection = document.querySelector('.contact-reveal');
    if (contactSection) {
        const contactObs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    contactSection.classList.add('revealed');
                    // Stop observing once revealed for better performance
                    contactObs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        contactObs.observe(contactSection);
    }

    // ── LIGHTBOX (Grandeur-style photo viewer) ──
    const lightbox = document.getElementById('lightbox');
    const lbImg = document.getElementById('lbImg');
    const lbCounter = document.getElementById('lbCounter');
    const galleryImgs = document.querySelectorAll('.gallery-item img');
    let currentIdx = 0;
    const imgSrcs = Array.from(galleryImgs).map(img => img.src);

    // Attach click listener to each gallery image
    galleryImgs.forEach((img, idx) => {
        img.addEventListener('click', () => {
            openLightbox(idx);
        });
    });

    function openLightbox(idx) {
        currentIdx = idx;
        lbImg.src = imgSrcs[currentIdx];
        lbCounter.textContent = `${currentIdx + 1} / ${imgSrcs.length}`;
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
        // Pause Lenis scroll
        if (typeof lenis !== 'undefined') lenis.stop();
    }

    function closeLightbox() {
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
        // Resume Lenis scroll
        if (typeof lenis !== 'undefined') lenis.start();
    }

    function nextImg() {
        currentIdx = (currentIdx + 1) % imgSrcs.length;
        updateLbImg();
    }

    function prevImg() {
        currentIdx = (currentIdx - 1 + imgSrcs.length) % imgSrcs.length;
        updateLbImg();
    }

    function updateLbImg() {
        lbImg.style.opacity = '0';
        lbImg.style.transform = 'scale(0.95)';
        setTimeout(() => {
            lbImg.src = imgSrcs[currentIdx];
            lbCounter.textContent = `${currentIdx + 1} / ${imgSrcs.length}`;
            lbImg.style.opacity = '1';
            lbImg.style.transform = 'scale(1)';
        }, 150);
    }

    // Lightbox controls
    if (lightbox) {
        lightbox.querySelector('.lb-close').addEventListener('click', closeLightbox);
        lightbox.querySelector('.lb-overlay').addEventListener('click', closeLightbox);
        lightbox.querySelector('.lb-next').addEventListener('click', nextImg);
        lightbox.querySelector('.lb-prev').addEventListener('click', prevImg);

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('open')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextImg();
            if (e.key === 'ArrowLeft') prevImg();
        });
    }

    // ── Formspree Contact Form Submission ──
    const contactForm = document.getElementById("contactForm");
    const statusMsg = document.getElementById("form-status");

    if (contactForm && statusMsg) {
        contactForm.addEventListener("submit", async function(event) {
            event.preventDefault();
            
            statusMsg.textContent = "";
            statusMsg.className = "form-status-msg";
            const btn = contactForm.querySelector(".submit-btn-grand");
            const originalBtnText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            btn.disabled = true;

            try {
                const response = await fetch(event.target.action, {
                    method: contactForm.method,
                    body: new FormData(contactForm),
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    statusMsg.textContent = "Thank you. We'll be in touch within 24 hours.";
                    statusMsg.className = "form-status-msg success";
                    contactForm.reset();
                } else {
                    const data = await response.json();
                    if (Object.hasOwn(data, 'errors')) {
                        statusMsg.textContent = data["errors"].map(error => error["message"]).join(", ");
                    } else {
                        statusMsg.textContent = "Oops! There was a problem submitting your form.";
                    }
                    statusMsg.className = "form-status-msg error";
                }
            } catch (error) {
                statusMsg.textContent = "Oops! There was a network problem submitting your form.";
                statusMsg.className = "form-status-msg error";
            } finally {
                btn.innerHTML = originalBtnText;
                btn.disabled = false;
            }
        });
     }

    // ── Buttery Smooth IntersectionObserver scroll animations (Task 10) ──
    const scrollAnimateElements = document.querySelectorAll(
        '.section-title, .section-tag, .service-card, .test-card, .process-step, .showroom-banner, .showroom-map-block, .showroom-details-block'
    );
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                
                // Stagger for service-card
                if (target.classList.contains('service-card')) {
                    const row = target.closest('.service-row') || target.closest('.services-grid');
                    if (row) {
                        const cards = Array.from(row.querySelectorAll('.service-card'));
                        const index = cards.indexOf(target);
                        target.style.transitionDelay = `${index * 0.1}s`;
                    }
                }
                
                // Stagger for process-step
                if (target.classList.contains('process-step')) {
                    const row = target.closest('.process-row');
                    if (row) {
                        const steps = Array.from(row.querySelectorAll('.process-step'));
                        const index = steps.indexOf(target);
                        target.style.transitionDelay = `${index * 0.1}s`;
                    }
                }

                // Stagger for test-card
                if (target.classList.contains('test-card')) {
                    const slider = target.closest('.swiper-wrapper');
                    if (slider) {
                        const cards = Array.from(slider.querySelectorAll('.test-card'));
                        const index = cards.indexOf(target);
                        target.style.transitionDelay = `${index * 0.15}s`;
                    }
                }

                target.classList.add('animate-in');
                scrollObserver.unobserve(target);
            }
        });
    }, {
        threshold: 0.01,
        rootMargin: '0px 0px -50px 0px'
    });

    scrollAnimateElements.forEach(el => {
        el.classList.add('scroll-trigger');
        scrollObserver.observe(el);
    });
});


