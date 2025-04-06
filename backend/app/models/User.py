from app.extensions import db
from app.models.UserAuth import UserAuth
from app.models.Race import Race
from app.models.Gender import Gender
from app.models.UserEducation import UserEducation
from app.models.WorkExperience import WorkExperience


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    # Foreign key to auth_users
    user_auth_id = db.Column(db.Integer, db.ForeignKey("auth_users.id"), nullable=False, unique=True)
    user_auth = db.relationship("UserAuth", backref=db.backref("user", uselist=False))

    # Personal information
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(50))
    location = db.Column(db.String(255))
    bio = db.Column(db.Text)
    linkedin = db.Column(db.String(255))
    github = db.Column(db.String(255))

    # Demographic info (linked to lookup tables)
    race_id = db.Column(db.Integer, db.ForeignKey("race.id"))
    gender_id = db.Column(db.Integer, db.ForeignKey("gender.id"))

    race = db.relationship("Race", backref="users")
    gender = db.relationship("Gender", backref="users")

    disability_status = db.Column(db.Boolean, default=False)
    veteran_status = db.Column(db.Boolean, default=False)

    # One-to-many relationship: one user -> many education entries
    user_education_entries = db.relationship(
        "UserEducation",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    work_experience_entries = db.relationship(
        "WorkExperience",
        back_populates="user",
        cascade="all, delete-orphan"
    )



    # Virtual fields - these access the related UserAuth info
    @property
    def username(self):
        return self.user_auth.username

    @property
    def email(self):
        return self.user_auth.email

    def check_password(self, password):
        return self.user_auth.check_password(password)

    def __repr__(self):
        return f"<User id={self.id}, auth_id={self.user_auth_id}, username={self.username}>"
