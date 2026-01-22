document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formContacto");
    const error = document.getElementById("error-msg");
  
    form.addEventListener("submit", (e) => {
      e.preventDefault();
  
      const nombre = document.getElementById("nombre").value.trim();
      const email = document.getElementById("email").value.trim();
      const mensaje = document.getElementById("mensaje").value.trim();
  
      if (!nombre || !email || !mensaje) {
        error.textContent = "Todos los campos son obligatorios";
        error.style.color = "red";
        return;
      }
  
      if (!email.includes("@")) {
        error.textContent = "Correo no válido";
        error.style.color = "red";
        return;
      }
  
      error.textContent = "Mensaje enviado correctamente ✔";
      error.style.color = "green";
      form.reset();
    });
  });
  