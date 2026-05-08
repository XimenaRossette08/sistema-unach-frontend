from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from cursos.adapters.db.postgres_adapter        import PostgresAdapter   as CursosDB
from docentes.adapters.db.mysql_adapter         import MySQLAdapter       as DocentesDB
from alumnos.adapters.db.sqlite_adapter         import SQLiteAdapter      as AlumnosDB
from invitaciones.adapters.db.mongo_adapter     import MongoAdapter       as InvitacionesDB
from monitor.adapters.db.redis_adapter          import RedisAdapter

from cursos.adapters.http.curso_router             import router as cursos_router
from docentes.adapters.http.docente_router         import router as docentes_router
from alumnos.adapters.http.alumno_router           import router as alumnos_router
from invitaciones.adapters.http.invitacion_router  import router as invitaciones_router
from auth.router                                   import router as auth_router
from notificaciones.router                         import router as notificaciones_router
from arquitecto.adapters.http.arquitecto_router import router as arquitecto_router


app = FastAPI(
    title="SIAE UNACH",
    description="Sistema de Administracion Escolar — Universidad Autonoma de Chiapas",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://mysql:5173"],
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


@app.middleware("http")
async def log_visitas(request: Request, call_next):
    response = await call_next(request)
    try:
        partes = request.url.path.split("/")
        api    = partes[2] if len(partes) > 2 else "root"
        request.app.state.redis.incrementar_visita(api)
    except Exception:
        pass
    return response


@app.on_event("startup")
def startup():
    app.state.cursos_repo       = CursosDB("postgresql://postgres:102538@postgres:5432/db_cursos")
    app.state.docentes_repo     = DocentesDB(host="mysql", user="root", password="102538", database="db_docentes", port=3307)
    app.state.alumnos_repo      = AlumnosDB("../unach_alumnos.db")
    app.state.invitaciones_repo = InvitacionesDB("mongodb://mysql:27017")
    app.state.redis             = RedisAdapter("mysql", 6379)
    print("🚀 SIAE UNACH corriendo en http://mysql:8002")
    print("📊 PostgreSQL | MySQL | SQLite | MongoDB | Redis — ONLINE")


app.include_router(auth_router)
app.include_router(notificaciones_router)
app.include_router(notificaciones_router)
app.include_router(cursos_router)
app.include_router(docentes_router)
app.include_router(alumnos_router)
app.include_router(invitaciones_router)
app.include_router(arquitecto_router)

@app.get("/health")
def health():
    return {"status": "ok", "sistema": "SIAE UNACH", "version": "2.0.0"}
