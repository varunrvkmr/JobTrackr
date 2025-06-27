from flask import Blueprint, request, jsonify
from app.extensions import db 
from app.models import JobPosting  # ✅ new
from functools import wraps
from flask import make_response
from flask_jwt_extended import jwt_required, get_jwt_identity


# Create a Blueprint for job-related routes
#job_bp = Blueprint('jobs', __name__,url_prefix='/api/jobs' )
job_bp = Blueprint("job_bp", __name__)

# Route to get all jobs
@job_bp.route('/getJobs', methods=['GET'])
@jwt_required()
def get_jobs():
    current_user_id = get_jwt_identity()

    # 🧠 Only fetch jobs belonging to this user
    jobs = JobPosting.query.filter_by(user_auth_id=current_user_id).all()

    return jsonify([{
        "id": job.id,
        "company": job.company,
        "job_title": job.job_title,
        "job_description": job.job_description,
        "job_link": job.job_link,
        "location": job.location,
        "country": job.country,
        "posting_status": job.posting_status
    } for job in jobs])

# Route to save a new job
@job_bp.route('/addJob', methods=['POST'])
@jwt_required()
def add_job():
    try:
        job_data = request.get_json()
        user_id = get_jwt_identity()

        # Extract fields using new schema
        company = job_data.get('company', 'Unknown Company')
        job_title = job_data.get('job_title', 'Unknown Title')
        posting_status = job_data.get('posting_status', 'Unknown Status')
        location = job_data.get('location', 'Unknown Location')
        country = job_data.get('country', 'Unknown Country')
        job_link = job_data.get('job_link', 'No Link')
        job_description = job_data.get('job_description', 'No job description available')

        if not company or not job_title or not posting_status:
            return jsonify({'error': 'Missing required fields (company, job_title, or posting_status).'}), 400

        # ✅ Create the job tied to the current user
        new_job = JobPosting(
            user_auth_id=user_id,
            company=company,
            job_title=job_title,
            posting_status=posting_status,
            location=location,
            country=country,
            job_link=job_link,
            job_description=job_description
        )

        db.session.add(new_job)
        db.session.commit()

        return jsonify({
            'message': 'Job added successfully!',
            'job': {
                'id': new_job.id,
                'company': new_job.company,
                'job_title': new_job.job_title,
                'posting_status': new_job.posting_status,
                'location': new_job.location,
                'country': new_job.country,
                'job_link': new_job.job_link,
                'job_description': new_job.job_description
            }
        }), 201

    except Exception as e:
        print(f"Error adding job: {e}")
        return jsonify({'error': 'An error occurred while adding the job.'}), 500

# Delete a job
@job_bp.route('/deleteJob/<int:job_id>', methods=['DELETE'])
@jwt_required()   # pulls from cookies per your config
def delete_job(job_id):
    # parse the JWT identity as an integer
    raw_id = get_jwt_identity()
    try:
        current_user_id = int(raw_id)
    except (TypeError, ValueError):
        # fallback if it really was non-numeric
        return jsonify({"status": "error", "message": "Invalid user identity"}), 400

    job = JobPosting.query.get(job_id)
    if not job:
        return jsonify({'status': 'error', 'message': 'Job not found'}), 404

    if job.user_auth_id != current_user_id:
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 403

    db.session.delete(job)
    db.session.commit()
    return jsonify({'status': 'success', 'message': 'Job deleted'}), 200

# GET a single job by ID
@job_bp.route('/getJob/<int:job_id>', methods=['GET'])
@jwt_required()
def get_job(job_id):
    current_user_id = get_jwt_identity()
    job = db.session.get(JobPosting, job_id)

    if not job:
        return jsonify({'status': 'error', 'message': 'Job not found'}), 404

    # 🔐 Make sure this job belongs to the current user
    if job.user_auth_id != current_user_id:
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 403

    job_data = {
        "id": job.id,
        "company": job.company,
        "job_title": job.job_title,
        "posting_status": job.posting_status,
        "job_link": job.job_link,
        "location": job.location,
        "country": job.country,
        "job_description": job.job_description
    }

    return jsonify({'status': 'success', 'data': job_data}), 200

@job_bp.route('/updateJobStatus/<int:job_id>', methods=['PUT'])
@jwt_required()
def update_job_status(job_id):
    try:
        # get the current user from the JWT (cast it to int)
        raw_identity     = get_jwt_identity()
        try:
            current_user_id = int(raw_identity)
        except (TypeError, ValueError):
            return jsonify({'status': 'error', 'message': 'Invalid token identity'}), 400

        # fetch the job and verify it exists
        job = JobPosting.query.get(job_id)
        if not job:
            return jsonify({'status': 'error', 'message': 'Job not found'}), 404

        # verify this job belongs to the current user
        if job.user_auth_id != current_user_id:
            # debug log—optional, remove in prod
            print(f"Forbidden: token user {current_user_id} ≠ job owner {job.user_auth_id}")
            return jsonify({'status': 'error', 'message': 'Unauthorized'}), 403

        # parse the desired new status from the request body
        data       = request.get_json() or {}
        new_status = data.get('status')
        if not new_status:
            return jsonify({'status': 'error', 'message': 'Missing “status” field'}), 400

        # perform the update
        job.posting_status = new_status
        db.session.commit()

        # return the updated status
        return jsonify({
            'status': 'success',
            'message': 'Job status updated successfully',
            'posting_status': job.posting_status
        }), 200

    except Exception as e:
        # log the exception for debugging
        print(f"Error updating job status: {e}")
        return jsonify({
            'status': 'error',
            'message': 'An error occurred while updating the job status'
        }), 500
