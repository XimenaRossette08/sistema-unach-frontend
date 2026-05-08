from abc import ABC, abstractmethod
from typing import List
from alumnos.domain.models import Alumno


class AlumnoRepository(ABC):

    @abstractmethod
    def guardar(self, alumno: Alumno) -> None:
        pass

    @abstractmethod
    def contar_por_curso(self, curso_id: int) -> int:
        pass

    @abstractmethod
    def obtener_todos(self) -> List[Alumno]:
        pass

    @abstractmethod
    def obtener_por_id(self, id: int) -> Alumno:
        pass

    @abstractmethod
    def obtener_alumnos_por_curso(self, curso_id: int) -> List[Alumno]:
        pass

    @abstractmethod
    def actualizar(self, id: int, alumno: Alumno) -> None:
        pass

    @abstractmethod
    def eliminar(self, id: int) -> None:
        pass
