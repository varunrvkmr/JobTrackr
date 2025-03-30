from datetime import datetime
from . import db

class user_authDB(db.Model):
    __tablename__ = 'user_auth'

    id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(255), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)