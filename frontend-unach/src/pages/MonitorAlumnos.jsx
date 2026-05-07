import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function MonitorAlumnos() {
  const [alumnos, setAlumnos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estado para el panel de envío manual
  const [datosCorreo, setDatosCorreo] = useState({
    curso_id: '',
    correo_profesor: ''
  });

  // Cargar lista inicial
  useEffect(() => {
    const fetchAlumnos = async () => {
      try {
        // 🚩 Usamos la URL completa para evitar problemas de proxy
        const res = await axios.get('http://localhost:8002/api/lista-alumnos');
        setAlumnos(res.data || []);
      } catch (err) {
        console.error('Error al traer alumnos:', err);
      } finally {
        setCargando(false);
      }
    };
    fetchAlumnos();
  }, []);

  // 📄 DESCARGA RÁPIDA: Genera el PDF del curso de esa fila
  const descargarPDFPorCurso = (cursoId) => {
    if (!cursoId) return alert("Este alumno no tiene un curso asignado.");
    const url = `http://localhost:8002/api/generar-pdf?cursoId=${cursoId}`;
    window.open(url, '_blank');
  };

  // 📧 ENVÍO MANUAL: El panel que tú mencionas para mandar a cualquier docente
  const enviarCorreoPDF = async (e) => {
    e.preventDefault();
    
    if (!datosCorreo.curso_id || !datosCorreo.correo_profesor) {
      alert("⚠️ Por favor ingresa el ID del curso y el correo del docente.");
      return;
    }

    try {
      alert("⏳ Procesando reporte oficial y enviando correo...");
      
      // 🚩 CRÍTICO: Convertimos el curso_id a número para evitar el Error 400
      const payload = {
        curso_id: parseInt(datosCorreo.curso_id),
        correo_profesor: datosCorreo.correo_profesor
      };

      await axios.post('http://localhost:8002/api/enviar-reporte-correo', payload);
      
      alert("✅ ¡Éxito! El docente recibirá el PDF en su correo.");
      setDatosCorreo({ curso_id: '', correo_profesor: '' }); // Limpiamos campos
    } catch (err) {
      console.error("Error en el envío:", err.response?.data || err.message);
      alert("❌ No se pudo enviar el correo. Revisa que el ID del curso exista.");
    }
  };

  const handleCorreoChange = (e) => {
    setDatosCorreo({ ...datosCorreo, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <header style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#003366', fontSize: '2.2rem', margin: 0 }}>
          👥 Monitor de Alumnos Confirmados
        </h2>
        <p style={{ color: '#666' }}>Gestión de listas de asistencia y reportes oficiales</p>
        <div style={{ height: '4px', background: '#C0A060', width: '100px', borderRadius: '2px' }}></div>
      </header>

      {/* 📧 PANEL DE ENVÍO MANUAL (Tu funcionalidad clave) */}
      <section style={panelStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '2rem' }}>📩</div>
          <div style={{ flexGrow: 1 }}>
            <h4 style={{ margin: '0', color: '#166534' }}>Enviar Reporte a Docente</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#15803d' }}>
              Ingresa el ID del curso y el destino para generar el PDF adjunto.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input 
              name="curso_id" 
              type="number"
              placeholder="ID del Curso" 
              value={datosCorreo.curso_id} 
              onChange={handleCorreoChange} 
              style={inputStyle} 
            />
            <input 
              name="correo_profesor" 
              type="email"
              placeholder="correo@unach.mx" 
              value={datosCorreo.correo_profesor} 
              onChange={handleCorreoChange} 
              style={{...inputStyle, width: '250px'}} 
            />
            <button onClick={enviarCorreoPDF} style={btnSendStyle}>
              🚀 Enviar Lista
            </button>
          </div>
        </div>
      </section>

      {cargando ? (
        <p style={{ textAlign: 'center', padding: '50px' }}>⏳ Obteniendo datos de los alumnos...</p>
      ) : alumnos.length === 0 ? (
        <div style={emptyStyle}>No hay alumnos inscritos todavía en el sistema.</div>
      ) : (
        <div style={tableContainerStyle}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#003366', color: '#fff' }}>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Alumno</th>
                <th style={thStyle}>Matrícula</th>
                <th style={thStyle}>Grado/Grupo</th>
                <th style={thStyle}>Curso Asignado</th>
                <th style={{...thStyle, textAlign: 'center'}}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {alumnos.map((al) => (
                <tr key={al.id} style={trStyle}>
                  <td style={{ ...tdStyle, color: '#C0A060', fontWeight: 'bold' }}>#{al.curso_id}</td>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: '600' }}>{al.nombre}</div>
                    <div style={{ fontSize: '0.8rem', color: '#888' }}>{al.correo}</div>
                  </td>
                  <td style={tdStyle}>{al.matricula}</td>
                  <td style={tdStyle}>
                    <span style={badgeStyle}>{al.grado} - {al.grupo}</span>
                  </td>
                  <td style={{ ...tdStyle, color: '#0369a1', fontWeight: '600' }}>
                    {al.nombre_curso || "Sin asignar"}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <button 
                      onClick={() => descargarPDFPorCurso(al.curso_id)} 
                      style={btnMiniStyle}
                      title="Descargar lista de este curso"
                    >
                      📄 Ver PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// --- ESTILOS ---
const panelStyle = { 
  background: '#f0fdf4', 
  padding: '25px', 
  borderRadius: '12px', 
  border: '1px solid #bbf7d0', 
  marginBottom: '30px',
  boxShadow: '0 2px 8px rgba(22, 163, 74, 0.05)'
};

const inputStyle = { 
  padding: '10px 15px', 
  borderRadius: '8px', 
  border: '1px solid #cbd5e1', 
  fontSize: '0.9rem',
  outline: 'none'
};

const btnSendStyle = { 
  backgroundColor: '#16a34a', 
  color: 'white', 
  border: 'none', 
  padding: '10px 20px', 
  borderRadius: '8px', 
  fontWeight: 'bold', 
  cursor: 'pointer',
  transition: '0.2s'
};

const btnMiniStyle = { 
  backgroundColor: '#C0A060', 
  color: 'white', 
  border: 'none', 
  padding: '6px 12px', 
  borderRadius: '6px', 
  cursor: 'pointer', 
  fontSize: '0.85rem',
  fontWeight: '500'
};

const tableContainerStyle = { 
  background: '#fff', 
  borderRadius: '12px', 
  boxShadow: '0 10px 25px rgba(0,0,0,0.05)', 
  overflow: 'hidden' 
};

const thStyle = { padding: '18px 15px', textAlign: 'left', fontSize: '0.9rem' };
const tdStyle = { padding: '15px', borderBottom: '1px solid #f1f5f9' };
const trStyle = { transition: 'background 0.2s' };
const badgeStyle = { background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem', color: '#475569' };
const emptyStyle = { padding: '50px', textAlign: 'center', background: '#fff', borderRadius: '12px', border: '2px dashed #cbd5e1', color: '#64748b' };