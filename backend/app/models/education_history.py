from app.extensions import db

class EducationHistory(db.Model):
    __tablename__ = "education_history"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_profile_id = db.Column(db.Integer, db.ForeignKey("user_profiles.id"), nullable=False)

    school_name = db.Column(db.String(255), nullable=False)
    degree = db.Column(db.String(255), nullable=True)
    field_of_study = db.Column(db.String(255), nullable=True)
    is_current = db.Column(db.Boolean, default=False)
    start_date = db.Column(db.Date, nullable=True)
    end_date = db.Column(db.Date, nullable=True)

    user_profile = db.relationship("UserProfileDB", backref="education_entries")

    def __repr__(self):
        return f"<EducationHistory {self.school_name} - {self.degree}>"
