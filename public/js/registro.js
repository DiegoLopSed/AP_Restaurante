/**
 * JavaScript para registro de usuarios
 * Maneja el registro de nuevos usuarios
 */

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registroForm');
    if (form) {
        form.addEventListener('submit', registroUsuario);
    }
});

/**
 * Registrar nuevo usuario
 */
async function registroUsuario(event) {
    event.preventDefault();
    
    const form = document.getElementById('registroForm');
    if (!form) {
        return;
    }
    
    const formData = new FormData(form);
    
    try {
        const response = await fetch('../../api/registro.php', {
            method: 'POST',
            body: formData
        });
        
        const responseText = await response.text();
        
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            mostrarMensaje('Error: El servidor devolvió una respuesta inválida', 'error');
            return;
        }
        
        if (data.success) {
            mostrarMensaje(data.message || 'Usuario registrado exitosamente. Redirigiendo al login...', 'success');
            form.reset();
            
            // Redirigir al login después de 2 segundos
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            mostrarMensaje(data.message || 'Error al registrar el usuario', 'error');
        }
    } catch (error) {
        mostrarMensaje('Error al registrar el usuario: ' + error.message, 'error');
    }
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
    
    // Insertar mensaje después del header o al inicio del formulario
    const registroHeader = document.querySelector('.registro-header');
    if (registroHeader) {
        registroHeader.insertAdjacentElement('afterend', mensajeDiv);
    } else {
        const welcome = document.querySelector('.welcome');
        if (welcome) {
            welcome.insertAdjacentElement('afterend', mensajeDiv);
        } else {
            const form = document.getElementById('registroForm');
            if (form) {
                form.insertBefore(mensajeDiv, form.firstChild);
            } else {
                const main = document.querySelector('main');
                if (main) {
                    main.insertBefore(mensajeDiv, main.firstChild);
                }
            }
        }
    }
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        mensajeDiv.remove();
    }, 5000);
}

            