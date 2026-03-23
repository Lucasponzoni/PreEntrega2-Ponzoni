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
    const abrirMenuBtn = document.querySelector('#abrir');
    const abrirMenuIcon = abrirMenuBtn?.querySelector('i');

    const startAnimation = () => {
      if (!abrirMenuBtn || !abrirMenuIcon) return;

      abrirMenuIcon.classList.remove('bounce');
      void abrirMenuBtn.offsetWidth;
      abrirMenuIcon.classList.add('bounce');
    };

    abrirMenuBtn?.addEventListener('click', startAnimation);
    abrirMenuIcon?.addEventListener('animationend', startAnimation);

    document.querySelectorAll('.js-current-year').forEach((node) => {
      node.textContent = String(new Date().getFullYear());
    });

    setupScrollToggleButton();
    setupGalleryInteractions();
    setupBackofficeFullscreen();
    setupWhatsAppBubble();
  });

  const setupImageSpinner = (img) => {
    const wrapper = img.closest('.hero_mobile_pack, .cardholder__card-image');
    if (!wrapper) return;

    wrapper.classList.add('is-loading');

    let spinner = wrapper.querySelector('.abr-image-spinner');
    if (!spinner) {
      spinner = document.createElement('span');
      spinner.className = 'spinner-border text-primary abr-image-spinner';
      spinner.setAttribute('role', 'status');
      spinner.setAttribute('aria-hidden', 'true');
      wrapper.appendChild(spinner);
    }

    const markAsLoaded = () => {
      wrapper.classList.remove('is-loading');
      wrapper.classList.add('is-loaded');
    };

    if (img.complete) {
      markAsLoaded();
      return;
    }

    img.addEventListener('load', markAsLoaded, { once: true });
    img.addEventListener('error', markAsLoaded, { once: true });
  };

  const openZoomPreview = (trigger) => {
    const imageWrapper = trigger.closest('.cardholder__card-image');
    const image = imageWrapper?.querySelector('.abr-zoomable');
    const card = trigger.closest('.cardholder__card');
    const title = card?.querySelector('.cardholder__card--title h2')?.innerText || 'Vista previa';
    const imageUrl = image?.getAttribute('src');
    const altText = image?.getAttribute('alt') || title;

    if (!imageUrl || typeof Swal === 'undefined') return;

    Swal.fire({
      title,
      imageUrl,
      imageAlt: altText,
      showCloseButton: true,
      showConfirmButton: false,
      allowOutsideClick: true,
      backdrop: 'rgba(10, 20, 35, 0.55)',
      customClass: {
        popup: 'abr-swal-glass',
        title: 'abr-swal-title',
        image: 'abr-swal-image',
        closeButton: 'abr-swal-close',
      },
    });
  };

  const setupGalleryInteractions = () => {
    const imageWrappers = document.querySelectorAll('.cardholder__card-image');
    const zoomables = document.querySelectorAll('.abr-zoomable');
    const loadingImages = document.querySelectorAll('.hero_mobile_pack img, .cardholder__card-image img');
    const cards = document.querySelectorAll('.cardholder__card');

    loadingImages.forEach(setupImageSpinner);

    imageWrappers.forEach((wrapper) => {
      wrapper.addEventListener('click', () => openZoomPreview(wrapper));
    });

    zoomables.forEach((img) => {
      img.addEventListener('click', (event) => {
        event.stopPropagation();
        openZoomPreview(img);
      });
    });

    if (!cards.length) return;

    const revealCard = (card, index = 0) => {
      card.style.transitionDelay = `${index * 110}ms`;
      card.classList.add('is-visible');
    };

    if (!('IntersectionObserver' in window)) {
      cards.forEach((card, index) => revealCard(card, index));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const card = entry.target;
          const index = Number(card.dataset.cardIndex || 0);
          revealCard(card, index);
          currentObserver.unobserve(card);
        });
      },
      {
        threshold: 0.16,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    cards.forEach((card, index) => {
      card.dataset.cardIndex = index;
      observer.observe(card);
      card.addEventListener('click', (event) => {
        if (event.target.closest('a')) return;
        openZoomPreview(card);
      });
    });
  };

  const getArgentinaDate = () => {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Argentina/Buenos_Aires',
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).formatToParts(new Date());

    const lookup = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

    return new Date(
      Number(lookup.year),
      Number(lookup.month) - 1,
      Number(lookup.day),
      Number(lookup.hour),
      Number(lookup.minute),
      Number(lookup.second)
    );
  };

  const getWhatsAppGreeting = () => {
    const argentinaDate = getArgentinaDate();
    const hour = argentinaDate.getHours();

    if (hour >= 5 && hour < 12) {
      return {
        emoji: '☀️',
        badge: 'Buenos días',
        html: 'Hola, soy <strong>Pablo</strong> 👋🏻 Si querés, escribime por WhatsApp y contame en qué etapa está tu proyecto. Trabajo con <strong>empresas, PyMEs y particulares</strong> que necesitan orden, criterio técnico y una solución clara.',
      };
    }

    if (hour >= 12 && hour < 20) {
      return {
        emoji: '🧉',
        badge: 'Buenas tardes',
        html: 'Hola, soy <strong>Pablo</strong> 👋🏻 Estoy por acá para ayudarte con habilitaciones, procesos, rotulado o mejora operativa. Escribime por WhatsApp y lo vemos juntos, tanto para <strong>empresas, PyMEs y particulares</strong>.',
      };
    }

    return {
      emoji: '🌙',
      badge: 'Buenas noches',
      html: 'Hola, soy <strong>Pablo</strong> 👋🏻 Cuando quieras, escribime por WhatsApp y contame qué necesitás resolver. Acompaño a <strong>empresas, PyMEs y particulares</strong> con una mirada práctica, profesional y a medida.',
    };
  };

  const setupBackofficeFullscreen = () => {
    const triggers = document.querySelectorAll('[data-abr-fullscreen]');
    if (!triggers.length || typeof Swal === 'undefined') return;

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const imageUrl = trigger.getAttribute('data-image');
        const title = trigger.getAttribute('data-title') || 'Vista ampliada';
        const altText = trigger.getAttribute('data-alt') || title;

        if (!imageUrl) return;

        Swal.fire({
          title,
          imageUrl,
          imageAlt: altText,
          width: 'min(96vw, 1440px)',
          padding: '1rem',
          showCloseButton: true,
          showConfirmButton: false,
          customClass: {
            popup: 'abr-swal-glass abr-swal-glass--wide',
            title: 'abr-swal-title',
            image: 'abr-swal-image abr-swal-image--contain',
            closeButton: 'abr-swal-close',
          },
        });
      });
    });
  };

  const setupWhatsAppBubble = () => {
    const stack = document.querySelector('[data-abr-wsp]');
    const bubble = document.querySelector('[data-abr-wsp-bubble]');
    const message = document.querySelector('[data-abr-wsp-message]');
    const closeButton = document.querySelector('[data-abr-wsp-close]');
    const badge = bubble?.querySelector('.abr-wsp-bubble__badge span:last-child');

    if (!stack || !bubble || !message) return;

    let hideTimeout;
    let restartInterval;

    const hideBubble = () => {
      bubble.classList.add('is-hiding');
      bubble.classList.remove('is-visible');
      bubble.setAttribute('aria-hidden', 'true');
    };

    const showBubble = () => {
      const greeting = getWhatsAppGreeting();

      if (badge) {
        badge.textContent = `${greeting.emoji} ${greeting.badge}`;
      }

      message.innerHTML = greeting.html;
      bubble.classList.remove('is-hiding');
      bubble.classList.add('is-visible');
      bubble.setAttribute('aria-hidden', 'false');

      window.clearTimeout(hideTimeout);
      hideTimeout = window.setTimeout(hideBubble, 18000);
    };

    closeButton?.addEventListener('click', () => {
      window.clearTimeout(hideTimeout);
      hideBubble();
    });

    if (window.matchMedia('(max-width: 768px)').matches) {
      bubble.addEventListener('click', (event) => {
        if (event.target.closest('[data-abr-wsp-close]')) return;
        hideBubble();
      });
    }

    showBubble();
    restartInterval = window.setInterval(showBubble, 60000);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        window.clearTimeout(hideTimeout);
        return;
      }

      showBubble();
    });

    window.addEventListener('beforeunload', () => {
      window.clearTimeout(hideTimeout);
      window.clearInterval(restartInterval);
    });
  };

  const setupScrollToggleButton = () => {
    const scrollButton = document.createElement('button');
    scrollButton.type = 'button';
    scrollButton.className = 'abr-scroll-toggle';
    scrollButton.setAttribute('aria-label', 'Ir hacia abajo');
    scrollButton.setAttribute('title', 'Ir hacia abajo');
    scrollButton.innerHTML = '<i class="bi bi-arrow-down"></i>';

    const updateScrollButton = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const viewportHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;
      const remaining = fullHeight - (scrollTop + viewportHeight);
      const shouldGoUp = remaining < 120 || scrollTop > viewportHeight * 0.45;

      scrollButton.classList.toggle('is-up', shouldGoUp);
      scrollButton.setAttribute('aria-label', shouldGoUp ? 'Ir hacia arriba' : 'Ir hacia abajo');
      scrollButton.setAttribute('title', shouldGoUp ? 'Ir hacia arriba' : 'Ir hacia abajo');
      scrollButton.innerHTML = shouldGoUp
        ? '<i class="bi bi-arrow-up"></i>'
        : '<i class="bi bi-arrow-down"></i>';
    };

    scrollButton.addEventListener('click', () => {
      const goUp = scrollButton.classList.contains('is-up');
      window.scrollTo({
        top: goUp ? 0 : document.documentElement.scrollHeight,
        behavior: 'smooth',
      });
    });

    document.body.appendChild(scrollButton);
    updateScrollButton();
    window.addEventListener('scroll', updateScrollButton, { passive: true });
    window.addEventListener('resize', updateScrollButton);
  };
})();
