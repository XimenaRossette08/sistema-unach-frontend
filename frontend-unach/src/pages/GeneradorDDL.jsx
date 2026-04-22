export default function GeneradorDDL() {
  return (
    <div style={containerStyle}>
      <h2 style={{ color: '#003366' }}>🛠️ Generador de Estructuras (DDL)</h2>
      <hr style={{ border: '1px solid #C0A060', marginBottom: '20px' }} />
      
      <label style={labelStyle}>Nombre de la Tabla:</label>
      <input type="text" placeholder="ej. docentes" style={inputStyle} />
      
      <label style={labelStyle}>Definición de Columnas (Simulado):</label>
      <textarea 
        placeholder="id SERIAL PRIMARY KEY, nombre VARCHAR(100), rfc VARCHAR(13)" 
        style={{ ...inputStyle, height: '100px', resize: 'none' }} 
      />
      
      <button style={btnAction}>Analizar y Crear Tabla</button>
    </div>
  );
}

const containerStyle = { background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' };
const labelStyle = { display: 'block', fontWeight: 'bold', marginTop: '15px', marginBottom: '5px' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px' };
const btnAction = { background: '#003366', color: 'white', padding: '12px 30px', border: 'none', borderRadius: '8px', marginTop: '25px', cursor: 'pointer', fontWeight: 'bold' };
