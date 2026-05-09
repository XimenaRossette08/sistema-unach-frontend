import React, { useState } from 'react';
import axios from 'axios';

export default function RegistroDocente() {
  const [docente, setDocente] = useState({
    rfc: '', nombre: '', descripcion: '',
    direccion: '', codigo_postal: '', banco: '', ine_folio: '', situacion_fiscal: 'Activo'
  });

  const [archivoINE, setArchivoINE] = useState(null);
  const [archivoCSF, setArchivoCSF] = useState(null);

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === 'ine_folio') {
      value = value.replace(/\D/g, '');
    }

    if (name === 'rfc') {
      value = value.toUpperCase().replace(/[^A-Z0-9Ñ]/g, '');
    }

    setDocente({ ...docente, [name]: value });
  };

  const handleFileINE = (e) => { setArchivoINE(e.target.files[0]); };
  const handleFileCSF = (e) => { setArchivoCSF(e.target.files[0]); };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!archivoINE || !archivoCSF) {
      alert("⚠️ Por favor, adjunta los archivos físicos del INE y la Constancia de Situación Fiscal.");
      return;
    }

    if (docente.ine_folio.length !== 13) {
      alert("⚠️ El folio del INE debe tener exactamente 13 números.");
      return;
    }

    if (docente.rfc.length !== 13) {
      alert("⚠️ El RFC debe tener exactamente 13 caracteres.");
      return;
    }

    const formData = new FormData();
    formData.append("rfc",              docente.rfc);
    formData.append("nombre",           docente.nombre);
    formData.append("descripcion",      docente.descripcion);
    formData.append("direccion",        docente.direccion);
    formData.append("codigo_postal",    docente.codigo_postal);
    formData.append("banco",            docente.banco);
    formData.append("ine_folio",        docente.ine_folio);
    formData.append("situacion_fiscal", docente.situacion_fiscal);
    formData.append("ine_archivo",      archivoINE);
    formData.append("csf_archivo",      archivoCSF);

    // 🔐 Token JWT para autenticación
    const token = localStorage.getItem('token');

    try {
      await axios.post('https://siae-unach.duckdns.org/api/registro-docente', formData, {
        headers: {
          'Content-Type':  'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        }
      });

      alert("✅ Docente y archivos registrados correctamente.");

      setDocente({
        rfc: '', nombre: '', descripcion: '', direccion: '',
        codigo_postal: '', banco: '', ine_folio: '', situacion_fiscal: 'Activo'
      });
      document.getElementById('file-ine').value = '';
      document.getElementById('file-csf').value = '';
      setArchivoINE(null);
      setArchivoCSF(null);

    } catch (err) {
      const msg = err.response?.data?.detail || "Error al registrar al docente o faltan documentos.";
      alert(`❌ ${msg}`);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderTop: '5px solid #003366' }}>
      <h2 style={{ color: '#003366', marginBottom: '20px' }}>📝 Registro Oficial de Docentes</h2>
      <p style={{ color: '#666', marginBottom: '30px' }}>Complete el expediente del docente y cargue sus documentos probatorios.</p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        <div style={{ gridColumn: 'span 2' }}>
          <label style={labelStyle}>Nombre Completo:</label>
          <input name="nombre" value={docente.nombre} onChange={handleChange} required style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>RFC (13 caracteres):</label>
          <input
            name="rfc"
            placeholder="Ej. EAGRO12345XR1"
            value={docente.rfc}
            onChange={handleChange}
            maxLength="13"
            minLength="13"
            required
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Nombre del Banco:</label>
          <input name="banco" placeholder="Ej. BBVA, Santander" value={docente.banco} onChange={handleChange} required style={inputStyle} />
        </div>

        <div style={{ gridColumn: 'span 2' }}>
          <label style={labelStyle}>Dirección Completa:</label>
          <input name="direccion" value={docente.direccion} onChange={handleChange} required style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Código Postal:</label>
          <input name="codigo_postal" value={docente.codigo_postal} onChange={handleChange} required style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Descripción del curso a impartir:</label>
          <input name="descripcion" placeholder="Ej. Matemáticas empleadas" value={docente.descripcion} onChange={handleChange} required style={inputStyle} />
        </div>

        <div style={{ gridColumn: 'span 2', background: '#f4f7f9', padding: '20px', borderRadius: '8px', marginTop: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#003366' }}>📎 Documentación Requerida</h4>
          </div>

          <div>
            <label style={labelStyle}>Folio del INE (13 dígitos):</label>
            <input
              type="text"
              name="ine_folio"
              placeholder="Ej. 1234567890123"
              value={docente.ine_folio}
              onChange={handleChange}
              maxLength="13"
              minLength="13"
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Estado de Situación Fiscal:</label>
            <select name="situacion_fiscal" value={docente.situacion_fiscal} onChange={handleChange} style={inputStyle}>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Subir Escaneo INE (PDF o JPG):</label>
            <input id="file-ine" type="file" onChange={handleFileINE} accept=".pdf,.jpg,.png" required style={fileStyle} />
          </div>

          <div>
            <label style={labelStyle}>Subir Constancia Fiscal (PDF):</label>
            <input id="file-csf" type="file" onChange={handleFileCSF} accept=".pdf" required style={fileStyle} />
          </div>
        </div>

        <button type="submit" style={{ gridColumn: 'span 2', background: '#003366', color: 'white', padding: '15px', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', marginTop: '10px' }}>
          Guardar Expediente Docente
        </button>

      </form>
    </div>
  );
}

const labelStyle = { display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#444', fontSize: '0.9rem' };
const inputStyle  = { width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box' };
const fileStyle   = { width: '100%', padding: '10px', background: 'white', border: '1px dashed #ccc', borderRadius: '6px' };
