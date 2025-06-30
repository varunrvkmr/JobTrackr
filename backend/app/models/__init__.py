from app.extensions import db 

# Import model classes so Flask-Migrate can detect them
from .UserAuth import UserAuth
from .JobPosting import JobPosting
from .education_history import EducationHistory
from .work_history import WorkHistory
