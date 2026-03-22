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
