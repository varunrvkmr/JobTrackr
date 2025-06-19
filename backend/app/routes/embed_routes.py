# app/routes/embed_routes.py

from flask import Blueprint, request, jsonify, current_app
import tensorflow_hub as hub
import os

embed_bp = Blueprint('embed', __name__, url_prefix='/api/embed')

@embed_bp.route('/health', methods=['GET'])
def health_check():
    """
    Warm-up endpoint: triggers loading of the USE model.
    Returns 200 OK once the model is loaded.
    """
    try:
        # this will load the model if it isn’t already in memory
        _ = get_embed_model()
        return jsonify(status="ok", model_loaded=True), 200
    except Exception as e:
        current_app.logger.error(f"Embed health check failed: {e}")
        return jsonify(status="error", message=str(e)), 500


# Lazily load the model once per worker
_model = None
def get_embed_model():
    global _model
    if _model is None:
        current_app.logger.info("🔹 Loading Universal Sentence Encoder model…")
        #_model = hub.load('https://tfhub.dev/google/universal-sentence-encoder/4')
        # Load the locally-packaged model at startup
# embed_routes.py lives in /app/app/routes/…, so go up one level to /app/app
        LOCAL_MODEL_PATH = os.path.abspath(
            os.path.join(os.path.dirname(__file__), '..', 'ml-models')
        )
        current_app.logger.info(f"🔹 Loading USE from local path: {LOCAL_MODEL_PATH}")
        _model = hub.load(LOCAL_MODEL_PATH)
        current_app.logger.info("✅ Model loaded")
    return _model

@embed_bp.route('', methods=['POST'])
def embed_texts():
    """
    Expects JSON: { "texts": ["foo", "bar", ...] }
    Returns JSON: { "embeddings": [[…], […], …] }
    """
    payload = request.get_json(silent=True)
    if not payload or 'texts' not in payload or not isinstance(payload['texts'], list):
        return jsonify(error="Invalid payload, expected {'texts': [...] }"), 400

    texts = payload['texts']
    model = get_embed_model()
    # This can be made async or batched more intelligently if needed
    embeddings = model(texts).numpy().tolist()
    return jsonify(embeddings=embeddings), 200
