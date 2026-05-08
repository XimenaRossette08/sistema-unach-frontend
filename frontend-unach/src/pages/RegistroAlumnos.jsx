import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom'; // 👈 Importamos useParams

export default function RegistroAlumnos() {
  // 🚩 Atrapamos el ID y Nombre del curso directo del Link que enviaste
  const { cursoId, nombreCurso } = useParams(); 

  const [nombre, setNombre] = useState('');
  const [matricula, setMatricula] = useState('');
  const [correo, setCorreo] = useState('');
  const [grado, setGrado] = useState('');
  const [grupo, setGrupo] = useState('');
  const [asiste, setAsiste] = useState(true);
  const [inscritos, setInscritos] = useState(0);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchConteo = async () => {
      try {
        const res = await axios.get(`http://siae-unach.duckdns.org/api/notificar-docente?cursoId=${cursoId}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
        setInscritos(res.data.alumnos_inscritos || 0);
      } catch (err) {
        console.error('Error al obtener conteo:', err);
      }
    };
    if (cursoId) fetchConteo();
  }, [cursoId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(''); setError('');

    try {
      const res = await axios.post('/api/registrar-alumno', {
        curso_id: parseInt(cursoId),
        nombre, matricula, correo, grado, grupo, asiste
      });

      setMensaje(res.data.mensaje);
      setInscritos(prev => prev + 1);
      setNombre(''); setMatricula(''); setCorreo(''); setGrado(''); setGrupo('');
    } catch (err) {
      setError('Error al registrar al alumno.');
    }
  };

  // Si alguien entra sin link específico, le avisamos
  if (!cursoId || !nombreCurso) {
    return <div style={{textAlign: 'center', padding: '50px'}}>Enlace de invitación inválido o incompleto.</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '30px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
      {/* 🚩 El título ahora muestra la materia dinámica */}
      <h2 style={{ color: '#003366', textAlign: 'center', marginBottom: '5px' }}>📝 Inscripción al Curso</h2>
      <h3 style={{ color: '#C0A060', textAlign: 'center', marginTop: '0', marginBottom: '20px' }}>{nombreCurso.replace(/%20/g, ' ')}</h3>
      
      <div style={{ padding: '12px', background: '#e0f2fe', color: '#0369a1', borderRadius: '6px', marginBottom: '20px', textAlign: 'center' }}>
        🎓 Alumnos confirmados: <strong>{inscritos}</strong>
      </div>

      {mensaje && <div style={{ padding: '10px', background: '#dcfce7', color: '#15803d', borderRadius: '6px', marginBottom: '10px' }}>{mensaje}</div>}
      {error && <div style={{ padding: '10px', background: '#fee2e2', color: '#b91c1c', borderRadius: '6px', marginBottom: '10px' }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input type="text" placeholder="Nombre Completo" value={nombre} onChange={e => setNombre(e.target.value)} required style={inputStyle} />
        <input type="text" placeholder="Matrícula" value={matricula} onChange={e => setMatricula(e.target.value)} required style={inputStyle} />
        <input type="email" placeholder="Correo Electrónico" value={correo} onChange={e => setCorreo(e.target.value)} required style={inputStyle} />
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <input type="text" placeholder="Grado (Ej. 6to)" value={grado} onChange={e => setGrado(e.target.value)} required style={{...inputStyle, flex: 1}} />
          <input type="text" placeholder="Grupo (Ej. A)" value={grupo} onChange={e => setGrupo(e.target.value)} required style={{...inputStyle, flex: 1}} />
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input type="checkbox" checked={asiste} onChange={e => setAsiste(e.target.checked)} />
          Confirmar asistencia
        </label>

        <button type="submit" style={{ padding: '12px', background: '#003366', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          Registrarme
        </button>
      </form>
    </div>
  );
}

const inputStyle = { padding: '12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '1rem' };
