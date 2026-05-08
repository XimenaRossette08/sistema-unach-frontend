import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Portal({ setUsuarioGlobal }) {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(false);

  // 🔐 Login real con JWT
  const entrarComoAdmin = async () => {
    setCargando(true);
    try {
      const res = await axios.post('https://siae-unach.duckdns.org/api/login', {
        usuario: 'admin',
        password: 'unach2026'
      });

      localStorage.setItem('token',    res.data.token);
      localStorage.setItem('userRole', 'admin');
      localStorage.setItem('userName', 'Luz Ximena Rossette');
      localStorage.setItem('userRFC',  'ADMIN-UX');

      setUsuarioGlobal({ rol: 'admin', nombre: 'Luz Ximena Rossette', rfc: 'ADMIN-UX' });
      navigate('/admin');
    } catch (err) {
      alert('❌ Error al conectar con el servidor');
    }
    setCargando(false);
  };

  return (
    <div style={containerStyle}>

      {/* Panel izquierdo — identidad */}
      <div style={leftPanelStyle}>
        <div style={textContainer}>
          <h1 style={mainTitleStyle}>SISTEMA DE GESTIÓN ACADÉMICA</h1>
          <p style={universityStyle}>Universidad Autónoma de Chiapas</p>
          <div style={dividerStyle}></div>
          <p style={mottoStyle}>"Por la conciencia de la necesidad de servir"</p>
        </div>
      </div>

      {/* Panel derecho — accesos */}
      <div style={rightPanelStyle}>
        <img
          src="/logo-unach.png"
          alt="UNACH"
          style={{ width: '140px', marginBottom: '10px' }}
        />

        <h2 style={welcomeTitle}>Módulo: Registro de Cursos</h2>
        <p style={subtitleStyle}>Selecciona tu área de acceso</p>

        <div style={formContainer}>

          <button onClick={entrarComoAdmin} style={btnGold} disabled={cargando}>
            {cargando ? '⏳ Conectando...' : '🔐 Panel Administrativo'}
          </button>

          <button onClick={() => navigate('/arquitecto-tecnico')} style={btnCompiladores}>
            ⚙️ Herramientas Técnicas (Compiladores)
          </button>

        </div>

        <p style={noteStyle}>
          Para acceso como docente, utiliza el portal central del sistema.
        </p>
      </div>

    </div>
  );
}

// ── Estilos ──────────────────────────────────────────────
const containerStyle  = { display: 'flex', width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, fontFamily: 'Arial, sans-serif' };
const leftPanelStyle  = { flex: 1.2, background: '#003366', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' };
const textContainer   = { textAlign: 'center', maxWidth: '80%' };
const mainTitleStyle  = { fontSize: '3rem', fontWeight: 'bold', lineHeight: '1.1', margin: '0 0 10px 0' };
const universityStyle = { fontSize: '1.5rem', margin: '0', opacity: 0.9 };
const dividerStyle    = { width: '60px', height: '4px', background: '#C0A060', margin: '30px auto' };
const mottoStyle      = { fontStyle: 'italic', fontSize: '1.1rem', opacity: 0.8 };
const rightPanelStyle = { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'white', padding: '40px' };
const welcomeTitle    = { color: '#333', fontSize: '1.8rem', marginBottom: '8px' };
const subtitleStyle   = { color: '#888', fontSize: '1rem', marginBottom: '30px' };
const formContainer   = { width: '100%', maxWidth: '350px', display: 'flex', flexDirection: 'column', gap: '16px' };
const btnGold         = { background: '#C0A060', color: '#003366', padding: '18px', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' };
const btnCompiladores = { background: '#ffffff', color: '#003366', padding: '18px', border: '2px solid #C0A060', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' };
const noteStyle       = { marginTop: '30px', color: '#aaa', fontSize: '0.85rem', textAlign: 'center', maxWidth: '300px' };
