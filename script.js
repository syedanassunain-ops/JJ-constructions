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

    // ── Counter animation ──
    const counters = document.querySelectorAll('.counter');
    const animateCounters = () => {
        counters.forEach(c => {
            const target = +c.dataset.target;
            const update = () => {
                const current = +c.innerText;
                const inc = target / 80;
                if (current < target) {
                    c.innerText = Math.ceil(current + inc);
                    setTimeout(update, 25);
                } else {
                    c.innerText = target + '+';
                }
            };
            update();
        });
    };
    const statsEl = document.querySelector('.about-stats');
    if (statsEl) {
        const obs = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) { animateCounters(); obs.disconnect(); }
        }, { threshold: 0.5 });
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
    // Only pick original images (first half of each marquee track), not duplicates
    const allMarqueeImgs = document.querySelectorAll('.m-item img');
    const seenSrcs = new Set();
    const uniqueImgs = [];
    allMarqueeImgs.forEach(img => {
        if (!seenSrcs.has(img.src)) {
            seenSrcs.add(img.src);
            uniqueImgs.push(img);
        }
    });
    let currentIdx = 0;
    const imgSrcs = uniqueImgs.map(img => img.src);

    // Attach click to ALL images (including duplicates), mapped to unique index
    allMarqueeImgs.forEach(img => {
        img.addEventListener('click', () => {
            const idx = imgSrcs.indexOf(img.src);
            if (idx !== -1) openLightbox(idx);
        });
    });

    function openLightbox(idx) {
        currentIdx = idx;
        lbImg.src = imgSrcs[currentIdx];
        lbCounter.textContent = `${currentIdx + 1} / ${imgSrcs.length}`;
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
        // Pause Lenis scroll
        if (lenis) lenis.stop();
    }

    function closeLightbox() {
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
        // Resume Lenis scroll
        if (lenis) lenis.start();
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
        lbImg.style.transform = 'scale(0.92)';
        setTimeout(() => {
            lbImg.src = imgSrcs[currentIdx];
            lbCounter.textContent = `${currentIdx + 1} / ${imgSrcs.length}`;
            lbImg.style.opacity = '1';
            lbImg.style.transform = 'scale(1)';
        }, 200);
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
            
            statusMsg.textContent = "Sending your enquiry...";
            statusMsg.className = "form-status-msg";
            const btn = contactForm.querySelector(".submit-btn-grand");
            const originalBtnText = btn.innerHTML;
            btn.innerHTML = "Sending...";
            btn.disabled = true;

            try {
                const response = await fetch(event.target.action, {
                    method: contactForm.method,
                    body: new FormData(contactForm),
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    statusMsg.innerHTML = "Thank you! Your enquiry has been received successfully. Our team will contact you shortly.";
                    statusMsg.classList.add("success");
                    contactForm.reset();
                } else {
                    const data = await response.json();
                    if (Object.hasOwn(data, 'errors')) {
                        statusMsg.textContent = data["errors"].map(error => error["message"]).join(", ");
                    } else {
                        statusMsg.textContent = "Oops! There was a problem submitting your form.";
                    }
                    statusMsg.classList.add("error");
                }
            } catch (error) {
                statusMsg.textContent = "Oops! There was a network problem submitting your form.";
                statusMsg.classList.add("error");
            } finally {
                btn.innerHTML = originalBtnText;
                btn.disabled = false;
            }
        });
    }
});
