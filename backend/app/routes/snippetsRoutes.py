from flask import Blueprint, jsonify, request
from app import db  # ✅ Import `db` from `app/__init__.py`
from app.models import SnippetDB  # ✅ Import `Job` from `models.py`

# Define blueprint for /api/snippets
snippet_bp = Blueprint('snippets', __name__, url_prefix='/api/snippets')

def handle_proxied_url(func):
    """Decorator to handle proxied URLs."""
    def wrapper(*args, **kwargs):
        print(f"SN-Original Request Path: {request.path}")  # Debugging log
        if request.path.startswith('/http://') and '/snippets' not in request.path:
            proxied_url = request.path.replace('/http://127.0.0.1:8080', '', 1).lstrip('/')
            print(f"SN-Rewritten Request Path: {proxied_url}")  # Debugging log
            request.environ['PATH_INFO'] = proxied_url
        return func(*args, **kwargs)
    wrapper.__name__ = f"{func.__name__}_proxied"  # Ensure unique endpoint name
    return wrapper


# Fetch all snippets
@snippet_bp.route('/all', methods=['GET'], endpoint="get_snippets")
@handle_proxied_url
def get_snippets():
    """Fetch all snippets from the database."""
    snippets = SnippetDB.query.order_by(SnippetDB.created_at.desc()).all()
    return jsonify([{'id': s.id, 'content': s.content} for s in snippets])

# Add a new snippet
@snippet_bp.route('/add', methods=['POST'], endpoint="add_snippet")
@handle_proxied_url
def add_snippet():
    """Add a new snippet to the database."""
    print("add_snippet route called")  # Debug log
    data = request.get_json()
    print("Request data:", data)  # Debug log

    content = data.get('content')
    if not content:
        return jsonify({'error': 'Content is required'}), 400

    snippet = SnippetDB(content=content)
    db.session.add(snippet)
    db.session.commit()
    return jsonify({'id': snippet.id, 'content': snippet.content}), 201

# Delete a snippet
@snippet_bp.route('/delete/<int:id>', methods=['DELETE'], endpoint="delete_snippet")
@handle_proxied_url
def delete_snippet(id):
    """Delete a snippet from the database."""
    snippet = SnippetDB.query.get(id)
    if not snippet:
        return jsonify({'error': 'Snippet not found'}), 404

    db.session.delete(snippet)
    db.session.commit()
    return jsonify({'message': f'Snippet {id} deleted successfully'}), 200
