import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Portal({ setUsuarioGlobal }) {
  const navigate = useNavigate();
  const [rfcInput, setRfcInput] = useState('');

  // 🛡️ ACCESO ADMINISTRADOR
  const entrarComoAdmin = () => {
    const adminData = {
      rol: 'admin',
      nombre: 'Luz Ximena Rossette',
      rfc: 'ADMIN-UX'
    };

    // Guardamos en LocalStorage para persistencia
    localStorage.setItem('token', 'token-falso-admin'); // Un token para saltar el guardia
    localStorage.setItem('userRole', adminData.rol);
    localStorage.setItem('userName', adminData.nombre);
    localStorage.setItem('userRFC', adminData.rfc);

    // Avisamos a App.jsx
    setUsuarioGlobal(adminData);
    navigate('/admin');
  };

  // 👨‍🏫 ACCESO DOCENTE
  const manejarLoginDocente = async () => {
    if (!rfcInput) {
      alert("⚠️ Por favor, ingresa tu RFC.");
      return;
    }

    try {
      const res = await axios.post('http://localhost:8002/api/login-docente', { 
        rfc: rfcInput.toUpperCase() 
      });
      
      const docenteData = {
        rol: 'docente', // Coincidir con minúsculas de App.jsx
        nombre: res.data.nombre,
        rfc: rfcInput.toUpperCase()
      };

      // 🔑 GUARDADO MAESTRO: Aquí es donde Sidebar saca la info
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userRole', docenteData.rol);
      localStorage.setItem('userName', docenteData.nombre);
      localStorage.setItem('userRFC', docenteData.rfc);
      
      // Actualizamos estado global inmediatamente
      setUsuarioGlobal(docenteData);
      
      // 🚀 Navegamos a la ruta que tienes en App.jsx
      navigate('/buzon');

    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.error || "RFC no reconocido o error de conexión";
      alert(`❌ ${errorMsg}`);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={leftPanelStyle}>
        <div style={textContainer}>
          <h1 style={mainTitleStyle}>SISTEMA DE GESTIÓN ACADÉMICA</h1>
          <p style={universityStyle}>Universidad Autónoma de Chiapas</p>
          <div style={dividerStyle}></div>
          <p style={mottoStyle}>"Por la conciencia de la necesidad de servir"</p>
        </div>
      </div>

      <div style={rightPanelStyle}>
        <img 
          src="/logo-unach.png" 
          alt="UNACH" 
          style={{ width: '140px', marginBottom: '10px' }} 
        />
        
        <h2 style={welcomeTitle}>Bienvenido al Portal</h2>

        <div style={formContainer}>
          <button onClick={entrarComoAdmin} style={btnGold}>
            🔐 Acceso Administrador
          </button>

          <button onClick={() => navigate('/arquitecto-tecnico')} style={btnCompiladores}>
            ⚙️ Herramientas Técnicas (Compiladores)
          </button>

          <div style={separatorContainer}>
            <hr style={hrStyle} />
            <span style={orStyle}>o ingresa como</span>
            <hr style={hrStyle} />
          </div>

          <div style={docentSection}>
            <label style={labelStyle}>Acceso para Docentes</label>
            <input 
              type="text" 
              placeholder="Ingresa tu RFC" 
              style={inputStyle}
              value={rfcInput}
              onChange={(e) => setRfcInput(e.target.value.toUpperCase())}
            />
            <button onClick={manejarLoginDocente} style={btnBlue}>
              Entrar al Buzón
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- TUS ESTILOS SE MANTIENEN IGUAL ---
const containerStyle = { display: 'flex', width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, fontFamily: 'Arial, sans-serif' };
const leftPanelStyle = { flex: 1.2, background: '#003366', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' };
const textContainer = { textAlign: 'center', maxWidth: '80%' };
const mainTitleStyle = { fontSize: '3rem', fontWeight: 'bold', lineHeight: '1.1', margin: '0 0 10px 0' };
const universityStyle = { fontSize: '1.5rem', margin: '0', opacity: 0.9 };
const dividerStyle = { width: '60px', height: '4px', background: '#C0A060', margin: '30px auto' };
const mottoStyle = { fontStyle: 'italic', fontSize: '1.1rem', opacity: 0.8 };
const rightPanelStyle = { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'white', padding: '40px' };
const welcomeTitle = { color: '#333', fontSize: '2rem', marginBottom: '30px' };
const formContainer = { width: '100%', maxWidth: '350px', display: 'flex', flexDirection: 'column', gap: '12px' };
const btnGold = { background: '#C0A060', color: '#003366', padding: '16px', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', transition: '0.3s' };
const btnCompiladores = { background: '#ffffff', color: '#003366', padding: '16px', border: '2px solid #C0A060', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', transition: '0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 10px rgba(192, 160, 96, 0.15)' };
const btnBlue = { background: '#003366', color: 'white', padding: '16px', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', width: '100%' };
const separatorContainer = { display: 'flex', alignItems: 'center', gap: '10px', margin: '15px 0' };
const hrStyle = { flex: 1, border: '0', borderTop: '1px solid #ddd' };
const orStyle = { color: '#999', fontSize: '0.9rem' };
const docentSection = { display: 'flex', flexDirection: 'column', gap: '10px' };
const labelStyle = { fontWeight: 'bold', color: '#444', textAlign: 'center' };
const inputStyle = { padding: '14px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem', outline: 'none', textAlign: 'center' };