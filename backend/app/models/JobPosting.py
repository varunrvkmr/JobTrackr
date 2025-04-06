from app.extensions import db
from app.models.UserAuth import UserAuth

class JobPosting(db.Model):
    __tablename__ = "job_posting"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_auth_id = db.Column(db.Integer, db.ForeignKey("auth_users.id"), nullable=False)

    company = db.Column(db.String(255), nullable=False)
    job_title = db.Column(db.String(255), nullable=False)
    job_description = db.Column(db.Text)
    job_link = db.Column(db.Text)
    location = db.Column(db.String(255))
    country = db.Column(db.String(100))
    posting_status = db.Column(db.String(100))

    user = db.relationship("UserAuth", backref="job_postings")
    
    def __repr__(self):
        return f"<JobPosting {self.company} - {self.job_title}>"
