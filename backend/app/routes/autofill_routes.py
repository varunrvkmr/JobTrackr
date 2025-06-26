import os
import json
import numpy as np
import re
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
import csv
from datetime import datetime
from typing import Dict, List, Any, Tuple

from app.routes.embed_routes import get_embed_model
from app.models.UserProfileDB import UserProfileDB

# Blueprint for autofill functionality
autofill_bp = Blueprint('autofill', __name__, url_prefix='/api/autofill')

# —————— CSV LOG SETUP ——————
LOG_DIR = os.path.join(os.path.dirname(__file__), '..', 'logs')
os.makedirs(LOG_DIR, exist_ok=True)

CSV_PATH = os.path.join(LOG_DIR, 'model_calls.csv')
_log_file = open(CSV_PATH, 'a', newline='', encoding='utf-8')
_csv_writer = csv.writer(_log_file)
if _log_file.tell() == 0:
    _csv_writer.writerow([
        'timestamp',
        'route',
        'selector',
        'label', 
        'placeholder',
        'field_type',
        'required',
        'predicted',
        'score',
        'threshold_used',
        'confidence_signals',
        'decision'
    ])
# —————————————————————————

# Load precomputed canonical embeddings
data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'canonical_embeddings.json')
with open(data_path, 'r') as f:
    canonical_embeddings = json.load(f)

# —————— DYNAMIC THRESHOLD CONFIGURATION ——————
BASE_THRESHOLD = 0.6

# Field type specific thresholds
FIELD_TYPE_THRESHOLDS = {
    'email': 0.8,
    'password': 0.95,
    'hidden': 0.95,
    'tel': 0.75,
    'url': 0.8,
    'number': 0.7,
    'date': 0.75,
    'text': 0.6,
    'textarea': 0.65,
    'select': 0.7,
    'checkbox': 0.8,
    'radio': 0.8
}

# Pattern-based confidence detection
CONFIDENCE_PATTERNS = {
    'email': r'email|e-?mail|mail(?!ing)',
    'phone': r'phone|tel|mobile|cell',
    'name': r'(?:first|last|full|given|sur)?name|fname|lname',
    'address': r'address|street|addr(?:ess)?',
    'city': r'city|town',
    'state': r'state|province|region',
    'zip': r'zip|postal|postcode',
    'company': r'company|organization|employer|business',
    'title': r'(?:job\s+)?title|position|role',
    'salary': r'salary|wage|pay|compensation|income',
    'date': r'date|birth|dob|start|end',
    'website': r'website|url|portfolio|linkedin|github|site'
}

# Threshold adjustment values
THRESHOLD_ADJUSTMENTS = {
    'required_field': -0.05,        # Lower threshold for required fields
    'has_validation': -0.05,        # Lower threshold for fields with patterns
    'multiple_signals': -0.1,       # Lower threshold when multiple patterns match
    'pattern_match': -0.05,         # Lower threshold for pattern matches
    'ambiguous_label': 0.1,         # Higher threshold for vague labels
    'short_label': 0.05,            # Higher threshold for very short labels
    'generic_terms': 0.08           # Higher threshold for generic terms
}

def cosine_similarity(a: list, b: list) -> float:
    """Compute cosine similarity between two vectors."""
    a_arr = np.array(a)
    b_arr = np.array(b)
    if np.linalg.norm(a_arr) == 0 or np.linalg.norm(b_arr) == 0:
        return 0.0
    return float(np.dot(a_arr, b_arr) / (np.linalg.norm(a_arr) * np.linalg.norm(b_arr)))

def get_pattern_matches(text: str) -> List[str]:
    """Find which predefined patterns match the field text."""
    matches = []
    for pattern_name, pattern in CONFIDENCE_PATTERNS.items():
        if re.search(pattern, text, re.IGNORECASE):
            matches.append(pattern_name)
    return matches

def is_ambiguous_field(text: str) -> bool:
    """Determine if a field has ambiguous or generic labeling."""
    if len(text.strip()) < 3:
        return True
    
    ambiguous_terms = [
        'input', 'field', 'text', 'value', 'data', 'info', 'information',
        'details', 'other', 'additional', 'misc', 'miscellaneous', 'enter'
    ]
    
    words = text.lower().split()
    return any(term in words for term in ambiguous_terms)

def extract_field_context(field: Dict[str, Any]) -> Dict[str, Any]:
    """Extract contextual information about a field."""
    label = field.get('label', '').strip()
    placeholder = field.get('placeholder', '').strip()
    field_type = field.get('type', 'text').lower()
    name = field.get('name', '').strip()
    id_attr = field.get('id', '').strip()
    required = field.get('required', False)
    pattern = field.get('pattern', '')
    maxlength = field.get('maxlength')
    
    # Combine text sources with priority: label > placeholder > name > id
    combined_text = label or placeholder or name or id_attr
    all_text = f"{label} {placeholder} {name} {id_attr}".strip()
    
    pattern_matches = get_pattern_matches(all_text)
    
    return {
        'field_type': field_type,
        'combined_text': combined_text,
        'all_text': all_text,
        'required': required,
        'has_pattern': bool(pattern),
        'has_maxlength': maxlength is not None,
        'text_length': len(combined_text),
        'pattern_matches': pattern_matches,
        'is_ambiguous': is_ambiguous_field(combined_text),
        'label': label,
        'placeholder': placeholder,
        'name': name,
        'id': id_attr
    }

def calculate_dynamic_threshold(field: Dict[str, Any], canonical_field: str) -> Tuple[float, List[str]]:
    """Calculate dynamic threshold for a specific field."""
    context = extract_field_context(field)
    
    # Start with field-type specific threshold
    threshold = FIELD_TYPE_THRESHOLDS.get(context['field_type'], BASE_THRESHOLD)
    
    confidence_signals = []
    
    # Pattern matching bonuses
    if context['pattern_matches']:
        threshold += THRESHOLD_ADJUSTMENTS['pattern_match']
        confidence_signals.append('pattern_match')
        
        # Extra bonus if pattern matches canonical field
        canonical_lower = canonical_field.lower()
        for pattern in context['pattern_matches']:
            if pattern in canonical_lower or canonical_lower.replace('_', '') in pattern:
                threshold += THRESHOLD_ADJUSTMENTS['pattern_match']
                confidence_signals.append('pattern_canonical_match')
                break
    
    # Multiple pattern matches increase confidence
    if len(context['pattern_matches']) >= 2:
        threshold += THRESHOLD_ADJUSTMENTS['multiple_signals']
        confidence_signals.append('multiple_patterns')
    
    # Required fields adjustment
    if context['required']:
        threshold += THRESHOLD_ADJUSTMENTS['required_field']
        confidence_signals.append('required_field')
    
    # Validation pattern adjustment
    if context['has_pattern']:
        threshold += THRESHOLD_ADJUSTMENTS['has_validation']
        confidence_signals.append('has_validation')
    
    # Penalize ambiguous fields
    if context['is_ambiguous']:
        threshold += THRESHOLD_ADJUSTMENTS['ambiguous_label']
        confidence_signals.append('ambiguous_label')
    
    # Penalize very short labels
    if context['text_length'] < 4:
        threshold += THRESHOLD_ADJUSTMENTS['short_label']
        confidence_signals.append('short_label')
    
    # Check for generic terms in any text field
    generic_found = False
    for text_field in [context['label'], context['placeholder'], context['name']]:
        if text_field and is_ambiguous_field(text_field):
            if not generic_found:  # Only apply penalty once
                threshold += THRESHOLD_ADJUSTMENTS['generic_terms']
                confidence_signals.append('generic_terms')
                generic_found = True
    
    # Ensure threshold stays within reasonable bounds
    threshold = max(0.3, min(0.95, threshold))
    
    return threshold, confidence_signals

@autofill_bp.route('/classify', methods=['POST'])
@jwt_required()
def classify_fields():
    """
    Classify form fields by semantic similarity to canonical profile fields.
    Now uses dynamic thresholds based on field context.
    
    Request JSON:
      {
        "fields": [
          { 
            "selector": ".foo > input", 
            "label": "First name", 
            "placeholder": "Your given name",
            "type": "text",
            "required": true,
            "name": "firstname",
            "id": "fname"
          },
          ...
        ]
      }
    
    Response JSON:
      {
        "matches": [
          { 
            "selector": ".foo > input", 
            "canonical": "first_name", 
            "score": 0.82,
            "threshold_used": 0.55,
            "confidence_signals": ["pattern_match", "required_field"]
          },
          ...
        ]
      }
    """
    data = request.get_json(force=True) or {}
    fields = data.get('fields')
    if not isinstance(fields, list) or not fields:
        return jsonify(error="Must supply a non-empty 'fields' array"), 400

    # Extract text inputs: prefer label, fallback to placeholder, then name, then id
    texts = []
    for f in fields:
        text = f.get('label', '').strip() or f.get('placeholder', '').strip() or f.get('name', '').strip() or f.get('id', '').strip()
        texts.append(text)

    # Embed all texts in a single batch
    model = get_embed_model()
    embeds = model(texts).numpy().tolist()

    matches = []
    for field, vec in zip(fields, embeds):
        best_match = None
        best_score = 0.0
        
        # Find best semantic match
        for canon, canon_vec in canonical_embeddings.items():
            score = cosine_similarity(vec, canon_vec)
            if score > best_score:
                best_match = canon
                best_score = score
        
        # Calculate dynamic threshold and make decision
        decision = 'reject'
        threshold_used = BASE_THRESHOLD
        confidence_signals = []
        
        if best_match:
            threshold_used, confidence_signals = calculate_dynamic_threshold(field, best_match)
            
            if best_score >= threshold_used:
                matches.append({
                    "selector": field.get('selector'),
                    "canonical": best_match,
                    "score": round(best_score, 4),
                    "threshold_used": round(threshold_used, 4),
                    "confidence_signals": confidence_signals
                })
                decision = 'accept'
        
        # Enhanced logging with dynamic threshold information
        _csv_writer.writerow([
            datetime.utcnow().isoformat(),
            '/classify',
            field.get('selector', ''),
            field.get('label', ''),
            field.get('placeholder', ''),
            field.get('type', 'text'),
            field.get('required', False),
            best_match or 'none',
            round(best_score, 4),
            round(threshold_used, 4),
            ','.join(confidence_signals),
            decision
        ])
    
    _log_file.flush()
    return jsonify(matches=matches), 200

@autofill_bp.route('/fill', methods=['POST'])
@jwt_required()
def fill_fields():
    """
    Generate fill values for matched form fields based on user profile.
    Enhanced with validation and confidence-based handling.
    
    Request JSON:
      {
        "matches": [
          { 
            "selector": ".foo > input", 
            "canonical": "email", 
            "score": 0.78,
            "threshold_used": 0.8,
            "confidence_signals": ["pattern_match"]
          },
          ...
        ]
      }
    
    Response JSON:
      {
        "fills": [
          { 
            "selector": ".foo > input", 
            "value": "user@example.com",
            "confidence": "high"
          },
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
        selector = m.get('selector')
        canon_field = m.get('canonical')
        score = m.get('score', 0)
        threshold_used = m.get('threshold_used', BASE_THRESHOLD)
        confidence_signals = m.get('confidence_signals', [])
        
        value = getattr(profile, canon_field, None)
        
        if value is not None:
            # Determine confidence level for frontend
            confidence = 'high' if score >= threshold_used + 0.1 else 'medium'
            if len(confidence_signals) >= 2:
                confidence = 'high'
            
            fills.append({
                "selector": selector,
                "value": value,
                "confidence": confidence
            })
            
            fill_status = 'filled'
        else:
            fill_status = 'no_value'

        # Enhanced fill logging
        _csv_writer.writerow([
            datetime.utcnow().isoformat(),
            '/fill',
            selector,
            canon_field,
            '',  # placeholder (not used in fill)
            '',  # field_type (not available here)
            '',  # required (not available here)
            canon_field,  # predicted (same as canonical in fill)
            round(score, 4) if isinstance(score, (float, int)) else '',
            round(threshold_used, 4) if isinstance(threshold_used, (float, int)) else '',
            ','.join(confidence_signals) if confidence_signals else '',
            fill_status
        ])
    
    _log_file.flush()
    return jsonify(fills=fills), 200

# —————— UTILITY ENDPOINTS FOR DEBUGGING ——————

@autofill_bp.route('/debug/threshold', methods=['POST'])
@jwt_required()
def debug_threshold():
    """
    Debug endpoint to test threshold calculation for a single field.
    Useful for tuning and understanding threshold decisions.
    """
    data = request.get_json(force=True) or {}
    field = data.get('field')
    canonical = data.get('canonical', 'test_field')
    
    if not field:
        return jsonify(error="Must supply a 'field' object"), 400
    
    threshold, signals = calculate_dynamic_threshold(field, canonical)
    context = extract_field_context(field)
    
    return jsonify({
        'field': field,
        'canonical': canonical,
        'threshold': round(threshold, 4),
        'base_threshold': FIELD_TYPE_THRESHOLDS.get(context['field_type'], BASE_THRESHOLD),
        'confidence_signals': signals,
        'context': {
            'field_type': context['field_type'],
            'pattern_matches': context['pattern_matches'],
            'is_ambiguous': context['is_ambiguous'],
            'text_length': context['text_length'],
            'required': context['required']
        }
    }), 200