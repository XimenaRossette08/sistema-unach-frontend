package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	_ "github.com/lib/pq"
	"github.com/streadway/amqp"
)

// --- ESTRUCTURAS ---

type Docente struct {
	ID          int    `json:"id"`
	RFC         string `json:"rfc"`
	Nombre      string `json:"nombre"`
	Direccion   string `json:"direccion"`
	CP          string `json:"cp"`
	Banco       string `json:"banco"`
	Situacion   string `json:"situacion"`
	INE         string `json:"ine"`
	Descripcion string `json:"descripcion"`
}

// 🚩 Nueva estructura para los cursos
type Curso struct {
	Nombre    string `json:"nombre"`
	Tipo      string `json:"tipo"`
	Modalidad string `json:"modalidad"`
	Objetivo  string `json:"objetivo"`
	Contenido string `json:"contenido"`
	Duracion  string `json:"duracion"`
	Horario   string `json:"horario"`
}

// --- MIDDLEWARE DE CORS ---
func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// --- RABBITMQ ---
func enviarARabbit(msg string) {
	conn, err := amqp.Dial("amqp://guest:guest@localhost:5672/")
	if err != nil { return }
	defer conn.Close()
	ch, _ := conn.Channel()
	defer ch.Close()
	q, _ := ch.QueueDeclare("unach_queue", false, false, false, false, nil)
	ch.Publish("", q.Name, false, false, amqp.Publishing{ContentType: "text/plain", Body: []byte(msg)})
}

func main() {
	mux := http.NewServeMux()

	// 1. API: REGISTRO DE DOCENTE
	mux.HandleFunc("/api/registro-docente", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost { return }
		var d Docente
		json.NewDecoder(r.Body).Decode(&d)
		sqlQuery := fmt.Sprintf(
			"INSERT INTO docentes (rfc, nombre, direccion, cp, banco, situacion, ine, descripcion_curso) VALUES ('%s','%s','%s','%s','%s','%s','%s','%s');",
			d.RFC, d.Nombre, d.Direccion, d.CP, d.Banco, d.Situacion, d.INE, d.Descripcion,
		)
		fmt.Println("👤 Mandando docente a RabbitMQ:", d.Nombre)
		enviarARabbit(sqlQuery)
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprint(w, `{"status": "Docente enviado a RabbitMQ"}`)
	})

	// 🚩 2. API: CREAR CURSO
	mux.HandleFunc("/api/crear-curso", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost { return }
		var c Curso
		json.NewDecoder(r.Body).Decode(&c)

		// Creamos el SQL para la tabla 'cursos'
		sqlQuery := fmt.Sprintf(
			"INSERT INTO cursos (nombre, tipo, modalidad, objetivo, contenido, duracion, horario) VALUES ('%s','%s','%s','%s','%s','%s','%s');",
			c.Nombre, c.Tipo, c.Modalidad, c.Objetivo, c.Contenido, c.Duracion, c.Horario,
		)

		fmt.Println("📚 Mandando curso a RabbitMQ:", c.Nombre)
		enviarARabbit(sqlQuery)

		w.Header().Set("Content-Type", "application/json")
		fmt.Fprint(w, `{"status": "Curso enviado a RabbitMQ"}`)
	})

	fmt.Println("🚀 Servidor Go en http://localhost:8002")
	log.Fatal(http.ListenAndServe(":8002", enableCORS(mux)))
}
