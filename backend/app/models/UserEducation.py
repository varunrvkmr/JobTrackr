from app.extensions import db

class UserEducation(db.Model):
    __tablename__ = "user_education"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    school = db.Column(db.String(255), nullable=False)
    degree = db.Column(db.String(255))
    gpa = db.Column(db.String(10))
    date = db.Column(db.String(100))  # Could be "2020-2024" or just a year
    descriptions = db.Column(db.Text)

    user = db.relationship("User", back_populates="user_education_entries")
