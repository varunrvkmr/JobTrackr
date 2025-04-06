from app import db

class Race(db.Model):
    __tablename__ = "race"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(256), nullable=False)
