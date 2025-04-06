from app.extensions import db
from flask_bcrypt import generate_password_hash, check_password_hash

class UserAuth(db.Model):
    __tablename__ = "auth_users" 
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(255), nullable=False, server_default="Unknown")
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password).decode("utf-8")

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
