from pathlib import Path
import psycopg2

from app import DB_SETTINGS

BASE_DIR = Path(__file__).parent

def crate_database():
    settings = {**DB_SETTINGS, 'dbname': 'postgres'}

    connection = psycopg2.connect(**settings)
    connection.autocommit = True

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                'SELECT 1 FROM pg_database WHERE datname = %s',
                (DB_SETTINGS['dbname'],),
            )

            if cursor.fetchone():
                print('БД уже существует')
            else:
                cursor.execute(f'CREATE DATABASE {DB_SETTINGS["dbname"]}')
                print('БД создана')
    finally:
        connection.close()

def apply_schema():
    schema = (BASE_DIR / 'schema.sql').read_text(encoding='utf-8')
    connection = psycopg2.connect(**DB_SETTINGS)

    try:
        with connection.cursor() as cursor:
            cursor.execute(schema)
            cursor.execute('SELECT count(*) FROM products')
            print(f'Блюд в таблице: {cursor.fetchone()[0]}')

        connection.commit()
    finally:
        connection.close()

if __name__ == '__main__':
    crate_database()
    apply_schema()