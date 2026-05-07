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
    def obtener_alumnos_por_curso(self, curso_id: int) -> List[Alumno]:
        pass
