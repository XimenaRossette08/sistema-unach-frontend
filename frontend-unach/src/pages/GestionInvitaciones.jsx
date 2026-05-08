import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function GestionInvitaciones() {
  const navigate = useNavigate();
  const [docentes, setDocentes] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [seleccion, setSeleccion] = useState({});
  const [cargando, setCargando] = useState(true);

  // 1. Cargar datos de los dos microservicios al iniciar
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resDoc, resCur] = await Promise.all([
          axios.get('http://localhost:8002/api/docentes', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
          axios.get('http://localhost:8002/api/cursos')
        ]);
        setDocentes(resDoc.data);
        setCursos(resCur.data);
      } catch (err) {
        console.error("Error al conectar con los microservicios:", err);
      } finally {
        setCargando(false);
      }
    };
    fetchData();
  }, []);

  // 🚩 FUNCIÓN DE AUTO-LLENADO: Al cambiar la materia, busca el horario
  const handleMateriaChange = (rfc, nombreCurso) => {
    const cursoEncontrado = cursos.find(c => c.nombre === nombreCurso);
    const horarioDetectado = cursoEncontrado ? cursoEncontrado.horario : '';

    setSeleccion(prev => ({
      ...prev,
      [rfc]: { 
        ...(prev[rfc] || {}), 
        curso: nombreCurso, 
        horario: horarioDetectado 
      }
    }));
  };

  // 2. Función para enviar la invitación final
  const handleInvite = async (docente) => {
    const info = seleccion[docente.rfc] || {};
    
    if (!info.curso || !info.horario) {
      alert("⚠️ Por favor, selecciona una materia y verifica el horario.");
      return;
    }

    const payload = {
      rfc: docente.rfc,
      nombre: docente.nombre,
      curso: info.curso,
      horario: info.horario
    };

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8002/api/enviar-invitacion', payload, { headers: { 'Authorization': `Bearer ${token}` } });
      alert(`✅ ¡Invitación enviada exitosamente a ${docente.nombre}!`);
    } catch (err) {
      alert("❌ Error: No se pudo procesar la invitación en el microservicio.");
    }
  };

  if (cargando) return <div style={loadingContainer}>⏳ Sincronizando Microservicios...</div>;

  return (
    <div style={pageContainer}>
      {/* BARRA SUPERIOR DE NAVEGACIÓN */}
      <div style={navBarTop}>
        <button onClick={() => navigate('/')} style={btnRegreso}>
          🏠 ← Volver al Portal
        </button>
        <span style={badgeModulo}>MICROSERVICIO: GESTIÓN DE INVITACIONES</span>
      </div>

      <div style={cardMain}>
        <header style={headerStyle}>
          <h2 style={titleStyle}>📩 Panel de Invitaciones Académicas</h2>
          <p style={subtitleStyle}>Asignación inteligente de docentes según perfil y catálogo de cursos.</p>
        </header>

        <div style={dividerStyle}></div>

        <div style={docentesGrid}>
          {docentes.map((doc) => (
            <div key={doc.rfc} style={docCard}>
              <div style={docHeader}>
                <div>
                  <h3 style={docName}>{doc.nombre}</h3>
                  <span style={rfcLabel}>{doc.rfc}</span>
                </div>
                
                {/* 🚩 VISUALIZACIÓN DE SMART MATCH ( backend logic ) */}
                {doc.sugerencias && doc.sugerencias.length > 0 && (
                  <div style={matchBadge}>
                    ⭐ Sugerencia: {doc.sugerencias[0].nombre}
                  </div>
                )}
              </div>

              <p style={perfilText}><b>Perfil:</b> {doc.perfil}</p>

              <div style={formRow}>
                <div style={inputGroup}>
                  <label style={labelStyle}>MATERIA</label>
                  <select 
                    style={selectStyle}
                    value={seleccion[doc.rfc]?.curso || ""}
                    onChange={(e) => handleMateriaChange(doc.rfc, e.target.value)}
                  >
                    <option value="">-- Seleccionar Curso --</option>
                    {cursos.map(c => (
                      <option key={c.nombre} value={c.nombre}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                <div style={inputGroup}>
                  <label style={labelStyle}>HORARIO (AUTOMÁTICO)</label>
                  <input 
                    type="text" 
                    placeholder="Esperando selección..." 
                    style={inputStyle}
                    value={seleccion[doc.rfc]?.horario || ""}
                    onChange={(e) => setSeleccion({
                      ...seleccion, 
                      [doc.rfc]: {...seleccion[doc.rfc], horario: e.target.value}
                    })}
                  />
                </div>

                <button onClick={() => handleInvite(doc)} style={btnInvitacion}>
                  ENVIAR
                </button>
              </div>
            </div>
          ))}
        </div>

        <footer style={footerStyle}>
          <button onClick={() => navigate('/monitor')} style={btnMonitor}>
            📊 Ir al Monitor de Estados
          </button>
        </footer>
      </div>
    </div>
  );
}

// --- ESTILOS PROFESIONALES (UNACH BLUE & GOLD) ---

const pageContainer = { background: '#f4f7fa', minHeight: '100vh', padding: '30px', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' };
const loadingContainer = { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#003366', fontWeight: 'bold' };
const navBarTop = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
const btnRegreso = { background: 'white', color: '#003366', border: '1px solid #003366', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const badgeModulo = { color: '#666', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px' };

const cardMain = { background: 'white', maxWidth: '1100px', margin: '0 auto', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', borderTop: '6px solid #003366' };
const headerStyle = { marginBottom: '20px' };
const titleStyle = { color: '#003366', fontSize: '1.8rem', margin: 0 };
const subtitleStyle = { color: '#777', fontSize: '0.9rem', marginTop: '5px' };
const dividerStyle = { height: '3px', background: '#C0A060', width: '60px', marginBottom: '30px' };

const docentesGrid = { display: 'flex', flexDirection: 'column', gap: '20px' };
const docCard = { border: '1px solid #eef0f2', padding: '25px', borderRadius: '12px', background: '#fff', transition: '0.3s' };
const docHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' };
const docName = { margin: 0, color: '#003366', fontSize: '1.3rem' };
const rfcLabel = { color: '#1a73e8', background: '#e8f0fe', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' };
const matchBadge = { background: '#fff3cd', color: '#856404', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid #ffeeba' };
const perfilText = { color: '#555', fontSize: '0.9rem', marginBottom: '20px', fontStyle: 'italic' };

const formRow = { display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '200px' };
const labelStyle = { fontSize: '0.7rem', fontWeight: 'bold', color: '#999', letterSpacing: '0.5px' };
const selectStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', background: '#f9f9f9', outline: 'none' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', background: '#f9f9f9', outline: 'none' };

const btnInvitacion = { background: '#003366', color: 'white', border: 'none', padding: '14px 30px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s', boxShadow: '0 4px 10px rgba(0,51,102,0.2)' };
const footerStyle = { marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px', textAlign: 'center' };
const btnMonitor = { background: 'none', border: 'none', color: '#003366', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' };
