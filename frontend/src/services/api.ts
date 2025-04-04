// Replace 'http://your-ec2-public-dns:8081' with your EC2 instance's address.
// If the frontend is served from the same origin, you can use a relative path (e.g., '/api').
//const BASE_URL = "https://jobtrackr.hopto.org/api/";
import { Job, ApiResponse, UserProfile, AuthUser } from "@/types";

//const BASE_URL = window.location.protocol + "//jobtrackr.hopto.org/api/";
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5050/api";


//const SNIPPET_URL = `${BASE_URL}/snippets`;
//const FILES_URL = `${BASE_URL}/files`;
//const JOBS_URL = `${BASE_URL}/jobs`;
//const LETTER_GENERATOR_URL = `${BASE_URL}/letter-generator`;
const JOBS_URL = `${BASE_URL}/jobs`;  // ✅ Remove duplicate `/getJobs`
const SNIPPET_URL = `${BASE_URL}/snippets`;
const FILES_URL = `${BASE_URL}/files`;
const LETTER_GENERATOR_URL = `${BASE_URL}/letter-generator`;
const USER_PROFILE_URL = `${BASE_URL}/user-profile`;


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
    const response = await fetch(`${JOBS_URL}/getJobs`);
    if (!response.ok) {
      throw new Error("Failed to fetch jobs");
    }
    const data: Job[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return [];
  }
};

export const updateJobStatus = async (jobId: string, newStatus: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/updateJobStatus/${jobId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!response.ok) {
      throw new Error(`Failed to update job status for ID ${jobId}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error updating job status:", error);
    throw error;
  }
};

export const saveJob = async (jobData: Partial<Job>): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/jobs/addJob`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jobData),
    });
    if (!response.ok) {
      throw new Error("Failed to save job");
    }
    return await response.json();
  } catch (error) {
    console.error("Error saving job:", error);
    throw error;
  }
};

export const deleteJob = async (jobId: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${JOBS_URL}/deleteJob/${jobId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      throw new Error(`Failed to delete job with ID ${jobId}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error deleting job:", error);
    throw error;
  }
};

/*
export const fetchSnippets = async () => {
  try {
    //const url = `${CORS_PROXY}${BACKEND_URL_SNIPPET}/all`;
    const url = `${SNIPPET_URL}all`;
    console.log('Fetch URL (Snippets):', url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch snippets');
    }

    const data = await response.json();
    console.log('Fetched Snippets:', data);
    return data;
  } catch (error) {
    console.error('Error fetching snippets:', error.message);
    return [];
  }
};

export const addSnippet = async (snippetContent) => {
  try {
    //const url = `${CORS_PROXY}${BACKEND_URL_SNIPPET}/add`;
    const url = `${SNIPPET_URL}add`;
    console.log('POST URL (Add Snippet):', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: snippetContent }),
    });

    if (!response.ok) {
      throw new Error('Failed to add snippet');
    }

    const data = await response.json();
    console.log('Added Snippet:', data);
    return data;
  } catch (error) {
    console.error('Error adding snippet:', error.message);
    return null;
  }
};

export const deleteSnippet = async (snippetId) => {
  try {
    //const url = `${CORS_PROXY}${BACKEND_URL_SNIPPET}/delete/${snippetId}`;
    const url = `${SNIPPET_URL}/delete/${snippetId}`;
    console.log('DELETE URL (Delete Snippet):', url);

    const response = await fetch(url, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete snippet');
    }

    console.log(`Deleted Snippet ID: ${snippetId}`);
    return true;
  } catch (error) {
    console.error('Error deleting snippet:', error.message);
    return false;
  }
};
*/



/*
// ✅ Upload File
export const uploadFile = async (file: File): Promise<UploadResponse> => {
  const url = `${FILES_URL}/upload`;
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload file. Server responded with ${response.status}`);
    }

    const data = await response.json();
    return {
      file_path: data.file_path || data.fileId || "", // Ensure valid file path
      status: data.status || "success",
    };
  } catch (error) {
    console.error("❌ Error uploading file:", error);
    throw error;
  }
};
*/

// ✅ Fetch File List
export const fetchFiles = async (): Promise<ApiResponse<File[]>> => {
  const url = `${FILES_URL}/getFiles`;

  try {
    console.log("📂 Fetching file list from:", url);
    const response = await fetch(url, { method: "GET" });

    if (!response.ok) {
      throw new Error(`Failed to fetch files. Server responded with ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Error fetching files:", error);
    throw error;
  }
};

// ✅ Fetch File for Viewing (Opening in New Tab)
export const getFileURL = (fileId: string): string => {
  return `${FILES_URL}/${fileId}`;
};

// ✅ Delete File
export const deleteFile = async (fileId: string): Promise<ApiResponse<{ deleted: boolean }>> => {
  const url = `${FILES_URL}/delete/${fileId}`;
  console.log("🗑️ DELETE FILE URL:", url);

  try {
    const response = await fetch(url, { method: "DELETE" });

    if (!response.ok) {
      throw new Error(`Failed to delete file: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Error deleting file:", error);
    throw error;
  }
};

export const fetchJobDetails = async (jobId: string): Promise<ApiResponse> => {
  try {
    const url = `${LETTER_GENERATOR_URL}/${jobId}`;
    console.log('🔍 Fetching Job Details from:', url); // Debug log

    const response = await fetch(url);
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


/**
 * Start Browser Automation for Job Application
 * @param {string} jobUrl - The URL of the job application page
 * @param {object} userInfo - The user information to autofill the form
 * @returns {Promise<object>}
 */
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

//Fetch All User Profiles
export const fetchUserProfiles = async (): Promise<ApiResponse<UserProfile[]>> => {
  try {
    const url = `${USER_PROFILE_URL}/`;
    console.log('Fetching User Profiles from:', url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch user profiles');
    }

    const data = await response.json();
    return { data };
  } catch (error: unknown) {
    console.error('Error fetching user profiles:', error);
    return { data: [] };
  }
};


//Fetch a Single User Profile by ID
export const fetchUserProfileById = async (userId: string): Promise<ApiResponse<UserProfile>> => {
  try {
    const url = `${USER_PROFILE_URL}/${userId}`;
    console.log(`Fetching User Profile ${userId} from:`, url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch user profile with ID ${userId}`);
    }

    return await response.json();
  } catch (error: unknown) {
    console.error('Error fetching user profile:', (error instanceof Error ? error.message : 'An unknown error occurred'));
    throw error;
  }
};

//Create a New User Profile
export const createUserProfile = async (userData: UserProfile): Promise<ApiResponse<UserProfile>> => {
  try {
    const url = `${USER_PROFILE_URL}/newUser`;
    console.log('Creating User Profile:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Failed to create user profile');
    }

    const result: ApiResponse<UserProfile> = await response.json();
    return result;
  } catch (error: unknown) {
    console.error('Error creating user profile:', (error instanceof Error ? error.message : 'An unknown error occurred'));
    throw error;
  }
};


//Update a User Profile
export const updateUserProfile = async (userId: string, updatedData: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> => {
  try {
    const url = `${USER_PROFILE_URL}/${userId}`;
    console.log(`Updating User Profile ${userId}:`, url);

    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update user profile with ID ${userId}`);
    }

    return await response.json();
  } catch (error: unknown) {
    console.error('Error updating user profile:', (error instanceof Error ? error.message : 'An unknown error occurred'));
    throw error;
  }
};

//PASSWORD AUTHENTICATION FUNCTIONS

export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};


export const getUserProfileById = async (id: string): Promise<ApiResponse<UserProfile>> => {
  const url = `${USER_PROFILE_URL}/${id}`;
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user profile");
  }

  return response.json();
};

const AUTH_USER_URL = "http://localhost:5050/api/auth/user"

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
export const loginUser = async (email: string, password: string) => {
  const response = await fetch("http://localhost:5050/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Login failed");
  }

  // ✅ Store token and ID
  localStorage.setItem("token", data.token);
  localStorage.setItem("userId", data.id);

  return data;
};

export const registerUser = async (email: string, password: string, name: string) => {
  const response = await fetch("http://localhost:5050/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name}),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Registration failed")
  }

  return data
}
