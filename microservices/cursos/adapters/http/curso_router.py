from fastapi import APIRouter, Depends, HTTPException, Request
from typing import List
from cursos.domain.models import Curso, CargaAcademica
from cursos.ports.curso_repository import CursoRepository
from shared.auth import require_jwt

router = APIRouter(tags=["Cursos"])


def get_repo(request: Request) -> CursoRepository:
    return request.app.state.cursos_repo


@router.get("/api/cursos", response_model=List[Curso])
def listar_cursos(repo: CursoRepository = Depends(get_repo)):
    try:
        return repo.obtener_cursos()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/cursos/{id}", response_model=Curso)
def obtener_curso(id: int, repo: CursoRepository = Depends(get_repo)):
    try:
        return repo.obtener_curso_por_id(id)
    except ValueError:
        raise HTTPException(status_code=404, detail=f"Curso {id} no encontrado")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/crear-curso")
@router.post("/api/publicar-curso")
def crear_curso(
    curso: Curso,
    repo: CursoRepository = Depends(get_repo),
    _: dict = Depends(require_jwt),
):
    try:
        repo.crear_curso(curso)
        return {"status": "success", "message": "Curso publicado correctamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/api/cursos/{id}")
def actualizar_curso(
    id: int,
    curso: Curso,
    repo: CursoRepository = Depends(get_repo),
    _: dict = Depends(require_jwt),
):
    try:
        repo.actualizar_curso(id, curso)
        return {"status": "success", "message": f"Curso {id} actualizado correctamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/api/cursos/{id}")
def eliminar_curso(
    id: int,
    repo: CursoRepository = Depends(get_repo),
    _: dict = Depends(require_jwt),
):
    try:
        repo.eliminar_curso(id)
        return {"status": "success", "message": f"Curso {id} eliminado correctamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/mi-carga", response_model=List[CargaAcademica])
def ver_mi_carga(
    rfc: str,
    repo: CursoRepository = Depends(get_repo),
    _: dict = Depends(require_jwt),
):
    try:
        return repo.obtener_carga_por_rfc(rfc)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
