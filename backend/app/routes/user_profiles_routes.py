from flask import Blueprint, request, jsonify
from sqlalchemy.orm import Session
from app import db 
from app.models.UserProfileDB import UserProfileDB 
from app.models.education_history import EducationHistory
from app.models.work_history import WorkHistory
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

    # build education array
    education_entries = [
        {
            "id": edu.id,
            "school_name": edu.school_name,
            "degree": edu.degree,
            "field_of_study": edu.field_of_study,
            "is_current": edu.is_current,
            "start_date": edu.start_date.isoformat() if edu.start_date else None,
            "end_date":   edu.end_date.isoformat()   if edu.end_date   else None,
        }
        for edu in user.education_entries
    ]

    # build work array
    work_entries = [
        {
            "id": work.id,
            "company":    work.company,
            "position":   work.position,
            "description": work.description,
            "is_current":  work.is_current,
            "start_date":  work.start_date.isoformat() if work.start_date else None,
            "end_date":    work.end_date.isoformat()   if work.end_date   else None,
        }
        for work in user.work_entries
    ]

    return jsonify({
        "id": user.id,
        "first_name": user.first_name,
        "last_name":  user.last_name,
        "email":      user.email,
        "phone":      user.phone,
        "location":   user.location,
        "bio":        user.bio,
        "linkedin":   user.linkedin,
        "github":     user.github,
        "race":       user.race,
        "ethnicity":  user.ethnicity,
        "gender":     user.gender,
        "disability_status": user.disability_status,
        "veteran_status":    user.veteran_status,

        # **new fields**:
        "education_history": education_entries,
        "work_history":      work_entries,
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
    return get_logged_in_user_profile()



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

@user_profiles_routes_bp.route("/education", methods=["POST"])
@jwt_required()
def add_education_entry():
    user_auth_id = get_jwt_identity()
    user_profile = UserProfileDB.query.filter_by(user_auth_id=user_auth_id).first_or_404()

    data = request.get_json() or {}

    required_fields = ["school_name"]
    for field in required_fields:
        if not data.get(field):
            return jsonify({"error": f"{field} is required"}), 400

    new_edu = EducationHistory(
        user_profile_id=user_profile.id,
        school_name=data.get("school_name"),
        degree=data.get("degree"),
        field_of_study=data.get("field_of_study"),
        is_current=data.get("is_current", False),
        start_date=data.get("start_date"),  # pass as "YYYY-MM-DD" string, Postgres Date will parse
        end_date=data.get("end_date"),
    )

    db.session.add(new_edu)
    db.session.commit()

    return jsonify({
        "message": "Education entry created successfully",
        "education_entry": {
            "id": new_edu.id,
            "school_name": new_edu.school_name,
            "degree": new_edu.degree,
            "field_of_study": new_edu.field_of_study,
            "is_current": new_edu.is_current,
            "start_date": new_edu.start_date.isoformat() if new_edu.start_date else None,
            "end_date": new_edu.end_date.isoformat() if new_edu.end_date else None,
        }
    }), 201

@user_profiles_routes_bp.route("/education/<int:edu_id>", methods=["PUT"])
@jwt_required()
def update_education_entry(edu_id):
    user_auth_id = get_jwt_identity()
    # fetch the user’s profile
    user_profile = UserProfileDB.query.filter_by(user_auth_id=user_auth_id).first_or_404()

    # fetch the education entry, ensuring it belongs to this profile
    edu = EducationHistory.query.get_or_404(edu_id)
    if edu.user_profile_id != user_profile.id:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json() or {}

    # List of fields we allow to update
    updatable = [
        "school_name",
        "degree",
        "field_of_study",
        "is_current",
        "start_date",
        "end_date",
    ]

    for field in updatable:
        if field in data:
            setattr(edu, field, data[field])

    db.session.commit()

    return jsonify({
        "message": "Education entry updated successfully",
        "education_entry": {
            "id": edu.id,
            "school_name": edu.school_name,
            "degree": edu.degree,
            "field_of_study": edu.field_of_study,
            "is_current": edu.is_current,
            "start_date": edu.start_date.isoformat() if edu.start_date else None,
            "end_date": edu.end_date.isoformat() if edu.end_date else None,
        }
    }), 200

@user_profiles_routes_bp.route("/education/<int:edu_id>", methods=["DELETE"])
@jwt_required()
def delete_education_entry(edu_id):
    user_auth_id = get_jwt_identity()
    # fetch the user’s profile
    user_profile = UserProfileDB.query.filter_by(user_auth_id=user_auth_id).first_or_404()

    # fetch the education entry, ensuring it exists
    edu = EducationHistory.query.get_or_404(edu_id)
    if edu.user_profile_id != user_profile.id:
        return jsonify({"error": "Unauthorized"}), 403

    # delete and commit
    db.session.delete(edu)
    db.session.commit()

    return jsonify({"message": "Education entry deleted successfully"}), 200

@user_profiles_routes_bp.route("/work", methods=["POST"])
@jwt_required()
def add_work_entry():
    user_auth_id = get_jwt_identity()
    user_profile = UserProfileDB.query.filter_by(user_auth_id=user_auth_id).first_or_404()

    data = request.get_json() or {}

    # require at least company
    if not data.get("company"):
        return jsonify({"error": "company is required"}), 400

    new_work = WorkHistory(
        user_profile_id=user_profile.id,
        company=data.get("company"),
        position=data.get("position"),
        description=data.get("description"),
        is_current=data.get("is_current", False),
        start_date=data.get("start_date"),
        end_date=data.get("end_date"),
    )

    db.session.add(new_work)
    db.session.commit()

    return jsonify({
        "message": "Work entry created successfully",
        "work_entry": {
            "id": new_work.id,
            "company": new_work.company,
            "position": new_work.position,
            "description": new_work.description,
            "is_current": new_work.is_current,
            "start_date": new_work.start_date.isoformat() if new_work.start_date else None,
            "end_date":   new_work.end_date.isoformat()   if new_work.end_date   else None,
        }
    }), 201


@user_profiles_routes_bp.route("/work/<int:work_id>", methods=["PUT"])
@jwt_required()
def update_work_entry(work_id):
    user_auth_id = get_jwt_identity()
    user_profile = UserProfileDB.query.filter_by(user_auth_id=user_auth_id).first_or_404()

    work = WorkHistory.query.get_or_404(work_id)
    if work.user_profile_id != user_profile.id:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json() or {}
    updatable = [
        "company",
        "position",
        "description",
        "is_current",
        "start_date",
        "end_date",
    ]

    for field in updatable:
        if field in data:
            setattr(work, field, data[field])

    db.session.commit()

    return jsonify({
        "message": "Work entry updated successfully",
        "work_entry": {
            "id": work.id,
            "company": work.company,
            "position": work.position,
            "description": work.description,
            "is_current": work.is_current,
            "start_date": work.start_date.isoformat() if work.start_date else None,
            "end_date":   work.end_date.isoformat()   if work.end_date   else None,
        }
    }), 200

@user_profiles_routes_bp.route("/work/<int:work_id>", methods=["DELETE"])
@jwt_required()
def delete_work_entry(work_id):
    user_auth_id = get_jwt_identity()
    user_profile = UserProfileDB.query.filter_by(user_auth_id=user_auth_id).first_or_404()

    work = WorkHistory.query.get_or_404(work_id)
    if work.user_profile_id != user_profile.id:
        return jsonify({"error": "Unauthorized"}), 403

    db.session.delete(work)
    db.session.commit()

    return jsonify({"message": "Work entry deleted successfully"}), 200
