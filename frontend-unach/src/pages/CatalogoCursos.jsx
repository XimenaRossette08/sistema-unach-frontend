import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function CatalogoCursos() {
  const [listaCursos, setListaCursos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const fetchCursos = async () => {
    try {
      const res = await axios.get('/api/cursos');
      setListaCursos(res.data || []);
    } catch (err) {
      console.error("Error al traer cursos", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchCursos();
  }, []);

  const copiarEnlace = (id, nombre) => {
    const nombreFormateado = nombre.replace(/\s+/g, '_');
    const enlace = `${window.location.origin}/inscripcion-curso/${id}/${nombreFormateado}`;
    
    navigator.clipboard.writeText(enlace).then(() => {
      alert(`✅ Enlace copiado:\n${enlace}`);
    });
  };

  // 🚩 AQUÍ ESTÁ LA NUEVA FUNCIÓN PARA MANDAR EL CORREO
  const notificarProfe = async (id, nombre) => {
    const correo = prompt(`Ingresa el correo del profesor para informarle sobre "${nombre}":`);
    if (!correo) return; // Si cancelas o lo dejas vacío, no hace nada

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://siae-unach.duckdns.org/api/enviar-reporte-correo', { 
        curso_id: id.toString(), 
        correo_profesor: correo 
      }, { headers: { 'Authorization': `Bearer ${token}` } });
      alert(`✅ Reporte enviado exitosamente a: ${correo}`);
    } catch (err) {
      alert("❌ Error al enviar el correo. Revisa la consola o tu servidor de Go.");
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#003366', fontSize: '1.8rem', margin: 0 }}>📚 Catálogo de Cursos Publicados</h2>
        <p style={{ color: '#666' }}>Gestiona los enlaces de inscripción para los jefes de grupo</p>
        <div style={{ height: '4px', background: '#C0A060', width: '60px', marginTop: '10px' }}></div>
      </header>

      {cargando ? (
        <p>Cargando catálogo...</p>
      ) : (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                <th style={pStyle}>ID</th>
                <th style={pStyle}>Nombre del Curso</th>
                <th style={pStyle}>Horario</th>
                <th style={{ ...pStyle, textAlign: 'center' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {listaCursos.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                  <td style={pStyle}>{c.id}</td>
                  <td style={{ ...pStyle, fontWeight: 'bold' }}>{c.nombre}</td>
                  <td style={pStyle}>{c.horario}</td>
                  
                  {/* 🚩 AQUÍ ESTÁN LOS DOS BOTONES JUNTOS */}
                  <td style={{ ...pStyle, textAlign: 'center', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button onClick={() => copiarEnlace(c.id, c.nombre)} style={btnCopyStyle}>
                      🔗 Copiar Link
                    </button>
                    <button onClick={() => notificarProfe(c.id, c.nombre)} style={{...btnCopyStyle, background: '#003366'}}>
                      📩 Notificar Profe
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

const pStyle = { padding: '15px 10px' };
const btnCopyStyle = { background: '#C0A060', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
