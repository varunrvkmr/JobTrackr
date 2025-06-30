// frontend/src/types.ts
export interface Job {
    id: string;
    job_title: string;
    company: string;
    posting_status: string;
    job_link: string;
    location?: string;
    country?: string;
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
    status?: string;
    error?: string;
    message?: string;
    data?: T | null; // ✅ Explicitly allow `null` or `undefined`
  }

  export interface Education {
    id?: string;
    school: string;
    degree?: string;
    focus?: string;
    isCurrent: boolean;
    startDate?: string;
    endDate?: string;
  }

  export interface WorkExperience {
    id?: string;
    company: string;
    position?: string;
    description?:string;
    isCurrent: boolean;
    startDate?: string;
    endDate?: string;
  }

  /** what the API actually expects when you create/update an education row */
  export interface EducationRequest {
    school_name:   string;
    degree?:       string;
    field_of_study?:string;
    is_current:    boolean;
    start_date?:   string; // "YYYY-MM-DD"
    end_date?:     string;
  }

  /** what the API expects for work entries */
  export interface WorkRequest {
    company:       string;
    position?:     string;
    description?:  string;
    is_current:    boolean;
    start_date?:   string;
    end_date?:     string;
  }

  
  export interface UserProfile {
    id: string; // or number if you prefer
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    location?: string;  // formerly “city”
    state?: string;
    bio?: string;
    linkedin?: string;
    github?: string;
    race?: string;
    ethnicity?: string;
    gender?: string;
    disabilityStatus?: string;
    veteranStatus?: string;
    education: Education[]
    workExperience: WorkExperience[]
  }

  /** The payload we send to PUT /api/user/me — snake_case */
  export interface UserProfilePayload {
    first_name?:       string;
    last_name?:        string;
    phone?:            string;
    location?:         string;    
    bio?:              string;
    linkedin?:         string;
    github?:           string;
    race?:             string;
    ethnicity?:        string;
    gender?:           string;
    disability_status?: string;
    veteran_status?:    string;
  }
    export interface AuthUser {
      id: number | string;
      email: string;
      username: string;
      avatar?: string;
    }
  
  /** Descriptor for a form field on the page */
  export interface FieldInput {
    selector:    string;  // CSS selector of the element
    label:       string;  // visible label text (or empty string)
    placeholder: string;  // placeholder text (or empty string)
  }

  /** What the classifier returns for each field */
  export interface Match {
    selector:  string;  // same selector back
    canonical: string;  // e.g. "first_name", "email", etc.
    score:     number;  // similarity score [0–1]
  }

  /** What the fill endpoint returns for each matched field */
  export interface Fill {
    selector: string;  // which element to fill
    value:    string;  // the value to put into that element
  }