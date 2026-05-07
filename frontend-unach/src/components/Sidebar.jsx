import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar({ usuario }) {
  const navigate = useNavigate();
  const location = useLocation();

  const manejarLogout = () => {
    localStorage.clear(); // Borra token, rfc, nombre y rol
    window.location.href = '/'; // Recarga la app desde el inicio
  };

  const adminItems = [
    { name: 'Panel Admin', path: '/admin', icon: '🏠' },
    { name: 'Catálogo de Cursos', path: '/catalogo-cursos', icon: '📚' }, 
    { name: 'Registrar Docente', path: '/registro', icon: '📝' },
    { name: 'Crear Cursos', path: '/crear-curso', icon: '➕' },
    { name: 'Gestión Invitaciones', path: '/gestionar-invitaciones', icon: '📩' },
    { name: 'Monitor Docentes', path: '/monitor', icon: '📊' },
    { name: 'Monitor Alumnos', path: '/monitor-alumnos', icon: '👥' },
  ];

  const docenteItems = [
    { name: 'Mis Invitaciones', path: '/buzon', icon: '📩' },
    { name: 'Carga Académica', path: '/carga', icon: '📚' },
  ];

  const menuActual = usuario.rol === 'admin' ? adminItems : docenteItems;
  const colorRol = usuario.rol === 'admin' ? '#C0A060' : '#4CAF50';

  return (
    <aside style={sidebarStyle}>
      <div style={logoSection}>
        <h2 style={siaeTitle}>SIAE UNACH</h2>
        <p style={{ ...panelSubtitle, color: colorRol }}>
          {usuario.rol === 'admin' ? 'Gestión Administrativa' : 'Portal del Docente'}
        </p>
      </div>

      <div style={profileCard}>
        <p style={welcomeText}>Bienvenido(a),</p>
        <h3 style={userName}>{usuario.nombre || 'Usuario'}</h3>
        <span style={rfcStyle}>{usuario.rfc || 'S/N RFC'}</span>
      </div>

      <nav style={navMenu}>
        <p style={adminLabel}>
          {usuario.rol === 'admin' ? 'MENÚ ADMINISTRADOR' : 'OPCIONES DOCENTE'}
        </p>
        {menuActual.map((item) => (
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

      <div style={logoutSection} onClick={manejarLogout}>
        <span style={{color: '#ff4d4d', fontWeight: 'bold', cursor: 'pointer'}}>
          ← Cerrar Sesión
        </span>
      </div>
    </aside>
  );
}

// (Tus estilos se mantienen igual...)
const sidebarStyle = { width: '280px', background: '#003366', color: 'white', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', left: 0, top: 0, boxShadow: '4px 0 10px rgba(0,0,0,0.1)', zIndex: 1000 };
const logoSection = { padding: '30px 20px', textAlign: 'center' };
const siaeTitle = { margin: 0, color: '#C0A060', fontSize: '1.5rem', fontWeight: 'bold' };
const panelSubtitle = { margin: 0, fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px' };
const profileCard = { background: '#00264d', margin: '10px 20px 20px 20px', padding: '15px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(192, 160, 96, 0.2)' };
const welcomeText = { margin: 0, fontSize: '0.75rem', opacity: 0.8 };
const userName = { margin: '5px 0 0 0', fontSize: '0.9rem', fontWeight: 'bold' };
const rfcStyle = { fontSize: '0.7rem', color: '#C0A060', opacity: 0.8 };
const navMenu = { padding: '0 20px', flex: 1 };
const adminLabel = { fontSize: '0.65rem', color: '#C0A060', fontWeight: 'bold', margin: '20px 0 10px 10px', letterSpacing: '1px', opacity: 0.8 };
const navItem = { padding: '12px 15px', borderRadius: '8px', cursor: 'pointer', marginBottom: '5px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', transition: '0.2s' };
const logoutSection = { padding: '25px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' };