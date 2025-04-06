from app.extensions import db 

# Import model classes so Flask-Migrate can detect them
from .User import User
from .UserAuth import UserAuth
from .Race import Race
from .Gender import Gender
from .JobPosting import JobPosting
from .UserJob import UserJob
from .UserEducation import UserEducation
from .WorkExperience import WorkExperience
