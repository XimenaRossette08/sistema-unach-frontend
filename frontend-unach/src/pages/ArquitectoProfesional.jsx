import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ArquitectoProfesional() {
  const [codigo, setCodigo] = useState(
    'CREATE DATABASE unach_db;\n\nCREATE TABLE alumnos (\n    id SERIAL PRIMARY KEY,\n    nombre TEXT,\n    correo TEXT\n);'
  );
  const [consola, setConsola] = useState([]);
  const navigate = useNavigate();

  // --- 🎓 1. ANALIZADOR LÉXICO ---
  const analizadorLexico = (input) => {
    const palabrasReservadas = [
      'CREATE', 'DROP', 'ALTER', 'ADD', 'COLUMN',
      'TABLE', 'DATABASE', 'INT', 'VARCHAR', 'TEXT',
      'PRIMARY', 'KEY', 'SERIAL', 'BOOLEAN', 'FLOAT',
      'IF', 'EXISTS', 'NOT', 'NULL', 'DEFAULT'
    ];
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

  // --- 🎓 2. ANALIZADOR SINTÁCTICO ---
  const analizadorSintactico = (comandos) => {
    for (let cmd of comandos) {
      const { tokens } = cmd;
      const verbo  = tokens[0];
      const objeto = tokens[1];

      // Verbos válidos
      if (!['CREATE', 'DROP', 'ALTER'].includes(verbo)) {
        return `Error Sintáctico: Verbo '${verbo}' no reconocido. Use CREATE, DROP o ALTER.`;
      }

      // Objetos válidos
      if (!['TABLE', 'DATABASE'].includes(objeto)) {
        return `Error Sintáctico: Se esperaba TABLE o DATABASE, no '${objeto}'.`;
      }

      // Reglas por verbo
      if (verbo === 'CREATE') {
        if (objeto === 'TABLE') {
          if (!tokens.includes('(')) return `Error Sintáctico en Tabla '${tokens[2]}': Faltan paréntesis de atributos.`;
          if (tokens[tokens.length - 1] !== ')') return `Error Sintáctico en Tabla '${tokens[2]}': Debe cerrar con ')'.`;
        }
        if (objeto === 'DATABASE' && tokens.length > 3) {
          return "Error Sintáctico: DATABASE no puede tener atributos o paréntesis.";
        }
      }

      if (verbo === 'DROP') {
        if (tokens.length < 3) return "Error Sintáctico: DROP requiere DROP [TABLE|DATABASE] [nombre].";
        if (tokens.includes('(')) return "Error Sintáctico: DROP no acepta paréntesis.";
      }

      if (verbo === 'ALTER') {
        if (objeto !== 'TABLE') return "Error Sintáctico: ALTER solo puede usarse con TABLE.";
        const upper = tokens.join(' ');
        if (!upper.includes('ADD') && !upper.includes('DROP')) {
          return "Error Sintáctico: ALTER TABLE requiere ADD COLUMN o DROP COLUMN.";
        }
        if (upper.includes('ADD') && !upper.includes('COLUMN')) {
          return "Error Sintáctico: ALTER TABLE ADD requiere la palabra COLUMN.";
        }
      }
    }
    return null;
  };

  // --- 🎓 3. ANALIZADOR SEMÁNTICO ---
  const analizadorSemantico = (comandos) => {
    const basesProtegidas = ['DB_CURSOS', 'DB_DOCENTES', 'DB_ALUMNOS', 'POSTGRES'];

    for (let cmd of comandos) {
      const { tokens, raw } = cmd;
      const verbo  = tokens[0];
      const objeto = tokens[1];
      const nombre = tokens[2]?.replace(';', '').toUpperCase();

      // Proteger bases de datos del sistema
      if (verbo === 'DROP' && objeto === 'DATABASE') {
        if (basesProtegidas.includes(nombre)) {
          return `Error Semántico: La base de datos '${nombre}' es del sistema y no puede eliminarse.`;
        }
      }

      // Validar atributos duplicados en CREATE TABLE
      if (verbo === 'CREATE' && objeto === 'TABLE') {
        const match = raw.match(/\(([^)]+)\)/);
        if (!match) return "Error Semántico: Definición de atributos vacía.";
        const camposRaw    = match[1].split(',');
        const nombresCol   = camposRaw.map(c => c.trim().split(/\s+/)[0].toLowerCase());
        const duplicados   = nombresCol.filter((item, idx) => nombresCol.indexOf(item) !== idx);
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

    // Ejecución en microservicio Go
    setConsola(prev => [...prev, "📡 Enviando órdenes al Microservicio DDL..."]);

    const lineas = codigo.split(';').filter(l => l.trim() !== "");
    const token  = localStorage.getItem('token');

    for (let sql of lineas) {
      try {
        const res = await axios.post(
          'http://localhost:8002/api/ejecutar-ddl',
          { sql: sql.trim() + ";" },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setConsola(prev => [...prev, `💎 ${res.data.mensaje}`]);
      } catch (e) {
        setConsola(prev => [...prev, `❌ ERROR: ${e.response?.data?.detail || "Fallo de conexión"}`]);
        break;
      }
    }
  };

  return (
    <div style={containerStyle}>
      <div style={navBarTop}>
        <button onClick={() => navigate('/')} style={btnRegreso}>🏠 Panel de Control</button>
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

// Estilos
const containerStyle  = { minHeight: '100vh', background: '#001a33', padding: '30px', fontFamily: 'monospace' };
const navBarTop       = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid rgba(192, 160, 96, 0.3)', paddingBottom: '15px' };
const btnRegreso      = { background: 'transparent', color: '#C0A060', border: '1px solid #C0A060', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const badgeStyle      = { background: '#C0A060', color: '#00264d', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.8rem' };
const headerStyle     = { textAlign: 'center', marginBottom: '40px' };
const titleStyle      = { color: '#C0A060', fontSize: '2.5rem', margin: 0, letterSpacing: '2px' };
const subtitleStyle   = { color: 'white', opacity: 0.6, fontSize: '1rem' };
const mainGrid        = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', maxWidth: '1400px', margin: '0 auto' };
const editorSection   = { display: 'flex', flexDirection: 'column' };
const consoleSection  = { display: 'flex', flexDirection: 'column' };
const labelContainer  = { display: 'flex', alignItems: 'center', gap: '10px', color: 'white', marginBottom: '10px' };
const dotRed          = { width: '10px', height: '10px', background: '#ff4d4d', borderRadius: '50%' };
const dotGreen        = { width: '10px', height: '10px', background: '#00ff00', borderRadius: '50%' };
const textareaStyle   = { width: '100%', height: '400px', background: '#0d0d0d', color: '#fff', padding: '20px', borderRadius: '12px', fontSize: '1.1rem', border: '1px solid #333', outline: 'none', resize: 'none' };
const btnCompilar     = { marginTop: '20px', padding: '18px', background: '#C0A060', color: '#00264d', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' };
const consoleBox      = { height: '400px', background: '#000', borderRadius: '12px', padding: '20px', color: '#00ff00', overflowY: 'auto', border: '1px solid #333' };
const lineaStyle      = { margin: '8px 0', fontSize: '1rem' };
