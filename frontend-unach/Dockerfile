# Etapa 1: Construcción con Vite
FROM node:20-alpine AS builder
WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el código fuente y construir
COPY . .
RUN npm run build

# Etapa 2: Servir con Nginx
FROM nginx:alpine

# Copiar la build de React a la carpeta pública de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer el puerto web por defecto
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]