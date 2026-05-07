from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from shared.auth import generar_token

router = APIRouter(tags=["Auth"])


class LoginRequest(BaseModel):
    usuario: str
    password: str


@router.post("/api/login")
def login(req: LoginRequest):
    if req.usuario == "admin" and req.password == "unach2026":
        token = generar_token(1, "admin")
        return {
            "token":   token,
            "mensaje": "Acceso concedido! Bienvenida Ingeniera",
            "rol":     "admin",
        }
    raise HTTPException(status_code=401, detail="Usuario o contrasena incorrectos")
