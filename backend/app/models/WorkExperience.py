from app.extensions import db

class WorkExperience(db.Model):
    __tablename__ = "work_experience"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    company = db.Column(db.String(255), nullable=False)
    job_title = db.Column(db.String(255), nullable=False)
    date = db.Column(db.String(100))  # e.g., "May 2021 – Aug 2022"
    descriptions = db.Column(db.Text)

    user = db.relationship("User", back_populates="work_experience_entries")
