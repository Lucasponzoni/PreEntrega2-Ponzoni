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
    setupScrollReveal();
    setupBackofficeReveal();
    setupBackofficeCarousels();
    setupBackofficeFullscreen();
    setupWhatsAppBubble();
  });

  const setupImageSpinner = (img) => {
    const wrapper = img.closest('.hero_mobile_pack, .cardholder__card-image, .abr-backoffice__frame');
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

  const dismissWhatsAppBubble = () => {
    const bubble = document.querySelector('[data-abr-wsp-bubble]');
    if (!bubble) return;

    bubble.classList.add('is-hiding');
    bubble.classList.remove('is-visible');
    bubble.setAttribute('aria-hidden', 'true');
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
    const loadingImages = document.querySelectorAll('.hero_mobile_pack img, .cardholder__card-image img, .abr-backoffice__frame img');
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



  const setupBackofficeCarousels = () => {
    const carousels = document.querySelectorAll('.abr-backoffice__carousel');

    if (!carousels.length || !window.bootstrap?.Carousel) return;

    carousels.forEach((carousel) => {
      const instance = window.bootstrap.Carousel.getOrCreateInstance(carousel, {
        interval: Number(carousel.getAttribute('data-bs-interval')) || 6500,
        ride: carousel.getAttribute('data-bs-ride') || false,
        touch: true,
        pause: false,
      });

      carousel.querySelectorAll('.carousel-control-prev, .carousel-control-next').forEach((control) => {
        control.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          dismissWhatsAppBubble();

          if (control.classList.contains('carousel-control-prev')) {
            instance.prev();
            return;
          }

          instance.next();
        });
      });

      carousel.querySelectorAll('.carousel-indicators [data-bs-slide-to]').forEach((indicator) => {
        indicator.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          dismissWhatsAppBubble();
          const slideIndex = Number(indicator.getAttribute('data-bs-slide-to'));
          if (!Number.isNaN(slideIndex)) {
            instance.to(slideIndex);
          }
        });
      });

      carousel.querySelectorAll('[data-abr-fullscreen]').forEach((trigger) => {
        trigger.addEventListener('click', (event) => {
          event.stopPropagation();
          dismissWhatsAppBubble();
        });
      });
    });
  };

  const setupBackofficeReveal = () => {
    const elements = document.querySelectorAll('.abr-reveal-on-load');
    if (!elements.length) return;

    const show = () => {
      elements.forEach((element, index) => {
        const delay = Number(element.dataset.revealDelay || index * 140);
        window.setTimeout(() => {
          element.classList.add('is-visible');
        }, delay);
      });
    };

    if (document.readyState === 'complete') {
      show();
      return;
    }

    window.addEventListener('load', show, { once: true });
  };

  const setupScrollReveal = () => {
    const elements = document.querySelectorAll('.abr-reveal-on-scroll');
    if (!elements.length) return;

    const revealElement = (element) => {
      element.classList.add('is-visible');
    };

    if (!('IntersectionObserver' in window)) {
      elements.forEach(revealElement);
      return;
    }

    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          revealElement(entry.target);
          currentObserver.unobserve(entry.target);
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    elements.forEach((element) => observer.observe(element));
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
    const galleryTriggers = document.querySelectorAll('[data-abr-fullscreen-gallery]');

    if (!galleryTriggers.length || typeof Swal === 'undefined') return;

    galleryTriggers.forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const selector = trigger.getAttribute('data-abr-fullscreen-gallery');
        const carousel = selector ? document.querySelector(selector) : null;
        const title = trigger.getAttribute('data-title') || 'Galería BackOffice';

        if (!carousel) return;

        const items = Array.from(carousel.querySelectorAll('.carousel-item')).map((item) => {
          const image = item.querySelector('img');
          const chip = item.querySelector('.abr-chip')?.textContent?.trim() || 'BackOffice ABR';
          const description = item.querySelector('.abr-backoffice__caption p')?.textContent?.trim() || '';
          return {
            src: image?.getAttribute('src') || '',
            alt: image?.getAttribute('alt') || title,
            chip,
            description,
          };
        }).filter((item) => item.src);

        if (!items.length) return;

        const activeIndex = Array.from(carousel.querySelectorAll('.carousel-item')).findIndex((item) => item.classList.contains('active'));
        const initialIndex = activeIndex >= 0 ? activeIndex : 0;
        const modalId = `abrFullscreenCarousel-${Date.now()}`;
        const indicators = items.map((item, index) => `
          <button type="button" data-bs-target="#${modalId}" data-bs-slide-to="${index}" class="${index === initialIndex ? 'active' : ''}" ${index === initialIndex ? 'aria-current="true"' : ''} aria-label="${item.chip}"></button>
        `).join('');
        const slides = items.map((item, index) => `
          <div class="carousel-item ${index === initialIndex ? 'active' : ''}">
            <div class="abr-fullscreen-carousel__frame" data-abr-zoom-frame>
              <button type="button" class="abr-fullscreen-carousel__zoom" data-abr-zoom-toggle aria-label="Acercar imagen" title="Acercar imagen">
                <i class="bi bi-zoom-in"></i>
              </button>
              <img src="${item.src}" class="d-block w-100" alt="${item.alt}" data-abr-zoom-image>
            </div>
            <div class="abr-fullscreen-carousel__caption">
              <span class="abr-chip abr-chip--glass">${item.chip}</span>
              <p>${item.description}</p>
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
            <div id="${modalId}" class="carousel slide abr-fullscreen-carousel" data-bs-interval="false">
              <div class="carousel-indicators">${indicators}</div>
              <div class="carousel-inner">${slides}</div>
              <button class="carousel-control-prev" type="button" data-bs-target="#${modalId}" data-bs-slide="prev" aria-label="Imagen anterior">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Anterior</span>
              </button>
              <button class="carousel-control-next" type="button" data-bs-target="#${modalId}" data-bs-slide="next" aria-label="Imagen siguiente">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Siguiente</span>
              </button>
            </div>
          `,
          customClass: {
            popup: 'abr-swal-glass abr-swal-glass--wide abr-swal-glass--carousel',
            title: 'abr-swal-title',
            closeButton: 'abr-swal-close',
            htmlContainer: 'abr-swal-carousel-container',
          },
          didOpen: () => {
            if (window.bootstrap?.Carousel) {
              const modalCarousel = document.getElementById(modalId);
              if (modalCarousel) {
                const modalInstance = window.bootstrap.Carousel.getOrCreateInstance(modalCarousel, {
                  interval: false,
                  ride: false,
                  touch: true,
                  pause: false,
                });

                modalCarousel.querySelectorAll('.carousel-control-prev, .carousel-control-next').forEach((control) => {
                  control.addEventListener('click', (event) => {
                    event.preventDefault();
                    if (control.classList.contains('carousel-control-prev')) {
                      modalInstance.prev();
                      return;
                    }
                    modalInstance.next();
                  });
                });

                modalCarousel.querySelectorAll('.carousel-indicators [data-bs-slide-to]').forEach((indicator) => {
                  indicator.addEventListener('click', (event) => {
                    event.preventDefault();
                    const slideIndex = Number(indicator.getAttribute('data-bs-slide-to'));
                    if (!Number.isNaN(slideIndex)) {
                      modalInstance.to(slideIndex);
                    }
                  });
                });

                const resetZoom = () => {
                  modalCarousel.querySelectorAll('.abr-fullscreen-carousel__frame.is-zoomed').forEach((frame) => {
                    frame.classList.remove('is-zoomed');
                    const zoomButton = frame.querySelector('[data-abr-zoom-toggle]');
                    if (zoomButton) {
                      zoomButton.setAttribute('aria-label', 'Acercar imagen');
                      zoomButton.setAttribute('title', 'Acercar imagen');
                      zoomButton.innerHTML = '<i class="bi bi-zoom-in"></i>';
                    }
                  });
                };

                modalCarousel.addEventListener('slide.bs.carousel', resetZoom);

                modalCarousel.querySelectorAll('[data-abr-zoom-toggle]').forEach((zoomButton) => {
                  zoomButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    const frame = zoomButton.closest('[data-abr-zoom-frame]');
                    if (!frame) return;

                    const shouldZoom = !frame.classList.contains('is-zoomed');
                    resetZoom();

                    if (shouldZoom) {
                      frame.classList.add('is-zoomed');
                      zoomButton.setAttribute('aria-label', 'Alejar imagen');
                      zoomButton.setAttribute('title', 'Alejar imagen');
                      zoomButton.innerHTML = '<i class="bi bi-zoom-out"></i>';
                      frame.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                    }
                  });
                });

                modalCarousel.querySelectorAll('[data-abr-zoom-image]').forEach((image) => {
                  image.addEventListener('click', (event) => {
                    event.preventDefault();
                    const frame = image.closest('[data-abr-zoom-frame]');
                    const zoomButton = frame?.querySelector('[data-abr-zoom-toggle]');
                    zoomButton?.click();
                  });
                });
              }
            }
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
    restartInterval = window.setInterval(showBubble, 300000);

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
