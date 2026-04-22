import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar({ nombreMaestro }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Panel Admin', path: '/admin', icon: '🏠' },
    { name: 'Arquitecto DDL', path: '/arquitecto', icon: '🏗️' },
    { name: 'Registro Docente', path: '/registro', icon: '📝' },
    { name: 'Crear Cursos', path: '/crear-curso', icon: '➕' },
    { name: 'Monitor Global', path: '/monitor', icon: '📊' },
  ];

  return (
    <aside style={sidebarStyle}>
      <div style={logoSection}>
        <h2 style={siaeTitle}>SIAE UNACH</h2>
        <p style={panelSubtitle}>Panel Administrativo</p>
      </div>

      {/* El cuadro de bienvenida que querías */}
      <div style={profileCard}>
        <p style={welcomeText}>Bienvenido,</p>
        <h3 style={userName}>{nombreMaestro}</h3>
      </div>

      <nav style={navMenu}>
        <p style={adminLabel}>ADMINISTRACIÓN</p>
        {menuItems.map((item) => (
          <div 
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              ...navItem,
              background: location.pathname === item.path ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: location.pathname === item.path ? '#C0A060' : 'white'
            }}
          >
            <span style={{marginRight: '12px'}}>{item.icon}</span>
            {item.name}
          </div>
        ))}
      </nav>

      <div style={logoutSection} onClick={() => navigate('/')}>
        <span style={{color: '#ff4d4d', fontWeight: 'bold'}}>← Salir</span>
      </div>
    </aside>
  );
}

const sidebarStyle = { width: '280px', background: '#003366', color: 'white', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', left: 0, top: 0, boxShadow: '4px 0 10px rgba(0,0,0,0.1)', zIndex: 1000 };
const logoSection = { padding: '30px 20px', textAlign: 'center' };
const siaeTitle = { margin: 0, color: '#C0A060', fontSize: '1.5rem', fontWeight: 'bold' };
const panelSubtitle = { margin: 0, fontSize: '0.8rem', opacity: 0.7 };
const profileCard = { background: '#00264d', margin: '20px', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(192, 160, 96, 0.2)' };
const welcomeText = { margin: 0, fontSize: '0.8rem', opacity: 0.8 };
const userName = { margin: '5px 0 0 0', fontSize: '1rem', fontWeight: 'bold' };
const navMenu = { padding: '0 20px', flex: 1 };
const adminLabel = { fontSize: '0.7rem', color: '#C0A060', fontWeight: 'bold', margin: '20px 0 10px 10px', letterSpacing: '1px' };
const navItem = { padding: '12px 15px', borderRadius: '8px', cursor: 'pointer', marginBottom: '5px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', transition: '0.2s' };
const logoutSection = { padding: '30px', textAlign: 'center', cursor: 'pointer', borderTop: '1px solid rgba(255,255,255,0.1)' };
