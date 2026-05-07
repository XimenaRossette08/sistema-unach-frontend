from pydantic import BaseModel
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
