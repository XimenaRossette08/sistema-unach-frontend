#!/usr/bin/env python3
"""
SIAE UNACH — Setup completo de microservicios FastAPI
Ejecutar desde: ~/sistema_unach_profesional/microservices/
  python3 setup_siae.py
"""
import os

BASE = os.path.dirname(os.path.abspath(__file__))

def f(path, content=""):
    full = os.path.join(BASE, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as fp:
        fp.write(content)
    print(f"  ✅  {path}")

print("\n📦 Creando estructura SIAE UNACH...\n")

# ══════════════════════════════════════════════════════
#  REQUIREMENTS
# ══════════════════════════════════════════════════════
f("requirements.txt",
"""fastapi==0.111.0
uvicorn[standard]==0.29.0
psycopg2-binary==2.9.9
mysql-connector-python==8.3.0
pymongo==4.7.1
redis==5.0.4
python-jose[cryptography]==3.3.0
python-multipart==0.0.9
fpdf2==2.7.9
pydantic==2.7.1
""")

# ══════════════════════════════════════════════════════
#  SHARED — JWT utilities
# ══════════════════════════════════════════════════════
f("shared/__init__.py")
f("shared/auth.py",
"""from jose import jwt, JWTError
from datetime import datetime, timedelta
from fastapi import HTTPException, Request

SECRET_KEY = "SIAE_UNACH_SECRET_KEY_2026"
ALGORITHM  = "HS256"


def generar_token(usuario_id: int, rol: str) -> str:
    claims = {
        "usuario_id": usuario_id,
        "rol": rol,
        "exp": datetime.utcnow() + timedelta(hours=24),
    }
    return jwt.encode(claims, SECRET_KEY, algorithm=ALGORITHM)


def validar_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Sesion invalida o expirada")


def require_jwt(request: Request) -> dict:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token no encontrado")
    return validar_token(auth[7:])
""")

# ══════════════════════════════════════════════════════
#  AUTH MODULE
# ══════════════════════════════════════════════════════
f("auth/__init__.py")
f("auth/router.py",
"""from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from shared.auth import generar_token

router = APIRouter(tags=["Auth"])


class LoginRequest(BaseModel):
    usuario: str
    password: str


@router.post("/api/login")
def login(req: LoginRequest):
    if req.usuario == "admin" and req.password == "unach2026":
        token = generar_token(1, "admin")
        return {
            "token":   token,
            "mensaje": "Acceso concedido! Bienvenida Ingeniera",
            "rol":     "admin",
        }
    raise HTTPException(status_code=401, detail="Usuario o contrasena incorrectos")
""")

# ══════════════════════════════════════════════════════
#  MONITOR MODULE — Redis
# ══════════════════════════════════════════════════════
f("monitor/__init__.py")
f("monitor/ports/__init__.py")
f("monitor/adapters/__init__.py")
f("monitor/adapters/db/__init__.py")

f("monitor/ports/monitor_repository.py",
"""from abc import ABC, abstractmethod


class MonitorRepository(ABC):

    @abstractmethod
    def incrementar_visita(self, api: str) -> None:
        pass
""")

f("monitor/adapters/db/redis_adapter.py",
"""import redis as redis_lib
from monitor.ports.monitor_repository import MonitorRepository


class RedisAdapter(MonitorRepository):

    def __init__(self, host: str = "localhost", port: int = 6379):
        self.client = redis_lib.Redis(host=host, port=port, decode_responses=True)

    def incrementar_visita(self, api: str) -> None:
        try:
            self.client.incr(f"visitas:{api}")
        except Exception:
            pass
""")

# ══════════════════════════════════════════════════════
#  CURSOS MODULE — PostgreSQL (reescrito con imports de paquete)
# ══════════════════════════════════════════════════════
f("cursos/__init__.py")
f("cursos/domain/__init__.py")
f("cursos/ports/__init__.py")
f("cursos/adapters/__init__.py")
f("cursos/adapters/db/__init__.py")
f("cursos/adapters/http/__init__.py")

f("cursos/domain/models.py",
"""from pydantic import BaseModel
from typing import Optional


class Curso(BaseModel):
    id:           Optional[int] = None
    nombre:       str
    tipo:         str
    modalidad:    str
    objetivo:     str
    contenido:    str
    duracion:     str
    horario:      str
    fecha_inicio: str
    fecha_fin:    str


class CargaAcademica(BaseModel):
    id:               Optional[int] = None
    docente_rfc:      str
    materia:          str
    horario:          str
    fecha_aceptacion: Optional[str] = None
    fecha_inicio:     Optional[str] = None
    fecha_fin:        Optional[str] = None
""")

f("cursos/ports/curso_repository.py",
"""from abc import ABC, abstractmethod
from typing import List
from cursos.domain.models import Curso, CargaAcademica


class CursoRepository(ABC):

    @abstractmethod
    def obtener_cursos(self) -> List[Curso]:
        pass

    @abstractmethod
    def crear_curso(self, curso: Curso) -> None:
        pass

    @abstractmethod
    def registrar_carga_academica(self, rfc: str, materia: str, horario: str) -> None:
        pass

    @abstractmethod
    def obtener_carga_por_rfc(self, rfc: str) -> List[CargaAcademica]:
        pass
""")

f("cursos/adapters/db/postgres_adapter.py",
"""import psycopg2
import psycopg2.extras
from typing import List
from cursos.domain.models import Curso, CargaAcademica
from cursos.ports.curso_repository import CursoRepository


class PostgresAdapter(CursoRepository):

    def __init__(self, conn_string: str):
        self.conn_string = conn_string
        self.conn = psycopg2.connect(conn_string)

    def _cursor(self):
        try:
            self.conn.isolation_level
        except Exception:
            self.conn = psycopg2.connect(self.conn_string)
        return self.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    def obtener_cursos(self) -> List[Curso]:
        with self._cursor() as cur:
            cur.execute(\"\"\"
                SELECT id,
                    COALESCE(nombre,'')             AS nombre,
                    COALESCE(tipo,'')               AS tipo,
                    COALESCE(modalidad,'')          AS modalidad,
                    COALESCE(objetivo,'')           AS objetivo,
                    COALESCE(contenido,'')          AS contenido,
                    COALESCE(duracion,'')           AS duracion,
                    COALESCE(horario,'')            AS horario,
                    COALESCE(fecha_inicio::text,'') AS fecha_inicio,
                    COALESCE(fecha_fin::text,'')    AS fecha_fin
                FROM cursos
            \"\"\")
            return [Curso(**row) for row in cur.fetchall()]

    def crear_curso(self, curso: Curso) -> None:
        with self._cursor() as cur:
            cur.execute(\"\"\"
                INSERT INTO cursos
                    (nombre, tipo, modalidad, objetivo, contenido, duracion, horario, fecha_inicio, fecha_fin)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
            \"\"\", (curso.nombre, curso.tipo, curso.modalidad, curso.objetivo,
                   curso.contenido, curso.duracion, curso.horario,
                   curso.fecha_inicio, curso.fecha_fin))
            self.conn.commit()

    def registrar_carga_academica(self, rfc: str, materia: str, horario: str) -> None:
        with self._cursor() as cur:
            cur.execute(\"\"\"
                INSERT INTO carga_academica (docente_rfc, materia, horario, fecha_aceptacion)
                VALUES (%s,%s,%s,NOW())
            \"\"\", (rfc, materia, horario))
            self.conn.commit()

    def obtener_carga_por_rfc(self, rfc: str) -> List[CargaAcademica]:
        with self._cursor() as cur:
            cur.execute(\"\"\"
                SELECT ca.id, ca.docente_rfc, ca.materia, ca.horario,
                       ca.fecha_aceptacion::text        AS fecha_aceptacion,
                       COALESCE(c.fecha_inicio::text,'') AS fecha_inicio,
                       COALESCE(c.fecha_fin::text,'')    AS fecha_fin
                FROM carga_academica ca
                LEFT JOIN cursos c ON ca.materia = c.nombre
                WHERE ca.docente_rfc = %s
            \"\"\", (rfc,))
            return [CargaAcademica(**row) for row in cur.fetchall()]
""")

f("cursos/adapters/http/curso_router.py",
"""from fastapi import APIRouter, Depends, HTTPException, Request
from typing import List
from cursos.domain.models import Curso, CargaAcademica
from cursos.ports.curso_repository import CursoRepository

router = APIRouter(tags=["Cursos"])


def get_repo(request: Request) -> CursoRepository:
    return request.app.state.cursos_repo


@router.get("/api/cursos", response_model=List[Curso])
def listar_cursos(repo: CursoRepository = Depends(get_repo)):
    try:
        return repo.obtener_cursos()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/crear-curso")
@router.post("/api/publicar-curso")
def crear_curso(curso: Curso, repo: CursoRepository = Depends(get_repo)):
    try:
        repo.crear_curso(curso)
        return {"status": "success", "message": "Curso publicado correctamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/mi-carga", response_model=List[CargaAcademica])
def ver_mi_carga(rfc: str, repo: CursoRepository = Depends(get_repo)):
    try:
        return repo.obtener_carga_por_rfc(rfc)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
""")

# ══════════════════════════════════════════════════════
#  DOCENTES MODULE — MySQL
# ══════════════════════════════════════════════════════
f("docentes/__init__.py")
f("docentes/domain/__init__.py")
f("docentes/ports/__init__.py")
f("docentes/adapters/__init__.py")
f("docentes/adapters/db/__init__.py")
f("docentes/adapters/http/__init__.py")

f("docentes/domain/models.py",
"""from pydantic import BaseModel
from typing import Optional


class Docente(BaseModel):
    rfc:              str
    nombre:           str
    descripcion:      Optional[str] = ""
    direccion:        Optional[str] = ""
    codigo_postal:    Optional[str] = ""
    banco:            Optional[str] = ""
    situacion_fiscal: Optional[str] = ""
    ine_folio:        Optional[str] = ""
    ine_archivo:      Optional[str] = ""
    csf_archivo:      Optional[str] = ""
""")

f("docentes/ports/docente_repository.py",
"""from abc import ABC, abstractmethod
from typing import List
from docentes.domain.models import Docente


class DocenteRepository(ABC):

    @abstractmethod
    def guardar(self, d: Docente) -> None:
        pass

    @abstractmethod
    def listar_todos(self) -> List[Docente]:
        pass

    @abstractmethod
    def obtener_por_rfc(self, rfc: str) -> Docente:
        pass
""")

f("docentes/adapters/db/mysql_adapter.py",
"""import mysql.connector
from typing import List
from docentes.domain.models import Docente
from docentes.ports.docente_repository import DocenteRepository


class MySQLAdapter(DocenteRepository):

    def __init__(self, host: str, user: str, password: str, database: str, port: int = 3307):
        self.config = {
            "host": host, "user": user, "password": password,
            "database": database, "port": port,
        }

    def _conn(self):
        return mysql.connector.connect(**self.config)

    def guardar(self, d: Docente) -> None:
        conn = self._conn()
        cur  = conn.cursor()
        cur.execute(\"\"\"
            INSERT INTO docentes
                (rfc, nombre, direccion, codigo_postal, banco,
                 situacion_fiscal, ine_folio, descripcion_perfil, ine_archivo, csf_archivo)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        \"\"\", (d.rfc, d.nombre, d.direccion, d.codigo_postal, d.banco,
               d.situacion_fiscal, d.ine_folio, d.descripcion,
               d.ine_archivo, d.csf_archivo))
        conn.commit()
        cur.close(); conn.close()

    def listar_todos(self) -> List[Docente]:
        conn = self._conn()
        cur  = conn.cursor(dictionary=True)
        cur.execute("SELECT nombre, rfc, descripcion_perfil AS descripcion FROM docentes")
        rows = cur.fetchall()
        cur.close(); conn.close()
        return [Docente(**r) for r in rows]

    def obtener_por_rfc(self, rfc: str) -> Docente:
        conn = self._conn()
        cur  = conn.cursor(dictionary=True)
        cur.execute("SELECT nombre, rfc FROM docentes WHERE rfc = %s", (rfc,))
        row  = cur.fetchone()
        cur.close(); conn.close()
        if not row:
            raise ValueError(f"RFC {rfc} no encontrado")
        return Docente(**row)
""")

f("docentes/adapters/http/docente_router.py",
"""import os
import shutil
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File, Form
from docentes.domain.models import Docente
from docentes.ports.docente_repository import DocenteRepository
from shared.auth import generar_token

router = APIRouter(tags=["Docentes"])

UPLOADS_DIR = "uploads"
os.makedirs(UPLOADS_DIR, exist_ok=True)


def get_repo(request: Request) -> DocenteRepository:
    return request.app.state.docentes_repo

def get_cursos_repo(request: Request):
    return request.app.state.cursos_repo


@router.get("/api/docentes")
def listar_con_match(
    repo       = Depends(get_repo),
    cursos_repo = Depends(get_cursos_repo),
):
    docentes = repo.listar_todos()
    try:
        cursos = cursos_repo.obtener_cursos()
    except Exception:
        cursos = []

    respuesta = []
    for d in docentes:
        sugerencias = [
            c for c in cursos
            if d.descripcion and (
                d.descripcion.lower() in c.nombre.lower() or
                c.nombre.lower() in d.descripcion.lower()
            )
        ]
        respuesta.append({
            "nombre":      d.nombre,
            "rfc":         d.rfc,
            "perfil":      d.descripcion,
            "sugerencias": [c.dict() for c in sugerencias],
        })
    return respuesta


@router.post("/api/docentes")
@router.post("/api/registro-docente")
async def registrar(
    rfc:              str                    = Form(...),
    nombre:           str                    = Form(...),
    banco:            str                    = Form(""),
    direccion:        str                    = Form(""),
    codigo_postal:    str                    = Form(""),
    situacion_fiscal: str                    = Form(""),
    ine_folio:        str                    = Form(""),
    descripcion:      str                    = Form(""),
    ine_archivo:      Optional[UploadFile]   = File(None),
    repo              = Depends(get_repo),
):
    ine_path = ""
    if ine_archivo and ine_archivo.filename:
        ine_path = f"{UPLOADS_DIR}/{ine_archivo.filename}"
        with open(ine_path, "wb") as fp:
            shutil.copyfileobj(ine_archivo.file, fp)

    doc = Docente(
        rfc=rfc, nombre=nombre, banco=banco,
        direccion=direccion, codigo_postal=codigo_postal,
        situacion_fiscal=situacion_fiscal, ine_folio=ine_folio,
        descripcion=descripcion, ine_archivo=ine_path,
    )
    try:
        repo.guardar(doc)
        return {"mensaje": "Expediente guardado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/login-docente")
async def login_docente(request: Request, repo = Depends(get_repo)):
    body = await request.json()
    rfc  = body.get("rfc", "")
    try:
        docente = repo.obtener_por_rfc(rfc)
    except Exception:
        raise HTTPException(status_code=401, detail="RFC no encontrado en el sistema")
    token = generar_token(0, "DOCENTE")
    return {"token": token, "nombre": docente.nombre, "rol": "docente"}
""")

# ══════════════════════════════════════════════════════
#  ALUMNOS MODULE — SQLite + PDF + Email
# ══════════════════════════════════════════════════════
f("alumnos/__init__.py")
f("alumnos/domain/__init__.py")
f("alumnos/ports/__init__.py")
f("alumnos/adapters/__init__.py")
f("alumnos/adapters/db/__init__.py")
f("alumnos/adapters/http/__init__.py")

f("alumnos/domain/models.py",
"""from pydantic import BaseModel
from typing import Optional


class Alumno(BaseModel):
    id:        Optional[int] = None
    curso_id:  int
    nombre:    str
    matricula: str
    correo:    str
    grado:     str
    grupo:     str
    asiste:    bool = True
""")

f("alumnos/ports/alumno_repository.py",
"""from abc import ABC, abstractmethod
from typing import List
from alumnos.domain.models import Alumno


class AlumnoRepository(ABC):

    @abstractmethod
    def guardar(self, alumno: Alumno) -> None:
        pass

    @abstractmethod
    def contar_por_curso(self, curso_id: int) -> int:
        pass

    @abstractmethod
    def obtener_todos(self) -> List[Alumno]:
        pass

    @abstractmethod
    def obtener_alumnos_por_curso(self, curso_id: int) -> List[Alumno]:
        pass
""")

f("alumnos/adapters/db/sqlite_adapter.py",
"""import sqlite3
from typing import List
from alumnos.domain.models import Alumno
from alumnos.ports.alumno_repository import AlumnoRepository


class SQLiteAdapter(AlumnoRepository):

    def __init__(self, db_path: str):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        conn = sqlite3.connect(self.db_path)
        conn.execute(\"\"\"
            CREATE TABLE IF NOT EXISTS alumnos (
                id        INTEGER PRIMARY KEY AUTOINCREMENT,
                curso_id  INTEGER,
                nombre    TEXT,
                matricula TEXT,
                correo    TEXT,
                grado     TEXT,
                grupo     TEXT,
                asiste    BOOLEAN
            )
        \"\"\")
        conn.commit(); conn.close()

    def _conn(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def guardar(self, al: Alumno) -> None:
        conn = self._conn()
        conn.execute(
            "INSERT INTO alumnos (curso_id,nombre,matricula,correo,grado,grupo,asiste) VALUES (?,?,?,?,?,?,?)",
            (al.curso_id, al.nombre, al.matricula, al.correo, al.grado, al.grupo, al.asiste),
        )
        conn.commit(); conn.close()

    def contar_por_curso(self, curso_id: int) -> int:
        conn  = self._conn()
        count = conn.execute(
            "SELECT COUNT(*) FROM alumnos WHERE curso_id=? AND asiste=1", (curso_id,)
        ).fetchone()[0]
        conn.close()
        return count

    def obtener_todos(self) -> List[Alumno]:
        conn = self._conn()
        rows = conn.execute(
            "SELECT id,curso_id,nombre,matricula,correo,grado,grupo,asiste FROM alumnos"
        ).fetchall()
        conn.close()
        return [Alumno(**dict(r)) for r in rows]

    def obtener_alumnos_por_curso(self, curso_id: int) -> List[Alumno]:
        conn = self._conn()
        rows = conn.execute(
            "SELECT id,curso_id,nombre,matricula,correo,grado,grupo,asiste FROM alumnos WHERE curso_id=?",
            (curso_id,),
        ).fetchall()
        conn.close()
        return [Alumno(**dict(r)) for r in rows]
""")

f("alumnos/adapters/http/alumno_router.py",
"""import io
import smtplib
from email.mime.multipart    import MIMEMultipart
from email.mime.text         import MIMEText
from email.mime.application  import MIMEApplication

from fastapi           import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from fpdf              import FPDF

from alumnos.domain.models         import Alumno
from alumnos.ports.alumno_repository import AlumnoRepository

router = APIRouter(tags=["Alumnos"])

GMAIL_USER = "xime08rossette@gmail.com"
GMAIL_PASS = "zvfzghsaprxoznrt"


def get_repo(request: Request) -> AlumnoRepository:
    return request.app.state.alumnos_repo

def get_cursos_repo(request: Request):
    return request.app.state.cursos_repo


@router.post("/api/registrar-alumno")
async def registrar(request: Request, repo = Depends(get_repo)):
    data = await request.json()
    try:
        repo.guardar(Alumno(**data))
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/lista-alumnos")
def listar_alumnos(repo = Depends(get_repo), cursos_repo = Depends(get_cursos_repo)):
    alumnos = repo.obtener_todos()
    try:
        mapa = {c.id: c.nombre for c in cursos_repo.obtener_cursos()}
    except Exception:
        mapa = {}
    return [{**al.dict(), "nombre_curso": mapa.get(al.curso_id, "")} for al in alumnos]


@router.get("/api/notificar-docente")
def obtener_conteo(cursoId: int, repo = Depends(get_repo)):
    return {"alumnos_inscritos": repo.contar_por_curso(cursoId)}


def _crear_pdf(nombre: str, inicio: str, fin: str, alumnos) -> bytes:
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", "B", 16)
    pdf.set_text_color(0, 51, 102)
    pdf.cell(0, 10, "SIAE UNACH - Lista de Asistencia Oficial", ln=True, align="C")
    pdf.set_font("Arial", "I", 11)
    pdf.set_text_color(80, 80, 80)
    periodo = f"Materia: {nombre}"
    if inicio and fin:
        periodo += f" | Periodo: {inicio} al {fin}"
    pdf.cell(0, 8, periodo, ln=True, align="C")
    pdf.ln(10)
    pdf.set_fill_color(192, 160, 96)
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("Arial", "B", 10)
    pdf.cell(90, 10, "Nombre del Alumno", border=1, align="C", fill=True)
    pdf.cell(50, 10, "Matricula",         border=1, align="C", fill=True)
    pdf.cell(50, 10, "Grado y Grupo",     border=1, align="C", fill=True, ln=True)
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Arial", "", 10)
    for al in alumnos:
        pdf.cell(90, 10, al.nombre,                   border=1, align="L")
        pdf.cell(50, 10, al.matricula,                border=1, align="C")
        pdf.cell(50, 10, f"{al.grado} - {al.grupo}",  border=1, align="C", ln=True)
    return bytes(pdf.output())


@router.get("/api/generar-pdf")
def generar_pdf(cursoId: int, repo = Depends(get_repo), cursos_repo = Depends(get_cursos_repo)):
    nombre, inicio, fin = "Curso Desconocido", "", ""
    try:
        for c in cursos_repo.obtener_cursos():
            if c.id == cursoId:
                nombre, inicio, fin = c.nombre, c.fecha_inicio, c.fecha_fin
                break
    except Exception:
        pass
    alumnos   = repo.obtener_alumnos_por_curso(cursoId)
    pdf_bytes = _crear_pdf(nombre, inicio, fin, alumnos)
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="lista_{nombre}.pdf"'},
    )


@router.post("/api/enviar-reporte-correo")
async def enviar_reporte(
    request: Request,
    repo = Depends(get_repo),
    cursos_repo = Depends(get_cursos_repo),
):
    data    = await request.json()
    cid     = data.get("curso_id")
    correo  = data.get("correo_profesor")
    nombre, inicio, fin = "Curso Desconocido", "", ""
    try:
        for c in cursos_repo.obtener_cursos():
            if c.id == cid:
                nombre, inicio, fin = c.nombre, c.fecha_inicio, c.fecha_fin
                break
    except Exception:
        pass
    alumnos   = repo.obtener_alumnos_por_curso(cid)
    pdf_bytes = _crear_pdf(nombre, inicio, fin, alumnos)

    msg = MIMEMultipart()
    msg["From"]    = GMAIL_USER
    msg["To"]      = correo
    msg["Subject"] = f"Lista Oficial - {nombre}"
    html = f\"\"\"<div style='font-family:Arial;padding:20px;background:#1a1a1a;color:white;border-radius:10px;'>
        <h2>SIAE UNACH</h2>
        <p>Lista oficial de: <strong>{nombre}</strong></p>
        <p>Periodo: <strong>{inicio} al {fin}</strong></p>
        <p>Total alumnos: <strong>{len(alumnos)}</strong></p>
    </div>\"\"\"
    msg.attach(MIMEText(html, "html"))
    att = MIMEApplication(pdf_bytes, _subtype="pdf")
    att.add_header("Content-Disposition", "attachment", filename=f"Reporte_{nombre}.pdf")
    msg.attach(att)
    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as s:
            s.starttls()
            s.login(GMAIL_USER, GMAIL_PASS)
            s.send_message(msg)
        return {"status": "success", "message": "Enviado correctamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al enviar correo: {e}")
""")

# ══════════════════════════════════════════════════════
#  INVITACIONES MODULE — MongoDB + brinco a Postgres
# ══════════════════════════════════════════════════════
f("invitaciones/__init__.py")
f("invitaciones/domain/__init__.py")
f("invitaciones/ports/__init__.py")
f("invitaciones/adapters/__init__.py")
f("invitaciones/adapters/db/__init__.py")
f("invitaciones/adapters/http/__init__.py")

f("invitaciones/domain/models.py",
"""from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class Invitacion(BaseModel):
    id:          Optional[str]      = None
    rfc:         str
    nombre:      str
    curso:       str
    horario:     str
    estado:      str                = "Pendiente"
    fecha_envio: Optional[datetime] = None
""")

f("invitaciones/ports/invitacion_repository.py",
"""from abc import ABC, abstractmethod
from typing import List
from invitaciones.domain.models import Invitacion


class InvitacionRepository(ABC):

    @abstractmethod
    def guardar(self, inv: Invitacion) -> None:
        pass

    @abstractmethod
    def obtener_aceptadas(self) -> List[Invitacion]:
        pass

    @abstractmethod
    def listar_por_rfc(self, rfc: str) -> List[Invitacion]:
        pass

    @abstractmethod
    def actualizar_estado(self, id: str, nuevo_estado: str) -> None:
        pass

    @abstractmethod
    def obtener_por_id(self, id: str) -> Invitacion:
        pass
""")

f("invitaciones/adapters/db/mongo_adapter.py",
"""from datetime import datetime
from bson     import ObjectId
from pymongo  import MongoClient
from typing   import List
from invitaciones.domain.models          import Invitacion
from invitaciones.ports.invitacion_repository import InvitacionRepository


class MongoAdapter(InvitacionRepository):

    def __init__(self, uri: str):
        client   = MongoClient(uri)
        self.col = client["db_invitaciones"]["logs"]

    def guardar(self, inv: Invitacion) -> None:
        doc = inv.dict(exclude={"id"})
        doc["fecha_envio"] = datetime.now()
        doc["estado"]      = "Pendiente"
        self.col.insert_one(doc)

    def obtener_aceptadas(self) -> List[Invitacion]:
        return [self._m(d) for d in self.col.find({"estado": "Aceptado"})]

    def listar_por_rfc(self, rfc: str) -> List[Invitacion]:
        return [self._m(d) for d in self.col.find({"rfc": rfc})]

    def actualizar_estado(self, id: str, nuevo_estado: str) -> None:
        self.col.update_one({"_id": ObjectId(id)}, {"$set": {"estado": nuevo_estado}})

    def obtener_por_id(self, id: str) -> Invitacion:
        doc = self.col.find_one({"_id": ObjectId(id)})
        if not doc:
            raise ValueError(f"Invitacion {id} no encontrada")
        return self._m(doc)

    def _m(self, doc: dict) -> Invitacion:
        doc["id"] = str(doc.pop("_id"))
        return Invitacion(**doc)
""")

f("invitaciones/adapters/http/invitacion_router.py",
"""from fastapi import APIRouter, Depends, HTTPException, Request
from invitaciones.domain.models              import Invitacion
from invitaciones.ports.invitacion_repository import InvitacionRepository

router = APIRouter(tags=["Invitaciones"])


def get_repo(request: Request) -> InvitacionRepository:
    return request.app.state.invitaciones_repo

def get_cursos_repo(request: Request):
    return request.app.state.cursos_repo


@router.post("/api/enviar-invitacion")
async def crear(request: Request, repo = Depends(get_repo)):
    data = await request.json()
    try:
        repo.guardar(Invitacion(**data))
        return {"status": "Invitacion enviada exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/mis-invitaciones")
def listar_para_docente(rfc: str, repo = Depends(get_repo)):
    try:
        return repo.listar_por_rfc(rfc)
    except Exception:
        return []


@router.get("/api/invitaciones-aceptadas")
def listar_aceptadas(repo = Depends(get_repo)):
    try:
        return repo.obtener_aceptadas()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/aceptar-invitacion")
async def aceptar(
    request:     Request,
    repo         = Depends(get_repo),
    cursos_repo  = Depends(get_cursos_repo),
):
    data   = await request.json()
    inv_id = data.get("id")

    try:
        inv = repo.obtener_por_id(inv_id)
    except Exception:
        raise HTTPException(status_code=404, detail="No se encontro la invitacion")

    try:
        cursos_repo.registrar_carga_academica(inv.rfc, inv.curso, inv.horario)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al registrar carga: {e}")

    repo.actualizar_estado(inv_id, "Aceptado")
    return {"status": "Materia aceptada y registrada en Postgres"}
""")

# ══════════════════════════════════════════════════════
#  MAIN.PY — Entry point unificado en :8002
# ══════════════════════════════════════════════════════
f("main.py",
"""from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from cursos.adapters.db.postgres_adapter        import PostgresAdapter   as CursosDB
from docentes.adapters.db.mysql_adapter         import MySQLAdapter       as DocentesDB
from alumnos.adapters.db.sqlite_adapter         import SQLiteAdapter      as AlumnosDB
from invitaciones.adapters.db.mongo_adapter     import MongoAdapter       as InvitacionesDB
from monitor.adapters.db.redis_adapter          import RedisAdapter

from cursos.adapters.http.curso_router             import router as cursos_router
from docentes.adapters.http.docente_router         import router as docentes_router
from alumnos.adapters.http.alumno_router           import router as alumnos_router
from invitaciones.adapters.http.invitacion_router  import router as invitaciones_router
from auth.router                                   import router as auth_router

app = FastAPI(
    title="SIAE UNACH",
    description="Sistema de Administracion Escolar — Universidad Autonoma de Chiapas",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


@app.middleware("http")
async def log_visitas(request: Request, call_next):
    response = await call_next(request)
    try:
        partes = request.url.path.split("/")
        api    = partes[2] if len(partes) > 2 else "root"
        request.app.state.redis.incrementar_visita(api)
    except Exception:
        pass
    return response


@app.on_event("startup")
def startup():
    app.state.cursos_repo       = CursosDB("postgresql://postgres:102538@localhost:5433/db_cursos")
    app.state.docentes_repo     = DocentesDB(host="localhost", user="root", password="102538", database="db_docentes", port=3307)
    app.state.alumnos_repo      = AlumnosDB("../unach_alumnos.db")
    app.state.invitaciones_repo = InvitacionesDB("mongodb://localhost:27017")
    app.state.redis             = RedisAdapter("localhost", 6379)
    print("🚀 SIAE UNACH corriendo en http://localhost:8002")
    print("📊 PostgreSQL | MySQL | SQLite | MongoDB | Redis — ONLINE")


app.include_router(auth_router)
app.include_router(cursos_router)
app.include_router(docentes_router)
app.include_router(alumnos_router)
app.include_router(invitaciones_router)


@app.get("/health")
def health():
    return {"status": "ok", "sistema": "SIAE UNACH", "version": "2.0.0"}
""")

print("\n🎉 ¡Setup completo! Todos los archivos creados.")
print("\nSiguiente paso:")
print("  pip install -r requirements.txt --break-system-packages")
print("  python3 -m uvicorn main:app --reload --port 8002")
