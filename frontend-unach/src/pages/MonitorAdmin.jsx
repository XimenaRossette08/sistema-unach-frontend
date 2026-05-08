import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function MonitorAdmin() {
  const [aceptados, setAceptados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAceptados = async () => {
      try {
        const res = await axios.get('https://siae-unach.duckdns.org/api/invitaciones-aceptadas', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
        setAceptados(res.data || []);
      } catch (err) {
        console.error('Error al traer datos de Go:', err);
        setError('No se pudieron cargar los datos del servidor.');
      } finally {
        setCargando(false);
      }
    };

    fetchAceptados();
  }, []);

  return (
    <div style={pageStyle}>
      <header style={headerStyle}>
        <h2 style={titleStyle}>📊 Monitor de Aceptación Académica</h2>
        <p style={subtitleStyle}>SIAE - Universidad Autónoma de Chiapas</p>
      </header>

      <div style={dividerStyle}></div>

      {cargando ? (
        <div style={msgLoading}>⏳ Esperando datos del servidor...</div>
      ) : error ? (
        <div style={errorStyle}>{error}</div>
      ) : aceptados.length === 0 ? (
        <div style={emptyContainer}>
          <p>No hay docentes que hayan aceptado la invitación hasta el momento.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr style={thStyle}>
                <th style={{ padding: '12px' }}>Nombre del Docente</th>
                <th style={{ padding: '12px' }}>RFC</th>
                <th style={{ padding: '12px' }}>Materia</th>
                <th style={{ padding: '12px' }}>Horario</th>
                <th style={{ padding: '12px' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {aceptados.map((inv) => (
                <tr key={inv.id} style={{ borderBottom: '1px solid #e4e4e7' }}>
                  {/* 🚩 Mostramos el nombre y el RFC por separado */}
                  <td style={{ padding: '12px', fontWeight: '500' }}>{inv.nombre}</td>
                  <td style={{ padding: '12px', color: '#555' }}>{inv.rfc}</td>
                  <td style={{ padding: '12px' }}>{inv.curso}</td>
                  <td style={{ padding: '12px' }}>{inv.horario}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      backgroundColor: '#dcfce7',
                      color: '#15803d',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}>
                      {inv.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// --- ESTILOS ---

const pageStyle = { maxWidth: '1100px', margin: '40px auto', padding: '0 20px' };
const headerStyle = { marginBottom: '25px' };
const titleStyle = { color: '#003366', fontSize: '2rem', margin: 0 };
const subtitleStyle = { color: '#666', fontSize: '1rem', marginTop: '5px' };
const dividerStyle = { height: '4px', background: '#C0A060', width: '80px', marginBottom: '40px', borderRadius: '2px' };

const msgLoading = { textAlign: 'center', padding: '40px', fontSize: '1.2rem', color: '#003366', fontWeight: 'bold', background: '#f9f9f9', borderRadius: '10px' };
const errorStyle = { textAlign: 'center', padding: '20px', backgroundColor: '#ffe6e6', color: '#cc0000', borderRadius: '8px', fontWeight: 'bold' };
const emptyContainer = { textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '15px', color: '#888', border: '2px dashed #d1d9e0' };

const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '12px', backgroundColor: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', borderRadius: '8px' };
const thStyle = { backgroundColor: '#003366', color: '#fff', borderBottom: '1px solid #e4e4e7' };
