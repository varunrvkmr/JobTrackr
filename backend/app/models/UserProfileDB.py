from app.extensions import db  # Import the global db instance

class UserProfileDB(db.Model):
    __tablename__ = "user_profiles" 

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    phone = db.Column(db.String(50), nullable=True)
    location = db.Column(db.String(100), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    linkedin = db.Column(db.String(255), nullable=True)
    github = db.Column(db.String(255), nullable=True)
    race = db.Column(db.String(50), nullable=True)
    ethnicity = db.Column(db.String(50), nullable=True)
    gender = db.Column(db.String(50), nullable=True)
    disability_status = db.Column(db.String(50), nullable=True)
    veteran_status = db.Column(db.String(50), nullable=True)
    user_auth_id = db.Column(db.Integer, db.ForeignKey("auth_users.id"), nullable=False, unique=True)