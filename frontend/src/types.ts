// frontend/src/types.ts
export interface Job {
    id: string
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
    match_percentage?: number
    recommendation?: string
    error?: string
  }

  export interface ApiResponse<T = undefined> {
    error?: string;
    message?: string;
    data?: T | null; // ✅ Explicitly allow `null` or `undefined`
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
  
  export interface UserProfileFormData {
    id: string; // Ensure id is explicitly a string
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    city: string;
    state: string;
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
  
  
  export interface UserProfilePayload {
    id: string;
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

  export type UserProfile = UserProfileFormData & {
    id: string;
  };
  
  export interface AuthUser {
    id: number | string;
    email: string;
    username: string;
    avatar?: string;
  }
  