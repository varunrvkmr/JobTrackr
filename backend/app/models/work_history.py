from app.extensions import db

class WorkHistory(db.Model):
    __tablename__ = "work_history"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_profile_id = db.Column(db.Integer, db.ForeignKey("user_profiles.id"), nullable=False)

    company = db.Column(db.String(255), nullable=False)
    position = db.Column(db.String(255), nullable=True)
    description = db.Column(db.Text, nullable=True)
    is_current = db.Column(db.Boolean, default=False)
    start_date = db.Column(db.Date, nullable=True)
    end_date = db.Column(db.Date, nullable=True)

    user_profile = db.relationship("UserProfileDB", backref="work_entries")

    def __repr__(self):
        return f"<WorkHistory {self.company} - {self.position}>"
