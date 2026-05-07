from jose import jwt, JWTError
from datetime import datetime, timedelta
from fastapi import HTTPException, Request

SECRET_KEY = "SIAE_UNACH_SECRET_KEY_2026"
ALGORITHM  = "HS256"


def generar_token(usuario_id: int, rol: str) -> str:
    claims = {
        "usuario_id": usuario_id,
        "rol": rol,
        "exp": datetime.utcnow() + timedelta(hours=24),
    }
    return jwt.encode(claims, SECRET_KEY, algorithm=ALGORITHM)


def validar_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Sesion invalida o expirada")


def require_jwt(request: Request) -> dict:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token no encontrado")
    return validar_token(auth[7:])
