document.addEventListener('DOMContentLoaded', function () {

    /* =====================================================
       1. MENU BURGER (mobile)
    ===================================================== */
    const burger = document.querySelector('.burger');
    const navList = document.querySelector('nav.head ul');

    if (burger && navList) {
        burger.addEventListener('click', function () {
            const isOpen = navList.classList.toggle('open');
            burger.classList.toggle('open', isOpen);
            burger.setAttribute('aria-expanded', isOpen);
        });

        // Ferme le menu quand on clique sur un lien
        navList.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                navList.classList.remove('open');
                burger.classList.remove('open');
                burger.setAttribute('aria-expanded', 'false');
            });
        });

        // Ferme le menu si on repasse en version bureau
        window.addEventListener('resize', function () {
            if (window.innerWidth > 768) {
                navList.classList.remove('open');
                burger.classList.remove('open');
                burger.setAttribute('aria-expanded', 'false');
            }
        });
    }


    /* =====================================================
       2. COMPTEUR ANIMÉ DES CHIFFRES (.stat-number)
    ===================================================== */
    const statNumbers = document.querySelectorAll('.stat-number');

    function animateCount(el) {
        const raw = el.textContent.trim();
        // Ex: "~13M" -> prefix "~", digits "13", suffix "M"
        //     "114 763" -> prefix "", digits "114 763", suffix ""
        //     "700 km" -> prefix "", digits "700", suffix " km"
        const match = raw.match(/^([^\d]*)([\d\s]+)(.*)$/);
        if (!match) return;

        const prefix = match[1];
        const target = parseInt(match[2].replace(/\s/g, ''), 10);
        const suffix = match[3];

        if (isNaN(target)) return;

        const duration = 1500;
        const start = performance.now();

        function step(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            const current = Math.floor(eased * target);
            el.textContent = prefix + current.toLocaleString('fr-FR') + suffix;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = prefix + target.toLocaleString('fr-FR') + suffix;
            }
        }
        requestAnimationFrame(step);
    }

    if (statNumbers.length) {
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    animateCount(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.4 });

        statNumbers.forEach(function (el) {
            observer.observe(el);
        });
    }


    /* =====================================================
       3. VALIDATION DU FORMULAIRE DE CONTACT
    ===================================================== */
    const contactForm = document.querySelector('.contact-form form');

    if (contactForm) {
        const prenom = contactForm.querySelector('#prenom');
        const nom = contactForm.querySelector('#nom');
        const email = contactForm.querySelector('#email');
        const sujet = contactForm.querySelector('#sujet');
        const message = contactForm.querySelector('#message');
        const fields = [prenom, nom, email, sujet, message].filter(Boolean);

        function showError(field, text) {
            field.classList.add('error');
            let msg = field.parentElement.querySelector('.error-msg');
            if (!msg) {
                msg = document.createElement('small');
                msg.className = 'error-msg';
                field.parentElement.appendChild(msg);
            }
            msg.textContent = text;
        }

        function clearError(field) {
            field.classList.remove('error');
            const msg = field.parentElement.querySelector('.error-msg');
            if (msg) msg.remove();
        }

        contactForm.addEventListener('submit', function (e) {
            let valid = true;
            fields.forEach(clearError);

            if (!prenom.value.trim()) {
                showError(prenom, 'Merci de renseigner votre prénom.');
                valid = false;
            }

            if (!nom.value.trim()) {
                showError(nom, 'Merci de renseigner votre nom.');
                valid = false;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email.value.trim()) {
                showError(email, 'Merci de renseigner votre email.');
                valid = false;
            } else if (!emailRegex.test(email.value.trim())) {
                showError(email, 'Format d\'email invalide.');
                valid = false;
            }

            if (!sujet.value) {
                showError(sujet, 'Merci de choisir un sujet.');
                valid = false;
            }

            if (!message.value.trim()) {
                showError(message, 'Merci d\'écrire un message.');
                valid = false;
            } else if (message.value.trim().length < 10) {
                showError(message, 'Votre message est trop court (10 caractères minimum).');
                valid = false;
            }

            if (!valid) {
                e.preventDefault();
            }
        });

        fields.forEach(function (field) {
            field.addEventListener('input', function () { clearError(field); });
        });
    }


    /* =====================================================
       4. DIAPORAMA (générique : réutilisable sur n'importe
          quelle section .diaporama)
    ===================================================== */
    document.querySelectorAll('.diaporama').forEach(function (diapo) {
        const track = diapo.querySelector('.diaporama-track');
        const slides = diapo.querySelectorAll('.diaporama-slide');
        const prevBtn = diapo.querySelector('.diaporama-btn.prev');
        const nextBtn = diapo.querySelector('.diaporama-btn.next');
        const dotsWrap = diapo.querySelector('.diaporama-dots');
        let index = 0;
        let autoplay;

        if (!track || slides.length === 0) return;

        if (dotsWrap) {
            slides.forEach(function (_, i) {
                const dot = document.createElement('span');
                if (i === 0) dot.classList.add('active');
                dot.addEventListener('click', function () { goTo(i); });
                dotsWrap.appendChild(dot);
            });
        }

        function update() {
            track.style.transform = 'translateX(-' + (index * 100) + '%)';
            if (dotsWrap) {
                dotsWrap.querySelectorAll('span').forEach(function (d, i) {
                    d.classList.toggle('active', i === index);
                });
            }
        }

        function goTo(i) {
            index = (i + slides.length) % slides.length;
            update();
        }

        if (nextBtn) nextBtn.addEventListener('click', function () { goTo(index + 1); });
        if (prevBtn) prevBtn.addEventListener('click', function () { goTo(index - 1); });

        function startAutoplay() {
            autoplay = setInterval(function () { goTo(index + 1); }, 5000);
        }
        startAutoplay();

        diapo.addEventListener('mouseenter', function () { clearInterval(autoplay); });
        diapo.addEventListener('mouseleave', startAutoplay);
    });

});
