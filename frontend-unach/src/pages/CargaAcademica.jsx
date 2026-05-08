import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function CargaAcademica({ usuario }) {
  const [carga, setCarga] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCarga = async () => {
      if (!usuario?.rfc) return;

      try {
        const res = await axios.get(`https://siae-unach.duckdns.org/api/mi-carga?rfc=${usuario.rfc}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
        setCarga(res.data || []);
      } catch (err) {
        console.error("Error al consultar PostgreSQL:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCarga();
  }, [usuario?.rfc]);

  // Función auxiliar para formatear fechas de forma elegante
  const formatearFecha = (fechaStr) => {
    if (!fechaStr || fechaStr === "") return null;
    return new Date(fechaStr).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div style={{ padding: '30px', animation: 'fadeIn 0.5s ease-in' }}>
      <header style={{ marginBottom: '40px' }}>
        <h2 style={{ color: '#003366', fontSize: '1.8rem', fontWeight: 'bold' }}>
          📚 Carga Académica Oficial
        </h2>
        <p style={{ color: '#666' }}>
          Bienvenido(a), <strong>{usuario?.nombre || 'Docente'}</strong>.
        </p>
        <div style={{ height: '4px', background: '#C0A060', width: '80px', borderRadius: '2px' }}></div>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p style={{ color: '#003366', fontWeight: 'bold' }}>Consultando base de datos oficial...</p>
        </div>
      ) : carga.length === 0 ? (
        <div style={emptyStateStyle}>
          <p style={{ margin: 0 }}>Aún no tienes materias registradas en tu carga oficial.</p>
          <small>Acepta una invitación desde tu buzón para verla aquí.</small>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr style={{ background: '#003366', color: 'white' }}>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Materia</th>
                <th style={thStyle}>Horario asignado</th>
                {/* 🚩 NUEVA COLUMNA */}
                <th style={thStyle}>Periodo de Clase</th>
                <th style={thStyle}>Fecha de Registro</th>
              </tr>
            </thead>
            <tbody>
              {carga.map((item, index) => (
                <tr 
                  key={item.id} 
                  style={{ 
                    ...trStyle, 
                    background: index % 2 === 0 ? '#ffffff' : '#f9f9f9' 
                  }}
                >
                  <td style={tdStyle}>{item.id}</td>
                  <td style={{ ...tdStyle, fontWeight: 'bold', color: '#003366' }}>
                    {item.materia}
                  </td>
                  <td style={tdStyle}>{item.horario}</td>
                  
                  {/* 🚩 MOSTRANDO EL PERIODO (Inicio - Fin) */}
                  <td style={{ ...tdStyle, color: '#15803d', fontWeight: '500' }}>
                    {item.fecha_inicio && item.fecha_fin ? (
                      <span>
                        {formatearFecha(item.fecha_inicio)} - {formatearFecha(item.fecha_fin)}
                      </span>
                    ) : (
                      <span style={{ color: '#999', fontStyle: 'italic' }}>No definido</span>
                    )}
                  </td>

                  <td style={tdStyle}>
                    {item.fecha_aceptacion 
                      ? new Date(item.fecha_aceptacion).toLocaleDateString('es-MX', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })
                      : 'Procesando...'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ marginTop: '20px', fontSize: '0.85rem', color: '#999', fontStyle: 'italic' }}>
            * Periodos y horarios sincronizados con el catálogo institucional - SIAE UNACH
          </p>
        </div>
      )}
    </div>
  );
}

// --- ESTILOS (Mantenemos tu diseño pro) ---
const tableStyle = { 
  width: '100%', 
  borderCollapse: 'separate', 
  borderSpacing: '0', 
  background: 'white', 
  borderRadius: '12px', 
  overflow: 'hidden', 
  boxShadow: '0 8px 24px rgba(0,0,0,0.08)' 
};

const thStyle = { 
  padding: '18px 20px', 
  textAlign: 'left',
  fontSize: '0.85rem',
  textTransform: 'uppercase',
  letterSpacing: '1px'
};

const tdStyle = { 
  padding: '16px 20px', 
  borderBottom: '1px solid #eee',
  fontSize: '0.95rem'
};

const trStyle = { 
  transition: '0.3s ease' 
};

const emptyStateStyle = { 
  textAlign: 'center', 
  padding: '60px', 
  background: '#f1f1f1', 
  borderRadius: '12px', 
  color: '#666',
  border: '2px dashed #ccc'
};