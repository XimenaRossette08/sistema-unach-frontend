# Etapa 1: Compilación
FROM golang:1.22-alpine AS builder
WORKDIR /app

# Descargar dependencias
COPY go.mod go.sum ./
RUN go mod download

# Copiar el código y compilar
COPY . .
RUN go build -o arquitecto_app main.go

# Etapa 2: Ejecución (Imagen súper ligera)
FROM alpine:latest
WORKDIR /root/

# Copiar el ejecutable compilado desde la etapa anterior
COPY --from=builder /app/arquitecto_app .

# Exponer el puerto
EXPOSE 8090

# Ejecutar el servicio
CMD ["./arquitecto_app"]