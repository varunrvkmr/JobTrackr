from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import JobPosting
from openai import OpenAI
from dotenv import load_dotenv
import json
import os
import requests
from bs4 import BeautifulSoup
from app.automation.apply_job import apply_for_job

letter_generator_bp = Blueprint('letter_generator', __name__, url_prefix='/api/letter-generator')

load_dotenv()
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
client = OpenAI(api_key=OPENAI_API_KEY)

@letter_generator_bp.route("/<int:job_id>", methods=["GET"])
@jwt_required()
def get_job_details(job_id):
    """Fetch job details for the letter generator, authenticated."""
    current_user_id = get_jwt_identity()

    job = JobPosting.query.get(job_id)

    # ✅ Ensure the job belongs to the current user
    if not job or job.user_auth_id != int(current_user_id):
        return jsonify({"status": "error", "message": "Job not found or unauthorized"}), 404

    return jsonify({
        "id": job.id,
        "company": job.company,
        "job_title": job.job_title,
        "posting_status": job.posting_status,
        "job_link": job.job_link,
        "location": job.location,
        "job_description": job.job_description
    })

def fetch_job_description(job_link):
    """Fetch the job description from the provided job link."""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(job_link, headers=headers, timeout=10)
        response.raise_for_status()

        # Debug response content
        print("LG-Response Text:", response.text[:1000])  # Print first 1000 characters

        soup = BeautifulSoup(response.text, 'html.parser')
        job_description_div = soup.find('div', {'class': 'description__text'})
        
        return job_description_div.get_text(strip=True, separator='\n') if job_description_div else "Unable to extract job description."
    except Exception as e:
        print(f"Error fetching job description: {e}")
        return "Failed to fetch job description from the provided link."

@letter_generator_bp.route('/parse-and-compare/<int:job_id>', methods=['POST'])
@jwt_required()
def parse_and_compare(job_id):
    """Parse the resume, fetch the job description, and compare skills using ChatGPT."""
    try:
        # ✅ Get user ID from JWT
        current_user_id = get_jwt_identity()

        # ✅ Check resume file presence
        if 'resume' not in request.files:
            return jsonify({'error': 'Resume file is missing'}), 400

        resume_file = request.files['resume']
        resume_content = resume_file.read().decode('utf-8')

        # ✅ Fetch job and confirm ownership
        job = JobPosting.query.get(job_id)
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        if job.user_auth_id != current_user_id:
            return jsonify({'error': 'Unauthorized access to this job'}), 403

        # ✅ Fetch job description from link
        job_description = fetch_job_description(job.job_link)
        if not job_description:
            return jsonify({'error': 'Job description not available'}), 404

        return compare_with_chatgpt(resume_content, job_description)

    except Exception as e:
        print(f"Error in parse-and-compare: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500
def compare_with_chatgpt(resume_content, job_description):
    """Use ChatGPT to compare the resume content with the job description."""
    prompt = f"""
    Compare the following job description and resume:
    - **Job Description**: {job_description}
    - **Resume**: {resume_content}
    
    Respond only with JSON:
    {{
      "matched_skills": ["skill1", "skill2"],
      "missing_skills": ["skill3", "skill4"],
      "matched_experience": ["experience1", "experience2"],
      "missing_experience": ["experience3", "experience4"]
    }}
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini-2024-07-18",
            messages=[
                {"role": "system", "content": "You are an AI comparing resumes and job descriptions."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
            temperature=0
        )

        raw_response = response.choices[0].message.content.strip()
        return json.loads(raw_response)

    except json.JSONDecodeError as e:
        print(f"Error parsing JSON from ChatGPT response: {e}")
        return {"error": "Invalid JSON format from ChatGPT response"}
    except Exception as e:
        print(f"Error calling ChatGPT for comparison: {e}")
        return {"error": "Failed to process comparison with ChatGPT"}

@letter_generator_bp.route('/generate', methods=['POST'])
def generate_cover_letter():
    """Generate a cover letter based on job details and resume."""
    data = request.get_json()
    job_details = data.get('job')
    resume = data.get('resume')

    if not job_details or not resume:
        return jsonify({'error': 'Missing job details or resume'}), 400

    job_description = fetch_job_description(job_details.get('job_link')) if job_details.get('job_link') else "Job description not provided."

    prompt = f"""
    Generate a professional and tailored cover letter based on:
    - **Job Details**: {job_details}
    - **Job Description**: {job_description}
    - **Resume**: {resume}
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini-2024-07-18",
            messages=[
                {"role": "system", "content": "You are a cover letter writer."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
            temperature=0.7
        )

        cover_letter = response.choices[0].message.content.strip()
        return jsonify({'cover_letter': cover_letter})

    except Exception as e:
        print(f"Error generating cover letter: {e}")
        return jsonify({'error': 'Failed to generate cover letter'}), 500

@letter_generator_bp.route('/answer-question/<int:job_id>', methods=['POST'])
def answer_custom_question(job_id):
    """Answer a custom question based on the job description and user input."""
    data = request.get_json()
    user_question = data.get('question')

    if not user_question:
        return jsonify({'error': 'Question is required'}), 400

    job = JobPosting.query.get(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404

    job_description = job.job_description or "No job description available."

    prompt = f"""
    Answer the following question based on the job description:
    - **Job Description**: {job_description}
    - **Question**: {user_question}
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini-2024-07-18",
            messages=[
                {"role": "system", "content": "You provide concise answers to job application questions."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.7
        )

        answer = response.choices[0].message.content.strip()
        return jsonify({'answer': answer})

    except Exception as e:
        print(f"Error answering question: {e}")
        return jsonify({'error': 'Failed to answer the question'}), 500

@letter_generator_bp.route("/apply/<int:job_id>", methods=["POST"])
def apply_job(job_id):
    """
    Endpoint to trigger job application automation.
    """
    job = JobPosting.query.get(job_id)
    if not job:
        return jsonify({"status": "error", "message": "Job not found"}), 404

    # Extract job details, including the 'link'
    job_data = {
        "id": job.id,
        "company": job.company,
        "job_title": job.job_title,  # You might use 'title' instead if your DB uses that field
        "job_link": job.job_link,  # ✅ Ensure we send the job_link to the browser automation
        "location": job.location
    }

    result = apply_for_job(job_data)  # ✅ Send the entire job_data to `apply_job.py`

    return jsonify({"status": "success", "message": result})


@letter_generator_bp.route("/apply/<int:job_id>", methods=["OPTIONS"])
def handle_preflight(job_id):
    response = jsonify({"message": "CORS preflight successful"})
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
    response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type")
    return response, 200
