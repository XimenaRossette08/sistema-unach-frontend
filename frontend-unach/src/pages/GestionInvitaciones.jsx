import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function GestionInvitaciones() {
  const navigate = useNavigate();
  const [docentes, setDocentes] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [seleccion, setSeleccion] = useState({}); // Para guardar qué curso/horario eliges por cada docente

  // Cargar datos al entrar
  useEffect(() => {
    const fetchData = async () => {
      const resDoc = await axios.get('http://localhost:8002/api/docentes');
      const resCur = await axios.get('http://localhost:8002/api/cursos');
      setDocentes(resDoc.data);
      setCursos(resCur.data);
    };
    fetchData();
  }, []);

  const handleInvite = async (docente) => {
    const info = seleccion[docente.rfc] || {};
    if (!info.curso || !info.horario) {
      alert("Por favor selecciona curso y horario");
      return;
    }

    const payload = {
      rfc: docente.rfc,
      nombre: docente.nombre,
      curso: info.curso,
      horario: info.horario
    };

    try {
      await axios.post('http://localhost:8002/api/enviar-invitacion', payload);
      alert(`✅ Invitación enviada a ${docente.nombre}`);
    } catch (err) {
      alert("❌ Error al enviar invitación");
    }
  };

  const updateSeleccion = (rfc, campo, valor) => {
    setSeleccion({
      ...seleccion,
      [rfc]: { ...(seleccion[rfc] || {}), [campo]: valor }
    });
  };

  return (
    <div style={pageContainer}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>Gestión de Invitaciones Docentes</h2>
        <div style={goldDivider}></div>

        {docentes.map((doc) => (
          <div key={doc.rfc} style={itemBox}>
            <div style={infoRow}>
              <h3 style={docName}>{doc.nombre}</h3>
              <span style={rfcTag}>{doc.rfc}</span>
            </div>

            <div style={actionRow}>
              <div style={inputCol}>
                <label style={miniLabel}>Materia:</label>
                <select 
                  style={selectStyle}
                  onChange={(e) => updateSeleccion(doc.rfc, 'curso', e.target.value)}
                >
                  <option value="">-- Seleccionar --</option>
                  {cursos.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div style={inputCol}>
                <label style={miniLabel}>Horario:</label>
                <input 
                  type="text" 
                  placeholder="Ej: Lun y Mier 5-7pm" 
                  style={smallInput}
                  onChange={(e) => updateSeleccion(doc.rfc, 'horario', e.target.value)}
                />
              </div>

              <button onClick={() => handleInvite(doc)} style={invitarBtn}>
                Invitar
              </button>
            </div>
          </div>
        ))}

        <button onClick={() => navigate('/monitor')} style={linkBtn}>
          📊 Ver Monitor de Estados
        </button>
      </div>
    </div>
  );
}

// --- ESTILOS PROFESIONALES ---
const pageContainer = { background: '#f4f7f9', minHeight: '100vh', padding: '40px 20px', display: 'flex', justifyContent: 'center' };
const cardStyle = { background: 'white', width: '100%', maxWidth: '900px', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderTop: '5px solid #003366' };
const titleStyle = { color: '#003366', fontSize: '1.6rem', marginBottom: '10px' };
const goldDivider = { height: '2px', background: '#C0A060', marginBottom: '30px' };
const itemBox = { border: '1px solid #eee', padding: '20px', borderRadius: '8px', marginBottom: '15px', background: '#fcfcfc' };
const infoRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' };
const docName = { margin: 0, color: '#333' };
const rfcTag = { background: '#eee', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', color: '#666' };
const actionRow = { display: 'flex', gap: '15px', alignItems: 'flex-end' };
const inputCol = { display: 'flex', flexDirection: 'column', flex: 1, gap: '5px' };
const miniLabel = { fontSize: '0.8rem', fontWeight: 'bold', color: '#777' };
const selectStyle = { padding: '10px', borderRadius: '6px', border: '1px solid #ccc', color: '#333' };
const smallInput = { padding: '10px', borderRadius: '6px', border: '1px solid #ccc', color: '#333' };
const invitarBtn = { background: '#003366', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' };
const linkBtn = { marginTop: '30px', background: 'none', border: 'none', color: '#003366', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' };
