from abc import ABC, abstractmethod


class MonitorRepository(ABC):

    @abstractmethod
    def incrementar_visita(self, api: str) -> None:
        pass
