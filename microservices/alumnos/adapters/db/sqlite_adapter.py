import sqlite3
from typing import List
from alumnos.domain.models import Alumno
from alumnos.ports.alumno_repository import AlumnoRepository


class SQLiteAdapter(AlumnoRepository):

    def __init__(self, db_path: str):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        conn = sqlite3.connect(self.db_path)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS alumnos (
                id        INTEGER PRIMARY KEY AUTOINCREMENT,
                curso_id  INTEGER,
                nombre    TEXT,
                matricula TEXT,
                correo    TEXT,
                grado     TEXT,
                grupo     TEXT,
                asiste    BOOLEAN
            )
        """)
        conn.commit(); conn.close()

    def _conn(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def guardar(self, al: Alumno) -> None:
        conn = self._conn()
        conn.execute(
            "INSERT INTO alumnos (curso_id,nombre,matricula,correo,grado,grupo,asiste) VALUES (?,?,?,?,?,?,?)",
            (al.curso_id, al.nombre, al.matricula, al.correo, al.grado, al.grupo, al.asiste),
        )
        conn.commit(); conn.close()

    def contar_por_curso(self, curso_id: int) -> int:
        conn  = self._conn()
        count = conn.execute(
            "SELECT COUNT(*) FROM alumnos WHERE curso_id=? AND asiste=1", (curso_id,)
        ).fetchone()[0]
        conn.close()
        return count

    def obtener_todos(self) -> List[Alumno]:
        conn = self._conn()
        rows = conn.execute(
            "SELECT id,curso_id,nombre,matricula,correo,grado,grupo,asiste FROM alumnos"
        ).fetchall()
        conn.close()
        return [Alumno(**dict(r)) for r in rows]

    def obtener_alumnos_por_curso(self, curso_id: int) -> List[Alumno]:
        conn = self._conn()
        rows = conn.execute(
            "SELECT id,curso_id,nombre,matricula,correo,grado,grupo,asiste FROM alumnos WHERE curso_id=?",
            (curso_id,),
        ).fetchall()
        conn.close()
        return [Alumno(**dict(r)) for r in rows]
