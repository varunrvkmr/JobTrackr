from flask import Flask, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from config import Config
from app.extensions import db
from app.routes.jobs_routes import job_bp
from app.routes.letter_generator import letter_generator_bp
from app.routes.user_profiles_routes import user_profiles_routes_bp
from app.routes.auth_routes import auth_bp
from app.routes.proxy_routes import proxy_bp
from dotenv import load_dotenv
import os

jwt = JWTManager()

def create_app():
    """Factory function to create a Flask app instance."""

    # Load .env variables
    load_dotenv()

    # Create Flask app
    app = Flask(__name__)

    # Load secret keys and config
    app.config.from_object(Config)
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "fallback-secret")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")

    # JWT cookie-based configuration (add these lines)
    app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
    app.config["JWT_COOKIE_SECURE"] = False           # False for localhost HTTP
    app.config["JWT_COOKIE_SAMESITE"] = "Lax"         # Supports cross-port auth on localhost
    app.config["JWT_COOKIE_CSRF_PROTECT"] = False     # Optional — set True in prod with CSRF protection

    # OpenAI key (optional — store in config or env as needed)
    app.config["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")

    # CORS for both /api and /proxy
    CORS(app, resources={
        r"/api/*": {
            "origins": [
                "chrome-extension://micccolehgefkhdjlalncmomknlankaj",
                "http://localhost:3000"
            ],
            "supports_credentials": True
        },
        r"/proxy/*": {
            "origins": "*",
            "supports_credentials": False
        }
    })

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    Migrate(app, db)

    # Ensure tables are created in dev
    with app.app_context():
        from app.models import JobDB  # add others if needed
        db.create_all()
        print("Database tables created successfully")

    # Register blueprints
    app.register_blueprint(job_bp, url_prefix="/api/jobs")
    app.register_blueprint(letter_generator_bp, url_prefix="/api/letter-generator")
    app.register_blueprint(user_profiles_routes_bp, url_prefix="/api/user-profile")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(proxy_bp, url_prefix="/proxy")

    # Health check
    @app.route('/api/', methods=['GET'])
    def backend_status():
        return jsonify({"message": "✅ Backend is running on port 5050!"})

    return app
