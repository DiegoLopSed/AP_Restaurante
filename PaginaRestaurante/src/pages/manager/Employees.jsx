import styles from '../../assets/css/ManagerDashboard.module.css';
import Table from '../../components/Table';
import { useEffect, useMemo, useState } from 'react';
import { fetchEmpleados } from '../../services/empleados';

const ManagerEmployees = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [employeesData, setEmployeesData] = useState([]);

  const columns = useMemo(
    () => [
      { key: 'nombreCompleto', label: 'Nombre' },
      { key: 'posicion', label: 'Puesto' },
      { key: 'correo', label: 'Correo' },
      { key: 'telefono', label: 'Teléfono' },
    ],
    []
  );

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await fetchEmpleados();
        if (!isMounted) return;

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

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.greeting}>Gestión de Empleados</h1>
      <div className={styles.contentSection}>
        {error && (
          <p style={{ color: '#b91c1c', marginBottom: 12 }} role="alert">
            {error}
          </p>
        )}
        <Table 
          columns={columns} 
          data={employeesData}
          emptyMessage={loading ? 'Cargando empleados...' : 'No hay empleados registrados'}
        />
      </div>
    </div>
  );
};

export default ManagerEmployees;

