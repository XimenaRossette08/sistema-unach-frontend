from pydantic import BaseModel
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
