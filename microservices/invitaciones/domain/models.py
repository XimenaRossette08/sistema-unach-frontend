from pydantic import BaseModel
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
