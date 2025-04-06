from app.extensions import db
from app.models.User import User
from app.models.JobPosting import JobPosting

class UserJob(db.Model):
    __tablename__ = "user_job"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    job_posting_id = db.Column(db.Integer, db.ForeignKey("job_posting.id"), nullable=False)
    applied_on = db.Column(db.DateTime)
    application_status = db.Column(db.String(100))  # Assuming flat text instead of FK
    notes = db.Column(db.String(4000))

    user = db.relationship("User", backref="user_jobs")
    job_posting = db.relationship("JobPosting", backref="job_applicants")

    def __repr__(self):
        return f"<UserJob user_id={self.user_id}, job_posting_id={self.job_posting_id}>"
