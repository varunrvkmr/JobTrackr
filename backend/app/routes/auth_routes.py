from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.extensions import db 
from app.models.UserAuth import UserAuth

auth_bp = Blueprint("auth", __name__)
# 🔐 Register a new user
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
    #access_token = create_access_token(identity=user.id)
    print("User ID type:", type(user.id))
    print("Stringified ID type:", type(str(user.id)))
    print("Stringified ID value:", str(user.id))
    access_token = create_access_token(identity=str(user.id))

    #access_token = create_access_token(identity=str(user.id))  # ✅ cast to string
    return jsonify({"token": access_token, "id": user.id}), 200


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
