import pika, psycopg2

DB_CONFIG = {"host": "localhost", "port": "5433", "database": "unach_db", "user": "postgres", "password": "102538"}

def ejecutar_sql(sql):
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        cur.execute(sql)
        conn.commit()
        cur.close()
        conn.close()
        print(" ✅ Base de Datos Actualizada.")
    except Exception as e:
        print(f" ❌ Error SQL: {e}")

def callback(ch, method, properties, body):
    msg = body.decode()
    print(f" 📥 Mensaje: {msg}")

    if msg.startswith("ALERTA_ADMIN"):
        print("\n🔔 ALERTA: Un docente aceptó su materia. Revisa el monitor.")
    elif msg.startswith("INVITACION_DETALLADA"):
        pass # Simulación de envío de correo
    else:
        ejecutar_sql(msg)

conn = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
chan = conn.channel()
chan.queue_declare(queue='unach_queue')
chan.basic_consume(queue='unach_queue', on_message_callback=callback, auto_ack=True)
print(" 🚀 Worker Python esperando mensajes...")
chan.start_consuming()
