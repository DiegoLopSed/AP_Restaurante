document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
    const msg = document.getElementById("login-msg");
  
    form.addEventListener("submit", (e) => {
      e.preventDefault();
  
      const nip = document.getElementById("nip").value.trim();
      const password = document.getElementById("password").value.trim();
  
      if (!nip || !password) {
        msg.textContent = "Todos los campos son obligatorios";
        msg.style.color = "red";
        return;
      }
  
      msg.textContent = "Inicio de sesión correctamente";
      msg.style.color = "green";
      form.reset();
    });
  });
  

