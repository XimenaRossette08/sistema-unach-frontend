import os
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
