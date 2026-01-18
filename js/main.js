/* --- Abrir y cerrar menu hamburguesa --- */
const nav = document.querySelector("#nav");
const abrir = document.querySelector("#abrir");
const cerrar = document.querySelector("#cerrar");

abrir.addEventListener("click", () => {
    nav.classList.add("visible");
})

cerrar.addEventListener("click", () => {
    nav.classList.remove("visible");
})

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
})

cerrar.addEventListener("click", () => {
    nav.classList.remove("visible");
    document.body.classList.remove("menu-open");
})

/* --- CLICK EN IMAGENES --- */
document.addEventListener("DOMContentLoaded", () => {
  const zoomables = document.querySelectorAll(".abr-zoomable");

  zoomables.forEach((img) => {
    img.addEventListener("click", () => {
      const card = img.closest(".cardholder__card");
      const title = card?.querySelector(".cardholder__card--title h2")?.innerText || "Vista previa";
      const imageUrl = img.getAttribute("src");
      const altText = img.getAttribute("alt") || title;

      Swal.fire({
        title: title,
        imageUrl: imageUrl,
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
    });
  });
});
