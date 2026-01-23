import styles from '../../assets/css/ManagerDashboard.module.css';
import Table from '../../components/Table';

const ManagerEmployees = () => {
  // Datos simulados de empleados
  const employeesData = [
    { id: 1, nombre: 'Juan Pérez', puesto: 'Mesero', departamento: 'Servicio', estado: 'Activo' },
    { id: 2, nombre: 'María García', puesto: 'Cocinero', departamento: 'Cocina', estado: 'Activo' },
    { id: 3, nombre: 'Pedro López', puesto: 'Bartender', departamento: 'Bar', estado: 'Activo' },
  ];

  const columns = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'puesto', label: 'Puesto' },
    { key: 'departamento', label: 'Departamento' },
    { key: 'estado', label: 'Estado' },
  ];

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.greeting}>Gestión de Empleados</h1>
      <div className={styles.contentSection}>
        <Table 
          columns={columns} 
          data={employeesData}
          emptyMessage="No hay empleados registrados"
        />
      </div>
    </div>
  );
};

export default ManagerEmployees;

