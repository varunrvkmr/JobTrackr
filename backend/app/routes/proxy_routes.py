# /routes/proxy_routes.py
from flask import Blueprint, request, jsonify
import requests

proxy_bp = Blueprint("proxy", __name__)

@proxy_bp.route("/proxy/linkedin", methods=["GET"])
def proxy_linkedin():
    target_url = request.args.get("url")
    if not target_url:
        return jsonify({"error": "Missing 'url' parameter"}), 400

    try:
        headers = {
            "User-Agent": "Mozilla/5.0",
        }
        response = requests.get(target_url, headers=headers)
        return response.text, response.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500
