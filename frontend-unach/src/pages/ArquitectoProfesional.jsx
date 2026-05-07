import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ArquitectoProfesional() {
  const [codigo, setCodigo] = useState('CREATE DATABASE unach_db;\n\nCREATE TABLE alumnos (\n    id SERIAL PRIMARY KEY,\n    nombre TEXT,\n    correo TEXT\n);');
  const [consola, setConsola] = useState([]);
  const navigate = useNavigate();

  // --- 🎓 1. ANALIZADOR LÉXICO (Reconoce palabras y símbolos) ---
  const analizadorLexico = (input) => {
    const palabrasReservadas = ['CREATE', 'TABLE', 'DATABASE', 'INT', 'VARCHAR', 'TEXT', 'PRIMARY', 'KEY', 'SERIAL'];
    const simbolos = ['(', ')', ',', ';'];
    
    const lineas = input.split(';').filter(l => l.trim() !== "");
    let comandosTokens = [];

    for (let linea of lineas) {
      const tokens = linea.toUpperCase()
        .replace(/\(/g, ' ( ')
        .replace(/\)/g, ' ) ')
        .replace(/,/g, ' , ')
        .split(/\s+/)
        .filter(t => t.trim() !== "");
      
      for (let token of tokens) {
        const esIdentificador = /^[A-Z_][A-Z0-9_]*$/.test(token);
        const esValido = palabrasReservadas.includes(token) || simbolos.includes(token) || esIdentificador || !isNaN(token);
        
        if (!esValido) return { error: `Error Léxico: Token no reconocido -> "${token}"` };
      }
      comandosTokens.push({ tokens, raw: linea });
    }
    return { comandos: comandosTokens };
  };

  // --- 🎓 2. ANALIZADOR SINTÁCTICO (Revisa el orden y la estructura) ---
  const analizadorSintactico = (comandos) => {
    for (let cmd of comandos) {
      const { tokens } = cmd;
      if (tokens[0] !== 'CREATE') return "Error Sintáctico: Toda sentencia debe iniciar con 'CREATE'.";
      if (tokens[1] !== 'TABLE' && tokens[1] !== 'DATABASE') return "Error Sintáctico: Se esperaba 'TABLE' o 'DATABASE'.";
      
      if (tokens[1] === 'TABLE') {
        if (!tokens.includes('(')) return `Error Sintáctico en Tabla '${tokens[2]}': Faltan los paréntesis de atributos.`;
        if (tokens[tokens.length - 1] !== ')') return `Error Sintáctico en Tabla '${tokens[2]}': La sentencia debe cerrar con ')'.`;
      }

      if (tokens[1] === 'DATABASE') {
        if (tokens.length > 3) return "Error Sintáctico: Una Base de Datos no puede tener atributos o paréntesis.";
      }
    }
    return null;
  };

  // --- 🎓 3. ANALIZADOR SEMÁNTICO (Revisa la coherencia y lógica) ---
  const analizadorSemantico = (comandos) => {
    for (let cmd of comandos) {
      const { tokens, raw } = cmd;

      if (tokens[1] === 'TABLE') {
        // Extraemos lo que está dentro de los paréntesis para revisar columnas
        const match = raw.match(/\(([^)]+)\)/);
        if (!match) return "Error Semántico: Definición de atributos vacía.";

        const camposRaw = match[1].split(',');
        const nombresColumnas = camposRaw.map(c => c.trim().split(/\s+/)[0].toLowerCase());

        // 🚩 REGLA SEMÁNTICA: No permitir nombres de atributos duplicados
        const duplicados = nombresColumnas.filter((item, index) => nombresColumnas.indexOf(item) !== index);
        if (duplicados.length > 0) {
          return `Error Semántico en Tabla '${tokens[2]}': El atributo '${duplicados[0]}' ya existe.`;
        }
      }
    }
    return null;
  };

  // --- 🚀 PROCESO DE COMPILACIÓN ---
  const compilarYEjecutar = async () => {
    setConsola(["⏳ Iniciando proceso de compilación integral..."]);

    // Fase 1: Léxico
    const resLexico = analizadorLexico(codigo);
    if (resLexico.error) return setConsola(prev => [...prev, `❌ ${resLexico.error}`]);
    setConsola(prev => [...prev, "✅ Fase 1: Análisis Léxico Terminado (Tokens OK)."]);

    // Fase 2: Sintáctico
    const errorSintactico = analizadorSintactico(resLexico.comandos);
    if (errorSintactico) return setConsola(prev => [...prev, `❌ ${errorSintactico}`]);
    setConsola(prev => [...prev, "✅ Fase 2: Análisis Sintáctico Terminado (Estructura OK)."]);

    // Fase 3: Semántico
    const errorSemantico = analizadorSemantico(resLexico.comandos);
    if (errorSemantico) return setConsola(prev => [...prev, `❌ ${errorSemantico}`]);
    setConsola(prev => [...prev, "✅ Fase 3: Análisis Semántico Terminado (Lógica OK)."]);

    // EJECUCIÓN FINAL EN MICROSERVICIO
    setConsola(prev => [...prev, "📡 Enviando órdenes al Microservicio de Cursos..."]);
    
    const lineas = codigo.split(';').filter(l => l.trim() !== "");
    const token = localStorage.getItem('token');

    for (let sql of lineas) {
      try {
        const res = await axios.post('http://localhost:8002/api/ejecutar-ddl', 
          { sql: sql.trim() + ";" },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setConsola(prev => [...prev, `💎 ${res.data.mensaje}`]);
      } catch (e) {
        setConsola(prev => [...prev, `❌ ERROR: ${e.response?.data || "Fallo de conexión"}`]);
        break;
      }
    }
  };

  return (
    <div style={containerStyle}>
      <div style={navBarTop}>
        <button onClick={() => navigate('/admin')} style={btnRegreso}>🏠 Panel de Control</button>
        <div style={badgeStyle}>COMPILADORES & TALLER DE BD IV</div>
      </div>

      <div style={headerStyle}>
        <h1 style={titleStyle}>🏗️ Arquitecto DDL Integral</h1>
        <p style={subtitleStyle}>Creación Automatizada de Bases de Datos, Tablas y Atributos</p>
      </div>

      <div style={mainGrid}>
        <div style={editorSection}>
          <div style={labelContainer}><span style={dotRed}></span> Editor de Código Fuente</div>
          <textarea 
            style={textareaStyle} 
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
          />
          <button onClick={compilarYEjecutar} style={btnCompilar}>CONSTRUIR ESTRUCTURA ⚡</button>
        </div>

        <div style={consoleSection}>
          <div style={labelContainer}><span style={dotGreen}></span> Consola del Compilador</div>
          <div style={consoleBox}>
            {consola.map((linea, i) => <p key={i} style={lineaStyle}>{linea}</p>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// Estilos (Gold & Dark)
const containerStyle = { minHeight: '100vh', background: '#001a33', padding: '30px', fontFamily: 'monospace' };
const navBarTop = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid rgba(192, 160, 96, 0.3)', paddingBottom: '15px' };
const btnRegreso = { background: 'transparent', color: '#C0A060', border: '1px solid #C0A060', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const badgeStyle = { background: '#C0A060', color: '#00264d', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.8rem' };
const headerStyle = { textAlign: 'center', marginBottom: '40px' };
const titleStyle = { color: '#C0A060', fontSize: '2.5rem', margin: 0, letterSpacing: '2px' };
const subtitleStyle = { color: 'white', opacity: 0.6, fontSize: '1rem' };
const mainGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', maxWidth: '1400px', margin: '0 auto' };
const editorSection = { display: 'flex', flexDirection: 'column' };
const consoleSection = { display: 'flex', flexDirection: 'column' };
const labelContainer = { display: 'flex', alignItems: 'center', gap: '10px', color: 'white', marginBottom: '10px' };
const dotRed = { width: '10px', height: '10px', background: '#ff4d4d', borderRadius: '50%' };
const dotGreen = { width: '10px', height: '10px', background: '#00ff00', borderRadius: '50%' };
const textareaStyle = { width: '100%', height: '400px', background: '#0d0d0d', color: '#fff', padding: '20px', borderRadius: '12px', fontSize: '1.1rem', border: '1px solid #333', outline: 'none', resize: 'none' };
const btnCompilar = { marginTop: '20px', padding: '18px', background: '#C0A060', color: '#00264d', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' };
const consoleBox = { height: '400px', background: '#000', borderRadius: '12px', padding: '20px', color: '#00ff00', overflowY: 'auto', border: '1px solid #333' };
const lineaStyle = { margin: '8px 0', fontSize: '1rem' };
