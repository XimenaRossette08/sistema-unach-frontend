from datetime import datetime
from bson     import ObjectId
from pymongo  import MongoClient
from typing   import List
from invitaciones.domain.models          import Invitacion
from invitaciones.ports.invitacion_repository import InvitacionRepository


class MongoAdapter(InvitacionRepository):

    def __init__(self, uri: str):
        client   = MongoClient(uri)
        self.col = client["db_invitaciones"]["logs"]

    def guardar(self, inv: Invitacion) -> None:
        doc = inv.dict(exclude={"id"})
        doc["fecha_envio"] = datetime.now()
        doc["estado"]      = "Pendiente"
        self.col.insert_one(doc)

    def obtener_aceptadas(self) -> List[Invitacion]:
        return [self._m(d) for d in self.col.find({"estado": "Aceptado"})]

    def listar_por_rfc(self, rfc: str) -> List[Invitacion]:
        return [self._m(d) for d in self.col.find({"rfc": rfc})]

    def actualizar_estado(self, id: str, nuevo_estado: str) -> None:
        self.col.update_one({"_id": ObjectId(id)}, {"$set": {"estado": nuevo_estado}})

    def obtener_por_id(self, id: str) -> Invitacion:
        doc = self.col.find_one({"_id": ObjectId(id)})
        if not doc:
            raise ValueError(f"Invitacion {id} no encontrada")
        return self._m(doc)

    def _m(self, doc: dict) -> Invitacion:
        doc["id"] = str(doc.pop("_id"))
        return Invitacion(**doc)
