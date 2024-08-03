import os, datetime
import psycopg2 as db

dbconfig = {
    'host': os.environ.get('POSTGRES_HOST'),
    'port': os.environ.get('POSTGRES_PORT'),
    'user': os.environ.get('POSTGRES_USER'),
    'password': os.environ.get('POSTGRES_PASSWORD'),
    'database': os.environ.get('POSTGRES_DB')
}


try:

    cutoff = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(weeks=8)
    cutoff=cutoff.strftime("%Y-%m-%d %H:%M:%S")

    connection = db.connect(**dbconfig)
    cursor = connection.cursor()

    query = f"""
        DELETE FROM action_log
        WHERE utc < '{cutoff}'
    """
    cursor.execute(query)
    connection.commit()

except Exception as err:
    print(str(err))

finally:
    cursor.close()
    connection.close()


