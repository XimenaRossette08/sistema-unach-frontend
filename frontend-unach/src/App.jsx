import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { ProtectedRoute } from './components/ProtectedRoute';

// Importación de Páginas
import Portal from './pages/Portal';
import AdminDashboard from './pages/AdminDashboard';
import MonitorAdmin from './pages/MonitorAdmin';
import ArquitectoProfesional from './pages/ArquitectoProfesional';
import CrearCurso from './pages/CrearCurso';
import BuzonDocente from './pages/BuzonDocente';
import CargaAcademica from './pages/CargaAcademica';
import RegistroDocente from './pages/RegistroDocente';
import GestionInvitaciones from './pages/GestionInvitaciones';
import RegistroAlumnos from './pages/RegistroAlumnos';
import MonitorAlumnos from './pages/MonitorAlumnos';
import CatalogoCursos from './pages/CatalogoCursos';

function App() {
  // 🚩 SINCRONIZACIÓN: Recuperamos los datos del LocalStorage para que la sesión sea persistente
  const [usuario, setUsuario] = useState({
    rol: localStorage.getItem('userRole') || '', 
    nombre: localStorage.getItem('userName') || '',
    rfc: localStorage.getItem('userRFC') || ''
  });

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: '#f8f9fa' }}>
      <Routes>
        {/* RUTA PÚBLICA (Login/Portal) */}
        <Route path="/" element={<Portal setUsuarioGlobal={setUsuario} />} />
        
        {/* ARQUITECTO TÉCNICO (Herramienta de desarrollo) */}
        <Route path="/arquitecto-tecnico" element={<ArquitectoProfesional />} />

        {/* ALUMNOS (Inscripción pública fuera del sistema privado) */}
        <Route path="/inscripcion-curso/:cursoId/:nombreCurso" element={
          <div style={{ padding: '40px', minHeight: '100vh', background: '#f0f4f8', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <RegistroAlumnos />
          </div>
        } />

        {/* 🔐 SISTEMA PRIVADO (Envuelto en ProtectedRoute para seguridad) */}
        <Route path="/*" element={
          <ProtectedRoute>
            <div style={{ display: 'flex' }}>
              {/* Sidebar recibe el usuario para mostrar el nombre y rol en el menú */}
              <Sidebar usuario={usuario} />

              <main style={{ marginLeft: '280px', padding: '40px', minHeight: '100vh', flex: 1 }}>
                <Routes>
                  {/* RUTAS PARA ADMINISTRADORES */}
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/monitor" element={<MonitorAdmin />} />
                  <Route path="/monitor-alumnos" element={<MonitorAlumnos />} />
                  <Route path="/crear-curso" element={<CrearCurso />} />
                  <Route path="/catalogo-cursos" element={<CatalogoCursos />} />
                  <Route path="/registro" element={<RegistroDocente />} />
                  <Route path="/gestionar-invitaciones" element={<GestionInvitaciones />} />

                  {/* RUTAS PARA DOCENTES */}
                  <Route path="/buzon" element={<BuzonDocente rfc={usuario.rfc} />} />
                  
                  {/* 🚩 CORRECCIÓN AQUÍ: Ahora le pasamos el objeto 'usuario' completo */}
                  <Route path="/carga" element={<CargaAcademica usuario={usuario} />} />
                  
                  {/* Redirección automática si la ruta no existe */}
                  <Route path="*" element={<Navigate to="/" />} />
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