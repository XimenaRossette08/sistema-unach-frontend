from abc import ABC, abstractmethod
from typing import List
from cursos.domain.models import Curso, CargaAcademica


class CursoRepository(ABC):

    @abstractmethod
    def obtener_cursos(self) -> List[Curso]:
        pass

    @abstractmethod
    def obtener_curso_por_id(self, id: int) -> Curso:
        pass

    @abstractmethod
    def crear_curso(self, curso: Curso) -> None:
        pass

    @abstractmethod
    def actualizar_curso(self, id: int, curso: Curso) -> None:
        pass

    @abstractmethod
    def eliminar_curso(self, id: int) -> None:
        pass

    @abstractmethod
    def registrar_carga_academica(self, rfc: str, materia: str, horario: str) -> None:
        pass

    @abstractmethod
    def obtener_carga_por_rfc(self, rfc: str) -> List[CargaAcademica]:
        pass
