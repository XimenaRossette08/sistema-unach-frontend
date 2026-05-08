package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os" // <- IMPORTANTE: Añadido para leer variables de entorno
	"regexp"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	_ "github.com/lib/pq"
)

var db *sql.DB
var secretKey = []byte("SIAE_UNACH_SECRET_KEY_2026")

type DDLRequest struct {
	SQL string `json:"sql"`
}

type DDLResponse struct {
	Mensaje string `json:"mensaje"`
}

// ══════════════════════════════════════════════════════════
//  VALIDACIÓN JWT
// ══════════════════════════════════════════════════════════

func validarJWT(tokenString string) bool {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("método de firma inesperado")
		}
		return secretKey, nil
	})
	return err == nil && token.Valid
}

// ══════════════════════════════════════════════════════════
//  1. ANALIZADOR LÉXICO
//  Reconoce: CREATE, DROP, ALTER
// ══════════════════════════════════════════════════════════

func analizadorLexico(input string) (string, string, string, error) {
	tokens := strings.Fields(strings.TrimSpace(input))

	if len(tokens) < 3 {
		return "", "", "", fmt.Errorf(
			"ERROR LEXICO: Sentencia incompleta. Se esperaba '[VERBO] [OBJETO] [NOMBRE]'")
	}

	verbo := strings.ToUpper(tokens[0])
	objeto := strings.ToUpper(tokens[1])
	nombre := strings.TrimSuffix(strings.TrimSuffix(tokens[2], ";"), "(")

	verbosValidos := map[string]bool{
		"CREATE": true,
		"DROP":   true,
		"ALTER":  true,
	}

	if !verbosValidos[verbo] {
		return "", "", "", fmt.Errorf(
			"ERROR LEXICO: Token inesperado '%s'. Use CREATE, DROP o ALTER", verbo)
	}

	objetosValidos := map[string]bool{
		"DATABASE": true,
		"TABLE":    true,
	}

	if !objetosValidos[objeto] {
		return "", "", "", fmt.Errorf(
			"ERROR LEXICO: Objeto '%s' no reconocido. Use DATABASE o TABLE", objeto)
	}

	return verbo, objeto, nombre, nil
}

// ══════════════════════════════════════════════════════════
//  2. ANALIZADOR SINTÁCTICO
//  Valida estructura según verbo y objeto
// ══════════════════════════════════════════════════════════

func analizadorSintactico(verbo, objeto, nombre, input string) error {
	validarNombre := regexp.MustCompile(`^[a-zA-Z_][a-zA-Z0-9_]*$`)
	if !validarNombre.MatchString(nombre) {
		return fmt.Errorf(
			"ERROR SINTACTICO: '%s' no es un nombre válido para un objeto de base de datos", nombre)
	}

	switch verbo {
	case "CREATE":
		if objeto == "DATABASE" && strings.Contains(input, "(") {
			return fmt.Errorf("ERROR SINTACTICO: DATABASE no puede tener atributos")
		}
		if objeto == "TABLE" {
			if !strings.Contains(input, "(") || !strings.Contains(input, ")") {
				return fmt.Errorf("ERROR SINTACTICO: TABLE '%s' debe tener atributos entre paréntesis", nombre)
			}
		}

	case "DROP":
		tokens := strings.Fields(input)
		if len(tokens) < 3 {
			return fmt.Errorf("ERROR SINTACTICO: DROP requiere 'DROP [TABLE|DATABASE] [nombre]'")
		}
		if strings.Contains(input, "(") {
			return fmt.Errorf("ERROR SINTACTICO: DROP no acepta paréntesis")
		}

	case "ALTER":
		upper := strings.ToUpper(input)
		if !strings.Contains(upper, "ADD") && !strings.Contains(upper, "DROP COLUMN") {
			return fmt.Errorf("ERROR SINTACTICO: ALTER TABLE requiere ADD o DROP COLUMN")
		}
		if strings.Contains(upper, "ADD") && !strings.Contains(upper, "COLUMN") {
			return fmt.Errorf("ERROR SINTACTICO: ALTER TABLE ADD requiere la palabra COLUMN")
		}
	}

	return nil
}

// ══════════════════════════════════════════════════════════
//  3. ANALIZADOR SEMÁNTICO
//  Verifica nombres reservados y coherencia
// ══════════════════════════════════════════════════════════

func analizadorSemantico(verbo, objeto, nombre, input string) error {
	reservados := []string{"SISTEMA", "ROOT", "ADMIN", "SIAE", "POSTGRES", "CONFIG"}
	for _, r := range reservados {
		if strings.ToUpper(nombre) == r {
			return fmt.Errorf(
				"ERROR SEMANTICO: El nombre '%s' está reservado y no puede utilizarse", nombre)
		}
	}

	if verbo == "CREATE" && objeto == "TABLE" {
		re := regexp.MustCompile(`\(([^)]+)\)`)
		match := re.FindStringSubmatch(input)
		if match != nil {
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
						"ERROR SEMANTICO: El atributo '%s' está duplicado en la tabla '%s'", col, nombre)
				}
				vistos[col] = true
			}
		}
	}

	if verbo == "DROP" && objeto == "DATABASE" {
		if strings.ToUpper(nombre) == "DB_CURSOS" ||
			strings.ToUpper(nombre) == "DB_DOCENTES" ||
			strings.ToUpper(nombre) == "DB_ALUMNOS" {
			return fmt.Errorf(
				"ERROR SEMANTICO: La base de datos '%s' es del sistema y no puede eliminarse", nombre)
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

	// — Validar JWT —
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
		http.Error(w, `{"detail":"Token no encontrado"}`, http.StatusUnauthorized)
		return
	}
	if !validarJWT(strings.TrimPrefix(authHeader, "Bearer ")) {
		http.Error(w, `{"detail":"Sesion invalida o expirada"}`, http.StatusUnauthorized)
		return
	}

	var req DDLRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"detail":"JSON invalido"}`, http.StatusBadRequest)
		return
	}

	input := strings.TrimSpace(req.SQL)

	// — Fase 1: Léxico —
	verbo, objeto, nombre, err := analizadorLexico(input)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"detail":"%s"}`, err.Error()), http.StatusBadRequest)
		return
	}
	log.Printf("✅ Lexico OK  | verbo=%s objeto=%s nombre=%s", verbo, objeto, nombre)

	// — Fase 2: Sintáctico —
	if err := analizadorSintactico(verbo, objeto, nombre, input); err != nil {
		http.Error(w, fmt.Sprintf(`{"detail":"%s"}`, err.Error()), http.StatusBadRequest)
		return
	}
	log.Println("✅ Sintactico OK")

	// — Fase 3: Semántico —
	if err := analizadorSemantico(verbo, objeto, nombre, input); err != nil {
		http.Error(w, fmt.Sprintf(`{"detail":"%s"}`, err.Error()), http.StatusForbidden)
		return
	}
	log.Println("✅ Semantico OK")

	// — Ejecución en PostgreSQL —
	if _, err := db.Exec(req.SQL); err != nil {
		http.Error(w, fmt.Sprintf(`{"detail":"ERROR DE MOTOR: %s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	log.Printf("💎 DDL ejecutado: %s %s %s", verbo, objeto, nombre)
	json.NewEncoder(w).Encode(DDLResponse{
		Mensaje: fmt.Sprintf("Compilacion exitosa: %s %s '%s' ejecutado correctamente", verbo, objeto, nombre),
	})
}

func main() {
	var err error

	// IMPORTANTE: Leemos la URL de la base de datos desde las variables de entorno
	dbUrl := os.Getenv("DATABASE_URL")
	if dbUrl == "" {
		// Fallback para cuando desarrollas en tu PC sin Docker
		dbUrl = "postgres://postgres:102538@localhost:5433/db_cursos?sslmode=disable"
	}

	db, err = sql.Open("postgres", dbUrl)
	if err != nil {
		log.Fatalf("Error conectando a PostgreSQL: %v", err)
	}
	defer db.Close()

	http.HandleFunc("/api/ejecutar-ddl", ejecutarDDL)

	// Ajustado para Docker: Escucha en 0.0.0.0
	fmt.Println("🏗️  ArquitectoDDL Go corriendo en http://0.0.0.0:8090")
	fmt.Println("📐 Operaciones: CREATE | DROP | ALTER")
	fmt.Println("🔍 Analizadores: Lexico | Sintactico | Semantico")
	fmt.Println("🔐 JWT validacion activa")

	// Ajustado para Docker: :8090 permite tráfico desde fuera del contenedor
	log.Fatal(http.ListenAndServe(":8090", nil))
}
