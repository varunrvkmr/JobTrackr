from flask import Blueprint, request, jsonify
from sqlalchemy.orm import Session
from app import db 
from app.models import UserProfileDB 

# Create Blueprint
user_profiles_routes_bp = Blueprint("user_profiles", __name__)

# ✅ Get all user profiles
@user_profiles_routes_bp.route("/", methods=["GET"])
def get_all_user_profiles():
    users = UserProfileDB.query.all()
    return jsonify([{
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "phone": user.phone,
        "city": user.city,
        "state": user.state,
        "bio": user.bio,
        "linkedin": user.linkedin,
        "github": user.github,
        "race": user.race,
        "ethnicity": user.ethnicity,
        "gender": user.gender,
        "disability_status": user.disability_status,
        "veteran_status": user.veteran_status
    } for user in users]), 200

# ✅ Get a single user profile by ID
@user_profiles_routes_bp.route("/<int:user_id>", methods=["GET"])
def get_user_profile(user_id):
    user = UserProfileDB.query.get(user_id)
    if not user:
        return jsonify({"error": "User profile not found"}), 404
    return jsonify({
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "phone": user.phone,
        "city": user.city,
        "state": user.state,
        "bio": user.bio,
        "linkedin": user.linkedin,
        "github": user.github,
        "race": user.race,
        "ethnicity": user.ethnicity,
        "gender": user.gender,
        "disability_status": user.disability_status,
        "veteran_status": user.veteran_status
    }), 200

# ✅ Create a new user profile
@user_profiles_routes_bp.route("/newUser", methods=["POST"])
def create_user_profile():
    data = request.get_json()
    
    if not data.get("email"):
        return jsonify({"error": "Email is required"}), 400

    new_user = UserProfileDB(
        first_name=data.get("first_name"),
        last_name=data.get("last_name"),
        email=data.get("email"),
        phone=data.get("phone"),
        city=data.get("city"),
        state=data.get("state"),
        bio=data.get("bio"),
        linkedin=data.get("linkedin"),
        github=data.get("github"),
        race=data.get("race"),
        ethnicity=data.get("ethnicity"),
        gender=data.get("gender"),
        disability_status=data.get("disability_status"),
        veteran_status=data.get("veteran_status"),
    )

    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({"message": "User profile created successfully", "id": new_user.id}), 201

# ✅ Update an existing user profile
@user_profiles_routes_bp.route("/<int:user_id>", methods=["PUT"])
def update_user_profile(user_id):
    user = UserProfileDB.query.get(user_id)
    if not user:
        return jsonify({"error": "User profile not found"}), 404

    data = request.get_json()
    for key, value in data.items():
        if hasattr(user, key):
            setattr(user, key, value)

    db.session.commit()
    return jsonify({"message": "User profile updated successfully"}), 200
