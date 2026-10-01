import os
from pathlib import Path

import psycopg2
from psycopg2.extras import RealDictCursor
from flask import Flask, jsonify

def load_env_file(path = '.env'):
    env_file = Path(__file__).parent / path

    if not env_file.exists():
        return

    for line in env_file.read_text(encoding='utf-8').splitlines():
        line = line.strip()

        if line and not line.startswith('#') and '=' in line:
            key, value = line.split('=', 1)
            os.environ.setdefault(key.strip(), value.strip())

load_env_file()

DB_SETTINGS = {
    'host': os.environ.get('DB_HOST', 'localhost'),
    'port': os.environ.get('DB_PORT', '5432'),
    'dbname': os.environ.get('DB_NAME', 'food_delivery'),
    'user': os.environ.get('DB_USER', 'postgres'),
    'password': os.environ.get('DB_PASSWORD', ''),
}

app = Flask(__name__, static_folder = '.', static_url_path='')

@app.route('/')
def index():
    return app.send_static_file('pages/main.html')

@app.route('/<page>.html')
def page(page):
     return app.send_static_file(f'pages/{page}.html')

@app.route('/api/products')
def products():
    connection = psycopg2.connect(**DB_SETTINGS)

    try:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                'SELECT id, name, description, weight, price, image FROM products ORDER BY id'
            )
            return jsonify(cursor.fetchall())
    finally:
        connection.close()

if __name__ == '__main__':
    app.run(port = 5000, debug = True)