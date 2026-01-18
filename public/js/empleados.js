/**
 * JavaScript para gestión de empleados
 * Maneja todas las operaciones CRUD
 */

const API_URL = '../../api/empleados.php';
let empleados = [];
let modoEdicion = false;

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    cargarEmpleados();
    
    // Configurar evento del formulario
    const form = document.getElementById('empleadoForm');
    if (form) {
        form.addEventListener('submit', guardarEmpleado);
    }
});

/**
 * Cargar todos los empleados
 */
async function cargarEmpleados() {
    try {
        const response = await fetch(API_URL);
        const responseText = await response.text();
        
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Error al parsear JSON de empleados. Respuesta del servidor:', responseText);
            console.error('Parse error:', parseError);
            mostrarMensaje('Error al cargar empleados. Ver consola para detalles.', 'error');
            const tbody = document.getElementById('empleadosBody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 2rem;">Error al cargar los datos</td></tr>';
            }
            return;
        }
        
        if (data && data.success) {
            empleados = data.data;
            mostrarEmpleados(empleados);
        } else {
            mostrarMensaje('Error al cargar empleados: ' + (data?.message || 'Error desconocido'), 'error');
            const tbody = document.getElementById('empleadosBody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 2rem;">Error al cargar los datos</td></tr>';
            }
        }
    } catch (error) {
        console.error('Error al cargar empleados:', error);
        mostrarMensaje('Error al cargar empleados', 'error');
        const tbody = document.getElementById('empleadosBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 2rem;">Error al cargar los datos</td></tr>';
        }
    }
}

/**
 * Mostrar empleados en la tabla
 */
function mostrarEmpleados(empleadosFiltrados) {
    const tbody = document.getElementById('empleadosBody');
    
    if (!tbody) {
        console.error('No se encontró el elemento empleadosBody');
        return;
    }
    
    if (empleadosFiltrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 2rem;">No hay empleados registrados</td></tr>';
        return;
    }
    
    tbody.innerHTML = empleadosFiltrados.map(empleado => `
        <tr>
            <td>${empleado.id_empleado}</td>
            <td>${escapeHtml(empleado.nombre || 'N/A')}</td>
            <td>${escapeHtml(empleado.apellido || 'N/A')}</td>
            <td>${escapeHtml(empleado.cargo || 'N/A')}</td>
            <td>${escapeHtml(empleado.telefono || 'N/A')}</td>
            <td>${escapeHtml(empleado.email || 'N/A')}</td>
            <td>${empleado.fecha_contratacion || 'N/A'}</td>
            <td>$${parseFloat(empleado.salario || 0).toFixed(2)}</td>
            <td class="actions-cell">
                <button class="btn btn-sm" onclick="editarEmpleado(${empleado.id_empleado})">Editar</button>
                <button class="btn btn-sm btn-danger" onclick="eliminarEmpleado(${empleado.id_empleado})">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

/**
 * Mostrar formulario para agregar/editar
 */
function mostrarFormulario() {
    const formDiv = document.getElementById('formEmpleado');
    const form = document.getElementById('empleadoForm');
    const formTitulo = document.getElementById('formTitulo');
    
    if (formDiv) {
        formDiv.style.display = 'block';
    }
    if (form) {
        form.reset();
        
        // Habilitar campos de usuario para creación (opcionales)
        const rfcInput = document.getElementById('rfc');
        const curpInput = document.getElementById('curp');
        const contrasenaInput = document.getElementById('contrasena');
        
        if (rfcInput) {
            rfcInput.disabled = false;
            rfcInput.required = false;
            rfcInput.placeholder = 'Opcional - Solo si crea usuario';
            rfcInput.style.backgroundColor = '';
        }
        if (curpInput) {
            curpInput.disabled = false;
            curpInput.required = false;
            curpInput.placeholder = 'Opcional - Solo si crea usuario';
            curpInput.style.backgroundColor = '';
        }
        if (contrasenaInput) {
            contrasenaInput.disabled = false;
            contrasenaInput.required = false;
            contrasenaInput.placeholder = 'Mínimo 8 caracteres - Solo si crea usuario';
            contrasenaInput.style.backgroundColor = '';
        }
    }
    
    if (formTitulo) {
        formTitulo.textContent = 'Agregar Nuevo Empleado';
    }
    
    modoEdicion = false;
}

/**
 * Editar empleado
 */
async function editarEmpleado(id) {
    try {
        const response = await fetch(`${API_URL}?id=${id}`);
        const responseText = await response.text();
        
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Error al parsear JSON. Respuesta:', responseText);
            mostrarMensaje('Error al cargar el empleado', 'error');
            return;
        }
        
        if (data.success && data.data) {
            const empleado = data.data;
            
            // Llenar formulario
            const nombreInput = document.getElementById('nombre');
            const apellidoInput = document.getElementById('apellido');
            const cargoInput = document.getElementById('cargo');
            const rfcInput = document.getElementById('rfc');
            const curpInput = document.getElementById('curp');
            const telefonoInput = document.getElementById('telefono');
            const emailInput = document.getElementById('email');
            const contrasenaInput = document.getElementById('contrasena');
            const fechaInput = document.getElementById('fechaContratacion');
            const salarioInput = document.getElementById('salario');
            
            if (nombreInput) nombreInput.value = empleado.nombre || '';
            if (apellidoInput) apellidoInput.value = empleado.apellido || '';
            if (cargoInput) cargoInput.value = empleado.cargo || '';
            if (telefonoInput) telefonoInput.value = empleado.telefono || '';
            if (emailInput) emailInput.value = empleado.email || '';
            if (fechaInput) fechaInput.value = empleado.fecha_contratacion || '';
            if (salarioInput) salarioInput.value = empleado.salario || '';
            
            // Para edición, los campos RFC, CURP y contraseña no se pueden modificar
            // Ocultar o deshabilitar estos campos en modo edición
            if (rfcInput) {
                rfcInput.value = '';
                rfcInput.required = false;
                rfcInput.disabled = true;
                rfcInput.placeholder = 'No se puede modificar en edición';
                rfcInput.style.backgroundColor = '#f5f5f5';
            }
            if (curpInput) {
                curpInput.value = '';
                curpInput.required = false;
                curpInput.disabled = true;
                curpInput.placeholder = 'No se puede modificar en edición';
                curpInput.style.backgroundColor = '#f5f5f5';
            }
            if (contrasenaInput) {
                contrasenaInput.value = '';
                contrasenaInput.required = false;
                contrasenaInput.disabled = true;
                contrasenaInput.placeholder = 'No se puede modificar en edición';
                contrasenaInput.style.backgroundColor = '#f5f5f5';
            }
            
            // Guardar ID para la actualización
            const form = document.getElementById('empleadoForm');
            if (form) {
                let idInput = form.querySelector('input[name="id_empleado"]');
                if (!idInput) {
                    idInput = document.createElement('input');
                    idInput.type = 'hidden';
                    idInput.name = 'id_empleado';
                    form.insertBefore(idInput, form.firstChild);
                }
                idInput.value = empleado.id_empleado;
            }
            
            // Mostrar formulario
            const formDiv = document.getElementById('formEmpleado');
            if (formDiv) {
                formDiv.style.display = 'block';
            }
            
            const formTitulo = document.getElementById('formTitulo');
            if (formTitulo) {
                formTitulo.textContent = 'Editar Empleado';
            }
            
            modoEdicion = true;
            
            // Scroll al formulario
            if (formDiv) {
                formDiv.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            mostrarMensaje('Error al cargar el empleado', 'error');
        }
    } catch (error) {
        console.error('Error al editar empleado:', error);
        mostrarMensaje('Error al cargar el empleado', 'error');
    }
}

/**
 * Guardar empleado (crear o actualizar)
 */
async function guardarEmpleado(e) {
    e.preventDefault();
    
    const form = document.getElementById('empleadoForm');
    if (!form) {
        mostrarMensaje('Error: No se encontró el formulario', 'error');
        return;
    }
    
    const idInput = form.querySelector('input[name="id_empleado"]');
    const id = idInput ? idInput.value : '';
    const esEdicion = !!id;
    
    const formData = {
        nombre: document.getElementById('nombre')?.value.trim() || '',
        apellido: document.getElementById('apellido')?.value.trim() || '',
        cargo: document.getElementById('cargo')?.value || '',
        telefono: document.getElementById('telefono')?.value.trim() || '',
        email: document.getElementById('email')?.value.trim() || '',
        fechaContratacion: document.getElementById('fechaContratacion')?.value || '',
        salario: parseFloat(document.getElementById('salario')?.value || 0)
    };
    
    // Solo incluir RFC, CURP y contraseña si es creación (no edición)
    if (!esEdicion) {
        const rfc = document.getElementById('rfc')?.value.trim() || '';
        const curp = document.getElementById('curp')?.value.trim() || '';
        const contrasena = document.getElementById('contrasena')?.value || '';
        
        // Si se proporciona alguno de los campos de usuario, todos deben estar presentes
        const tieneAlgunDatoUsuario = rfc || curp || contrasena;
        if (tieneAlgunDatoUsuario) {
            if (!rfc || !curp || !contrasena) {
                mostrarMensaje('Si desea crear un usuario asociado, debe proporcionar RFC, CURP y contraseña. Todos los campos son requeridos.', 'error');
                return;
            }
            
            // Validar formato de RFC (12-13 caracteres alfanuméricos)
            if (rfc.length < 12 || rfc.length > 13 || !/^[A-ZÑ&0-9]{12,13}$/i.test(rfc)) {
                mostrarMensaje('RFC inválido. Debe tener entre 12 y 13 caracteres alfanuméricos', 'error');
                return;
            }
            
            // Validar formato de CURP (18 caracteres)
            if (curp.length !== 18 || !/^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]$/i.test(curp)) {
                mostrarMensaje('CURP inválido. Debe tener exactamente 18 caracteres con el formato correcto', 'error');
                return;
            }
            
            // Validar contraseña
            if (contrasena.length < 8) {
                mostrarMensaje('La contraseña debe tener al menos 8 caracteres', 'error');
                return;
            }
            
            // Si todas las validaciones pasan, incluir en formData
            formData.rfc = rfc;
            formData.curp = curp;
            formData.contrasena = contrasena;
        }
    }
    
    // Validar datos básicos
    if (!formData.nombre || !formData.apellido || !formData.cargo || 
        !formData.telefono || !formData.email || !formData.fechaContratacion) {
        mostrarMensaje('Todos los campos son requeridos', 'error');
        return;
    }
    const url = esEdicion ? `${API_URL}?id=${id}` : API_URL;
    const method = esEdicion ? 'PUT' : 'POST';
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            let errorData;
            try {
                errorData = JSON.parse(errorText);
                console.error('Error del servidor (status ' + response.status + '):', errorData);
                mostrarMensaje(errorData.message || `Error ${response.status}: ${response.statusText}`, 'error');
            } catch (parseError) {
                console.error('Error no parseable del servidor:', errorText);
                mostrarMensaje(`Error ${response.status}: ${response.statusText}`, 'error');
            }
            return;
        }
        
        const responseText = await response.text();
        
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Error al parsear JSON. Respuesta del servidor:', responseText);
            console.error('Parse error:', parseError);
            mostrarMensaje('Error: El servidor devolvió una respuesta inválida. Ver consola para detalles.', 'error');
            return;
        }
        
        if (data.success) {
            mostrarMensaje(data.message || (id ? 'Empleado actualizado exitosamente' : 'Empleado creado exitosamente'), 'success');
            cancelarFormulario();
            cargarEmpleados();
        } else {
            mostrarMensaje(data.message || 'Error al guardar el empleado', 'error');
        }
    } catch (error) {
        console.error('Error al guardar empleado:', error);
        console.error('Error completo:', error.message, error.stack);
        mostrarMensaje('Error al guardar el empleado: ' + error.message, 'error');
    }
}

/**
 * Eliminar empleado
 */
async function eliminarEmpleado(id) {
    if (!confirm('¿Está seguro de que desea eliminar este empleado?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}?id=${id}`, {
            method: 'DELETE'
        });
        
        const responseText = await response.text();
        
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Error al parsear JSON. Respuesta:', responseText);
            mostrarMensaje('Error al eliminar el empleado', 'error');
            return;
        }
        
        if (data.success) {
            mostrarMensaje(data.message || 'Empleado eliminado exitosamente', 'success');
            cargarEmpleados();
        } else {
            mostrarMensaje(data.message || 'Error al eliminar el empleado', 'error');
        }
    } catch (error) {
        console.error('Error al eliminar empleado:', error);
        mostrarMensaje('Error al eliminar el empleado', 'error');
    }
}

/**
 * Cancelar formulario
 */
function cancelarFormulario() {
    const formDiv = document.getElementById('formEmpleado');
    const form = document.getElementById('empleadoForm');
    
    if (formDiv) {
        formDiv.style.display = 'none';
    }
    if (form) {
        form.reset();
        const idInput = form.querySelector('input[name="id_empleado"]');
        if (idInput) {
            idInput.remove();
        }
    }
    
    modoEdicion = false;
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
    
    // Insertar mensaje después del título
    const welcome = document.querySelector('.welcome');
    if (welcome) {
        welcome.insertAdjacentElement('afterend', mensajeDiv);
    } else {
        const main = document.querySelector('main');
        if (main) {
            main.insertBefore(mensajeDiv, main.firstChild);
        }
    }
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        mensajeDiv.remove();
    }, 5000);
}

/**
 * Escapar HTML para prevenir XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

