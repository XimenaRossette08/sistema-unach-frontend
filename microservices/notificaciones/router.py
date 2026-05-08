from fastapi import APIRouter, Request
from pydantic import BaseModel
import psycopg2

router = APIRouter(tags=["Notificaciones"])

class CorreoRequest(BaseModel):
    correo: str
    nombre: str = ""

@router.get("/api/correos-notificacion")
def listar_correos(request: Request):
    conn = psycopg2.connect(request.app.state.cursos_repo.conn_string)
    cur = conn.cursor()
    cur.execute("SELECT id, correo, nombre FROM correos_notificacion ORDER BY id")
    rows = cur.fetchall()
    conn.close()
    return [{"id": r[0], "correo": r[1], "nombre": r[2]} for r in rows]

@router.post("/api/correos-notificacion")
def agregar_correo(req: CorreoRequest, request: Request):
    conn = psycopg2.connect(request.app.state.cursos_repo.conn_string)
    cur = conn.cursor()
    cur.execute("INSERT INTO correos_notificacion (correo, nombre) VALUES (%s, %s)", (req.correo, req.nombre))
    conn.commit()
    conn.close()
    return {"mensaje": "Correo agregado"}

@router.delete("/api/correos-notificacion/{id}")
def eliminar_correo(id: int, request: Request):
    conn = psycopg2.connect(request.app.state.cursos_repo.conn_string)
    cur = conn.cursor()
    cur.execute("DELETE FROM correos_notificacion WHERE id = %s", (id,))
    conn.commit()
    conn.close()
    return {"mensaje": "Correo eliminado"}
