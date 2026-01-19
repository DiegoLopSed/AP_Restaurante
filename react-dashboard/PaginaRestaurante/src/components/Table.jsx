import styles from '../assets/css/Table.module.css';

const Table = ({ 
  columns = [], 
  data = [], 
  className = '',
  emptyMessage = 'No hay datos disponibles',
  ...props 
}) => {
  if (!data || data.length === 0) {
    return (
      <div className={styles.tableContainer} role="region" aria-label="Tabla de datos">
        <p className={styles.emptyMessage}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer} role="region" aria-label="Tabla de datos">
      <table className={`${styles.table} ${className}`} {...props}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th 
                key={column.key} 
                className={styles.tableHeader}
                scope="col"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={row.id || index} className={styles.tableRow}>
              {columns.map((column) => (
                <td key={column.key} className={styles.tableCell}>
                  {column.render 
                    ? column.render(row[column.key], row) 
                    : row[column.key]
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;

