from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from shared.auth import generar_token
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import psycopg2

router = APIRouter(tags=["Auth"])

GMAIL_USER = "luz.rossette79@unach.mx"
GMAIL_PASS = "zvfzghsaprxoznrt"

def enviar_correos_validacion(conn_str: str, nombre: str, rol: str):
    try:
        conn = psycopg2.connect(conn_str)
        cur = conn.cursor()
        cur.execute("SELECT correo FROM correos_notificacion")
        correos = [r[0] for r in cur.fetchall()]
        conn.close()
        if not correos:
            correos = ["xime08rossette@gmail.com"]
        hora = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
        body = f"""<html><body>
        <h2>Sistema SIAE - Universidad Autónoma de Chiapas</h2>
        <p>Hola <b>{nombre}</b>,</p>
        <p>Se ha detectado un inicio de sesión en tu cuenta.</p>
        <ul>
            <li><b>Rol:</b> {rol}</li>
            <li><b>Fecha y hora:</b> {hora}</li>
        </ul>
        <p>SIAE UNACH — Registro de Cursos</p>
        </body></html>"""
        for correo in correos:
            msg = MIMEMultipart()
            msg["From"] = GMAIL_USER
            msg["To"] = correo
            msg["Subject"] = "✅ Acceso al Sistema SIAE UNACH"
            msg.attach(MIMEText(body, "html"))
            server = smtplib.SMTP("smtp.gmail.com", 587)
            server.starttls()
            server.login(GMAIL_USER, GMAIL_PASS)
            server.sendmail(GMAIL_USER, correo, msg.as_string())
            server.quit()
    except Exception as e:
        print(f"Error enviando correo: {e}")

class LoginRequest(BaseModel):
    usuario: str
    password: str

@router.post("/api/login")
def login(req: LoginRequest, request: Request):
    if req.usuario == "admin" and req.password == "unach2026":
        token = generar_token(1, "admin")
        enviar_correos_validacion(request.app.state.cursos_repo.conn_string, "Administrador", "Admin")
        return {"token": token, "mensaje": "Acceso concedido! Bienvenida Ingeniera", "rol": "admin"}
    raise HTTPException(status_code=401, detail="Usuario o contrasena incorrectos")
