import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Portal() {
  const navigate = useNavigate();

  return (
    <div style={containerStyle}>
      {/* LADO IZQUIERDO: Identidad UNACH */}
      <div style={leftPanelStyle}>
        <div style={textContainer}>
          <h1 style={mainTitleStyle}>SISTEMA DE GESTIÓN ACADÉMICA</h1>
          <p style={universityStyle}>Universidad Autónoma de Chiapas</p>
          <div style={dividerStyle}></div>
          <p style={mottoStyle}>"Por la conciencia de la necesidad de servir"</p>
        </div>
      </div>

      {/* LADO DERECHO: Acceso */}
      <div style={rightPanelStyle}>
        {/* Asegúrate de tener logo-unach.png en tu carpeta public */}
        <img 
          src="/logo-unach.png" 
          alt="UNACH" 
          style={{ width: '140px', marginBottom: '20px' }} 
        />
        
        <h2 style={welcomeTitle}>Bienvenido al Portal</h2>

        <div style={formContainer}>
          {/* SECCIÓN ADMINISTRADOR */}
          <button 
            onClick={() => navigate('/admin')} 
            style={btnGold}
          >
            Acceso Administrador
          </button>

          <div style={separatorContainer}>
            <hr style={hrStyle} />
            <span style={orStyle}>o ingresa como</span>
            <hr style={hrStyle} />
          </div>

          {/* SECCIÓN DOCENTE */}
          <div style={docentSection}>
            <label style={labelStyle}>Acceso para Docentes</label>
            <input 
              type="text" 
              placeholder="Ingresa tu RFC" 
              style={inputStyle} 
            />
            <button 
              onClick={() => navigate('/buzon')} 
              style={btnBlue}
            >
              Entrar al Buzón
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- ESTILOS (CSS-in-JS) PARA QUE TODO SE VEA PRO ---
const containerStyle = {
  display: 'flex',
  width: '100vw',
  height: '100vh',
  position: 'fixed',
  top: 0,
  left: 0,
  fontFamily: 'Arial, sans-serif'
};

const leftPanelStyle = {
  flex: 1.2,
  background: '#003366',
  color: 'white',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '40px'
};

const textContainer = {
  textAlign: 'center',
  maxWidth: '80%'
};

const mainTitleStyle = {
  fontSize: '3rem',
  fontWeight: 'bold',
  lineHeight: '1.1',
  margin: '0 0 10px 0'
};

const universityStyle = {
  fontSize: '1.5rem',
  margin: '0',
  opacity: 0.9
};

const dividerStyle = {
  width: '60px',
  height: '4px',
  background: '#C0A060',
  margin: '30px auto'
};

const mottoStyle = {
  fontStyle: 'italic',
  fontSize: '1.1rem',
  opacity: 0.8
};

const rightPanelStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  background: 'white',
  padding: '40px'
};

const welcomeTitle = {
  color: '#333',
  fontSize: '2rem',
  marginBottom: '40px'
};

const formContainer = {
  width: '100%',
  maxWidth: '350px',
  display: 'flex',
  flexDirection: 'column',
  gap: '15px'
};

const btnGold = {
  background: '#C0A060',
  color: '#003366',
  padding: '16px',
  border: 'none',
  borderRadius: '8px',
  fontWeight: 'bold',
  fontSize: '1rem',
  cursor: 'pointer',
  transition: '0.3s'
};

const btnBlue = {
  background: '#003366',
  color: 'white',
  padding: '16px',
  border: 'none',
  borderRadius: '8px',
  fontWeight: 'bold',
  fontSize: '1rem',
  cursor: 'pointer',
  width: '100%'
};

const separatorContainer = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  margin: '20px 0'
};

const hrStyle = { flex: 1, border: '0', borderTop: '1px solid #ddd' };
const orStyle = { color: '#999', fontSize: '0.9rem' };

const docentSection = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px'
};

const labelStyle = {
  fontWeight: 'bold',
  color: '#444',
  textAlign: 'center'
};

const inputStyle = {
  padding: '14px',
  borderRadius: '8px',
  border: '1px solid #ccc',
  fontSize: '1rem',
  outline: 'none',
  textAlign: 'center'
};
