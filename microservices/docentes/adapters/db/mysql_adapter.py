import mysql.connector
from typing import List
from docentes.domain.models import Docente
from docentes.ports.docente_repository import DocenteRepository


class MySQLAdapter(DocenteRepository):

    def __init__(self, host: str, user: str, password: str, database: str, port: int = 3307):
        self.config = {
            "host": host, "user": user, "password": password,
            "database": database, "port": port,
        }

    def _conn(self):
        return mysql.connector.connect(**self.config)

    def guardar(self, d: Docente) -> None:
        conn = self._conn()
        cur  = conn.cursor()
        cur.execute("""
            INSERT INTO docentes
                (rfc, nombre, direccion, codigo_postal, banco,
                 situacion_fiscal, ine_folio, descripcion_perfil, ine_archivo, csf_archivo)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (d.rfc, d.nombre, d.direccion, d.codigo_postal, d.banco,
               d.situacion_fiscal, d.ine_folio, d.descripcion,
               d.ine_archivo, d.csf_archivo))
        conn.commit()
        cur.close(); conn.close()

    def listar_todos(self) -> List[Docente]:
        conn = self._conn()
        cur  = conn.cursor(dictionary=True)
        cur.execute("SELECT nombre, rfc, descripcion_perfil AS descripcion FROM docentes")
        rows = cur.fetchall()
        cur.close(); conn.close()
        return [Docente(**r) for r in rows]

    def obtener_por_rfc(self, rfc: str) -> Docente:
        conn = self._conn()
        cur  = conn.cursor(dictionary=True)
        cur.execute("SELECT nombre, rfc FROM docentes WHERE rfc = %s", (rfc,))
        row  = cur.fetchone()
        cur.close(); conn.close()
        if not row:
            raise ValueError(f"RFC {rfc} no encontrado")
        return Docente(**row)

    def actualizar(self, rfc: str, d: Docente) -> None:
        conn = self._conn()
        cur  = conn.cursor()
        cur.execute("""
            UPDATE docentes SET
                nombre=%s, direccion=%s, codigo_postal=%s, banco=%s,
                situacion_fiscal=%s, ine_folio=%s, descripcion_perfil=%s
            WHERE rfc=%s
        """, (d.nombre, d.direccion, d.codigo_postal, d.banco,
               d.situacion_fiscal, d.ine_folio, d.descripcion, rfc))
        conn.commit()
        cur.close(); conn.close()

    def eliminar(self, rfc: str) -> None:
        conn = self._conn()
        cur  = conn.cursor()
        cur.execute("DELETE FROM docentes WHERE rfc = %s", (rfc,))
        conn.commit()
        cur.close(); conn.close()
