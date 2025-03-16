from flask import Flask, jsonify, request, redirect
from flask_cors import CORS
from dotenv import load_dotenv
import os
from app.models import db
from app.routes.jobs_routes import job_bp
from datetime import datetime
from flask_migrate import Migrate
from functools import wraps
#from routes.snippets import snippet_bp
from app.routes.fileManagerRoutes import file_manager_bp
from app.routes.letter_generator import letter_generator_bp
from app.routes.browser_automation import browser_bp
from app.routes.user_profiles_routes import user_profiles_routes_bp
from app.extensions import db
from app.automation import apply_job

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

#app.register_blueprint(snippet_bp)
app.register_blueprint(job_bp)
app.register_blueprint(file_manager_bp, url_prefix="/api/files")
app.register_blueprint(letter_generator_bp, url_prefix="/letter-generator")
app.register_blueprint(user_profiles_routes_bp, url_prefix="/user-profile")


# Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL")
print(f"Using database URL: {DATABASE_URL}")  # ✅ Debugging line

app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL

# Initialize the database
db.init_app(app)  # Ensure database is initialized
migrate = Migrate(app, db)  # Add this line to initialize Flask-Migrate

with app.app_context():
    db.create_all()
    print("Database tables created successfully")

CORS(
    app,
    resources={r"/*": {"origins": os.getenv("ALLOWED_ORIGINS", "*").split(',')}},
    supports_credentials=False,  # Set to True if your production requires cookies/auth
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
    expose_headers=["Content-Length", "X-JSON"]
)

@app.after_request
def after_request(response):
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'POST, GET, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Origin'] = request.headers.get('Origin', '*')
    return response

@app.route('/api/<path:subpath>', methods=['OPTIONS'])
def handle_preflight(subpath):
    """
    Handle preflight CORS requests for all API routes.
    """
    #print(f"(/api/<path:subpath>) APP.PY-Handling preflight for path: /api/{subpath}")  # Debugging log
    response = jsonify({"message": "Preflight allowed"})
    response.headers['Access-Control-Allow-Origin'] = request.headers.get('Origin', '*')
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT, DELETE'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
    response.headers['Access-Control-Expose-Headers'] = 'Content-Length, X-JSON'
    response.headers['Access-Control-Max-Age'] = '3600'
    return response, 204

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5050)