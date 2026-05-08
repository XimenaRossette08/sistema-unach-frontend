import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function BuzonDocente({ rfc }) {
  // 🚩 Verificación del RFC que está llegando al componente
  console.log("RFC recibido en Buzón:", rfc); 

  const [invitaciones, setInvitaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  // 📥 Efecto para cargar las invitaciones reales del docente
  useEffect(() => {
    const fetchInvitaciones = async () => {
      try {
        if (!rfc) return; // Evitamos hacer la petición si el RFC no está disponible
        const res = await axios.get(`https://siae-unach.duckdns.org/api/mis-invitaciones?rfc=${rfc}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
        
        // Si el endpoint devuelve null nos aseguramos de asignar un arreglo vacío
        setInvitaciones(res.data || []);
      } catch (err) {
        console.error("Error al obtener invitaciones:", err);
      } finally {
        setCargando(false);
      }
    };

    fetchInvitaciones();
  }, [rfc]);

  // ✅ Función para aceptar la propuesta de trabajo
  const manejarAceptar = async (id, nombreCurso) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://siae-unach.duckdns.org/api/aceptar-invitacion', { id }, { headers: { 'Authorization': `Bearer ${token}` } });
      
      alert(`🎉 ¡Excelente! Has aceptado impartir el curso: ${nombreCurso}.`);

      // Actualizamos el estado local para que la UI cambie al instante
      setInvitaciones(prev => prev.map(inv => 
        inv.id === id ? { ...inv, estado: 'Aceptado' } : inv
      ));
    } catch (err) {
      alert("❌ Hubo un problema al procesar la aceptación. Intenta de nuevo.");
    }
  };

  if (cargando) return <div style={msgLoading}>⏳ Sincronizando con el servidor...</div>;

  return (
    <div style={pageStyle}>
      <header style={headerStyle}>
        <h2 style={titleStyle}>📬 Mi Buzón de Invitaciones</h2>
        <p style={subtitleStyle}>Revisa y gestiona las propuestas académicas asignadas a tu perfil.</p>
      </header>

      <div style={dividerStyle}></div>

      {invitaciones.length === 0 ? (
        <div style={emptyContainer}>
          <span style={{ fontSize: '4rem' }}>📩</span>
          <p style={{ marginTop: '15px', fontWeight: 'bold' }}>No tienes invitaciones pendientes por el momento.</p>
          <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Cuando el Administrador te asigne un curso, aparecerá aquí.</p>
        </div>
      ) : (
        <div style={listStyle}>
          {invitaciones.map((inv) => (
            <div 
              key={inv.id} 
              style={{
                ...cardStyle, 
                borderLeft: inv.estado === 'Aceptado' ? '8px solid #4CAF50' : '8px solid #C0A060'
              }}
            >
              <div style={infoSection}>
                <h3 style={cursoName}>{inv.curso}</h3>
                <p style={detailText}>📅 <b>Horario:</b> {inv.horario}</p>
                <div style={{ marginTop: '10px' }}>
                  <span style={{
                    ...statusLabel,
                    background: inv.estado === 'Aceptado' ? '#e8f5e9' : '#fff3e0',
                    color: inv.estado === 'Aceptado' ? '#2e7d32' : '#e65100'
                  }}>
                    {inv.estado.toUpperCase()}
                  </span>
                </div>
              </div>

              {inv.estado === 'Pendiente' ? (
                <button 
                  onClick={() => manejarAceptar(inv.id, inv.curso)} 
                  style={btnAceptar}
                >
                  Confirmar Asistencia
                </button>
              ) : (
                <div style={successBadge}>
                  ✨ Materia Asignada Correctamente
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- ESTILOS PROFESIONALES (UNACH BLUE & GOLD) ---

const pageStyle = { maxWidth: '1000px', margin: '0 auto' };
const headerStyle = { marginBottom: '25px' };
const titleStyle = { color: '#003366', fontSize: '2rem', margin: 0 };
const subtitleStyle = { color: '#666', fontSize: '1rem', marginTop: '5px' };
const dividerStyle = { height: '4px', background: '#C0A060', width: '80px', marginBottom: '40px', borderRadius: '2px' };

const msgLoading = { textAlign: 'center', marginTop: '100px', fontSize: '1.2rem', color: '#003366', fontWeight: 'bold' };

const emptyContainer = { 
  textAlign: 'center', 
  padding: '60px', 
  background: '#fff', 
  borderRadius: '15px', 
  color: '#888', 
  border: '2px dashed #d1d9e0',
  boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
};

const listStyle = { display: 'flex', flexDirection: 'column', gap: '20px' };

const cardStyle = { 
  background: 'white', 
  padding: '30px', 
  borderRadius: '12px', 
  boxShadow: '0 6px 15px rgba(0,0,0,0.05)', 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center',
  transition: 'transform 0.2s ease-in-out'
};

const infoSection = { flex: 1 };
const cursoName = { margin: '0 0 10px 0', color: '#003366', fontSize: '1.5rem' };
const detailText = { margin: '5px 0', color: '#555', fontSize: '1rem' };

const statusLabel = { 
  padding: '5px 12px', 
  borderRadius: '6px', 
  fontSize: '0.75rem', 
  fontWeight: 'bold', 
  letterSpacing: '0.5px' 
};

const btnAceptar = { 
  background: '#003366', 
  color: 'white', 
  border: 'none', 
  padding: '14px 28px', 
  borderRadius: '10px', 
  fontWeight: 'bold', 
  cursor: 'pointer', 
  fontSize: '1rem',
  boxShadow: '0 4px 12px rgba(0,51,102,0.25)',
  transition: '0.3s'
};

const successBadge = { 
  color: '#2e7d32', 
  fontWeight: 'bold', 
  fontSize: '1rem', 
  display: 'flex', 
  alignItems: 'center', 
  gap: '8px' 
};
