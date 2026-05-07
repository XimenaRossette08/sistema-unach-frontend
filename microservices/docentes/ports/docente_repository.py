from abc import ABC, abstractmethod
from typing import List
from docentes.domain.models import Docente


class DocenteRepository(ABC):

    @abstractmethod
    def guardar(self, d: Docente) -> None:
        pass

    @abstractmethod
    def listar_todos(self) -> List[Docente]:
        pass

    @abstractmethod
    def obtener_por_rfc(self, rfc: str) -> Docente:
        pass
