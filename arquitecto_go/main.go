package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"regexp"
	"strings"

	_ "github.com/lib/pq"
)

var db *sql.DB

// ══════════════════════════════════════════════════════════
//  MODELOS
// ══════════════════════════════════════════════════════════

type DDLRequest struct {
	SQL string `json:"sql"`
}

type DDLResponse struct {
	Mensaje string `json:"mensaje"`
}

// ══════════════════════════════════════════════════════════
//  1. ANALIZADOR LÉXICO
//  Verifica que el primer token sea CREATE y el objeto sea
//  DATABASE o TABLE. Rechaza cualquier token desconocido.
// ══════════════════════════════════════════════════════════

func analizadorLexico(input string) (string, string, string, error) {
	tokens := strings.Fields(strings.TrimSpace(input))

	if len(tokens) < 3 {
		return "", "", "", fmt.Errorf(
			"ERROR LEXICO: Sentencia incompleta. Se esperaba 'CREATE [OBJETO] [NOMBRE]'")
	}

	verbo  := strings.ToUpper(tokens[0])
	objeto := strings.ToUpper(tokens[1])
	nombre := strings.TrimSuffix(strings.TrimSuffix(tokens[2], ";"), "(")

	if verbo != "CREATE" {
		return "", "", "", fmt.Errorf(
			"ERROR LEXICO: Token inesperado '%s'. Se esperaba 'CREATE'", verbo)
	}

	if objeto != "DATABASE" && objeto != "TABLE" {
		return "", "", "", fmt.Errorf(
			"ERROR LEXICO: Objeto '%s' no reconocido. Use 'DATABASE' o 'TABLE'", objeto)
	}

	return verbo, objeto, nombre, nil
}

// ══════════════════════════════════════════════════════════
//  2. ANALIZADOR SINTÁCTICO
//  Valida estructura: nombre válido, paréntesis en TABLE,
//  sin paréntesis en DATABASE.
// ══════════════════════════════════════════════════════════

func analizadorSintactico(objeto, nombre, input string) error {
	validarNombre := regexp.MustCompile(`^[a-zA-Z_][a-zA-Z0-9_]*$`)
	if !validarNombre.MatchString(nombre) {
		return fmt.Errorf(
			"ERROR SINTACTICO: '%s' no es un nombre válido para un objeto de base de datos", nombre)
	}

	if objeto == "DATABASE" && strings.Contains(input, "(") {
		return fmt.Errorf(
			"ERROR SINTACTICO: Una Base de Datos no puede contener definicion de atributos")
	}

	if objeto == "TABLE" {
		if !strings.Contains(input, "(") || !strings.Contains(input, ")") {
			return fmt.Errorf(
				"ERROR SINTACTICO: La tabla '%s' debe incluir atributos entre parentesis", nombre)
		}
	}

	return nil
}

// ══════════════════════════════════════════════════════════
//  3. ANALIZADOR SEMÁNTICO
//  Verifica nombres reservados y coherencia de atributos.
// ══════════════════════════════════════════════════════════

func analizadorSemantico(objeto, nombre, input string) error {
	reservados := []string{"SISTEMA", "ROOT", "ADMIN", "SIAE", "POSTGRES", "CONFIG"}
	for _, r := range reservados {
		if strings.ToUpper(nombre) == r {
			return fmt.Errorf(
				"ERROR SEMANTICO: El nombre '%s' está reservado y no puede utilizarse", nombre)
		}
	}

	if objeto == "TABLE" {
		re := regexp.MustCompile(`\(([^)]+)\)`)
		match := re.FindStringSubmatch(input)
		if match == nil {
			return fmt.Errorf("ERROR SEMANTICO: Definicion de atributos vacia en tabla '%s'", nombre)
		}

		campos := strings.Split(match[1], ",")
		vistos := map[string]bool{}
		for _, campo := range campos {
			partes := strings.Fields(strings.TrimSpace(campo))
			if len(partes) == 0 {
				continue
			}
			col := strings.ToLower(partes[0])
			if vistos[col] {
				return fmt.Errorf(
					"ERROR SEMANTICO: El atributo '%s' esta duplicado en la tabla '%s'", col, nombre)
			}
			vistos[col] = true
		}
	}

	return nil
}

// ══════════════════════════════════════════════════════════
//  HANDLER PRINCIPAL
// ══════════════════════════════════════════════════════════

func ejecutarDDL(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	var req DDLRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"detail":"JSON invalido"}`, http.StatusBadRequest)
		return
	}

	input := strings.TrimSpace(req.SQL)

	// — Fase 1: Léxico —
	_, objeto, nombre, err := analizadorLexico(input)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"detail":"%s"}`, err.Error()), http.StatusBadRequest)
		return
	}
	log.Printf("✅ Lexico OK  | objeto=%s nombre=%s", objeto, nombre)

	// — Fase 2: Sintáctico —
	if err := analizadorSintactico(objeto, nombre, input); err != nil {
		http.Error(w, fmt.Sprintf(`{"detail":"%s"}`, err.Error()), http.StatusBadRequest)
		return
	}
	log.Println("✅ Sintactico OK")

	// — Fase 3: Semántico —
	if err := analizadorSemantico(objeto, nombre, input); err != nil {
		http.Error(w, fmt.Sprintf(`{"detail":"%s"}`, err.Error()), http.StatusForbidden)
		return
	}
	log.Println("✅ Semantico OK")

	// — Ejecución en PostgreSQL —
	if _, err := db.Exec(req.SQL); err != nil {
		http.Error(w, fmt.Sprintf(`{"detail":"ERROR DE MOTOR: %s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	log.Printf("💎 DDL ejecutado: %s %s", objeto, nombre)
	json.NewEncoder(w).Encode(DDLResponse{
		Mensaje: fmt.Sprintf("Compilacion exitosa: %s '%s' creado correctamente", objeto, nombre),
	})
}

func main() {
	var err error
	db, err = sql.Open("postgres",
		"postgres://postgres:102538@localhost:5433/db_cursos?sslmode=disable")
	if err != nil {
		log.Fatalf("Error conectando a PostgreSQL: %v", err)
	}
	defer db.Close()

	http.HandleFunc("/api/ejecutar-ddl", ejecutarDDL)

	fmt.Println("🏗️  ArquitectoDDL Go corriendo en http://localhost:8090")
	fmt.Println("📐 Analizadores: Lexico | Sintactico | Semantico")
	log.Fatal(http.ListenAndServe(":8090", nil))
}
