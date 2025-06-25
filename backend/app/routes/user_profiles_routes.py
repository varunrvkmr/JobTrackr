from flask import Blueprint, request, jsonify
from sqlalchemy.orm import Session
from app import db 
from app.models.UserProfileDB import UserProfileDB 
from flask_jwt_extended import jwt_required, get_jwt_identity

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
        "location": user.location,
        "bio": user.bio,
        "linkedin": user.linkedin,
        "github": user.github,
        "race": user.race,
        "ethnicity": user.ethnicity,
        "gender": user.gender,
        "disability_status": user.disability_status,
        "veteran_status": user.veteran_status
    } for user in users]), 200


@user_profiles_routes_bp.route("/me", methods=["GET"])
@jwt_required()
def get_logged_in_user_profile():
    user_auth_id = get_jwt_identity()
    
    user = UserProfileDB.query.filter_by(user_auth_id=user_auth_id).first()
    
    if not user:
        return jsonify({"error": "Profile not found"}), 404

    return jsonify({
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "phone": user.phone,
        "location": user.location,
        "bio": user.bio,
        "linkedin": user.linkedin,
        "github": user.github,
        "race": user.race,
        "ethnicity": user.ethnicity,
        "gender": user.gender,
        "disability_status": user.disability_status,
        "veteran_status": user.veteran_status
    }), 200

@user_profiles_routes_bp.route("/me", methods=["PUT"])
@jwt_required()
def update_my_profile():
    user_auth_id = get_jwt_identity()
    profile = UserProfileDB.query.filter_by(user_auth_id=user_auth_id).first_or_404()

    data = request.get_json() or {}
    if "email" in data and data["email"] != profile.email:
        return jsonify({"error": "Cannot change email"}), 400

    updatable = {
        "first_name","last_name","phone","location","state",
        "bio","linkedin","github","race","ethnicity",
        "gender","disability_status","veteran_status"
    }
    for field in updatable:
        if field in data:
            setattr(profile, field, data[field])

    db.session.commit()
    return jsonify({"message":"Profile updated successfully"}), 200



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
        location=data.get("location"),
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