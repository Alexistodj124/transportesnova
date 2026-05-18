const VIEWS = ['resumen', 'scrum', 'kanban', 'scrumban', 'xp', 'wsf', 'pmi'];

document.addEventListener('DOMContentLoaded', () => {

    const scrollProgress = document.getElementById('scrollProgress');
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        scrollProgress.style.width = scrollPercent + '%';
        navbar.classList.toggle('scrolled', scrollTop > 80);
    });

    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
        });
    });

    const observerOptions = {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                entry.target.querySelectorAll('.bar-fill, .epica-fill, .costo-bar-fill, .hbar-fill').forEach(bar => {
                    const width = bar.dataset.width;
                    if (width && !bar.dataset.animated) {
                        bar.dataset.animated = 'true';
                        setTimeout(() => { bar.style.width = width + '%'; }, 250);
                    }
                });

                entry.target.querySelectorAll('.counter').forEach(counter => {
                    if (counter.dataset.animated) return;
                    counter.dataset.animated = 'true';
                    animateCounter(counter);
                });
            }
        });
    }, observerOptions);

    function observeAll() {
        document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
    }

    observeAll();

    function animateCounter(el) {
        const targetStr = el.dataset.target;
        const target = parseFloat(targetStr);
        const decimals = (targetStr.split('.')[1] || '').length;
        const duration = 1800;
        const start = performance.now();

        function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = target * eased;
            el.textContent = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString('es-GT');
            if (progress < 1) requestAnimationFrame(update);
        }

        requestAnimationFrame(update);
    }

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        document.querySelectorAll('.view.active .shape').forEach((shape, i) => {
            const speed = (i + 1) * 0.03;
            shape.style.transform = `translateY(${scrollY * speed}px)`;
        });
    });

    function resetAnimationsInView(viewEl) {
        viewEl.querySelectorAll('.animate-on-scroll').forEach(el => {
            el.classList.remove('visible');
        });
        viewEl.querySelectorAll('.counter').forEach(c => {
            delete c.dataset.animated;
            c.textContent = '0';
        });
        viewEl.querySelectorAll('.bar-fill, .epica-fill, .costo-bar-fill, .hbar-fill').forEach(b => {
            delete b.dataset.animated;
            b.style.width = '0%';
        });
    }

    function showView(name) {
        const target = VIEWS.includes(name) ? name : 'resumen';
        document.querySelectorAll('.view').forEach(v => {
            const isActive = v.dataset.view === target;
            v.classList.toggle('active', isActive);
            if (isActive) {
                resetAnimationsInView(v);
            }
        });
        document.querySelectorAll('.nav-links a[data-view], .mobile-menu a[data-view]').forEach(a => {
            a.classList.toggle('active', a.dataset.view === target);
        });
        document.body.setAttribute('data-current-view', target);
        window.scrollTo({ top: 0, behavior: 'instant' });

        requestAnimationFrame(() => {
            const activeView = document.querySelector('.view.active');
            if (activeView) {
                activeView.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
            }
        });
    }

    window.addEventListener('hashchange', () => showView(location.hash.slice(1)));
    showView(location.hash.slice(1) || 'resumen');

    document.querySelectorAll('a[data-view]').forEach(a => {
        a.addEventListener('click', (e) => {
            const v = a.dataset.view;
            if (VIEWS.includes(v)) {
                e.preventDefault();
                if (location.hash !== `#${v}`) {
                    location.hash = v;
                } else {
                    showView(v);
                }
            }
        });
    });

});
