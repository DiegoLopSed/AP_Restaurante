<<<<<<< HEAD
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
  

=======
/**
 * JavaScript para gestión de login
 * Maneja la autenticación de usuarios
 */

const API_URL = '../../api/login.php';

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');
    if (form) {
        form.addEventListener('submit', iniciarSesion);
    }
    
    // Verificar si ya hay una sesión activa
    verificarSesion();
});

/**
 * Iniciar sesión
 */
async function iniciarSesion(event) {
    event.preventDefault();
    
    const form = document.getElementById('loginForm');
    const btnLogin = document.getElementById('btnLogin');
    
    if (!form) {
        mostrarMensaje('Error: No se encontró el formulario', 'error');
        return;
    }
    
    const correo = document.getElementById('correo').value.trim();
    const contrasena = document.getElementById('contrasena').value;
    
    // Validación básica
    if (!correo || !contrasena) {
        mostrarMensaje('Por favor, complete todos los campos', 'error');
        return;
    }
    
    // Validar formato de correo
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
        mostrarMensaje('Por favor, ingrese un correo electrónico válido', 'error');
        return;
    }
    
    // Deshabilitar botón durante la petición
    if (btnLogin) {
        btnLogin.disabled = true;
        btnLogin.textContent = 'Iniciando sesión...';
    }
    
    try {
        const formData = {
            correo: correo,
            contrasena: contrasena
        };
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const responseText = await response.text();
        
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            mostrarMensaje('Error al procesar la respuesta del servidor', 'error');
            return;
        }
        
        if (data.success) {
            // Guardar información de sesión
            if (data.data && data.data.token) {
                localStorage.setItem('auth_token', data.data.token);
            }
            if (data.data && data.data.usuario) {
                localStorage.setItem('usuario', JSON.stringify(data.data.usuario));
            }
            
            mostrarMensaje(data.message || 'Inicio de sesión exitoso. Redirigiendo...', 'success');
            
            // Redirigir después de 1 segundo
            setTimeout(() => {
                window.location.href = '../../index.html';
            }, 1000);
        } else {
            mostrarMensaje(data.message || 'Correo o contraseña incorrectos', 'error');
            // Habilitar botón nuevamente
            if (btnLogin) {
                btnLogin.disabled = false;
                btnLogin.textContent = 'Iniciar Sesión';
            }
        }
    } catch (error) {
        mostrarMensaje('Error al conectar con el servidor. Por favor, intente nuevamente.', 'error');
        // Habilitar botón nuevamente
        if (btnLogin) {
            btnLogin.disabled = false;
            btnLogin.textContent = 'Iniciar Sesión';
        }
    }
}

/**
 * Verificar si hay una sesión activa
 */
function verificarSesion() {
    const token = localStorage.getItem('auth_token');
    const usuario = localStorage.getItem('usuario');
    
    if (token && usuario) {
        // Sesión activa detectada
    }
}

/**
 * Cerrar sesión
 */
function cerrarSesion() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('usuario');
    window.location.href = 'login.html';
}

/**
 * Obtener usuario actual de la sesión
 */
function obtenerUsuarioActual() {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
        try {
            return JSON.parse(usuarioStr);
        } catch (e) {
            return null;
        }
    }
    return null;
}

/**
 * Verificar si el usuario está autenticado
 */
function estaAutenticado() {
    return localStorage.getItem('auth_token') !== null;
}

/**
 * Mostrar mensaje de notificación
 */
function mostrarMensaje(mensaje, tipo) {
    // Remover mensajes anteriores
    const mensajesAnteriores = document.querySelectorAll('.message');
    mensajesAnteriores.forEach(msg => msg.remove());
    
    // Crear nuevo mensaje
    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = `message message-${tipo}`;
    mensajeDiv.textContent = mensaje;
    
    // Insertar mensaje después del header
    const loginHeader = document.querySelector('.login-header');
    if (loginHeader) {
        loginHeader.insertAdjacentElement('afterend', mensajeDiv);
    } else {
        const form = document.getElementById('loginForm');
        if (form) {
            form.insertBefore(mensajeDiv, form.firstChild);
        }
    }
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        mensajeDiv.remove();
    }, 5000);
}
>>>>>>> kadidev_Diego
