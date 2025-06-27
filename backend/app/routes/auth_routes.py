from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.extensions import db 
from app.models.UserAuth import UserAuth
from flask import make_response
from flask_jwt_extended import create_refresh_token
from datetime import timedelta
from flask_jwt_extended import decode_token
from flask_jwt_extended.exceptions import JWTDecodeError
from flask import current_app
from app.models.UserProfileDB import UserProfileDB

auth_bp = Blueprint("auth", __name__)
# 🔐 Register a new user
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    print("Received payload:", data)

    # Extract required fields
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    first_name = data.get("first_name")
    last_name = data.get("last_name")

    # Optional fields
    phone = data.get("phone")
    location = data.get("location")  # mapped to city in UserProfileDB

    print(f"Parsed registration fields: {username}, {email}, {first_name}, {last_name}, {phone}, {location}")

    # Validate required fields
    if not all([username, email, password, first_name, last_name]):
        return jsonify({"error": "Missing required fields"}), 400

    # Prevent duplicate emails
    if UserAuth.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 400

    try:
        # Create UserAuth entry
        user = UserAuth(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        # Create corresponding UserProfileDB entry
        profile = UserProfileDB(
            user_auth_id=user.id,
            first_name=first_name,
            last_name=last_name,
            email=email,
            phone=phone,
            location=location  # using location field as city
        )
        db.session.add(profile)
        db.session.commit()

        print("✅ User and profile successfully created")

        return jsonify({"message": "User registered successfully", "id": user.id}), 201

    except Exception as e:
        print("🔥 Exception during registration:", str(e))
        return jsonify({"error": "Internal server error"}), 500


'''
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    print("Received payload:", data)

    # Explicit field extraction
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    print("Parsed username:", username)
    print("Parsed email:", email)
    print("Parsed password:", password)

    if not username or not email or not password:
        return jsonify({"error": "Username, email, and password are required"}), 400

    if UserAuth.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 400

    try:
        user = UserAuth(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
    except Exception as e:
        print("Exception during user creation:", str(e))
        return jsonify({"error": "Internal server error"}), 500

    return jsonify({"message": "User registered successfully", "id": user.id}), 201
'''

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

    # ✅ Generate tokens
    access_token = create_access_token(identity=str(user.id), expires_delta=timedelta(minutes=15))
    refresh_token = create_refresh_token(identity=str(user.id), expires_delta=timedelta(days=30))

    profile = UserProfileDB.query.filter_by(user_auth_id=user.id).first()
    profile_id = profile.id if profile else None

    # Build response payload
    payload = {
        "message": "Login successful",
        "authId":    user.id,
        "profileId": profile_id
    }

    response = make_response(jsonify(payload), 200)

    # ✅ Set access token cookie (short-lived)
    response.set_cookie(
        "access_token_cookie",
        access_token,
        httponly=True,
        secure=False,  # True only in production (HTTPS)
        samesite="Lax",
        path="/",  # available for all routes
        max_age=60 * 15  # 15 minutes
    )

    # ✅ Set refresh token cookie (long-lived)
    response.set_cookie(
        "refresh_token_cookie",
        refresh_token,
        httponly=True,
        secure=False,
        samesite="Lax",
        path="/api/auth/refresh",
        max_age=60 * 60 * 24 * 30
    )

    return response

@auth_bp.route("/refresh", methods=["POST"])
def refresh():
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        return jsonify({"error": "Refresh token not found"}), 401

    try:
        decoded = decode_token(refresh_token)
        identity = decoded["sub"]
    except JWTDecodeError:
        return jsonify({"error": "Invalid refresh token"}), 401

    new_access_token = create_access_token(identity=identity)
    return jsonify({"access_token": new_access_token})

@auth_bp.route("/logout", methods=["POST"])
def logout():
    response = jsonify({"message": "Logged out"})

    response.delete_cookie("access_token_cookie", path="/")
    response.delete_cookie("refresh_token_cookie", path="/api/auth/refresh")

    return response, 200
@auth_bp.route("/check", methods=["GET"])
@jwt_required()
def check_auth():
    return jsonify({"authenticated": True}), 200

# 👤 Get auth user info by ID
@auth_bp.route("/user/<int:user_id>", methods=["GET"])
@jwt_required()
def get_auth_user(user_id):
    current_user_id = get_jwt_identity()
    print("Current user ID from token:", current_user_id)

    user = UserAuth.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "email": user.email,
        "username": user.username
    }), 200


# 🔐 Example of a protected route
@auth_bp.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify({"message": f"Hello user {current_user}, you're authenticated!"}), 200
