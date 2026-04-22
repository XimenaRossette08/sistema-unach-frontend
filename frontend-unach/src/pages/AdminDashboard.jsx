import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  return (
    <div style={{ width: '100%' }}>
      <h1 style={{ color: '#003366', marginBottom: '40px', fontSize: '2.2rem', fontWeight: 'bold' }}>
        Bienvenido, Administrador
      </h1>
      
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        {/* Tarjeta Compiladores */}
        <div style={{ ...cardStyle, borderLeft: '8px solid #C0A060' }}>
          <h3 style={cardTitle}>Compiladores</h3>
          <p style={cardText}>Usa el generador DDL para crear estructuras en Postgres.</p>
          <Link to="/arquitecto" style={linkBtn}>Ir al Generador</Link>
        </div>

        {/* Tarjeta Taller */}
        <div style={{ ...cardStyle, borderLeft: '8px solid #003366' }}>
          <h3 style={cardTitle}>Taller de Desarrollo 4</h3>
          <p style={cardText}>Gestiona la plantilla docente y las convocatorias de cursos.</p>
          <Link to="/monitor" style={linkBtn}>Ver Monitor</Link>
        </div>
      </div>
    </div>
  );
}

// Estilos limpios
const cardStyle = { background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', flex: 1, minWidth: '300px' };
const cardTitle = { fontSize: '1.5rem', marginBottom: '15px', color: '#333' };
const cardText = { color: '#666', marginBottom: '20px', lineHeight: '1.5' };
const linkBtn = { color: '#003366', fontWeight: 'bold', textDecoration: 'none', borderBottom: '2px solid #C0A060' };
