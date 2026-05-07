from abc import ABC, abstractmethod


class ArquitectoRepository(ABC):

    @abstractmethod
    def ejecutar_ddl(self, sql: str) -> None:
        pass
