import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "https://siae-unach.duckdns.org";

export default function CatalogoCursos() {
  const [listaCursos, setListaCursos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalCurso, setModalCurso] = useState(null);
  const [correosJefes, setCorreosJefes] = useState("");
  const [enviando, setEnviando] = useState(false);
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchCursos = async () => {
    try {
      const res = await axios.get(`${API}/api/cursos`);
      setListaCursos(res.data || []);
    } catch (err) {
      console.error("Error al traer cursos", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { fetchCursos(); }, []);

  const copiarEnlace = (id, nombre) => {
    const nombreFormateado = nombre.replace(/\s+/g, "_");
    const enlace = `${window.location.origin}/inscripcion-curso/${id}/${nombreFormateado}`;
    navigator.clipboard.writeText(enlace).then(() => {
      alert("✅ Enlace copiado: " + enlace);
    });
  };

  const notificarProfe = async (curso) => {
    const correo = prompt("Correo del profesor para " + curso.nombre + ":");
    if (!correo) return;
    try {
      await axios.post(`${API}/api/enviar-reporte-correo`, {
        curso_id: curso.id.toString(),
        curso_nombre: curso.nombre,
        curso_horario: curso.horario,
        curso_fecha_inicio: curso.fecha_inicio,
        curso_fecha_fin: curso.fecha_fin,
        correo_profesor: correo
      }, { headers });
      alert("✅ Reporte enviado a: " + correo);
    } catch (err) {
      alert("❌ Error al enviar el correo.");
    }
  };

  const enviarInvitaciones = async () => {
    if (!correosJefes.trim()) return;
    setEnviando(true);
    const correos = correosJefes.split(",").map(c => c.trim()).filter(c => c);
    const nombreFormateado = modalCurso.nombre.replace(/\s+/g, "_");
    const link = `https://sistema-unach-frontend.vercel.app/inscripcion-curso/${modalCurso.id}/${nombreFormateado}`;
    try {
      await axios.post(`${API}/api/invitar-alumnos`, {
        curso_id: modalCurso.id,
        curso_nombre: modalCurso.nombre,
        correos_jefes: correos,
        link_inscripcion: link
      }, { headers });
      alert("✅ Invitaciones enviadas a " + correos.length + " jefe(s) de grupo");
      setModalCurso(null);
      setCorreosJefes("");
    } catch (err) {
      alert("❌ Error al enviar invitaciones.");
    }
    setEnviando(false);
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <header style={{ marginBottom: "30px" }}>
        <h2 style={{ color: "#003366", fontSize: "1.8rem", margin: 0 }}>📚 Catálogo de Cursos Publicados</h2>
        <p style={{ color: "#666" }}>Gestiona los enlaces de inscripción para los jefes de grupo</p>
        <div style={{ height: "4px", background: "#C0A060", width: "60px", marginTop: "10px" }}></div>
      </header>

      {cargando ? <p>Cargando catálogo...</p> : (
        <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "2px solid #eee" }}>
                <th style={pStyle}>ID</th>
                <th style={pStyle}>Nombre del Curso</th>
                <th style={pStyle}>Horario</th>
                <th style={{ ...pStyle, textAlign: "center" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {listaCursos.map(c => (
                <tr key={c.id} style={{ borderBottom: "1px solid #f9f9f9" }}>
                  <td style={pStyle}>{c.id}</td>
                  <td style={{ ...pStyle, fontWeight: "bold" }}>{c.nombre}</td>
                  <td style={pStyle}>{c.horario}</td>
                  <td style={{ ...pStyle, textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                      <button onClick={() => copiarEnlace(c.id, c.nombre)} style={btnStyle("#C0A060")}>🔗 Copiar Link</button>
                      <button onClick={() => notificarProfe(c)} style={btnStyle("#003366")}>📩 Notificar Profe</button>
                      <button onClick={() => setModalCurso(c)} style={btnStyle("#28a745")}>📧 Invitar Alumnos</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalCurso && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "15px", width: "500px", maxWidth: "90%" }}>
            <h3 style={{ color: "#003366", marginBottom: "10px" }}>📧 Invitar Alumnos</h3>
            <p style={{ color: "#666", marginBottom: "20px" }}>Curso: <b>{modalCurso.nombre}</b></p>
            <p style={{ color: "#888", fontSize: "0.9rem", marginBottom: "10px" }}>Correos de jefes de grupo separados por comas:</p>
            <textarea value={correosJefes} onChange={e => setCorreosJefes(e.target.value)}
              placeholder="jefe1@gmail.com, jefe2@gmail.com"
              style={{ width: "100%", height: "100px", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", marginBottom: "15px", resize: "vertical" }} />
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => { setModalCurso(null); setCorreosJefes(""); }} style={btnStyle("#999")}>Cancelar</button>
              <button onClick={enviarInvitaciones} disabled={enviando} style={btnStyle("#28a745")}>
                {enviando ? "Enviando..." : "📧 Enviar Invitaciones"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const pStyle = { padding: "15px 10px" };
const btnStyle = (bg) => ({ background: bg, color: "white", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "0.85rem" });
