import httpx
from fastapi import APIRouter, Request, HTTPException, Depends
from shared.auth import require_jwt

router = APIRouter(tags=["Arquitecto DDL"])

GO_URL = "http://localhost:8090/api/ejecutar-ddl"


@router.post("/api/ejecutar-ddl")
async def ejecutar_ddl(
    request: Request,
    _: dict = Depends(require_jwt),
):
    body  = await request.json()
    token = request.headers.get("Authorization", "")
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                GO_URL,
                json=body,
                headers={"Authorization": token},
            )
            return resp.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
