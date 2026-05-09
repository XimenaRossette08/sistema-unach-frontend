import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API = "https://siae-unach.duckdns.org";

export default function AdminDashboard() {
  const [correos, setCorreos] = useState([]);
  const [nuevoCorreo, setNuevoCorreo] = useState("");
  const [nuevoNombre, setNuevoNombre] = useState("");
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { cargarCorreos(); }, []);

  const cargarCorreos = async () => {
    try {
      const res = await axios.get(`${API}/api/correos-notificacion`, { headers });
      setCorreos(res.data);
    } catch (e) { console.error(e); }
  };

  const agregarCorreo = async () => {
    if (!nuevoCorreo) return;
    await axios.post(`${API}/api/correos-notificacion`, { correo: nuevoCorreo, nombre: nuevoNombre }, { headers });
    setNuevoCorreo(""); setNuevoNombre("");
    cargarCorreos();
  };

  const eliminarCorreo = async (id) => {
    await axios.delete(`${API}/api/correos-notificacion/${id}`, { headers });
    cargarCorreos();
  };

  return (
    <div style={{ width: "100%" }}>
      <h1 style={{ color: "#003366", marginBottom: "40px", fontSize: "2.2rem", fontWeight: "bold" }}>
        Bienvenido, Administrador
      </h1>
      <div style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>
      <div style={{ ...cardStyle, borderLeft: "8px solid #003366" }}>
          <h3 style={cardTitle}>Taller de Desarrollo 4</h3>
          <p style={cardText}>Gestiona la plantilla docente y las convocatorias de cursos.</p>
          <Link to="/monitor" style={linkBtn}>Ver Monitor</Link>
        </div>
      </div>

      <div style={{ ...cardStyle, marginTop: "30px", borderLeft: "8px solid #28a745" }}>
        <h3 style={cardTitle}>📧 Correos de Notificación</h3>
        <p style={cardText}>Estos correos reciben alertas cuando alguien inicia sesión.</p>
        <div style={{ display: "flex", gap: "10px", marginBottom: "15px", flexWrap: "wrap" }}>
          <input placeholder="Nombre" value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)}
            style={inputStyle} />
          <input placeholder="correo@ejemplo.com" value={nuevoCorreo} onChange={e => setNuevoCorreo(e.target.value)}
            style={{ ...inputStyle, flex: 2 }} />
          <button onClick={agregarCorreo} style={btnStyle}>➕ Agregar</button>
        </div>
        {correos.length === 0 ? <p style={{ color: "#999" }}>No hay correos registrados.</p> :
          correos.map(c => (
            <div key={c.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #eee" }}>
              <span>📧 <b>{c.nombre}</b> — {c.correo}</span>
              <button onClick={() => eliminarCorreo(c.id)} style={{ background: "#dc3545", color: "white", border: "none", borderRadius: "5px", padding: "4px 10px", cursor: "pointer" }}>🗑️</button>
            </div>
          ))
        }
      </div>
    </div>
  );
}

const cardStyle = { background: "white", padding: "40px", borderRadius: "15px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", flex: 1, minWidth: "300px" };
const cardTitle = { fontSize: "1.5rem", marginBottom: "15px", color: "#333" };
const cardText = { color: "#666", marginBottom: "20px", lineHeight: "1.5" };
const linkBtn = { color: "#003366", fontWeight: "bold", textDecoration: "none", borderBottom: "2px solid #C0A060" };
const inputStyle = { padding: "8px 12px", borderRadius: "8px", border: "1px solid #ddd", flex: 1 };
const btnStyle = { padding: "8px 16px", background: "#003366", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" };
