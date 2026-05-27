/* ABR — main.js
   Mobile menu · year stamp · scroll reveal · scroll button
   · WhatsApp bubble greeting · Backoffice carousel + fullscreen
   ========================================================= */
(() => {
  const nav = document.querySelector('#nav');
  const abrir = document.querySelector('#abrir');
  const cerrar = document.querySelector('#cerrar');

  const toggleMenu = (isOpen) => {
    if (!nav) return;
    nav.classList.toggle('visible', isOpen);
    document.body.classList.toggle('menu-open', isOpen);
  };

  abrir?.addEventListener('click', () => toggleMenu(true));
  cerrar?.addEventListener('click', () => toggleMenu(false));

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.js-current-year').forEach((node) => {
      node.textContent = String(new Date().getFullYear());
    });

    setupRevealOnScroll();
    setupCardReveal();
    setupScrollToggleButton();
    setupBackofficeCarousels();
    setupBackofficeFullscreen();
    setupWhatsAppBubble();
    closeMobileMenuOnNav();
  });

  /* ---------- Mobile menu auto-close ---------- */
  function closeMobileMenuOnNav() {
    document.querySelectorAll('.nav-list a').forEach((link) => {
      link.addEventListener('click', () => {
        if (link.classList.contains('dropdown-toggle')) return;
        toggleMenu(false);
      });
    });
  }

  /* ---------- Reveal on scroll (replaces text-focus-in) ---------- */
  function setupRevealOnScroll() {
    const selector = '.abr-reveal, .text-focus-in, .text-focus-in-2, .abr-reveal-on-scroll, .abr-reveal-on-load';
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
      elements.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry, idx) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = Number(el.dataset.revealDelay || 0);
          setTimeout(() => el.classList.add('is-visible'), delay);
          obs.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    elements.forEach((el) => observer.observe(el));
  }

  /* ---------- Card stagger reveal (cardholder cards) ---------- */
  function setupCardReveal() {
    const cards = document.querySelectorAll('.cardholder__card');
    if (!cards.length) return;

    if (!('IntersectionObserver' in window)) {
      cards.forEach((c) => c.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const card = entry.target;
          const idx = Number(card.dataset.cardIndex || 0);
          card.style.transitionDelay = `${idx * 90}ms`;
          card.classList.add('is-visible');
          obs.unobserve(card);
        });
      },
      { threshold: 0.15 }
    );

    cards.forEach((card, idx) => {
      card.dataset.cardIndex = idx;
      observer.observe(card);
    });
  }

  /* ---------- Scroll button (up/down) ---------- */
  function setupScrollToggleButton() {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'abr-scroll-toggle';
    btn.setAttribute('aria-label', 'Ir hacia abajo');
    btn.innerHTML = '<i class="bi bi-arrow-down"></i>';

    const update = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const vh = window.innerHeight;
      const total = document.documentElement.scrollHeight;
      const remaining = total - (scrollTop + vh);
      const goUp = remaining < 120 || scrollTop > vh * 0.45;
      const showBtn = scrollTop > 200;

      btn.classList.toggle('is-visible', showBtn);
      btn.classList.toggle('is-up', goUp);
      btn.innerHTML = goUp ? '<i class="bi bi-arrow-up"></i>' : '<i class="bi bi-arrow-down"></i>';
      btn.setAttribute('aria-label', goUp ? 'Ir hacia arriba' : 'Ir hacia abajo');
    };

    btn.addEventListener('click', () => {
      const goUp = btn.classList.contains('is-up');
      window.scrollTo({ top: goUp ? 0 : document.documentElement.scrollHeight, behavior: 'smooth' });
    });

    document.body.appendChild(btn);
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }

  /* ---------- Backoffice carousels ---------- */
  function setupBackofficeCarousels() {
    const carousels = document.querySelectorAll('.abr-backoffice__carousel');
    if (!carousels.length || !window.bootstrap?.Carousel) return;

    carousels.forEach((carousel) => {
      window.bootstrap.Carousel.getOrCreateInstance(carousel, {
        interval: Number(carousel.getAttribute('data-bs-interval')) || 6500,
        ride: carousel.getAttribute('data-bs-ride') || false,
        touch: true,
        pause: false,
      });
    });
  }

  /* ---------- Backoffice fullscreen gallery via SweetAlert ---------- */
  function setupBackofficeFullscreen() {
    const triggers = document.querySelectorAll('[data-abr-fullscreen-gallery]');
    if (!triggers.length || typeof Swal === 'undefined') return;

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const selector = trigger.getAttribute('data-abr-fullscreen-gallery');
        const carousel = selector ? document.querySelector(selector) : null;
        const title = trigger.getAttribute('data-title') || 'Galería BackOffice';
        if (!carousel) return;

        const items = Array.from(carousel.querySelectorAll('.carousel-item')).map((item) => {
          const img = item.querySelector('img');
          const chip = item.querySelector('.abr-chip')?.textContent?.trim() || 'BackOffice ABR';
          const description = item.querySelector('.abr-backoffice__caption p')?.textContent?.trim() || '';
          return {
            src: img?.getAttribute('src') || '',
            alt: img?.getAttribute('alt') || title,
            chip,
            description,
          };
        }).filter((i) => i.src);

        if (!items.length) return;

        const activeIdx = Array.from(carousel.querySelectorAll('.carousel-item')).findIndex((i) => i.classList.contains('active'));
        const initial = activeIdx >= 0 ? activeIdx : 0;
        const id = `abrFs-${Date.now()}`;

        const indicators = items.map((it, i) =>
          `<button type="button" data-bs-target="#${id}" data-bs-slide-to="${i}" class="${i === initial ? 'active' : ''}" aria-label="${it.chip}"></button>`
        ).join('');

        const slides = items.map((it, i) => `
          <div class="carousel-item ${i === initial ? 'active' : ''}">
            <div class="abr-fullscreen-carousel__frame">
              <img src="${it.src}" class="d-block w-100" alt="${it.alt}">
            </div>
            <div class="abr-fullscreen-carousel__caption">
              <span class="abr-chip abr-chip--glass">${it.chip}</span>
              <p>${it.description}</p>
            </div>
          </div>
        `).join('');

        Swal.fire({
          title,
          width: 'min(96vw, 1480px)',
          padding: '1rem',
          showCloseButton: true,
          showConfirmButton: false,
          html: `
            <div id="${id}" class="carousel slide" data-bs-interval="false">
              <div class="carousel-indicators">${indicators}</div>
              <div class="carousel-inner">${slides}</div>
              <button class="carousel-control-prev" type="button" data-bs-target="#${id}" data-bs-slide="prev" aria-label="Anterior">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
              </button>
              <button class="carousel-control-next" type="button" data-bs-target="#${id}" data-bs-slide="next" aria-label="Siguiente">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
              </button>
            </div>
          `,
          customClass: {
            popup: 'abr-swal-glass abr-swal-glass--wide',
            title: 'abr-swal-title',
            closeButton: 'abr-swal-close',
          },
          didOpen: () => {
            if (window.bootstrap?.Carousel) {
              const c = document.getElementById(id);
              if (c) window.bootstrap.Carousel.getOrCreateInstance(c, { interval: false, ride: false });
            }
          },
          willOpen: () => document.body.classList.add('abr-modal-open'),
          willClose: () => document.body.classList.remove('abr-modal-open'),
        });
      });
    });
  }

  /* ---------- WhatsApp bubble greeting (ABR brand) ---------- */
  function getArgentinaDate() {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Argentina/Buenos_Aires',
      hour12: false, hour: '2-digit',
    }).formatToParts(new Date());
    const hour = Number(parts.find((p) => p.type === 'hour')?.value || '12');
    return hour;
  }

  function getGreeting() {
    const hour = getArgentinaDate();
    if (hour >= 5 && hour < 12) {
      return {
        emoji: '☀️',
        badge: 'Buenos días',
        html: 'Hola, somos <strong>ABR</strong> 👋🏻 Escribinos y contanos tu proyecto. Trabajamos con <strong>industrias, PyMEs y emprendimientos</strong>: te respondemos con criterio técnico y una propuesta clara.',
      };
    }
    if (hour >= 12 && hour < 20) {
      return {
        emoji: '🧉',
        badge: 'Buenas tardes',
        html: 'Hola, somos <strong>ABR</strong> 👋🏻 Estamos por acá para habilitaciones, rotulado o mejora operativa. Escribinos por WhatsApp y lo vemos juntos, para <strong>empresas, PyMEs y emprendimientos</strong>.',
      };
    }
    return {
      emoji: '🌙',
      badge: 'Buenas noches',
      html: 'Hola, somos <strong>ABR</strong> 👋🏻 Cuando quieras, escribinos por WhatsApp y contanos qué necesitás resolver. Acompañamos con mirada práctica y a medida.',
    };
  }

  function setupWhatsAppBubble() {
    const bubble = document.querySelector('[data-abr-wsp-bubble]');
    const messageEl = document.querySelector('[data-abr-wsp-message]');
    const closeBtn = document.querySelector('[data-abr-wsp-close]');
    const badge = bubble?.querySelector('.abr-wsp-bubble__badge span:last-child');
    if (!bubble || !messageEl) return;

    let hideTimeout;

    const hide = () => {
      bubble.classList.remove('is-visible');
      bubble.classList.add('is-hiding');
      bubble.setAttribute('aria-hidden', 'true');
    };

    const show = () => {
      const g = getGreeting();
      if (badge) badge.textContent = `${g.emoji} ${g.badge}`;
      messageEl.innerHTML = g.html;
      bubble.classList.remove('is-hiding');
      bubble.classList.add('is-visible');
      bubble.setAttribute('aria-hidden', 'false');
      clearTimeout(hideTimeout);
      hideTimeout = setTimeout(hide, 16000);
    };

    closeBtn?.addEventListener('click', () => { clearTimeout(hideTimeout); hide(); });

    setTimeout(show, 2200);
    setInterval(show, 300000);
  }

  /* ---------- Google Ads conversion tracking (WhatsApp clicks) ---------- */
  const GADS_SEND_TO = 'AW-18186670188/XLKtCMvSirQcEOygiuBD';

  window.gtag_report_conversion = function (url) {
    const callback = function () {
      if (typeof url !== 'undefined') window.location = url;
    };
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', {
        send_to: GADS_SEND_TO,
        event_callback: callback,
      });
    }
    return false;
  };

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href*="api.whatsapp.com"], a[href*="wa.me"]');
    if (!link) return;
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', 'conversion', { send_to: GADS_SEND_TO });
  }, true);
})();
