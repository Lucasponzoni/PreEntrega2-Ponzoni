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