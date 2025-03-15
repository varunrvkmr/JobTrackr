import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")  # AWS RDS connection
    SQLALCHEMY_TRACK_MODIFICATIONS = False
