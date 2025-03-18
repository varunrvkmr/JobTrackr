// frontend/src/types.ts
export interface Job {
    position: string;
    company: string;
    location: string;
    status: string;
    date_applied: string;
    link: string;
    job_description?: string;
  }
  
  export interface ComparisonData {
    matched_skills: string[];
    missing_skills: string[];
    matched_experience: string[];
    missing_experience: string[];
  }

  export interface ApiResponse {
    error?: string;
    message?: string;
  }

  interface Education {
    school: string;
    degree: string;
    year: string;
  }
  
  interface WorkExperience {
    company: string;
    position: string;
    years: string;
  }
  
  interface UserProfileFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    cityState: string;
    education: Education[];
    workExperience: WorkExperience[];
    skills: string;
    gender: string;
    race: string;
    ethnicity: string;
    disabilityStatus: string;
    veteranStatus: string;
    linkedin: string;
    github: string;
  }
  
  interface UserProfilePayload {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    city: string;
    state: string;
    skills: string;
    gender: string;
    race: string;
    ethnicity: string;
    disability_status: string;
    veteran_status: string;
    linkedin: string;
    github: string;
  }