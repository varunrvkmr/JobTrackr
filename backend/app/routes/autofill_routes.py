import os
import json
import numpy as np
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.routes.embed_routes import get_embed_model
from app.models.UserProfileDB import UserProfileDB  # adjust import according to your project structure

# Blueprint for autofill functionality
autofill_bp = Blueprint('autofill', __name__, url_prefix='/api/autofill')

# Load precomputed canonical embeddings once at import
data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'canonical_embeddings.json')
with open(data_path, 'r') as f:
    canonical_embeddings = json.load(f)

# Similarity threshold for matching labels to canonical fields
SIMILARITY_THRESHOLD = 0.6


def cosine_similarity(a: list, b: list) -> float:
    """
    Compute cosine similarity between two vectors.
    """
    a_arr = np.array(a)
    b_arr = np.array(b)
    if np.linalg.norm(a_arr) == 0 or np.linalg.norm(b_arr) == 0:
        return 0.0
    return float(np.dot(a_arr, b_arr) / (np.linalg.norm(a_arr) * np.linalg.norm(b_arr)))


@autofill_bp.route('/classify', methods=['POST'])
@jwt_required()
def classify_fields():
    """
    Classify form fields by semantic similarity to canonical profile fields.

    Request JSON:
      {
        "fields": [
          { "selector": ".foo > input", "label": "First name", "placeholder": "Your given name" },
          ...
        ]
      }

    Response JSON:
      {
        "matches": [
          { "selector": ".foo > input", "canonical": "first_name", "score": 0.82 },
          ...
        ]
      }
    """
    data = request.get_json(force=True) or {}
    fields = data.get('fields')
    if not isinstance(fields, list) or not fields:
        return jsonify(error="Must supply a non-empty 'fields' array"), 400

    # Extract text inputs: prefer label, fallback to placeholder
    texts = [f.get('label', '') or f.get('placeholder', '') for f in fields]

    # Embed all texts in a single batch
    model = get_embed_model()
    embeds = model(texts).numpy().tolist()

    matches = []
    for field, vec in zip(fields, embeds):
        best_match = None
        best_score = 0.0
        # Compare against each canonical embedding
        for canon, canon_vec in canonical_embeddings.items():
            score = cosine_similarity(vec, canon_vec)
            if score > best_score:
                best_match = canon
                best_score = score
        # Apply similarity threshold
        if best_score >= SIMILARITY_THRESHOLD:
            matches.append({
                "selector": field.get('selector'),
                "canonical": best_match,
                "score": round(best_score, 4)
            })

    return jsonify(matches=matches), 200


@autofill_bp.route('/fill', methods=['POST'])
@jwt_required()
def fill_fields():
    """
    Generate fill values for matched form fields based on user profile.

    Request JSON:
      {
        "matches": [
          { "selector": ".foo > input", "canonical": "email", "score": 0.78 },
          ...
        ]
      }

    Response JSON:
      {
        "fills": [
          { "selector": ".foo > input", "value": "user@example.com" },
          ...
        ]
      }
    """
    data = request.get_json(force=True) or {}
    matches = data.get('matches')
    if not isinstance(matches, list) or not matches:
        return jsonify(error="Must supply a non-empty 'matches' array"), 400

    # Retrieve current user's profile
    user_id = get_jwt_identity()
    profile = UserProfileDB.query.filter_by(user_auth_id=user_id).first()
    if not profile:
        return jsonify(error="User profile not found"), 404

    fills = []
    for m in matches:
        canon_field = m.get('canonical')
        value = getattr(profile, canon_field, None)
        if value is not None:
            fills.append({"selector": m.get('selector'), "value": value})

    return jsonify(fills=fills), 200
