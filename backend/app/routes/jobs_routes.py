from flask import Blueprint, request, jsonify
from app import db 
from app.models import JobDB 
from functools import wraps
import requests
from datetime import datetime
from bs4 import BeautifulSoup


# Create a Blueprint for job-related routes
#job_bp = Blueprint('jobs', __name__,url_prefix='/api/jobs' )
job_bp = Blueprint("job_bp", __name__)

# Route to get all jobs
@job_bp.route('/getJobs', methods=['GET'])
def get_jobs():
    jobs = JobDB.query.all()
    return jsonify([{
        "id": job.id,
        "company": job.company,
        "position": job.position,
        "status": job.status,
        "date_applied": job.date_applied,
        "link": job.link,
        "location": job.location
    } for job in jobs])

# Route to save a new job
@job_bp.route('/addJob', methods=['POST'])
def add_job():
    """
    Endpoint to add a new job to the database.
    """
    try:
        # Parse the JSON payload from the request
        job_data = request.get_json()

        # Extract fields from the payload
        company = job_data.get('company', 'Unknown Company')
        position = job_data.get('position', 'Unknown Position')
        status = job_data.get('status', 'Unknown Status')
        date_applied = job_data.get('date_applied', None)
        location = job_data.get('location', 'Unknown Location')
        link = job_data.get('link', 'No Link')
        job_description = job_data.get('job_description', 'No job description available')

        # Validate required fields
        if not company or not position or not status:
            return jsonify({'error': 'Missing required fields (company, position, or status).'}), 400

        # Create a new Job instance
        new_job = JobDB(
            company=company,
            position=position,
            status=status,
            date_applied=date_applied,
            location=location,
            link=link,
            job_description=job_description  # Include the JobDB description
        )

        # Add the new job to the database
        db.session.add(new_job)
        db.session.commit()

        return jsonify({'message': 'Job added successfully!', 'job': {
            'id': new_job.id,
            'company': new_job.company,
            'position': new_job.position or 'Unknown Position',
            'status': new_job.status,
            'date_applied': new_job.date_applied,
            'location': new_job.location,
            'link': new_job.link,
            'job_description': new_job.job_description  # Return the job description
        }}), 201

    except Exception as e:
        print(f"Error adding job: {e}")
        return jsonify({'error': 'An error occurred while adding the job.'}), 500

@job_bp.route('/deleteJob/<int:job_id>', methods=['DELETE'])
def delete_job(job_id):
    job = db.session.get(JobDB, job_id)
    if not job:
        return jsonify({"message": "Job not found", "status": "error"}), 404
    
    db.session.delete(job)
    db.session.commit()
    return jsonify({"message": f"Job {job_id} deleted successfully!"})


# Route to parse a job posting from a URL
@job_bp.route('/api/jobs/parse', methods=['POST'])
def parse_job_posting():
    data = request.json
    url = data.get('url')
    
    if not url:
        return jsonify({"error": "URL is required"}), 400

    try:
        response = requests.get(url)
        if response.status_code != 200:
            return jsonify({"error": "Failed to fetch the page"}), 400

        soup = BeautifulSoup(response.text, 'html.parser')

        # Adjust selectors based on website structure
        title = soup.find('h1').text.strip() if soup.find('h1') else 'No title found'
        company = soup.find('div', {'class': 'company'}).text.strip() if soup.find('div', {'class': 'company'}) else 'No company found'
        location = soup.find('div', {'class': 'location'}).text.strip() if soup.find('div', {'class': 'location'}) else 'No location found'

        # Save parsed job data
        new_job = JobDB(
            company=company,
            position=title,
            status='Saved',
            link=url  # Save the link to the job
        )
        db.session.add(new_job)
        db.session.commit()

        return jsonify({
            "message": "Job saved successfully",
            "company": company,
            "position": title,
            "location": location,
            "link": url
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# GET a single job by ID
@job_bp.route('/getJob/<int:job_id>', methods=['GET'])
def get_job(job_id):
    #job = JobDB.query.get(job_id)
    job = db.session.get(JobDB, job_id)
    if not job:
        return jsonify({'status': 'error', 'message': 'Job not found'}), 404

    job_data = {
        "id": job.id,
        "company": job.company,
        "position": job.position,
        "status": job.status,
        "date_applied": job.date_applied.strftime('%Y-%m-%d') if job.date_applied else None,
        "link": job.link,
        "location": job.location
    }

    return jsonify({'status': 'success', 'data': job_data}), 200



# Route to get all saved jobs (status = "Saved")
@job_bp.route('/saved', methods=['GET'])
def get_saved_jobs():
    try:
        saved_jobs = JobDB.query.filter_by(status="Saved").all()
        
        # Convert job objects to dictionaries
        jobs_data = [{
            "id": job.id,
            "company": job.company,
            "position": job.position,
            "status": job.status,
            "date_applied": job.date_applied.strftime('%Y-%m-%d') if job.date_applied else None,
            "link": job.link,
            "location": job.location
        } for job in saved_jobs]

        return jsonify({
            "status": "success",
            "data": jobs_data
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@job_bp.route('/<int:job_id>', methods=['PUT'])
def update_jobREST(job_id):
    #job = JobDB.query.get(job_id)
    job = db.session.get(JobDB, job_id)
    if not job:
        return jsonify({'status': 'error', 'message': 'Job not found'}), 404

    try:
        data = request.json
        print(f"🔹 Received update request: {data}")  # ✅ Log request data

        job.company = data.get('company', job.company)
        job.position = data.get('position', job.position)
        job.status = data.get('status', job.status)
        job.date_applied = data.get('date_applied', job.date_applied)
        job.link = data.get('link', job.link)
        job.location = data.get('location', job.location)

        db.session.commit()
        print(f"✅ Job {job_id} updated successfully!")

        return jsonify({'status': 'success', 'message': 'Job updated successfully'}), 200

    except Exception as e:
        print(f"❌ ERROR updating job {job_id}: {str(e)}")  # ✅ Log detailed error
        return jsonify({'status': 'error', 'message': str(e)}), 500
