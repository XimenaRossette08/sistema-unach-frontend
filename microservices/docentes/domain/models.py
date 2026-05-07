from pydantic import BaseModel
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
