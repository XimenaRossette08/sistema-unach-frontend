import redis as redis_lib
from monitor.ports.monitor_repository import MonitorRepository


class RedisAdapter(MonitorRepository):

    def __init__(self, host: str = "localhost", port: int = 6379):
        self.client = redis_lib.Redis(host=host, port=port, decode_responses=True)

    def incrementar_visita(self, api: str) -> None:
        try:
            self.client.incr(f"visitas:{api}")
        except Exception:
            pass
