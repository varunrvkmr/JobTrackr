from flask import Blueprint, request, jsonify
from playwright.sync_api import sync_playwright
import logging

browser_bp = Blueprint("browser", __name__)

@browser_bp.route('/start-automation', methods=['POST'])
def start_automation():
    try:
        data = request.json
        job_url = data.get("job_url")
        user_info = data.get("user_info")

        if not job_url:
            return jsonify({"error": "Job URL is required"}), 400

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=False)  # Ensure user can review
            page = browser.new_page()
            page.goto(job_url)

            # Autofill form fields
            page.fill('input[name="full_name"]', user_info["name"])
            page.fill('input[name="email"]', user_info["email"])
            page.fill('input[name="phone"]', user_info["phone"])
            page.fill('textarea[name="cover_letter"]', user_info["cover_letter"])

            # Notify user via alert before manual submission
            page.evaluate('alert("Automation complete! Please review and submit manually.")')

            return jsonify({"message": "Automation finished, please review."})

    except Exception as e:
        logging.exception("Error in browser automation")
        return jsonify({"error": str(e)}), 500
