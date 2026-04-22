import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function MonitorAdmin() {
  const [invitaciones, setInvitaciones] = useState([]);

  // 🚀 Traemos los datos reales de tu base de datos
  useEffect(() => {
    axios.get('http://localhost:8002/api/monitor')
      .then(res => {
        setInvitaciones(res.data);
      })
      .catch(err => console.error("Error al traer datos de Go:", err));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <header style={{ borderBottom: '2px solid #003366', marginBottom: '20px' }}>
        <h1 style={{ color: '#003366' }}>📊 Monitor de Aceptación Académica</h1>
        <p>SIAE - Universidad Autónoma de Chiapas</p>
      </header>

      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#003366', color: 'white', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>Docente (RFC)</th>
              <th>Materia</th>
              <th>Horario</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {/* 🔄 Mapeamos los datos que vienen de Go */}
            {invitaciones && invitaciones.map((inv, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{inv.rfc}</td>
                <td>{inv.curso}</td>
                <td>{inv.horario}</td>
                <td>
                  <span style={{ 
                    background: inv.estado === 'Aceptada' ? '#d4edda' : '#fff3cd', 
                    color: inv.estado === 'Aceptada' ? '#155724' : '#856404', 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' 
                  }}>
                    {inv.estado.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {invitaciones.length === 0 && <p style={{textAlign: 'center', marginTop: '20px'}}>Esperando datos del servidor...</p>}
      </div>
    </div>
  );
}
