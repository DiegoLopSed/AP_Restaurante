/**
 * ManagerEmployees.jsx
 * 
 * Componente para la gestión y visualización de empleados
 * dentro del panel de administrador.
 * 
 * Funcionalidades principales:
 * - Obtiene datos de empleados desde la API
 * - Normaliza la información recibida
 * - Muestra los datos en una tabla reutilizable
 * - Maneja estados de carga y errores
 * 
 * Nota:
 * Se implementa protección con "isMounted" para evitar
 * actualizaciones de estado en componentes desmontados.
 * @package AP_Restaurante
 * @subpackage ManagerEmployees.jsx
 * @author Andres Manuel Amaro Ramirez
 * @version 1.0.0
 */

import styles from '../../assets/css/ManagerDashboard.module.css';
import Table from '../../components/Table';
import { useEffect, useMemo, useState } from 'react';
import { fetchEmpleados } from '../../services/empleados';

const ManagerEmployees = () => {

  // Estados principales
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [employeesData, setEmployeesData] = useState([]);

  /**
   * Definición de columnas para la tabla
   * useMemo evita renders innecesarios
   */
  const columns = useMemo(
    () => [
      { key: 'nombreCompleto', label: 'Nombre' },
      { key: 'posicion', label: 'Puesto' },
      { key: 'correo', label: 'Correo' },
      { key: 'telefono', label: 'Teléfono' },
    ],
    []
  );

  /**
   * useEffect para cargar empleados al montar el componente
   */
  useEffect(() => {
    let isMounted = true;

    /**
     * Obtiene y procesa los datos de empleados
     */
    async function load() {
      setLoading(true);
      setError('');

      try {
        const data = await fetchEmpleados();

        // Evita actualizar estado si el componente ya no existe
        if (!isMounted) return;

        /**
         * Normalización de datos:
         * - Unifica nombres de campos
         * - Genera ID único si no existe
         */
        const normalized = data.map((e) => ({
          id: e.id_colaborador ?? e.id ?? `${e.nombre ?? ''}-${e.apellido ?? ''}-${e.correo ?? ''}`,
          nombreCompleto: `${e.nombre ?? ''} ${e.apellido ?? ''}`.trim(),
          posicion: e.posicion ?? '',
          correo: e.correo ?? e.email ?? '',
          telefono: e.telefono ?? '',
        }));

        setEmployeesData(normalized);

      } catch (err) {
        if (!isMounted) return;

        setError(err?.message || 'Error al cargar empleados');
        setEmployeesData([]);

      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    }

    load();

    // Cleanup para evitar memory leaks
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className={styles.dashboard}>

      {/* Título */}
      <h1 className={styles.greeting}>Gestión de Empleados</h1>

      <div className={styles.contentSection}>

        {/* Mensaje de error */}
        {error && (
          <p style={{ color: '#b91c1c', marginBottom: 12 }} role="alert">
            {error}
          </p>
        )}

        {/* Tabla de empleados */}
        <Table 
          columns={columns} 
          data={employeesData}
          emptyMessage={
            loading
              ? 'Cargando empleados...'
              : 'No hay empleados registrados'
          }
        />

      </div>
    </div>
  );
};

export default ManagerEmployees;