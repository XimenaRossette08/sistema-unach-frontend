import React from 'react';

export default function BuzonDocente() {
  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: '#003366', borderBottom: '2px solid #C0A060', pb: '10px' }}>
        📩 Mis Invitaciones Pendientes
      </h2>
      <div style={{ background: 'white', padding: '20px', borderRadius: '10px', marginTop: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <p>Aquí aparecerán las materias que te asigne el administrador.</p>
        {/* Más adelante aquí conectaremos los datos de Go */}
      </div>
    </div>
  );
}
