from flask_sqlalchemy import SQLAlchemy

# Create db instance globally
db = SQLAlchemy()

# Import models after db is initialized
from .JobDB import JobDB  # ✅ Ensure all models are imported
from .FileDB import FileDB
