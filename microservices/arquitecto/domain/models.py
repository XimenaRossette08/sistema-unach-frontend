from pydantic import BaseModel


class DDLRequest(BaseModel):
    sql: str


class DDLResponse(BaseModel):
    mensaje: str
