from fastapi import APIRouter, Depends, HTTPException, Request
from invitaciones.domain.models               import Invitacion
from invitaciones.ports.invitacion_repository import InvitacionRepository
from shared.auth                              import require_jwt

router = APIRouter(tags=["Invitaciones"])


def get_repo(request: Request) -> InvitacionRepository:
    return request.app.state.invitaciones_repo

def get_cursos_repo(request: Request):
    return request.app.state.cursos_repo


@router.post("/api/enviar-invitacion")
async def crear(
    request: Request,
    repo    = Depends(get_repo),
    _: dict = Depends(require_jwt),
):
    data = await request.json()
    try:
        repo.guardar(Invitacion(**data))
        return {"status": "Invitacion enviada exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/mis-invitaciones")
def listar_para_docente(
    rfc: str,
    repo    = Depends(get_repo),
    _: dict = Depends(require_jwt),
):
    try:
        return repo.listar_por_rfc(rfc)
    except Exception:
        return []


@router.get("/api/invitaciones-aceptadas")
def listar_aceptadas(
    repo    = Depends(get_repo),
    _: dict = Depends(require_jwt),
):
    try:
        return repo.obtener_aceptadas()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/aceptar-invitacion")
async def aceptar(
    request:    Request,
    repo        = Depends(get_repo),
    cursos_repo = Depends(get_cursos_repo),
    _: dict     = Depends(require_jwt),
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


@router.delete("/api/invitaciones/{id}")
def eliminar_invitacion(
    id: str,
    repo    = Depends(get_repo),
    _: dict = Depends(require_jwt),
):
    try:
        repo.eliminar(id)
        return {"status": "success", "message": f"Invitacion {id} eliminada"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
