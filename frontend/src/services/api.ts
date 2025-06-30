// Replace 'http://your-ec2-public-dns:8081' with your EC2 instance's address.
// If the frontend is served from the same origin, you can use a relative path (e.g., '/api').
//const BASE_URL = "https://jobtrackr.hopto.org/api/";
import { Job, ApiResponse, UserProfile, AuthUser, FieldInput, Match, Fill, EducationRequest, WorkRequest } from "@/types";

//const BASE_URL = window.location.protocol + "//jobtrackr.hopto.org/api/";
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5050/api";

const JOBS_URL = `${BASE_URL}/jobs`;  
//const FILES_URL = `${BASE_URL}/files`;
const LETTER_GENERATOR_URL = `${BASE_URL}/letter-generator`;
const USER_PROFILE_URL = `${BASE_URL}/user-profile`;
const AUTH_USER_URL = `${BASE_URL}/auth/user`;

interface RawUserProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  location?: string;
  state?: string;
  bio?: string;
  linkedin?: string;
  github?: string;
  race?: string;
  ethnicity?: string;
  gender?: string;
  disability_status?: string;
  veteran_status?: string;

  education_history: Array<{
    id: number;
    school_name: string;
    degree?: string;
    field_of_study?: string;
    is_current: boolean;
    start_date?: string;
    end_date?: string;
  }>;
  work_history: Array<{
    id: number;
    company: string;
    position?: string;
    description?: string;
    is_current: boolean;
    start_date?: string;
    end_date?: string;
  }>;
}

export async function fetchWithAutoRefresh<T>(
  input: RequestInfo,
  init: RequestInit = {},
  retry = true
): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    credentials: "include",
  });

  if (response.status === 401 || response.status === 422) {
    if (!retry) throw new Error("Unauthorized");

    console.log("🔁 Access token expired, attempting refresh...");
    const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (refreshResponse.ok) {
      // Retry the original request after successful refresh
      return fetchWithAutoRefresh<T>(input, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...(init.headers || {}),
        },
        credentials: "include",
      }, false);
    } else {
      window.location.href = "/login";
      throw new Error("Session expired, please log in again.");
    }
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Request failed");
  }

  return response.json();
}

export const fetchBackendStatus = async (): Promise<ApiResponse> => {
  try {
    const response = await fetch(BASE_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching backend status:", error);
    throw error;
  }
};

export const fetchJobs = async (): Promise<Job[]> => {
  try {
    return await fetchWithAutoRefresh<Job[]>(
      `${JOBS_URL}/getJobs`,
      { method: "GET" }
    );
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return [];
  }
};

export const updateJobStatus = async (jobId: string, newStatus: string): Promise<ApiResponse> => {
  try {
    return await fetchWithAutoRefresh<ApiResponse>(
      `${JOBS_URL}/updateJobStatus/${jobId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      }
    );
  } catch (error) {
    console.error("Error updating job status:", error);
    throw error;
  }
};

export const saveJob = async (jobData: Partial<Job>): Promise<ApiResponse> => {
  try {
    return await fetchWithAutoRefresh<ApiResponse>(
      `${BASE_URL}/jobs/addJob`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobData),
      }
    );
  } catch (error) {
    console.error("Error saving job:", error);
    throw error;
  }
};

export const deleteJob = async (jobId: string): Promise<ApiResponse> => {
  return fetchWithAutoRefresh<ApiResponse>(
    `${JOBS_URL}/deleteJob/${jobId}`,
    { method: "DELETE" }
  );
};

export const fetchJobDetails = async (jobId: string): Promise<ApiResponse> => {
  try {
    const url = `${LETTER_GENERATOR_URL}/${jobId}`;
    console.log('🔍 Fetching Job Details from:', url); // Debug log

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // ✅ Send HttpOnly cookies
    });

    console.log("📄 Raw Response Status:", response.status); // Debug log

    if (!response.ok) {
      throw new Error(`Failed to fetch job details. Server responded with ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Job Details Received:", data);

    return { data };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('❌ Error fetching job details:', error.message);
      return { error: error.message };
    }
    console.error('❌ Unknown error fetching job details:', error);
    return { error: 'An unknown error occurred' };
  }
};

export const fetchSkillComparison = async (jobId: string, resumeFile: Blob): Promise<ApiResponse> => {
  const url = `${LETTER_GENERATOR_URL}/parse-and-compare/${jobId}`;
  console.log('Fetch URL (Parse and Compare):', url);

  try {
    if (!(resumeFile instanceof Blob)) {
      throw new Error('Resume file is not a valid Blob');
    }

    const formData = new FormData();
    formData.append('resume', resumeFile, 'resume.pdf');

    console.log('FormData entries before fetch:');
    for (const [key, value] of Array.from(formData.entries())) {
      console.log(`${key}:`, value);
    }

    const apiResponse = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!apiResponse.ok) {
      throw new Error(`Failed to fetch skill comparison. Server responded with ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    console.log('Skill Comparison Data:', data);
    return { data };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching skill comparison:', error.message);
      return { error: error.message };
    }
    console.error('Unknown error fetching skill comparison:', error);
    return { error: 'An unknown error occurred' };
  }
};

export const generateCoverLetter = async (payload: Record<string, unknown>): Promise<ApiResponse<{ cover_letter: string }>> => {
  const url = `${LETTER_GENERATOR_URL}/generate`;
  console.log('Fetch URL (LETTER GENERATOR):', url); // Debug log
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate cover letter. Server responded with ${response.status}`);
    }

    const data = await response.json();
    return { data };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error generating cover letter:', error.message);
      return { error: error.message };
    }
    console.error('Unknown error generating cover letter:', error);
    return { error: 'An unknown error occurred' };
  }
};


// Answer a custom question based on job description and user input
export const answerCustomQuestion = async (jobId: string, question: string): Promise<ApiResponse<{ answer: string }>> => {
  //const url = `${CORS_PROXY}${BACKEND_URL_LG}/answer-question/${jobId}`;
  const url = `${LETTER_GENERATOR_URL}/answer-question/${jobId}`;
  console.log('Fetch URL (Answer Custom Question):', url);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }), // Send the user question
    });

    if (!response.ok) {
      throw new Error(`Failed to get answer for the question. Server responded with ${response.status}`);
    }

    const data = await response.json();
    return data.answer; // Return the answer generated by GPT
  } catch (error: unknown) {
    console.error('Error fetching custom question answer:', (error instanceof Error ? error.message : 'An unknown error occurred'));
    throw error; // Re-throw the error for the calling component to handle
  }
};



/*
 * Start Browser Automation for Job Application
 * @param {string} jobUrl - The URL of the job application page
 * @param {object} userInfo - The user information to autofill the form
 * @returns {Promise<object>}
 
export const startAutomation = async (jobId: string): Promise<ApiResponse> => {
  try {
    const url = `${LETTER_GENERATOR_URL}/apply/${jobId}`;
    console.log('🚀 Initiating Browser Automation:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      mode: 'cors',
    });

    const responseText = await response.text();
    console.log('📄 Raw Response:', responseText);

    if (!response.ok) {
      throw new Error(`❌ Failed to start automation: ${response.statusText}`);
    }

    const data = JSON.parse(responseText);
    console.log('✅ Browser Automation Started:', data);
    return data;
  } catch (error: unknown) {
    console.error('❌ Error in startAutomation:', (error instanceof Error ? error.message : 'An unknown error occurred'));
    return { error: `Automation failed for job ${jobId}` };
  }
};
*/

/*
export const applyForJob = async (jobId: string): Promise<ApiResponse> => {
  try {
    const url = `${LETTER_GENERATOR_URL}/apply/${jobId}`;
    console.log('🚀 Initiating Auto-Apply:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors', // ✅ Ensure CORS issues are avoided
    });

    const responseText = await response.text(); // ✅ Capture response text for debugging
    console.log('📄 Raw Response:', responseText);

    if (!response.ok) {
      throw new Error(`❌ Failed to apply for job: ${response.statusText}`);
    }

    const data = JSON.parse(responseText); // ✅ Ensure valid JSON parsing
    console.log(`✅ Auto-Apply started for Job ID ${jobId}:`, data);
    return data;
  } catch (error: unknown) {
    console.error('❌ Error applying for job:', (error instanceof Error ? error.message : 'An unknown error occurred'));
    return { error: `Application failed for job ${jobId}` };
  }
};
*/

//USER PROFILES FUNCTIONALITY - BEGIN

/*
export const fetchCurrentUserProfile = async (): Promise<UserProfile> => {
  return await fetchWithAutoRefresh<UserProfile>(
    `${USER_PROFILE_URL}/me`,
    {
      method: "GET",
    }
  );
};
*/
/*
export const fetchCurrentUserProfile = async (): Promise<UserProfile> => {
  const data = await fetchWithAutoRefresh<any>( // get raw API data
    `${USER_PROFILE_URL}/me`,
    {
      method: "GET",
    }
  );

  // Transform snake_case fields to camelCase for UserProfile
  const transformed: UserProfile = {
    ...data,
    firstName: data.first_name,
    lastName: data.last_name,
    disabilityStatus: data.disability_status,
    veteranStatus: data.veteran_status,
    // Remove snake_case if you want, or leave for now
  };

  return transformed;
};

//Update a User Profile
export const updateCurrentUserProfile = async (payload: any) => {
  return fetchWithAutoRefresh<ApiResponse<any>>(
    `${USER_PROFILE_URL}/me`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    }
  );
};
*/
const normalize = (api: any): UserProfile => ({
  id:                String(api.id),
  firstName:         api.first_name,
  lastName:          api.last_name,
  email:             api.email,
  phone:             api.phone    ?? "",
  location:          api.location ?? "",
  bio:               api.bio      ?? "",
  linkedin:          api.linkedin ?? "",
  github:            api.github   ?? "",
  race:              api.race     ?? "",
  ethnicity:         api.ethnicity?? "",
  gender:            api.gender   ?? "",
  disabilityStatus:  api.disability_status ?? "",
  veteranStatus:     api.veteran_status    ?? "",

  education: (api.education_history ?? []).map((e: any) => ({
    id:        String(e.id),
    school:    e.school_name,
    degree:    e.degree          ?? "",
    focus:     e.field_of_study  ?? "",
    isCurrent: e.is_current,
    startDate: e.start_date      ?? "",
    endDate:   e.end_date        ?? "",
  })),

  workExperience: (api.work_history ?? []).map((w: any) => ({
    id:          String(w.id),
    company:     w.company,
    position:    w.position      ?? "",
    description: w.description   ?? "",
    isCurrent:   w.is_current,
    startDate:   w.start_date    ?? "",
    endDate:     w.end_date      ?? "",
  })),
});


export const fetchCurrentUserProfile = async (): Promise<UserProfile> => {
  // 1) Tell TS we expect the ApiResponse wrapper, with RawUserProfile inside .data
  const resp = await fetchWithAutoRefresh<ApiResponse<RawUserProfile>>(
    `${USER_PROFILE_URL}/me`,
    { method: "GET" }
  );
  
  // 2) Extract the raw snake_case payload
  //const api = resp.data!;   // type is RawUserProfile
  // 3) Normalize into your camelCase UserProfile
  return normalize(resp);
};

export const updateCurrentUserProfile = async (
  payload: Record<string, any>
): Promise<UserProfile> => {
  // 1) Same pattern for PUT: ApiResponse<RawUserProfile>
  const resp = await fetchWithAutoRefresh<ApiResponse<RawUserProfile>>(
    `${USER_PROFILE_URL}/me`,
    {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    }
  );

  // 2) Unwrap
  //const api = resp.data!;

  // 3) Normalize
  return normalize(resp);
};

// EDUCATION CRUD
export async function addEducation(payload: EducationRequest) {
  const res = await fetchWithAutoRefresh<ApiResponse<{ education_entry: any }>>(
    `${USER_PROFILE_URL}/education`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  return res.data?.education_entry;
}


export async function updateEducation(id: string, payload: EducationRequest) {
  const res = await fetchWithAutoRefresh<ApiResponse<{ education_entry: any }>>(
    `${USER_PROFILE_URL}/education/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  return res.data?.education_entry;
}

export async function deleteEducation(id: string) {
  const res = await fetchWithAutoRefresh<ApiResponse>(
    `${USER_PROFILE_URL}/education/${id}`,
    { method: "DELETE" }
  );
  return res;
}

// WORK CRUD
export async function addWork(payload: WorkRequest) {
  const res = await fetchWithAutoRefresh<ApiResponse<{ work_entry: any }>>(
    `${USER_PROFILE_URL}/work`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  return res.data?.work_entry;
}

export async function updateWork(id: string, payload: WorkRequest) {
  const res = await fetchWithAutoRefresh<ApiResponse<{ work_entry: any }>>(
    `${USER_PROFILE_URL}/work/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  return res.data?.work_entry;
}

export async function deleteWork(id: string) {
  const res = await fetchWithAutoRefresh<ApiResponse>(
    `${USER_PROFILE_URL}/work/${id}`,
    { method: "DELETE" }
  );
  return res;
}
//USER PROFILES FUNCTIONALITY - END

//PASSWORD AUTHENTICATION FUNCTIONS - BEGIN

export const getUserProfileById = async (id: string): Promise<ApiResponse<UserProfile>> => {
  const url = `${USER_PROFILE_URL}/${id}`;
  return fetchWithAutoRefresh<ApiResponse<UserProfile>>(url, { method: "GET" });
};



/*
export const getAuthUserById = async (id: string): Promise<AuthUser> => {
  const url = `${AUTH_USER_URL}/${Number(id)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    window.location.href = "/";
    throw new Error("Unauthorized — please log in again.");
  }

  if (!response.ok) {
    throw new Error("Failed to fetch user profile");
  }

  return response.json(); // ✅ response is AuthUser object, not wrapped
};
*/

export const getAuthUserById = async (id: string): Promise<AuthUser> => {
  const url = `${AUTH_USER_URL}/${Number(id)}`;
  return fetchWithAutoRefresh<AuthUser>(url, { method: "GET" });
};

export const loginUser = async (email: string, password: string) => {
  const response = await fetch("http://localhost:5050/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });
  console.log(response)
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Login failed");
  }

  return data;
};

export const registerUser = async (email: string, password: string, username: string, first_name: string, last_name: string, phone: string, location: string) => {
  const response = await fetch("http://localhost:5050/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, username, first_name, last_name, phone, location}),
  })
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error || "Registration failed")
  }
  
  return data
}

export const logoutUser = async (): Promise<void> => {
  const res = await fetch(`${BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include", // 🔑 required to send cookies
  });

  if (!res.ok) {
    throw new Error("Logout failed");
  }
};

//CHROME EXTENSION EMBED ROUTES
export async function embedText(text: string): Promise<number[]> {
  const res = await fetch(`${BASE_URL}/api/embed`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texts: [text] })
  });
  if (!res.ok) throw new Error(`Embed failed: ${res.status}`);
  const { embeddings } = await res.json();
  return embeddings[0];
}

//AUTOFILL FUNCTIONS

/**
 * Classify a batch of form‐field descriptors into canonical fields.
 */
export async function classifyFields(fields: FieldInput[]): Promise<Match[]> {
  // fetchWithAutoRefresh auto‐adds JSON headers + credentials for you
  const { matches } = await fetchWithAutoRefresh<{ matches: Match[] }>(
    `${BASE_URL}/autofill/classify`,
    {
      method: 'POST',
      body: JSON.stringify({ fields }),
    }
  );
  return matches;
}

/**
 * Given a list of classifier matches, return the user‐specific fill values.
 */
export async function getFieldFills(matches: Match[]): Promise<Fill[]> {
  const { fills } = await fetchWithAutoRefresh<{ fills: Fill[] }>(
    `${BASE_URL}/autofill/fill`,
    {
      method: 'POST',
      body: JSON.stringify({ matches }),
    }
  );
  return fills;
}