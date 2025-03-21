from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from app.extensions import db
from flask_migrate import Migrate
from app.routes.jobs_routes import job_bp
from app.routes.fileManagerRoutes import file_manager_bp
from app.routes.letter_generator import letter_generator_bp
from app.routes.user_profiles_routes import user_profiles_routes_bp
from app.routes.auth_routes import auth_bp  # ✅ Add this line
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv 
import os

jwt = JWTManager()

def create_app():
    """Factory function to create a Flask app instance."""
    app = Flask(__name__)
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "fallback-secret")

    # ✅ Allow CORS only for localhost:3000 (Frontend)
    CORS(app, resources={
        r"/*": {
            "origins": [
                "http://localhost:3000",  # Allow frontend (React)
                "https://www.linkedin.com"  # Allow LinkedIn job scraping
            ],
            "supports_credentials": True
        }
    })

    app.config.from_object(Config)

    # Initialize database
    db.init_app(app)
    jwt.init_app(app)
    Migrate(app, db)

    with app.app_context():
        from app.models import JobDB

    # ✅ Ensure the health check route is correctly registered
    @app.route('/api/', methods=['GET'])
    def backend_status():
        return jsonify({"message": "✅ Backend is running on port 5050!"})


    # Import and register API routes
    app.register_blueprint(job_bp, url_prefix="/api/jobs")
    app.register_blueprint(file_manager_bp, url_prefix="/api/files") 
    #app.register_blueprint(browser_bp, url_prefix="/api")
    app.register_blueprint(letter_generator_bp, url_prefix="/api/letter-generator")
    app.register_blueprint(user_profiles_routes_bp, url_prefix="/api/user-profile")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    return app
