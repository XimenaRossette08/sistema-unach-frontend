import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Sidebar from "./components/Sidebar";
import { ProtectedRoute } from "./components/ProtectedRoute";

import Portal from "./pages/Portal";
import AdminDashboard from "./pages/AdminDashboard";
import MonitorAdmin from "./pages/MonitorAdmin";
import CrearCurso from "./pages/CrearCurso";
import BuzonDocente from "./pages/BuzonDocente";
import CargaAcademica from "./pages/CargaAcademica";
import RegistroDocente from "./pages/RegistroDocente";
import GestionInvitaciones from "./pages/GestionInvitaciones";
import RegistroAlumnos from "./pages/RegistroAlumnos";
import MonitorAlumnos from "./pages/MonitorAlumnos";
import CatalogoCursos from "./pages/CatalogoCursos";
import InscripcionCurso from "./pages/InscripcionCurso";

function obtenerUsuarioDesdeToken() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return { rol: "", nombre: "", rfc: "" };
    const decoded = jwtDecode(token);
    return {
      rol:    decoded.rol    || localStorage.getItem("userRole") || "",
      nombre: decoded.nombre || localStorage.getItem("userName") || "",
      rfc:    decoded.rfc    || localStorage.getItem("userRFC")  || ""
    };
  } catch {
    return {
      rol:    localStorage.getItem("userRole") || "",
      nombre: localStorage.getItem("userName") || "",
      rfc:    localStorage.getItem("userRFC")  || ""
    };
  }
}

// Leer token de la URL si viene del sistema central
const params = new URLSearchParams(window.location.search);
const tokenUrl = params.get("token");
if (tokenUrl) {
  localStorage.setItem("token", tokenUrl);
  window.history.replaceState({}, "", window.location.pathname);
}

function App() {
  const [usuario, setUsuario] = useState(obtenerUsuarioDesdeToken);

  const setUsuarioGlobal = (data) => {
    setUsuario(data);
  };

  useEffect(() => {
    const u = obtenerUsuarioDesdeToken();
    if (u.rol) setUsuario(u);
  }, []);

  return (
    <div style={{ minHeight: "100vh", width: "100%", background: "#f8f9fa" }}>
      <Routes>
        <Route path="/" element={<Portal setUsuarioGlobal={setUsuarioGlobal} />} />
        <Route path="/inscripcion-curso/:id/:nombre" element={<InscripcionCurso />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <div style={{ display: "flex" }}>
              <Sidebar usuario={usuario} />
              <main style={{ marginLeft: "280px", padding: "40px", minHeight: "100vh", flex: 1 }}>
                <Routes>
                  <Route path="/admin"                  element={usuario.rol === "admin" ? <AdminDashboard /> : <Navigate to="/buzon" />} />
                  <Route path="/monitor"                element={usuario.rol === "admin" ? <MonitorAdmin /> : <Navigate to="/buzon" />} />
                  <Route path="/monitor-alumnos"        element={usuario.rol === "admin" ? <MonitorAlumnos /> : <Navigate to="/buzon" />} />
                  <Route path="/crear-curso"            element={usuario.rol === "admin" ? <CrearCurso /> : <Navigate to="/buzon" />} />
                  <Route path="/catalogo-cursos"        element={usuario.rol === "admin" ? <CatalogoCursos /> : <Navigate to="/buzon" />} />
                  <Route path="/registro"               element={usuario.rol === "admin" ? <RegistroDocente /> : <Navigate to="/buzon" />} />
                  <Route path="/gestionar-invitaciones" element={usuario.rol === "admin" ? <GestionInvitaciones /> : <Navigate to="/buzon" />} />
                  <Route path="/buzon"                  element={<BuzonDocente rfc={usuario.rfc} />} />
                  <Route path="/carga"                  element={<CargaAcademica usuario={usuario} />} />
                  <Route path="*"                       element={<Navigate to="/" />} />
                </Routes>
              </main>
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;
