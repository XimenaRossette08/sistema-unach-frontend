import React, { useState } from 'react';
import axios from 'axios';

export default function CrearCurso() {
  const [cursoData, setCursoData] = useState({
    nombre: '',
    tipo: 'Taller',
    modalidad: 'Presencial',
    objetivo: '',
    contenido: '',
    duracion: '',
    horario: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCursoData({ ...cursoData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      console.log("Publicando curso...", cursoData);
      const res = await axios.post('http://localhost:8002/api/crear-curso', cursoData);
      alert("✅ ¡Curso publicado! Ahora puedes invitar docentes.");
    } catch (err) {
      alert("❌ Error al publicar el curso. Revisa tu servidor de Go.");
    }
  };

  return (
    <div style={pageContainer}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>Crear Nueva Convocatoria de Curso</h2>

        <div style={formGrid}>
          {/* Nombre del Curso */}
          <div style={{ ...inputGroup, gridColumn: 'span 2' }}>
            <label style={labelStyle}>Nombre del Curso:</label>
            <input 
              name="nombre"
              type="text" 
              placeholder="Ej. Programación en Go" 
              value={cursoData.nombre}
              onChange={handleChange}
              style={inputStyle} 
            />
          </div>

          {/* Tipo y Modalidad */}
          <div style={inputGroup}>
            <label style={labelStyle}>Tipo de Capacitación:</label>
            <select name="tipo" value={cursoData.tipo} onChange={handleChange} style={inputStyle}>
              <option value="Taller">Taller</option>
              <option value="Diplomado">Diplomado</option>
              <option value="Seminario">Seminario</option>
            </select>
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Modalidad:</label>
            <select name="modalidad" value={cursoData.modalidad} onChange={handleChange} style={inputStyle}>
              <option value="Presencial">Presencial</option>
              <option value="Virtual">Virtual</option>
              <option value="Híbrido">Híbrido</option>
            </select>
          </div>

          {/* Objetivo */}
          <div style={{ ...inputGroup, gridColumn: 'span 2' }}>
            <label style={labelStyle}>Objetivo y Dirigido a:</label>
            <textarea 
              name="objetivo"
              placeholder="¿Qué aprenderán y para quién es?" 
              value={cursoData.objetivo}
              onChange={handleChange}
              style={textareaStyle} // 🚩 Corregido para legibilidad
            />
          </div>

          {/* Contenido Temático */}
          <div style={{ ...inputGroup, gridColumn: 'span 2' }}>
            <label style={labelStyle}>Contenido Temático:</label>
            <textarea 
              name="contenido"
              placeholder="Lista de temas..." 
              value={cursoData.contenido}
              onChange={handleChange}
              style={textareaStyle} // 🚩 Corregido para legibilidad
            />
          </div>

          {/* Duración y Horario */}
          <div style={inputGroup}>
            <label style={labelStyle}>Duración (Horas):</label>
            <input 
              name="duracion"
              type="text" 
              value={cursoData.duracion}
              onChange={handleChange}
              style={inputStyle} 
            />
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Horario Sugerido:</label>
            <input 
              name="horario"
              type="text" 
              placeholder="Ej: Lunes y Miércoles 5-7 PM" 
              value={cursoData.horario}
              onChange={handleChange}
              style={inputStyle} 
            />
          </div>
        </div>

        <button onClick={handleSubmit} style={btnStyle}>
          Publicar Curso e Invitar Docentes
        </button>
      </div>
    </div>
  );
}

// --- ESTILOS (Legibilidad Arreglada) ---
const pageContainer = {
  background: '#f4f7f9',
  minHeight: '100vh',
  padding: '40px 20px',
  display: 'flex',
  justifyContent: 'center'
};

const cardStyle = {
  background: 'white',
  width: '100%',
  maxWidth: '900px',
  padding: '40px',
  borderRadius: '12px',
  boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
  borderTop: '5px solid #003366'
};

const titleStyle = {
  color: '#003366',
  fontSize: '1.6rem',
  marginBottom: '30px',
  fontWeight: 'bold'
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

// 🚩 EL CAMBIO CRÍTICO: Definimos color oscuro sobre fondo blanco
const inputStyle = {
  padding: '12px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  fontSize: '1rem',
  outline: 'none',
  background: '#ffffff', // Aseguramos fondo blanco
  color: '#333333' // Definimos texto gris oscuro
};

// 🚩 Y PARA LAS TEXTAREAS:
const textareaStyle = {
  padding: '12px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  fontSize: '1rem',
  height: '100px',
  resize: 'none',
  outline: 'none',
  background: '#ffffff', // Aseguramos fondo blanco
  color: '#333333', // Definimos texto gris oscuro
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
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
};
