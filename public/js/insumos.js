/**
 * JavaScript para gestión de insumos
 * Maneja todas las operaciones CRUD
 */

const API_URL = '../../api/insumos.php';
let insumos = [];
let categorias = [];
let modoEdicion = false;

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    cargarCategorias();
    cargarInsumos();
    
    // Configurar evento del formulario
    document.getElementById('insumoForm').addEventListener('submit', guardarInsumo);
});

/**
 * Cargar todas las categorías para los dropdowns
 */
async function cargarCategorias() {
    try {
        const response = await fetch('../../api/categorias.php');
        
        // Obtener el texto primero para debug
        const responseText = await response.text();
        
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Error al parsear JSON de categorías. Respuesta del servidor:', responseText);
            console.error('Parse error:', parseError);
            // Si falla, intentar extraer categorías de los insumos como respaldo
            try {
                const responseInsumos = await fetch('../../api/insumos.php');
                const textInsumos = await responseInsumos.text();
                let dataInsumos = JSON.parse(textInsumos);
                
                if (dataInsumos.success && dataInsumos.data.length > 0) {
                    const categoriasUnicas = {};
                    dataInsumos.data.forEach(insumo => {
                        if (!categoriasUnicas[insumo.id_categoria]) {
                            categoriasUnicas[insumo.id_categoria] = {
                                id_categoria: insumo.id_categoria,
                                nombre: insumo.categoria_nombre
                            };
                        }
                    });
                    categorias = Object.values(categoriasUnicas);
                } else {
                    mostrarMensaje('Error al cargar categorías. Ver consola para detalles.', 'error');
                    return;
                }
            } catch (fallbackError) {
                console.error('Error en respaldo al cargar categorías:', fallbackError);
                mostrarMensaje('Error al cargar categorías. Ver consola para detalles.', 'error');
                return;
            }
        }
        
        if (data && data.success) {
            categorias = data.data;
        } else if (!categorias || categorias.length === 0) {
            // Si no hay categorías cargadas, mostrar error
            console.error('No se pudieron cargar las categorías');
            mostrarMensaje('No se pudieron cargar las categorías', 'error');
            return;
        }
        
        // Llenar dropdowns de categorías
        const selectCategoria = document.getElementById('id_categoria');
        const filtroCategoria = document.getElementById('filtroCategoria');
        
        // Limpiar opciones existentes (excepto la primera)
        while (selectCategoria.children.length > 1) {
            selectCategoria.removeChild(selectCategoria.lastChild);
        }
        while (filtroCategoria.children.length > 1) {
            filtroCategoria.removeChild(filtroCategoria.lastChild);
        }
        
        categorias.forEach(categoria => {
            const option1 = document.createElement('option');
            option1.value = categoria.id_categoria;
            option1.textContent = categoria.nombre;
            selectCategoria.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = categoria.id_categoria;
            option2.textContent = categoria.nombre;
            filtroCategoria.appendChild(option2);
        });
    } catch (error) {
        console.error('Error al cargar categorías:', error);
        mostrarMensaje('Error al cargar categorías', 'error');
    }
}

/**
 * Cargar todos los insumos
 */
async function cargarInsumos() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        if (data.success) {
            insumos = data.data;
            mostrarInsumos(insumos);
        } else {
            mostrarMensaje('Error al cargar insumos: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error al cargar insumos:', error);
        mostrarMensaje('Error al cargar insumos', 'error');
        document.getElementById('insumosBody').innerHTML = 
            '<tr><td colspan="6" style="text-align: center; padding: 2rem;">Error al cargar los datos</td></tr>';
    }
}

/**
 * Mostrar insumos en la tabla
 */
function mostrarInsumos(insumosFiltrados) {
    const tbody = document.getElementById('insumosBody');
    
    if (insumosFiltrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No hay insumos registrados</td></tr>';
        return;
    }
    
    tbody.innerHTML = insumosFiltrados.map(insumo => `
        <tr>
            <td>${insumo.id_insumo}</td>
            <td>${escapeHtml(insumo.nombre)}</td>
            <td>${escapeHtml(insumo.categoria_nombre || 'N/A')}</td>
            <td>
                <span class="stock-badge ${(parseInt(insumo.stock) || 0) > 0 ? 'stock-true' : 'stock-false'}">
                    ${insumo.stock || 0} piezas
                </span>
            </td>
            <td>${insumo.fecha_ultimo_pedido || 'N/A'}</td>
            <td class="actions-cell">
                <button class="btn btn-sm" onclick="editarInsumo(${insumo.id_insumo})">Editar</button>
                <button class="btn btn-sm btn-danger" onclick="eliminarInsumo(${insumo.id_insumo})">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

/**
 * Filtrar insumos
 */
function filtrarInsumos() {
    const buscar = document.getElementById('buscar').value.toLowerCase();
    const categoria = document.getElementById('filtroCategoria').value;
    const stock = document.getElementById('filtroStock').value;
    
    let insumosFiltrados = insumos;
    
    // Filtrar por búsqueda de texto
    if (buscar) {
        insumosFiltrados = insumosFiltrados.filter(insumo => 
            insumo.nombre.toLowerCase().includes(buscar)
        );
    }
    
    // Filtrar por categoría
    if (categoria) {
        insumosFiltrados = insumosFiltrados.filter(insumo => 
            insumo.id_categoria == categoria
        );
    }
    
    // Filtrar por stock
    if (stock !== '') {
        if (stock === 'con_stock') {
            insumosFiltrados = insumosFiltrados.filter(insumo => 
                (parseInt(insumo.stock) || 0) > 0
            );
        } else if (stock === 'sin_stock') {
            insumosFiltrados = insumosFiltrados.filter(insumo => 
                (parseInt(insumo.stock) || 0) === 0
            );
        }
    }
    
    mostrarInsumos(insumosFiltrados);
}

/**
 * Mostrar formulario para agregar/editar
 */
function mostrarFormulario() {
    document.getElementById('formInsumo').style.display = 'block';
    document.getElementById('insumoForm').reset();
    document.getElementById('id_insumo').value = '';
    document.getElementById('formTitulo').textContent = 'Agregar Nuevo Insumo';
    modoEdicion = false;
}

/**
 * Editar insumo
 */
async function editarInsumo(id) {
    try {
        const response = await fetch(`${API_URL}?id=${id}`);
        const data = await response.json();
        
        if (data.success && data.data) {
            const insumo = data.data;
            
            // Llenar formulario
            document.getElementById('id_insumo').value = insumo.id_insumo;
            document.getElementById('nombre').value = insumo.nombre;
            document.getElementById('id_categoria').value = insumo.id_categoria;
            document.getElementById('stock').value = insumo.stock || 0;
            document.getElementById('fecha_ultimo_pedido').value = insumo.fecha_ultimo_pedido || '';
            
            // Mostrar formulario
            document.getElementById('formInsumo').style.display = 'block';
            document.getElementById('formTitulo').textContent = 'Editar Insumo';
            modoEdicion = true;
            
            // Scroll al formulario
            document.getElementById('formInsumo').scrollIntoView({ behavior: 'smooth' });
        } else {
            mostrarMensaje('Error al cargar el insumo', 'error');
        }
    } catch (error) {
        console.error('Error al editar insumo:', error);
        mostrarMensaje('Error al cargar el insumo', 'error');
    }
}

/**
 * Guardar insumo (crear o actualizar)
 */
async function guardarInsumo(e) {
    e.preventDefault();
    
    const formData = {
        nombre: document.getElementById('nombre').value,
        id_categoria: document.getElementById('id_categoria').value,
        stock: document.getElementById('stock').value,
        fecha_ultimo_pedido: document.getElementById('fecha_ultimo_pedido').value || null
    };
    
    const id = document.getElementById('id_insumo').value;
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
            mostrarMensaje(data.message || (id ? 'Insumo actualizado exitosamente' : 'Insumo creado exitosamente'), 'success');
            cancelarFormulario();
            cargarInsumos();
            cargarCategorias(); // Recargar categorías por si hay nuevas
        } else {
            mostrarMensaje(data.message || 'Error al guardar el insumo', 'error');
        }
    } catch (error) {
        console.error('Error al guardar insumo:', error);
        console.error('Error completo:', error.message, error.stack);
        mostrarMensaje('Error al guardar el insumo: ' + error.message, 'error');
    }
}

/**
 * Eliminar insumo
 */
async function eliminarInsumo(id) {
    if (!confirm('¿Está seguro de que desea eliminar este insumo?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}?id=${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarMensaje(data.message || 'Insumo eliminado exitosamente', 'success');
            cargarInsumos();
        } else {
            mostrarMensaje(data.message || 'Error al eliminar el insumo', 'error');
        }
    } catch (error) {
        console.error('Error al eliminar insumo:', error);
        mostrarMensaje('Error al eliminar el insumo', 'error');
    }
}

/**
 * Cancelar formulario
 */
function cancelarFormulario() {
    document.getElementById('formInsumo').style.display = 'none';
    document.getElementById('insumoForm').reset();
    document.getElementById('id_insumo').value = '';
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
    welcome.insertAdjacentElement('afterend', mensajeDiv);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        mensajeDiv.remove();
    }, 5000);
}

/**
 * Escapar HTML para prevenir XSS
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text ? text.replace(/[&<>"']/g, m => map[m]) : '';
}

