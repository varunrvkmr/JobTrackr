import os
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from pdfminer.high_level import extract_text

resume_parser_bp = Blueprint('resume_parser', __name__)

UPLOAD_FOLDER = "uploads/resumes"
ALLOWED_EXTENSIONS = {"pdf"}

# Ensure the upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@resume_parser_bp.route('/upload-resume', methods=['POST'])
def upload_resume():
    """Handles resume upload and extraction"""
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type"}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    # Extract text from resume
    extracted_text = extract_text_from_pdf(file_path)
    return jsonify({"filename": filename, "extracted_text": extracted_text})

def extract_text_from_pdf(file_path):
    """Extracts text from a PDF file using pdfminer.six"""
    try:
        text = extract_text(file_path)
        return text.strip() if text else "No text found in PDF"
    except Exception as e:
        return f"Error extracting text: {str(e)}"
