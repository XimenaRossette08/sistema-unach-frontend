import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API = "https://siae-unach.duckdns.org";

export default function InscripcionCurso() {
  const { id, nombre } = useParams();
  const [form, setForm] = useState({ nombre: "", matricula: "", correo: "", telefono: "", grado: "", grupo: "" });
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.nombre || !form.matricula) {
      setError("Nombre y matrícula son requeridos");
      return;
    }
    try {
      await axios.post(`${API}/api/registrar-alumno`, {
        nombre: form.nombre,
        matricula: form.matricula,
        correo: form.correo,
        telefono: form.telefono,
        grado: form.grado,
        grupo: form.grupo,
        curso_id: id,
        curso_nombre: nombre?.replace(/_/g, " ")
      });
      setEnviado(true);
    } catch (err) {
      setError("Error al registrarse. Intenta de nuevo.");
    }
  };

  if (enviado) return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ fontSize: "4rem", marginBottom: "20px" }}>✅</div>
        <h2 style={{ color: "#003366" }}>¡Registro exitoso!</h2>
        <p style={{ color: "#666" }}>Te has registrado al curso:</p>
        <h3 style={{ color: "#C0A060" }}>{nombre?.replace(/_/g, " ")}</h3>
        <p style={{ color: "#888" }}>El docente será notificado de tu inscripción.</p>
      </div>
    </div>
  );

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <img src="/logo-unach.png" alt="UNACH" style={{ height: "60px", marginBottom: "10px" }} />
          <h2 style={{ color: "#003366", margin: 0 }}>Registro al Curso</h2>
          <h3 style={{ color: "#C0A060", margin: "10px 0" }}>{nombre?.replace(/_/g, " ")}</h3>
          <p style={{ color: "#666" }}>Universidad Autónoma de Chiapas</p>
        </div>

        {error && <p style={{ color: "red", marginBottom: "15px" }}>{error}</p>}

        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <input placeholder="Nombre completo *" value={form.nombre}
            onChange={e => setForm({...form, nombre: e.target.value})} style={inputStyle} />
          <input placeholder="Matrícula *" value={form.matricula}
            onChange={e => setForm({...form, matricula: e.target.value})} style={inputStyle} />
          <input placeholder="Correo electrónico" value={form.correo}
            onChange={e => setForm({...form, correo: e.target.value})} style={inputStyle} />
          <input placeholder="Teléfono" value={form.telefono}
            onChange={e => setForm({...form, telefono: e.target.value})} style={inputStyle} />
          <input placeholder="Grado" value={form.grado}
            onChange={e => setForm({...form, grado: e.target.value})} style={inputStyle} />
          <input placeholder="Grupo" value={form.grupo}
            onChange={e => setForm({...form, grupo: e.target.value})} style={inputStyle} />
          <button onClick={handleSubmit} style={btnStyle}>
            📝 Confirmar Inscripción
          </button>
        </div>
      </div>
    </div>
  );
}

const containerStyle = { minHeight: "100vh", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" };
const cardStyle = { background: "white", padding: "40px", borderRadius: "15px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", width: "100%", maxWidth: "450px", textAlign: "center" };
const inputStyle = { padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "1rem", width: "100%", boxSizing: "border-box" };
const btnStyle = { padding: "15px", background: "#003366", color: "white", border: "none", borderRadius: "8px", fontSize: "1rem", cursor: "pointer", fontWeight: "bold" };
