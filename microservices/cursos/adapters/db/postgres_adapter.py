import psycopg2
import psycopg2.extras
from typing import List
from cursos.domain.models import Curso, CargaAcademica
from cursos.ports.curso_repository import CursoRepository


class PostgresAdapter(CursoRepository):

    def __init__(self, conn_string: str):
        self.conn_string = conn_string
        self.conn = psycopg2.connect(conn_string)

    def _cursor(self):
        try:
            self.conn.isolation_level
        except Exception:
            self.conn = psycopg2.connect(self.conn_string)
        return self.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    def obtener_cursos(self) -> List[Curso]:
        with self._cursor() as cur:
            cur.execute("""
                SELECT id,
                    COALESCE(nombre,'')             AS nombre,
                    COALESCE(tipo,'')               AS tipo,
                    COALESCE(modalidad,'')          AS modalidad,
                    COALESCE(objetivo,'')           AS objetivo,
                    COALESCE(contenido,'')          AS contenido,
                    COALESCE(duracion,'')           AS duracion,
                    COALESCE(horario,'')            AS horario,
                    COALESCE(fecha_inicio::text,'') AS fecha_inicio,
                    COALESCE(fecha_fin::text,'')    AS fecha_fin
                FROM cursos
            """)
            return [Curso(**row) for row in cur.fetchall()]

    def obtener_curso_por_id(self, id: int) -> Curso:
        with self._cursor() as cur:
            cur.execute("""
                SELECT id,
                    COALESCE(nombre,'')             AS nombre,
                    COALESCE(tipo,'')               AS tipo,
                    COALESCE(modalidad,'')          AS modalidad,
                    COALESCE(objetivo,'')           AS objetivo,
                    COALESCE(contenido,'')          AS contenido,
                    COALESCE(duracion,'')           AS duracion,
                    COALESCE(horario,'')            AS horario,
                    COALESCE(fecha_inicio::text,'') AS fecha_inicio,
                    COALESCE(fecha_fin::text,'')    AS fecha_fin
                FROM cursos WHERE id = %s
            """, (id,))
            row = cur.fetchone()
            if not row:
                raise ValueError(f"Curso {id} no encontrado")
            return Curso(**row)

    def crear_curso(self, curso: Curso) -> None:
        with self._cursor() as cur:
            cur.execute("""
                INSERT INTO cursos
                    (nombre, tipo, modalidad, objetivo, contenido, duracion, horario, fecha_inicio, fecha_fin)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """, (curso.nombre, curso.tipo, curso.modalidad, curso.objetivo,
                   curso.contenido, curso.duracion, curso.horario,
                   curso.fecha_inicio, curso.fecha_fin))
            self.conn.commit()

    def actualizar_curso(self, id: int, curso: Curso) -> None:
        with self._cursor() as cur:
            cur.execute("""
                UPDATE cursos SET
                    nombre=%s, tipo=%s, modalidad=%s, objetivo=%s,
                    contenido=%s, duracion=%s, horario=%s,
                    fecha_inicio=%s, fecha_fin=%s
                WHERE id=%s
            """, (curso.nombre, curso.tipo, curso.modalidad, curso.objetivo,
                   curso.contenido, curso.duracion, curso.horario,
                   curso.fecha_inicio, curso.fecha_fin, id))
            self.conn.commit()

    def eliminar_curso(self, id: int) -> None:
        with self._cursor() as cur:
            cur.execute("DELETE FROM cursos WHERE id = %s", (id,))
            self.conn.commit()

    def registrar_carga_academica(self, rfc: str, materia: str, horario: str) -> None:
        with self._cursor() as cur:
            cur.execute("""
                INSERT INTO carga_academica (docente_rfc, materia, horario, fecha_aceptacion)
                VALUES (%s,%s,%s,NOW())
            """, (rfc, materia, horario))
            self.conn.commit()

    def obtener_carga_por_rfc(self, rfc: str) -> List[CargaAcademica]:
        with self._cursor() as cur:
            cur.execute("""
                SELECT ca.id, ca.docente_rfc, ca.materia, ca.horario,
                       ca.fecha_aceptacion::text        AS fecha_aceptacion,
                       COALESCE(c.fecha_inicio::text,'') AS fecha_inicio,
                       COALESCE(c.fecha_fin::text,'')    AS fecha_fin
                FROM carga_academica ca
                LEFT JOIN cursos c ON ca.materia = c.nombre
                WHERE ca.docente_rfc = %s
            """, (rfc,))
            return [CargaAcademica(**row) for row in cur.fetchall()]
