from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db 
from app.models.UserAuth import UserAuth

auth_bp = Blueprint("auth", __name__)

# 🔐 Register a new user
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    if UserAuth.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 400

    user = UserAuth(email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User registered successfully", "id": user.id}), 201


# 🔑 Login route
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = UserAuth.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password"}), 401

    # ✅ Generate JWT token
    access_token = create_access_token(identity=user.id)
    return jsonify({"token": access_token, "id": user.id}), 200


# 🔐 Example of a protected route
@auth_bp.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify({"message": f"Hello user {current_user}, you're authenticated!"}), 200
