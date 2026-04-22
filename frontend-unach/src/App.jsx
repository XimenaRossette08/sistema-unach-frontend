import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Portal from './pages/Portal';
import AdminDashboard from './pages/AdminDashboard';
import MonitorAdmin from './pages/MonitorAdmin';
import GeneradorDDL from './pages/GeneradorDDL';
import CrearCurso from './pages/CrearCurso';
import BuzonDocente from './pages/BuzonDocente';
import CargaAcademica from './pages/CargaAcademica';
import RegistroDocente from './pages/RegistroDocente';

function App() {
  return (
    // 🚩 Agregamos width: '100%' al contenedor principal para que no quede el hueco negro
    <div style={{ minHeight: '100vh', width: '100%', background: '#f8f9fa' }}>
      <Routes>
        <Route path="/" element={<Portal />} />

        <Route path="/*" element={
          <>
            <Sidebar nombreMaestro="Luz Ximena Rossette" rol="admin" />

            {/* 🚩 CAMBIO: Quitamos width: '100%' y usamos flex: 1 */}
            <main style={{ 
              marginLeft: '280px', 
              padding: '40px', 
              minHeight: '100vh',
		display: 'block', // Asegura que se comporte como bloque
              width: 'auto'     // Se estira solito hasta el borde derecho 
            }}>
              <Routes>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/monitor" element={<MonitorAdmin />} />
                <Route path="/arquitecto" element={<GeneradorDDL />} />
                <Route path="/crear-curso" element={<CrearCurso />} />
                <Route path="/registro" element={<RegistroDocente />} />
                <Route path="/buzon" element={<BuzonDocente />} />
                <Route path="/carga" element={<CargaAcademica />} />
              </Routes>
            </main>
          </>
        } />
      </Routes>
    </div>
  );
}

export default App;
