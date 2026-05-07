from abc import ABC, abstractmethod
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
