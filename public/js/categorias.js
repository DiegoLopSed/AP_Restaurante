/**
 * JavaScript para gestión de categorías
 * Maneja todas las operaciones CRUD
 */

const API_URL = '../../api/categorias.php';
let categorias = [];
let modoEdicion = false;

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    cargarCategorias();
    
    // Configurar evento del formulario
    const form = document.getElementById('insumoForm');
    if (form) {
        form.addEventListener('submit', guardarCategoria);
    }
});

/**
 * Cargar todas las categorías
 */
async function cargarCategorias() {
    try {
        const response = await fetch(API_URL);
        
        // Obtener el texto primero para debug
        const responseText = await response.text();
        
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Error al parsear JSON de categorías. Respuesta del servidor:', responseText);
            console.error('Parse error:', parseError);
            mostrarMensaje('Error al cargar categorías. Ver consola para detalles.', 'error');
            const tbody = document.getElementById('insumosBody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem;">Error al cargar los datos</td></tr>';
            }
            return;
        }
        
        if (data && data.success) {
            categorias = data.data;
            mostrarCategorias(categorias);
        } else {
            mostrarMensaje('Error al cargar categorías: ' + (data?.message || 'Error desconocido'), 'error');
            const tbody = document.getElementById('insumosBody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem;">Error al cargar los datos</td></tr>';
            }
        }
    } catch (error) {
        console.error('Error al cargar categorías:', error);
        mostrarMensaje('Error al cargar categorías', 'error');
        const tbody = document.getElementById('insumosBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem;">Error al cargar los datos</td></tr>';
        }
    }
}

/**
 * Mostrar categorías en la tabla
 */
function mostrarCategorias(categoriasFiltradas) {
    const tbody = document.getElementById('insumosBody');
    
    if (!tbody) {
        console.error('No se encontró el elemento insumosBody');
        return;
    }
    
    if (categoriasFiltradas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem;">No hay categorías registradas</td></tr>';
        return;
    }
    
    tbody.innerHTML = categoriasFiltradas.map(categoria => `
        <tr>
            <td>${categoria.id_categoria}</td>
            <td>${escapeHtml(categoria.nombre || 'N/A')}</td>
            <td>${escapeHtml(categoria.descripcion || 'Sin descripción')}</td>
            <td class="actions-cell">
                <button class="btn btn-sm" onclick="editarCategoria(${categoria.id_categoria})">Editar</button>
                <button class="btn btn-sm btn-danger" onclick="eliminarCategoria(${categoria.id_categoria})">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

/**
 * Filtrar categorías
 */
function filtrarCategorias() {
    const buscar = document.getElementById('buscar')?.value.toLowerCase() || '';
    
    let categoriasFiltradas = categorias;
    
    // Filtrar por búsqueda de texto
    if (buscar) {
        categoriasFiltradas = categoriasFiltradas.filter(categoria => 
            (categoria.nombre && categoria.nombre.toLowerCase().includes(buscar)) ||
            (categoria.descripcion && categoria.descripcion.toLowerCase().includes(buscar))
        );
    }
    
    mostrarCategorias(categoriasFiltradas);
}

/**
 * Mostrar formulario para agregar/editar
 */
function mostrarFormulario() {
    const formDiv = document.getElementById('formInsumo');
    const form = document.getElementById('insumoForm');
    const formTitulo = document.getElementById('formTitulo');
    
    if (formDiv) {
        formDiv.style.display = 'block';
    }
    if (form) {
        form.reset();
    }
    
    const idInput = document.getElementById('id_categoria');
    if (idInput) {
        idInput.value = '';
    }
    
    if (formTitulo) {
        formTitulo.textContent = 'Agregar Nueva Categoría';
    }
    
    modoEdicion = false;
    
    // Ocultar campos que no corresponden a categorías
    const categoriaSelect = document.querySelector('select[name="id_categoria"]');
    const fechaInput = document.getElementById('fecha_ultimo_pedido');
    
    if (categoriaSelect && categoriaSelect.closest('.form-group')) {
        categoriaSelect.closest('.form-group').style.display = 'none';
    }
    if (fechaInput && fechaInput.closest('.form-group')) {
        fechaInput.closest('.form-group').style.display = 'none';
    }
}

/**
 * Editar categoría
 */
async function editarCategoria(id) {
    try {
        const response = await fetch(`${API_URL}?id=${id}`);
        const responseText = await response.text();
        
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Error al parsear JSON. Respuesta:', responseText);
            mostrarMensaje('Error al cargar la categoría', 'error');
            return;
        }
        
        if (data.success && data.data) {
            const categoria = data.data;
            
            // Llenar formulario
            const idInput = document.getElementById('id_categoria');
            const nombreInput = document.getElementById('nombre');
            const descripcionInput = document.getElementById('descripcion');
            
            if (idInput) idInput.value = categoria.id_categoria;
            if (nombreInput) nombreInput.value = categoria.nombre || '';
            if (descripcionInput) {
                descripcionInput.value = categoria.descripcion || '';
            } else {
                // Si no existe el campo descripción, intentar crear uno o usar un textarea
                const form = document.getElementById('insumoForm');
                if (form && !descripcionInput) {
                    // Buscar si hay un campo de descripción oculto o crearlo
                    const nombreGroup = nombreInput?.closest('.form-group');
                    if (nombreGroup && nombreGroup.nextElementSibling) {
                        // Intentar encontrar un campo existente o agregar uno
                        let descField = form.querySelector('[name="descripcion"]');
                        if (!descField) {
                            // Crear campo de descripción dinámicamente
                            const descGroup = document.createElement('div');
                            descGroup.className = 'form-group';
                            descGroup.innerHTML = `
                                <label for="descripcion">Descripción:</label>
                                <textarea id="descripcion" name="descripcion" rows="3" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;"></textarea>
                            `;
                            nombreGroup.insertAdjacentElement('afterend', descGroup);
                            descField = document.getElementById('descripcion');
                        }
                        if (descField) {
                            descField.value = categoria.descripcion || '';
                        }
                    }
                }
            }
            
            // Mostrar formulario
            const formDiv = document.getElementById('formInsumo');
            if (formDiv) {
                formDiv.style.display = 'block';
            }
            
            const formTitulo = document.getElementById('formTitulo');
            if (formTitulo) {
                formTitulo.textContent = 'Editar Categoría';
            }
            
            modoEdicion = true;
            
            // Ocultar campos que no corresponden a categorías
            const categoriaSelect = document.querySelector('select[name="id_categoria"]');
            const fechaInput = document.getElementById('fecha_ultimo_pedido');
            
            if (categoriaSelect && categoriaSelect.closest('.form-group')) {
                categoriaSelect.closest('.form-group').style.display = 'none';
            }
            if (fechaInput && fechaInput.closest('.form-group')) {
                fechaInput.closest('.form-group').style.display = 'none';
            }
            
            // Scroll al formulario
            if (formDiv) {
                formDiv.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            mostrarMensaje('Error al cargar la categoría', 'error');
        }
    } catch (error) {
        console.error('Error al editar categoría:', error);
        mostrarMensaje('Error al cargar la categoría', 'error');
    }
}

/**
 * Guardar categoría (crear o actualizar)
 */
async function guardarCategoria(e) {
    e.preventDefault();
    
    const nombreInput = document.getElementById('nombre');
    const descripcionInput = document.getElementById('descripcion');
    const idInput = document.getElementById('id_categoria');
    
    if (!nombreInput) {
        mostrarMensaje('Error: No se encontró el campo nombre', 'error');
        return;
    }
    
    const formData = {
        nombre: nombreInput.value.trim(),
        descripcion: descripcionInput ? descripcionInput.value.trim() : null
    };
    
    // Validar nombre
    if (!formData.nombre) {
        mostrarMensaje('El nombre es requerido', 'error');
        return;
    }
    
    const id = idInput ? idInput.value : '';
    const url = id ? `${API_URL}?id=${id}` : API_URL;
    const method = id ? 'PUT' : 'POST';
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        // Verificar el status de la respuesta primero
        if (!response.ok) {
            // Si la respuesta no es OK, intentar obtener el error en JSON
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
        
        // Obtener el texto primero para debug
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
            mostrarMensaje(data.message || (id ? 'Categoría actualizada exitosamente' : 'Categoría creada exitosamente'), 'success');
            cancelarFormulario();
            cargarCategorias();
        } else {
            mostrarMensaje(data.message || 'Error al guardar la categoría', 'error');
        }
    } catch (error) {
        console.error('Error al guardar categoría:', error);
        console.error('Error completo:', error.message, error.stack);
        mostrarMensaje('Error al guardar la categoría: ' + error.message, 'error');
    }
}

/**
 * Eliminar categoría
 */
async function eliminarCategoria(id) {
    if (!confirm('¿Está seguro de que desea eliminar esta categoría?\n\nNota: No se podrá eliminar si tiene insumos o productos asociados.')) {
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
            mostrarMensaje('Error al eliminar la categoría', 'error');
            return;
        }
        
        if (data.success) {
            mostrarMensaje(data.message || 'Categoría eliminada exitosamente', 'success');
            cargarCategorias();
        } else {
            mostrarMensaje(data.message || 'Error al eliminar la categoría', 'error');
        }
    } catch (error) {
        console.error('Error al eliminar categoría:', error);
        mostrarMensaje('Error al eliminar la categoría', 'error');
    }
}

/**
 * Cancelar formulario
 */
function cancelarFormulario() {
    const formDiv = document.getElementById('formInsumo');
    const form = document.getElementById('insumoForm');
    
    if (formDiv) {
        formDiv.style.display = 'none';
    }
    if (form) {
        form.reset();
    }
    
    const idInput = document.getElementById('id_categoria');
    if (idInput) {
        idInput.value = '';
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
        // Si no existe welcome, insertar al inicio del main
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

// Función de compatibilidad para el HTML que aún usa filtrarInsumos
function filtrarInsumos() {
    filtrarCategorias();
}


