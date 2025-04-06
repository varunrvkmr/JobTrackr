from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
from flask import send_file
from app.models import FileDB
from app.extensions import db 

file_manager_bp = Blueprint("file_manager", __name__)

# Configure upload directory
UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"pdf", "docx", "png", "jpg", "jpeg"}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@file_manager_bp.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"status": "error", "message": "No file part"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"status": "error", "message": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)

        # ✅ Save file details in DB
        new_file = FileDB(name=filename, path=filepath)
        db.session.add(new_file)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "File uploaded and saved to database",
            "file_id": new_file.id,
            "file_path": new_file.path
        }), 201

    return jsonify({"status": "error", "message": "Invalid file type"}), 400

# ✅ Get List of Uploaded Files
@file_manager_bp.route("/getFiles", methods=["GET"])
def list_files():
    """Fetch all files from the database."""
    files = FileDB.query.order_by(FileDB.uploaded_at.desc()).all()
    return jsonify([{'id': f.id, 'name': f.name, 'path': f.path} for f in files])

# ✅ Delete a File
@file_manager_bp.route("/delete/<filename>", methods=["DELETE"])
def delete_file(filename):
    filepath = os.path.join(UPLOAD_FOLDER, filename)

    if os.path.exists(filepath):
        os.remove(filepath)
        return jsonify({"status": "success", "message": f"File '{filename}' deleted"}), 200

    return jsonify({"status": "error", "message": "File not found"}), 404

@file_manager_bp.route("/files/<file_id>", methods=["GET"])
def get_file(file_id):
    """Serve the file by ID so users can open it in a new tab."""
    file_entry = FileDB.query.get(file_id)
    if not file_entry:
        return jsonify({"status": "error", "message": "File not found"}), 404

    file_path = os.path.join(UPLOAD_FOLDER, file_entry.filename)
    if os.path.exists(file_path):
        return send_file(file_path, as_attachment=False)  # Set to True for forced download
    return jsonify({"status": "error", "message": "File not found"}), 404





# ✅ Get File Content (for viewing in UI)
@file_manager_bp.route('/content/', methods=['GET'])
def get_any_file_content():
    """Fetch the content of the first available uploaded file or return a placeholder response."""
    
    # ✅ Get the first file from the database
    file_record = FileDB.query.order_by(FileDB.uploaded_at.desc()).first()
    
    if not file_record:
        return jsonify({"status": "error", "message": "No Resume on File"}), 200  # ✅ Prevents frontend crashes

    file_name = file_record.name
    file_path = os.path.join("/app/uploads", file_name)

    if not os.path.exists(file_path):
        return jsonify({"status": "error", "message": f"File {file_name} not found"}), 200  # ✅ Prevents frontend crashes

    return send_file(file_path, as_attachment=False)