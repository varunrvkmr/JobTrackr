from . import db

import datetime

class Snippet(db.Model):
    __tablename__ = 'snippets'
    
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)