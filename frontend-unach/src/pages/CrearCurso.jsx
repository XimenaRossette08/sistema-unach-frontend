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
    horario: '',
    // 🚩 NUEVOS CAMPOS
    fecha_inicio: '',
    fecha_fin: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCursoData({ ...cursoData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      // 🚩 Enviamos el objeto completo con las nuevas fechas a Go
      await axios.post('http://localhost:8002/api/crear-curso', cursoData);
      
      alert("✅ ¡Curso publicado exitosamente! El periodo ha sido registrado.");
      
      // Limpiamos el formulario incluyendo los nuevos campos
      setCursoData({ 
        nombre: '', tipo: 'Taller', modalidad: 'Presencial', 
        objetivo: '', contenido: '', duracion: '', horario: '',
        fecha_inicio: '', fecha_fin: '' 
      });
    } catch (err) {
      alert("❌ Error al publicar el curso. Revisa la conexión con el servidor.");
    }
  };

  return (
    <div style={pageContainer}>
      <div style={cardStyle}>
        <header style={{ marginBottom: '30px' }}>
          <h2 style={titleStyle}>Crear Nueva Convocatoria de Curso</h2>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>SIAE UNACH - Registro de Oferta Académica</p>
        </header>

        <div style={formGrid}>
          {/* Nombre del Curso */}
          <div style={{ ...inputGroup, gridColumn: 'span 2' }}>
            <label style={labelStyle}>Nombre del Curso:</label>
            <input name="nombre" type="text" placeholder="Ej. Programación en Go" value={cursoData.nombre} onChange={handleChange} style={inputStyle} />
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

          {/* 🚩 NUEVA FILA: PERIODO DEL CURSO */}
          <div style={inputGroup}>
            <label style={labelStyle}>Fecha de Inicio:</label>
            <input 
              name="fecha_inicio" 
              type="date" 
              value={cursoData.fecha_inicio} 
              onChange={handleChange} 
              style={inputStyle} 
            />
          </div>
          <div style={inputGroup}>
            <label style={labelStyle}>Fecha de Término:</label>
            <input 
              name="fecha_fin" 
              type="date" 
              value={cursoData.fecha_fin} 
              onChange={handleChange} 
              style={inputStyle} 
            />
          </div>

          {/* Objetivo y Contenido */}
          <div style={{ ...inputGroup, gridColumn: 'span 2' }}>
            <label style={labelStyle}>Objetivo y Dirigido a:</label>
            <textarea name="objetivo" placeholder="¿Qué aprenderán y para quién es?" value={cursoData.objetivo} onChange={handleChange} style={textareaStyle} />
          </div>
          <div style={{ ...inputGroup, gridColumn: 'span 2' }}>
            <label style={labelStyle}>Contenido Temático:</label>
            <textarea name="contenido" placeholder="Lista de temas..." value={cursoData.contenido} onChange={handleChange} style={textareaStyle} />
          </div>

          {/* Duración y Horario */}
          <div style={inputGroup}>
            <label style={labelStyle}>Duración (Horas):</label>
            <input name="duracion" type="text" value={cursoData.duracion} onChange={handleChange} style={inputStyle} />
          </div>
          <div style={inputGroup}>
            <label style={labelStyle}>Horario Sugerido:</label>
            <input name="horario" type="text" placeholder="Ej: Lunes y Miércoles 5-7 PM" value={cursoData.horario} onChange={handleChange} style={inputStyle} />
          </div>
        </div>
        
        <button onClick={handleSubmit} style={btnStyle}>Publicar Curso e Invitar Docentes</button>
      </div>
    </div>
  );
}

// --- ESTILOS (Se mantienen tus estilos originales) ---
const pageContainer = { background: '#f4f7f9', minHeight: '100vh', padding: '40px 20px', display: 'flex', justifyContent: 'center' };
const cardStyle = { background: 'white', width: '100%', maxWidth: '900px', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderTop: '5px solid #003366' };
const titleStyle = { color: '#003366', fontSize: '1.6rem', marginBottom: '5px', fontWeight: 'bold' };
const formGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labelStyle = { fontWeight: 'bold', color: '#444', fontSize: '0.9rem' };
const inputStyle = { padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', outline: 'none', background: '#ffffff', color: '#333333' };
const textareaStyle = { padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', height: '100px', resize: 'none', outline: 'none', background: '#ffffff', color: '#333333', fontFamily: 'inherit' };
const btnStyle = { width: '100%', background: '#003366', color: 'white', padding: '18px', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' };