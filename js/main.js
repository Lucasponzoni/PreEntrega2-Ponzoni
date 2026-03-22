/* --- Abrir y cerrar menu hamburguesa --- */
const nav = document.querySelector("#nav");
const abrir = document.querySelector("#abrir");
const cerrar = document.querySelector("#cerrar");

abrir.addEventListener("click", () => {
    nav.classList.add("visible");
});

cerrar.addEventListener("click", () => {
    nav.classList.remove("visible");
});

document.addEventListener("DOMContentLoaded", function () {
  const abrirMenuBtn = document.querySelector("#abrir");

  function startAnimation() {
    abrirMenuBtn.querySelector("i").classList.remove("bounce");
    void abrirMenuBtn.offsetWidth;
    abrirMenuBtn.querySelector("i").classList.add("bounce");
  }

  abrirMenuBtn.addEventListener("click", startAnimation);
  abrirMenuBtn.querySelector("i").addEventListener("animationend", startAnimation);
});

/* --- Evita Scroll al abrir NavBar en mobile --- */

abrir.addEventListener("click", () => {
  nav.classList.add("visible");
  document.body.classList.add("menu-open");
});

cerrar.addEventListener("click", () => {
  nav.classList.remove("visible");
  document.body.classList.remove("menu-open");
});

const openZoomPreview = (trigger) => {
  const imageWrapper = trigger.closest(".cardholder__card-image");
  const image = imageWrapper?.querySelector(".abr-zoomable");
  const card = trigger.closest(".cardholder__card");
  const title = card?.querySelector(".cardholder__card--title h2")?.innerText || "Vista previa";
  const imageUrl = image?.getAttribute("src");
  const altText = image?.getAttribute("alt") || title;

  if (!imageUrl || typeof Swal === "undefined") return;

  Swal.fire({
    title,
    imageUrl,
    imageAlt: altText,
    showCloseButton: true,
    showConfirmButton: false,
    allowOutsideClick: true,
    backdrop: "rgba(10, 20, 35, 0.55)",
    customClass: {
      popup: "abr-swal-glass",
      title: "abr-swal-title",
      image: "abr-swal-image",
      closeButton: "abr-swal-close",
    },
  });
};

/* --- CLICK EN IMAGENES Y OVERLAY --- */
document.addEventListener("DOMContentLoaded", () => {
  const imageWrappers = document.querySelectorAll(".cardholder__card-image");
  const zoomables = document.querySelectorAll(".abr-zoomable");

  imageWrappers.forEach((wrapper) => {
    wrapper.addEventListener("click", () => openZoomPreview(wrapper));
  });

  zoomables.forEach((img) => {
    img.addEventListener("click", (event) => {
      event.stopPropagation();
      openZoomPreview(img);
    });
  });

  const cards = document.querySelectorAll(".cardholder__card");

  const revealCard = (card, index) => {
    card.style.transitionDelay = `${index * 110}ms`;
    card.classList.add("is-visible");
  };

  if (!("IntersectionObserver" in window)) {
    cards.forEach(revealCard);
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
      rootMargin: "0px 0px -40px 0px",
    }
  );

  cards.forEach((card, index) => {
    card.dataset.cardIndex = index;
    observer.observe(card);
  });
});
