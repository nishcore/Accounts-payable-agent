import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()


def get_connection():
    return psycopg2.connect(
        dbname="ap_agent_db",
        user="postgres",
        password=os.getenv("DB_PASSWORD"),
        host="127.0.0.1",
        port="5432"
    )
