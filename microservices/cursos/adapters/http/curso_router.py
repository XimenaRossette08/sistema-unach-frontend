from fastapi import APIRouter, Depends, HTTPException, Request
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
