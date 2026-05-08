import io
import smtplib
from email.mime.multipart    import MIMEMultipart
from email.mime.text         import MIMEText
from email.mime.application  import MIMEApplication

from fastapi           import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from fpdf              import FPDF

from alumnos.domain.models           import Alumno
from alumnos.ports.alumno_repository import AlumnoRepository
from shared.auth                     import require_jwt

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
def listar_alumnos(
    repo        = Depends(get_repo),
    cursos_repo = Depends(get_cursos_repo),
    _: dict     = Depends(require_jwt),
):
    alumnos = repo.obtener_todos()
    try:
        mapa = {c.id: c.nombre for c in cursos_repo.obtener_cursos()}
    except Exception:
        mapa = {}
    return [{**al.dict(), "nombre_curso": mapa.get(al.curso_id, "")} for al in alumnos]


@router.get("/api/alumnos/{id}")
def obtener_alumno(
    id: int,
    repo    = Depends(get_repo),
    _: dict = Depends(require_jwt),
):
    try:
        return repo.obtener_por_id(id)
    except ValueError:
        raise HTTPException(status_code=404, detail=f"Alumno {id} no encontrado")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/api/alumnos/{id}")
async def actualizar_alumno(
    id: int,
    request: Request,
    repo    = Depends(get_repo),
    _: dict = Depends(require_jwt),
):
    data = await request.json()
    try:
        repo.actualizar(id, Alumno(**data))
        return {"status": "success", "message": f"Alumno {id} actualizado correctamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/api/alumnos/{id}")
def eliminar_alumno(
    id: int,
    repo    = Depends(get_repo),
    _: dict = Depends(require_jwt),
):
    try:
        repo.eliminar(id)
        return {"status": "success", "message": f"Alumno {id} eliminado correctamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/notificar-docente")
def obtener_conteo(
    cursoId: int,
    repo    = Depends(get_repo),
    _: dict = Depends(require_jwt),
):
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
        pdf.cell(90, 10, al.nombre,                  border=1, align="L")
        pdf.cell(50, 10, al.matricula,               border=1, align="C")
        pdf.cell(50, 10, f"{al.grado} - {al.grupo}", border=1, align="C", ln=True)
    return bytes(pdf.output())


@router.get("/api/generar-pdf")
def generar_pdf(
    cursoId: int,
    repo        = Depends(get_repo),
    cursos_repo = Depends(get_cursos_repo),
    _: dict     = Depends(require_jwt),
):
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
    repo        = Depends(get_repo),
    cursos_repo = Depends(get_cursos_repo),
    _: dict     = Depends(require_jwt),
):
    data  = await request.json()
    cid   = data.get("curso_id")
    correo = data.get("correo_profesor")
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
    html = f"""<div style='font-family:Arial;padding:20px;background:#1a1a1a;color:white;border-radius:10px;'>
        <h2>SIAE UNACH</h2>
        <p>Lista oficial de: <strong>{nombre}</strong></p>
        <p>Periodo: <strong>{inicio} al {fin}</strong></p>
        <p>Total alumnos: <strong>{len(alumnos)}</strong></p>
    </div>"""
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
