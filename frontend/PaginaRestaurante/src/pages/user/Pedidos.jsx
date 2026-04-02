import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import styles from '../../assets/css/ManagerDashboard.module.css';
import pedidoStyles from '../../assets/css/UserPedidos.module.css';
import Table from '../../components/Table';
import { PlusIcon, MinusIcon, TrashIcon, ArrowLeftIcon, PrinterIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import {
  fetchPedidosActivos,
  createPedido,
  addProductoAPedido,
  fetchLineasPedido,
  updateCantidadLineaPedido,
  removeProductoDePedido,
  finalizarPedido,
  eliminarPedido,
  enviarComandaImpresoraRed,
} from '../../services/pedidos';
import { fetchCategorias } from '../../services/categorias';
import { fetchProductos } from '../../services/productos';
import {
  imprimirComandaPedido,
  getAutoImprimirAlAgregar,
  setAutoImprimirAlAgregar,
  getImprimirPorRedTermica,
  setImprimirPorRedTermica,
} from '../../services/impresionComanda';

function etiquetaMetodoPago(pedido) {
  const n = pedido?.metodo_pago_nombre;
  if (n != null && String(n).trim() !== '') {
    return String(n).trim();
  }
  if (Number(pedido?.id_metodo_pago) === 2) return 'Tarjeta';
  return 'Efectivo';
}

function formatearEntrada(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('es-MX', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return '—';
  }
}

/** Referencia temporal del pedido: `created_at` (tabla pedido); respaldo por compatibilidad. */
function instantePedidoParaAntiguedad(pedido) {
  const v = pedido?.created_at ?? pedido?.hora_entrada;
  if (v == null || String(v).trim() === '') return null;
  return v;
}

/** Minutos transcurridos desde el instante dado hasta ahora; null si no aplica. */
function minutosDesdeInstante(iso) {
  if (iso == null || String(iso).trim() === '') return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  const diffMs = Date.now() - t;
  if (diffMs < 0) return 0;
  return Math.floor(diffMs / 60000);
}

/**
 * Verde: hasta 30 min · Amarillo: 31–50 min · Rojo: 51+ min
 * (tiempo desde `created_at` del pedido)
 */
function claseCardPorAntiguedadPedido(pedido, stylesModule) {
  const m = minutosDesdeInstante(instantePedidoParaAntiguedad(pedido));
  if (m === null) return '';
  if (m <= 30) return stylesModule.clientCardFresh;
  if (m <= 50) return stylesModule.clientCardWarning;
  return stylesModule.clientCardUrgent;
}

function etiquetaAntiguedadPedido(pedido) {
  const ref = instantePedidoParaAntiguedad(pedido);
  const m = minutosDesdeInstante(ref);
  if (m === null) return 'Sin fecha de registro del pedido';
  if (m <= 30) return `Desde registro: ${m} min (reciente)`;
  if (m <= 50) return `Desde registro: ${m} min (revisar)`;
  return `Desde registro: ${m} min (urgente)`;
}

const UserPedidos = () => {
  const { usuario } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loadingPedidos, setLoadingPedidos] = useState(true);
  const [errorPedidos, setErrorPedidos] = useState('');
  const [modalNuevoPedido, setModalNuevoPedido] = useState(false);
  const [pedidoResumenModal, setPedidoResumenModal] = useState(null);
  const [modalEdicionAbierto, setModalEdicionAbierto] = useState(false);
  const [modalPedidoBusy, setModalPedidoBusy] = useState(false);
  const [formPedido, setFormPedido] = useState({
    nombre_cliente: '',
    id_metodo_pago: 1,
  });
  const [pedidoEdicion, setPedidoEdicion] = useState(null);
  const [lineasPedido, setLineasPedido] = useState([]);
  const [loadingLineas, setLoadingLineas] = useState(false);
  const [lineaBusyKey, setLineaBusyKey] = useState('');
  const [cantidadCatalogo, setCantidadCatalogo] = useState({});
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  /** 'categorias' | 'productos' — flujo del menú para agregar al pedido */
  const [catalogoPaso, setCatalogoPaso] = useState('categorias');
  const [categoriaMenuSeleccionada, setCategoriaMenuSeleccionada] = useState(null);
  const [autoImprimirAlAgregar, setAutoImprimirAlAgregarState] = useState(() =>
    getAutoImprimirAlAgregar()
  );
  const [imprimirRedTermica, setImprimirRedTermicaState] = useState(() => getImprimirPorRedTermica());

  const seleccionRef = useRef(null);
  useEffect(() => {
    seleccionRef.current = pedidoEdicion?.id_pedido ?? null;
  }, [pedidoEdicion?.id_pedido]);

  const nombreMesero = usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Mesero';

  const onToggleAutoImprimirAlAgregar = useCallback((e) => {
    const activo = e.target.checked;
    setAutoImprimirAlAgregarState(activo);
    setAutoImprimirAlAgregar(activo);
  }, []);

  const onToggleImprimirRedTermica = useCallback((e) => {
    const activo = e.target.checked;
    setImprimirRedTermicaState(activo);
    setImprimirPorRedTermica(activo);
  }, []);

  const handleImprimirComanda = useCallback(
    async (pedido, lineasPrecargadas) => {
      if (!pedido?.id_pedido) return;
      try {
        if (getImprimirPorRedTermica()) {
          await enviarComandaImpresoraRed(pedido.id_pedido);
          return;
        }
        const lineas =
          lineasPrecargadas != null
            ? lineasPrecargadas
            : await fetchLineasPedido(pedido.id_pedido);
        const ok = await imprimirComandaPedido({ pedido, lineas, nombreMesero });
        if (!ok) {
          alert('No se pudo abrir el diálogo de impresión. Revisa el bloqueador de ventanas.');
        }
      } catch (err) {
        alert(err?.message || 'No se pudo imprimir la comanda');
      }
    },
    [nombreMesero]
  );

  const loadPedidos = useCallback(async () => {
    setLoadingPedidos(true);
    setErrorPedidos('');
    try {
      const data = await fetchPedidosActivos();
      setPedidos(data);
      return data;
    } catch (e) {
      setErrorPedidos(e?.message || 'Error al cargar pedidos activos');
      return [];
    } finally {
      setLoadingPedidos(false);
    }
  }, []);

  const cerrarModalResumen = useCallback(() => {
    setModalEdicionAbierto(false);
    setPedidoEdicion(null);
    setPedidoResumenModal(null);
  }, []);

  const cerrarModalEdicion = useCallback(() => {
    setModalEdicionAbierto(false);
  }, []);

  const refrescarPedidoYLineas = useCallback(
    async (idPedido) => {
      const data = await loadPedidos();
      if (seleccionRef.current !== idPedido) {
        return { actualizado: null, lineas: [] };
      }
      const actualizado = data.find((p) => p.id_pedido === idPedido);
      setPedidoEdicion((prev) =>
        prev?.id_pedido === idPedido && actualizado ? actualizado : prev
      );
      setPedidoResumenModal((m) =>
        m?.id_pedido === idPedido && actualizado ? actualizado : m
      );
      if (!actualizado) {
        setLineasPedido([]);
        return { actualizado: null, lineas: [] };
      }
      let lineas = [];
      try {
        lineas = await fetchLineasPedido(idPedido);
        if (seleccionRef.current !== idPedido) {
          return { actualizado: null, lineas: [] };
        }
        setLineasPedido(lineas);
      } catch {
        if (seleccionRef.current === idPedido) {
          setLineasPedido([]);
        }
      }
      return { actualizado, lineas };
    },
    [loadPedidos]
  );

  /** Fuerza re-render cada 30s para actualizar colores por antigüedad del pedido */
  const [antiguedadTick, setAntiguedadTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setAntiguedadTick((n) => n + 1), 30000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    loadPedidos();
    (async () => {
      try {
        const [cats, prods] = await Promise.all([fetchCategorias(), fetchProductos()]);
        const catsProducto = cats.filter(
          (c) => !c.tipo_categoria || String(c.tipo_categoria).toLowerCase() === 'producto'
        );
        setCategorias(catsProducto);
        setProductos(prods.filter((p) => Number(p.estatus) === 1));
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    })();
  }, [loadPedidos]);

  useEffect(() => {
    const id = pedidoEdicion?.id_pedido;
    if (!id) {
      setLineasPedido([]);
      return;
    }
    let cancelled = false;
    setLoadingLineas(true);
    (async () => {
      try {
        const lineas = await fetchLineasPedido(id);
        if (!cancelled) setLineasPedido(lineas);
      } catch (e) {
        if (!cancelled) {
          setLineasPedido([]);
          alert(e?.message || 'No se pudieron cargar los productos del pedido');
        }
      } finally {
        if (!cancelled) setLoadingLineas(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pedidoEdicion?.id_pedido]);

  useEffect(() => {
    setCatalogoPaso('categorias');
    setCategoriaMenuSeleccionada(null);
  }, [pedidoEdicion?.id_pedido]);

  const categoriasConProductos = useMemo(() => {
    const idsConProducto = new Set(productos.map((p) => String(p.id_categoria)));
    return categorias
      .filter((c) => idsConProducto.has(String(c.id_categoria)))
      .sort((a, b) => String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es'));
  }, [categorias, productos]);

  const productosDeCategoriaMenu = useMemo(() => {
    if (!categoriaMenuSeleccionada) return [];
    const idCat = String(categoriaMenuSeleccionada.id_categoria);
    return productos.filter((p) => String(p.id_categoria) === idCat);
  }, [productos, categoriaMenuSeleccionada]);

  const handleSubmitPedido = async (e) => {
    e.preventDefault();
    if (!formPedido.nombre_cliente.trim()) {
      alert('El nombre del cliente es obligatorio');
      return;
    }
    try {
      await createPedido({
        nombre_cliente: formPedido.nombre_cliente.trim(),
        nombre_mesero: nombreMesero,
        id_metodo_pago: Number(formPedido.id_metodo_pago) || 1,
      });
      setModalNuevoPedido(false);
      setFormPedido({ nombre_cliente: '', id_metodo_pago: 1 });
      await loadPedidos();
    } catch (e) {
      alert(e?.message || 'No se pudo crear el pedido');
    }
  };

  const handleFinalizarDesdeModal = async () => {
    const p = pedidoResumenModal;
    if (!p?.id_pedido) return;
    if (!window.confirm('¿Finalizar pedido?')) return;
    setModalPedidoBusy(true);
    try {
      await finalizarPedido(p.id_pedido);
      cerrarModalResumen();
      await loadPedidos();
    } catch (e) {
      alert(e?.message || 'No se pudo finalizar el pedido');
    } finally {
      setModalPedidoBusy(false);
    }
  };

  const handleEliminarDesdeModal = async () => {
    const p = pedidoResumenModal;
    if (!p?.id_pedido) return;
    if (!window.confirm('¿Eliminar pedido?')) return;
    setModalPedidoBusy(true);
    try {
      await eliminarPedido(p.id_pedido);
      cerrarModalResumen();
      await loadPedidos();
    } catch (e) {
      alert(e?.message || 'No se pudo eliminar el pedido');
    } finally {
      setModalPedidoBusy(false);
    }
  };

  const handleEditarDesdeModal = () => {
    const p = pedidoResumenModal;
    if (!p) return;
    setPedidoEdicion(p);
    setModalEdicionAbierto(true);
  };

  const getCantidadCatalogo = (idProducto) => {
    const v = cantidadCatalogo[idProducto];
    if (v === undefined || v === '') return 1;
    const n = parseInt(String(v), 10);
    return Number.isNaN(n) || n < 1 ? 1 : n;
  };

  const handleAgregarProducto = useCallback(
    async (prod) => {
      if (!pedidoEdicion) return;

      const cantidad = getCantidadCatalogo(prod.id_producto);
      const idPedido = pedidoEdicion.id_pedido;
      const busyKey = `add-${prod.id_producto}`;
      setLineaBusyKey(busyKey);
      try {
        await addProductoAPedido({
          id_pedido: idPedido,
          id_producto: prod.id_producto,
          cantidad,
        });
        const { actualizado, lineas } = await refrescarPedidoYLineas(idPedido);
        if (getAutoImprimirAlAgregar()) {
          if (getImprimirPorRedTermica()) {
            await enviarComandaImpresoraRed(idPedido);
          } else if (actualizado) {
            await imprimirComandaPedido({
              pedido: actualizado,
              lineas,
              nombreMesero,
            });
          }
        }
      } catch (e) {
        alert(e?.message || 'No se pudo agregar el producto al pedido');
      } finally {
        setLineaBusyKey('');
      }
    },
    [pedidoEdicion, refrescarPedidoYLineas, cantidadCatalogo, nombreMesero]
  );

  const handleDeltaCantidad = useCallback(
    async (linea, delta) => {
      const idPedido = linea.id_pedido;
      const idProducto = linea.id_producto;
      const actual = Number(linea.cantidad) || 0;
      const siguiente = actual + delta;
      const key = `${idProducto}-${delta < 0 ? 'dec' : 'inc'}`;
      setLineaBusyKey(key);
      try {
        if (siguiente < 1) {
          if (!window.confirm('¿Quitar?')) return;
          await removeProductoDePedido(idPedido, idProducto);
        } else {
          await updateCantidadLineaPedido({
            id_pedido: idPedido,
            id_producto: idProducto,
            cantidad: siguiente,
          });
        }
        await refrescarPedidoYLineas(idPedido);
      } catch (e) {
        alert(e?.message || 'No se pudo actualizar la cantidad');
      } finally {
        setLineaBusyKey('');
      }
    },
    [refrescarPedidoYLineas]
  );

  const handleCantidadInputBlur = useCallback(
    async (linea, raw) => {
      const n = parseInt(String(raw).trim(), 10);
      const idPedido = linea.id_pedido;
      const idProducto = linea.id_producto;
      const actual = Number(linea.cantidad) || 0;
      if (Number.isNaN(n) || n < 1) {
        await refrescarPedidoYLineas(idPedido);
        return;
      }
      if (n === actual) return;
      setLineaBusyKey(`qty-${idProducto}`);
      try {
        await updateCantidadLineaPedido({
          id_pedido: idPedido,
          id_producto: idProducto,
          cantidad: n,
        });
        await refrescarPedidoYLineas(idPedido);
      } catch (e) {
        alert(e?.message || 'No se pudo actualizar la cantidad');
        await refrescarPedidoYLineas(idPedido);
      } finally {
        setLineaBusyKey('');
      }
    },
    [refrescarPedidoYLineas]
  );

  const handleEliminarLinea = useCallback(
    async (linea) => {
      if (!window.confirm('¿Quitar línea?')) return;
      const idPedido = linea.id_pedido;
      setLineaBusyKey(`del-${linea.id_producto}`);
      try {
        await removeProductoDePedido(idPedido, linea.id_producto);
        await refrescarPedidoYLineas(idPedido);
      } catch (e) {
        alert(e?.message || 'No se pudo eliminar el producto');
      } finally {
        setLineaBusyKey('');
      }
    },
    [refrescarPedidoYLineas]
  );

  const lineaColumns = useMemo(
    () => [
      { key: 'nombre_producto', label: 'Producto' },
      {
        key: 'precio_unitario',
        label: 'P. unitario',
        render: (v) => `$${Number(v || 0).toFixed(2)}`,
      },
      {
        key: 'cantidad',
        label: 'Cantidad',
        render: (v, row) => {
          return (
            <div className={pedidoStyles.qtyControl}>
              <button
                type="button"
                className={pedidoStyles.qtyBtn}
                aria-label="Reducir cantidad"
                disabled={!!lineaBusyKey}
                onClick={() => handleDeltaCantidad(row, -1)}
              >
                <MinusIcon aria-hidden />
              </button>
              <input
                key={`${row.id_producto}-${row.cantidad}`}
                type="number"
                min={1}
                className={pedidoStyles.qtyInput}
                defaultValue={v}
                disabled={!!lineaBusyKey}
                aria-label={`Cantidad de ${row.nombre_producto}`}
                onBlur={(e) => handleCantidadInputBlur(row, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.target.blur();
                }}
              />
              <button
                type="button"
                className={pedidoStyles.qtyBtn}
                aria-label="Aumentar cantidad"
                disabled={!!lineaBusyKey}
                onClick={() => handleDeltaCantidad(row, 1)}
              >
                <PlusIcon aria-hidden />
              </button>
            </div>
          );
        },
      },
      {
        key: 'subtotal',
        label: 'Subtotal',
        render: (v) => `$${Number(v || 0).toFixed(2)}`,
      },
      {
        key: 'acciones',
        label: '',
        render: (_, row) => (
          <button
            type="button"
            className={pedidoStyles.dangerButton}
            disabled={!!lineaBusyKey}
            onClick={() => handleEliminarLinea(row)}
          >
            <TrashIcon aria-hidden />
            Quitar
          </button>
        ),
      },
    ],
    [handleDeltaCantidad, handleCantidadInputBlur, handleEliminarLinea, lineaBusyKey]
  );

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.greeting}>Mis pedidos</h1>

      <section className={styles.contentSection} aria-label="Pedidos activos y creación de pedidos">
        <div className={pedidoStyles.pageHeader}>
          <div className={pedidoStyles.pageHeaderRow}>
            <h2 className={pedidoStyles.sectionTitle}>Pedidos activos</h2>
            <button
              type="button"
              className={pedidoStyles.primaryButton}
              onClick={() => setModalNuevoPedido(true)}
            >
              <PlusIcon aria-hidden />
              Nuevo pedido
            </button>
          </div>
          <label className={pedidoStyles.printToggle}>
            <input
              type="checkbox"
              checked={autoImprimirAlAgregar}
              onChange={onToggleAutoImprimirAlAgregar}
            />
            <span>
              Imprimir comanda al agregar un producto (abre el cuadro de impresión del sistema para
              cocina o PDF)
            </span>
          </label>
          <label className={pedidoStyles.printToggle}>
            <input
              type="checkbox"
              checked={imprimirRedTermica}
              onChange={onToggleImprimirRedTermica}
            />
            <span>
              Usar impresora térmica por red (IP): el servidor envía ESC/POS al equipo configurado en{' '}
              <code className={pedidoStyles.envCode}>THERMAL_PRINTER_HOST</code> del archivo .env
            </span>
          </label>
        </div>

        {errorPedidos && <div className={pedidoStyles.errorBanner}>{errorPedidos}</div>}

        <div
          className={pedidoStyles.cardsGrid}
          role="list"
          aria-label="Lista de pedidos por cliente"
          data-antiguedad-tick={antiguedadTick}
        >
          {loadingPedidos ? (
            <p className={pedidoStyles.cardsEmpty}>Cargando pedidos…</p>
          ) : pedidos.length === 0 ? (
            <p className={pedidoStyles.cardsEmpty}>
              No hay pedidos activos. Crea uno nuevo para comenzar.
            </p>
          ) : (
            pedidos.map((p) => {
              const timingClass = claseCardPorAntiguedadPedido(p, pedidoStyles);
              return (
                <button
                  key={p.id_pedido}
                  type="button"
                  role="listitem"
                  className={[pedidoStyles.clientCard, timingClass].filter(Boolean).join(' ')}
                  aria-label={`Pedido ${p.nombre_cliente || 'Cliente'}. ${etiquetaAntiguedadPedido(p)}`}
                  onClick={() => {
                    setPedidoResumenModal(p);
                    setModalEdicionAbierto(false);
                    setPedidoEdicion(null);
                  }}
                >
                  {p.nombre_cliente || 'Cliente'}
                </button>
              );
            })
          )}
        </div>
      </section>

      {pedidoResumenModal && (
        <>
        <div
          className={pedidoStyles.modalOverlay}
          role="presentation"
          onClick={cerrarModalResumen}
        >
          <div
            className={`${pedidoStyles.modalBox} ${pedidoStyles.modalBoxWide}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-pedido-resumen-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="modal-pedido-resumen-title" className={pedidoStyles.modalClienteNombre}>
              {pedidoResumenModal.nombre_cliente || 'Cliente'}
            </h2>
            <ul className={pedidoStyles.modalDetailList}>
              <li className={pedidoStyles.modalDetailRow}>
                <span className={pedidoStyles.modalDetailLabel}>Registro del pedido</span>
                <span className={pedidoStyles.modalDetailValue}>
                  {formatearEntrada(instantePedidoParaAntiguedad(pedidoResumenModal))}
                </span>
              </li>
              <li className={pedidoStyles.modalDetailRow}>
                <span className={pedidoStyles.modalDetailLabel}>Total</span>
                <span className={pedidoStyles.modalDetailValue}>
                  ${Number(pedidoResumenModal.total || 0).toFixed(2)}
                </span>
              </li>
              <li className={pedidoStyles.modalDetailRow}>
                <span className={pedidoStyles.modalDetailLabel}>Pago</span>
                <span className={pedidoStyles.modalDetailValue}>
                  {etiquetaMetodoPago(pedidoResumenModal)}
                </span>
              </li>
            </ul>

            <div className={pedidoStyles.modalActions}>
              <button
                type="button"
                className={`${pedidoStyles.modalActionBtn} ${pedidoStyles.modalActionPrint}`}
                disabled={modalPedidoBusy}
                onClick={() => handleImprimirComanda(pedidoResumenModal)}
              >
                <span className={pedidoStyles.modalActionPrintInner}>
                  <PrinterIcon aria-hidden />
                  Imprimir comanda
                </span>
              </button>
              <button
                type="button"
                className={`${pedidoStyles.modalActionBtn} ${pedidoStyles.modalActionEdit}`}
                disabled={modalPedidoBusy}
                onClick={handleEditarDesdeModal}
              >
                Editar
              </button>
              <button
                type="button"
                className={`${pedidoStyles.modalActionBtn} ${pedidoStyles.modalActionFinalize}`}
                disabled={modalPedidoBusy}
                onClick={handleFinalizarDesdeModal}
              >
                Finalizar
              </button>
              <button
                type="button"
                className={`${pedidoStyles.modalActionBtn} ${pedidoStyles.modalActionDelete}`}
                disabled={modalPedidoBusy}
                onClick={handleEliminarDesdeModal}
              >
                Eliminar
              </button>
            </div>

            <button type="button" className={pedidoStyles.modalCloseLink} onClick={cerrarModalResumen}>
              Cerrar
            </button>
          </div>
        </div>

        {modalEdicionAbierto &&
          pedidoEdicion &&
          pedidoEdicion.id_pedido === pedidoResumenModal.id_pedido && (
            <div
              className={pedidoStyles.modalOverlayNested}
              role="presentation"
              onClick={cerrarModalEdicion}
            >
              <div
                className={pedidoStyles.modalBoxEditor}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-pedido-editor-title"
                onClick={(e) => e.stopPropagation()}
              >
                <div className={pedidoStyles.modalEditorBack}>
                  <button
                    type="button"
                    className={pedidoStyles.catalogBackBtn}
                    onClick={cerrarModalEdicion}
                  >
                    <ArrowLeftIcon aria-hidden />
                    Volver
                  </button>
                </div>
                <h2 id="modal-pedido-editor-title" className={pedidoStyles.modalEditorTitle}>
                  #{pedidoEdicion.id_pedido} · {pedidoEdicion.nombre_cliente}
                </h2>

                <div className={pedidoStyles.lineasSection}>
                  <div className={pedidoStyles.lineasMeta}>
                    <h3 className={pedidoStyles.subsectionTitle}>Orden</h3>
                    <div className={pedidoStyles.lineasMetaEnd}>
                      <button
                        type="button"
                        className={pedidoStyles.printComandaBtn}
                        disabled={!!lineaBusyKey || loadingLineas}
                        onClick={() => handleImprimirComanda(pedidoEdicion, lineasPedido)}
                      >
                        <PrinterIcon aria-hidden />
                        Imprimir
                      </button>
                      <span className={pedidoStyles.lineasTotal}>
                        ${Number(pedidoEdicion.total || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className={pedidoStyles.scrollTableTall}>
                    <Table
                      columns={lineaColumns}
                      data={lineasPedido}
                      rowKey={(row) => `${row.id_pedido}-${row.id_producto}`}
                      emptyMessage={loadingLineas ? 'Cargando…' : 'Vacío'}
                    />
                  </div>
                </div>

                <div className={pedidoStyles.catalogMenuPanel} aria-label="Menú de categorías y productos">
                  {catalogoPaso === 'categorias' && (
                    <div
                      className={pedidoStyles.menuCardsGrid}
                      role="list"
                      aria-label="Categorías con productos"
                    >
                      {categoriasConProductos.length === 0 ? (
                        <p className={pedidoStyles.catalogEmpty}>—</p>
                      ) : (
                        categoriasConProductos.map((cat) => {
                          const n = productos.filter(
                            (pr) => String(pr.id_categoria) === String(cat.id_categoria)
                          ).length;
                          return (
                            <button
                              key={cat.id_categoria}
                              type="button"
                              role="listitem"
                              className={pedidoStyles.categoryMenuCard}
                              onClick={() => {
                                setCategoriaMenuSeleccionada({
                                  id_categoria: cat.id_categoria,
                                  nombre: cat.nombre,
                                });
                                setCatalogoPaso('productos');
                              }}
                            >
                              <p className={pedidoStyles.categoryMenuCardName}>{cat.nombre}</p>
                              <p className={pedidoStyles.categoryMenuCardCount}>{n}</p>
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}

                  {catalogoPaso === 'productos' && categoriaMenuSeleccionada && (
                    <>
                      <div className={pedidoStyles.catalogBackRow}>
                        <button
                          type="button"
                          className={pedidoStyles.catalogBackBtn}
                          onClick={() => {
                            setCatalogoPaso('categorias');
                            setCategoriaMenuSeleccionada(null);
                          }}
                        >
                          <ArrowLeftIcon aria-hidden />
                          Categorías
                        </button>
                        <h4 className={pedidoStyles.catalogContextTitle}>
                          {categoriaMenuSeleccionada.nombre}
                        </h4>
                      </div>
                      <div
                        className={`${pedidoStyles.menuCardsGrid} ${pedidoStyles.menuCardsGridProducts}`}
                        role="list"
                        aria-label="Productos de la categoría"
                      >
                        {productosDeCategoriaMenu.length === 0 ? (
                          <p className={pedidoStyles.catalogEmpty}>—</p>
                        ) : (
                          productosDeCategoriaMenu.map((prod) => (
                            <article
                              key={prod.id_producto}
                              className={pedidoStyles.productMenuCard}
                              role="listitem"
                            >
                              <h5 className={pedidoStyles.productMenuCardTitle}>{prod.nombre}</h5>
                              <p className={pedidoStyles.productMenuCardPrice}>
                                ${Number(prod.precio || 0).toFixed(2)}
                              </p>
                              {prod.descripcion?.trim() ? (
                                <p className={pedidoStyles.productMenuCardDesc}>{prod.descripcion}</p>
                              ) : null}
                              <div className={pedidoStyles.productMenuCardActions}>
                                <input
                                  type="number"
                                  min={1}
                                  className={pedidoStyles.catalogQtyInput}
                                  value={cantidadCatalogo[prod.id_producto] ?? ''}
                                  placeholder="1"
                                  aria-label={`Cantidad para ${prod.nombre}`}
                                  onChange={(e) =>
                                    setCantidadCatalogo((prev) => ({
                                      ...prev,
                                      [prod.id_producto]: e.target.value,
                                    }))
                                  }
                                />
                                <button
                                  type="button"
                                  className={pedidoStyles.actionButton}
                                  disabled={lineaBusyKey === `add-${prod.id_producto}`}
                                  onClick={() => handleAgregarProducto(prod)}
                                >
                                  Agregar
                                </button>
                              </div>
                            </article>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {modalNuevoPedido && (
        <div
          className={`${pedidoStyles.modalOverlay} ${pedidoStyles.modalOverlayNuevoPedido}`}
          role="presentation"
          onClick={() => {
            setModalNuevoPedido(false);
            setFormPedido({ nombre_cliente: '', id_metodo_pago: 1 });
          }}
        >
          <div
            className={pedidoStyles.modalBox}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-nuevo-pedido-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="modal-nuevo-pedido-title" className={pedidoStyles.modalTitle}>
              Nuevo pedido
            </h2>
            <form onSubmit={handleSubmitPedido}>
              <div className={pedidoStyles.formGroup}>
                <label className={pedidoStyles.formLabel} htmlFor="pedido-nombre-cliente">
                  Nombre del cliente *
                </label>
                <input
                  id="pedido-nombre-cliente"
                  type="text"
                  className={pedidoStyles.formInput}
                  value={formPedido.nombre_cliente}
                  onChange={(e) =>
                    setFormPedido({ ...formPedido, nombre_cliente: e.target.value })
                  }
                  required
                />
              </div>

              <div className={pedidoStyles.formGroup}>
                <label className={pedidoStyles.formLabel} htmlFor="pedido-metodo-pago">
                  Método de pago
                </label>
                <select
                  id="pedido-metodo-pago"
                  className={pedidoStyles.formSelect}
                  value={formPedido.id_metodo_pago}
                  onChange={(e) =>
                    setFormPedido({
                      ...formPedido,
                      id_metodo_pago: Number(e.target.value),
                    })
                  }
                >
                  <option value={1}>Efectivo</option>
                  <option value={2}>Tarjeta</option>
                </select>
              </div>

              <div className={pedidoStyles.formActions}>
                <button
                  type="button"
                  className={pedidoStyles.secondaryButton}
                  onClick={() => {
                    setModalNuevoPedido(false);
                    setFormPedido({ nombre_cliente: '', id_metodo_pago: 1 });
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className={pedidoStyles.primaryButton}>
                  Crear pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPedidos;
