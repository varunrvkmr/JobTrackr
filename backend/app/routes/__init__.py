from flask import Blueprint

# Create API blueprint
api = Blueprint("api", __name__)

# Import route files (must be after the Blueprint declaration)
from app.routes.jobs_routes import job_bp
from app.routes.fileManagerRoutes import file_manager_bp
from app.routes.letter_generator import letter_generator_bp
from app.routes.snippetsRoutes import snippet_bp
from app.routes.user_profiles_routes import user_profiles_routes_bp
from app.routes.proxy_routes import proxy_bp

# Register blueprints for different route groups
api.register_blueprint(job_bp, url_prefix="/jobs")
api.register_blueprint(file_manager_bp, url_prefix="/files")
api.register_blueprint(letter_generator_bp, url_prefix="/letter-generator")
api.register_blueprint(snippet_bp, url_prefix="/snippets")
api.register_blueprint(user_profiles_routes_bp, url_prefix="/user-profile")
api.register_blueprint(proxy_bp, url_prefix="/proxy")

