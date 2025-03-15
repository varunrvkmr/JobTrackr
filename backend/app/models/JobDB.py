from . import db

class JobDB(db.Model):
    __tablename__ = 'jobs_table'
    id = db.Column(db.Integer, primary_key=True)
    company = db.Column(db.String(255), nullable=False)
    position = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(50), nullable=False)
    date_applied = db.Column(db.Date, nullable=True)
    link = db.Column(db.Text, nullable=True)
    location = db.Column(db.String(255), nullable=True)
    job_description = db.Column(db.Text, nullable=True)  # New column for job description
