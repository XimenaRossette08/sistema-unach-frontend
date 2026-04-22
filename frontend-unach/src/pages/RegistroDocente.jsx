import React, { useState } from 'react';
import axios from 'axios';

export default function RegistroDocente() {
  const [formData, setFormData] = useState({
    rfc: '',
    nombre: '',
    direccion: '',
    cp: '',
    banco: '',
    situacion: 'Activo',
    ine: '',
    descripcion: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async () => {
    try {
      console.log("Enviando a Postgres...", formData);
      const response = await axios.post('http://localhost:8002/api/registro-docente', formData);
      
      if (response.status === 200 || response.status === 201) {
        alert("✅ ¡Excelente! Los datos de " + formData.nombre + " se guardaron en unach_db.");
        setFormData({ rfc: '', nombre: '', direccion: '', cp: '', banco: '', situacion: 'Activo', ine: '', descripcion: '' });
      }
    } catch (error) {
      console.error("Error al conectar con Go:", error);
      alert("❌ Error: No se pudo conectar con el servidor de Go. ¿Está encendido?");
    }
  };

  return (
    <div style={pageContainer}>
      <div style={cardStyle}>
        {/* Encabezado Estilo Panel */}
        <h2 style={titleStyle}>📄 Expediente del Docente</h2>
        <div style={goldDivider}></div>

        <div style={formGrid}>
          {/* RFC */}
          <div style={inputGroup}>
            <label style={labelStyle}>RFC:</label>
            <input 
              name="rfc" 
              type="text" 
              value={formData.rfc} 
              onChange={handleChange} 
              placeholder="ABCD123456XYZ" 
              style={inputStyle} 
            />
          </div>

          {/* Nombre */}
          <div style={inputGroup}>
            <label style={labelStyle}>Nombre Completo:</label>
            <input 
              name="nombre" 
              type="text" 
              value={formData.nombre} 
              onChange={handleChange} 
              style={inputStyle} 
            />
          </div>

          {/* Dirección */}
          <div style={{ ...inputGroup, gridColumn: 'span 2' }}>
            <label style={labelStyle}>Dirección Particular:</label>
            <input 
              name="direccion" 
              type="text" 
              value={formData.direccion} 
              onChange={handleChange} 
              style={inputStyle} 
            />
          </div>

          {/* CP y Banco */}
          <div style={inputGroup}>
            <label style={labelStyle}>Código Postal:</label>
            <input 
              name="cp" 
              type="text" 
              value={formData.cp} 
              onChange={handleChange} 
              style={inputStyle} 
            />
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Banco para Depósito:</label>
            <input 
              name="banco" 
              type="text" 
              value={formData.banco} 
              onChange={handleChange} 
              placeholder="Ej. Banamex" 
              style={inputStyle} 
            />
          </div>

          {/* Situación e INE */}
          <div style={inputGroup}>
            <label style={labelStyle}>Situación Fiscal:</label>
            <select 
              name="situacion" 
              value={formData.situacion} 
              onChange={handleChange} 
              style={inputStyle}
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>INE (Anexar ID/Folio):</label>
            <input 
              name="ine" 
              type="text" 
              value={formData.ine} 
              onChange={handleChange} 
              placeholder="Número de identificación" 
              style={inputStyle} 
            />
          </div>

          {/* Descripción */}
          <div style={{ ...inputGroup, gridColumn: 'span 2' }}>
            <label style={labelStyle}>Descripción del Curso a Impartir:</label>
            <textarea 
              name="descripcion" 
              value={formData.descripcion} 
              onChange={handleChange} 
              style={textareaStyle}
            ></textarea>
          </div>
        </div>

        <button onClick={handleSubmit} style={btnStyle}>
          Registrarse como Docente
        </button>
      </div>
    </div>
  );
}

// --- ESTILOS ACTUALIZADOS (IGUAL AL DE CURSOS) ---

const pageContainer = {
  background: '#f4f7f9', // Fondo gris clarito para la página
  minHeight: '100vh',
  padding: '40px 20px',
  display: 'flex',
  justifyContent: 'center',
  fontFamily: 'Arial, sans-serif'
};

const cardStyle = {
  background: 'white',
  width: '100%',
  maxWidth: '850px',
  padding: '40px',
  borderRadius: '12px',
  boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
  borderTop: '5px solid #003366' // Línea azul UNACH arriba
};

const titleStyle = {
  color: '#003366',
  fontSize: '1.6rem',
  margin: '0',
  fontWeight: 'bold'
};

const goldDivider = {
  height: '2px',
  background: '#C0A060',
  width: '100%',
  margin: '15px 0 30px 0'
};

const formGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '20px'
};

const inputGroup = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
};

const labelStyle = {
  fontWeight: 'bold',
  color: '#444',
  fontSize: '0.9rem'
};

// 🚩 TEXTO OSCURO ASEGURADO
const inputStyle = {
  padding: '12px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  fontSize: '1rem',
  outline: 'none',
  background: '#ffffff',
  color: '#333333' // Letra gris oscuro
};

const textareaStyle = {
  padding: '12px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  fontSize: '1rem',
  height: '100px',
  resize: 'none',
  outline: 'none',
  background: '#ffffff',
  color: '#333333', // Letra gris oscuro
  fontFamily: 'inherit'
};

const btnStyle = {
  width: '100%',
  background: '#003366',
  color: 'white',
  padding: '18px',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1.1rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  marginTop: '40px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  transition: '0.3s'
};
