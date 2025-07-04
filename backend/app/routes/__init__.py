from flask import Blueprint

# Create API blueprint
api = Blueprint("api", __name__)

# Import route files (must be after the Blueprint declaration)
from app.routes.jobs_routes import job_bp
from app.routes.letter_generator import letter_generator_bp
from app.routes.user_profiles_routes import user_profiles_routes_bp
from app.routes.proxy_routes import proxy_bp
from app.routes.embed_routes import embed_bp
from app.routes.autofill_routes import autofill_bp

# Register blueprints for different route groups
api.register_blueprint(job_bp, url_prefix="/jobs")
api.register_blueprint(letter_generator_bp, url_prefix="/letter-generator")
api.register_blueprint(user_profiles_routes_bp, url_prefix="/user-profile")
api.register_blueprint(embed_bp, url_prefix="/api/embed")
api.register_blueprint(autofill_bp, url_prefix="/api/autofill")
api.register_blueprint(proxy_bp, url_prefix="/proxy")