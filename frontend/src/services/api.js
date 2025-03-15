// Replace 'http://your-ec2-public-dns:8081' with your EC2 instance's address.
// If the frontend is served from the same origin, you can use a relative path (e.g., '/api').
//const BASE_URL = "https://jobtrackr.hopto.org/api/";

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
const RESUME_URL = `${BASE_URL}/resume`;


// Fetch Backend Status
export const fetchBackendStatus = async () => {
  try {
    const url = `${BASE_URL}`;
    console.log('Fetch URL (Backend Status):', url);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data.message);
    return data;
  } catch (error) {
    console.error('Error fetching backend status:', error.message);
  }
};

export const fetchJobs = async () => {
  try {
    //const url = `${CORS_PROXY}/api/jobs/${jobId}`;
    //const url = `${CORS_PROXY}/${BACKEND_URL}/jobs/getJobs`; // Add '/' between proxy and backend
    //const url = `${JOBS_URL}getJobs`;
    const url = `${JOBS_URL}/getJobs`;  // ✅ Correct (fetches `/api/jobs/getJobs`)
    console.log('Fetch URL (Jobs):', url); // Debug log
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch jobs');
    }
    const data = await response.json();
    //console.log('Fetched Jobs:', data);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching jobs:', error.message);
    return [];
  }
};

export const updateJobStatus = async (jobId, newStatus) => {
  try {
    //const url = `${CORS_PROXY}${BACKEND_URL_JOBS}/updateStatus/${jobId}`;
    //const url = `${JOBS_URL}/updateStatus/${jobId}`;
    const url = `${BASE_URL}updateJobStatus/${jobId}`;


    console.log('PUT URL (Job Status):', url);

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update job status for ID ${jobId}`);
    }

    const data = await response.json();
    console.log('Response data:', data);
    return data;
  } catch (error) {
    console.error('Error updating job status:', error.message);
    throw error;
  }
};

// Add a new function for adding a job
export const saveJob = async (jobData) => {
  try {
    //const url = `${CORS_PROXY}${BACKEND_URL_JOBS}/addJob`;
    //const url = `${JOBS_URL}/addJob`;
    //const url = `${BASE_URL}addJob`;
    const url = `${BASE_URL}/jobs/addJob`;  // ✅ Correct



    console.log('POST URL (Save Job):', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobData),
    });

    if (!response.ok) {
      throw new Error('Failed to save job');
    }

    const data = await response.json();
    console.log('Response data (Save Job):', data);
    return data;
  } catch (error) {
    console.error('Error saving job:', error.message);
    throw error;
  }
};

// Add a new function for deleting a job
export const deleteJob = async (jobId) => {
  try {
    // Use the proxy URL without appending the backend URL in the path
    //const url = `${CORS_PROXY}/api/jobs/${jobId}`;
    const url = `${JOBS_URL}/deleteJob/${jobId}`;  // ✅ Correct
    console.log(`DELETE URL (Job):`, url); // Debug log

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete job with ID ${jobId}`);
    }

    const data = await response.json();
    console.log(`Deleted Job ID ${jobId}:`, data);
    return data;
  } catch (error) {
    console.error('Error deleting job:', error.message);
    throw error;
  }
};

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

/* WORKING CODE
export const uploadFile = async (file) => {
  const url = `${CORS_PROXY}/${BACKEND_URL_FILES}/upload`;
  console.log('UPLOAD FILE URL:', url);
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload file.');
    }

    const data = await response.json();
    console.log('File upload response:', data);
    return data;
  } catch (error) {
    console.error('Error uploading file:', error.message);
    throw error;
  }
};
*/

/*OLD WORKING CODE - 03/09
// ✅ Fetch File Content
export const fetchFileContent = async () => {
  try {
    const url = `${LETTER_GENERATOR_URL}/content/`;
    console.log('📂 Fetching file content from:', url); // Debug log

    const response = await fetch(url);
    console.log("📄 Raw Response Status:", response.status); // Debug log

    const data = await response.json();
    
    // ✅ Check for missing file message
    if (data.status === "error" && data.message === "No Resume on File") {
      console.warn("⚠️ No Resume on File");
      return { error: "No Resume on File" };
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch file content. Server responded with ${response.status}`);
    }

    return await response.blob(); // ✅ Returns file content as Blob
  } catch (error) {
    console.error('❌ Error fetching file content:', error.message);
    return { error: "Failed to fetch resume" }; // ✅ Prevents breaking frontend
  }
};



// ✅ Upload File
export const uploadFile = async (file) => {
  const url = `${BASE_URL}/files/upload`;

  const formData = new FormData();
  formData.append("file", file);

  console.log("📤 UPLOAD FILE URL:", url);

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload file. Server responded with ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ File uploaded successfully:", data);

    return data;
  } catch (error) {
    console.error("❌ Error uploading file:", error.message);
    throw error;
  }
};


export const fetchFiles = async () => {
  const url = `${BASE_URL}/files/getFiles`; // ✅ Updated to match backend

  try {
    console.log("📂 Fetching file list from:", url);
    const response = await fetch(url, { method: "GET" });

    if (!response.ok) {
      throw new Error(`Failed to fetch files. Server responded with ${response.status}`);
    }

    const data = await response.json();
    console.log("📄 Files fetched:", data);

    return data; // ✅ Return the list of files
  } catch (error) {
    console.error("❌ Error fetching files:", error.message);
    throw error;
  }
};


export const deleteFile = async (fileId) => {
  const url = `${BASE_URL}/files/delete/${fileId}`; // ✅ Use `fileId` instead of `filename`

  console.log("🗑️ DELETE FILE URL:", url);

  try {
    const response = await fetch(url, { method: "DELETE" });

    if (!response.ok) {
      throw new Error(`Failed to delete file: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`🗑️ File deleted: ${fileId}`, data);
    return data;
  } catch (error) {
    console.error("❌ Error deleting file:", error.message);
    throw error;
  }
};
*/
// ✅ Upload File
export const uploadFile = async (file) => {
  const url = `${FILES_URL}/upload`;

  const formData = new FormData();
  formData.append("file", file);

  console.log("📤 UPLOAD FILE URL:", url);

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload file. Server responded with ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ File uploaded successfully:", data);

    return data;
  } catch (error) {
    console.error("❌ Error uploading file:", error.message);
    throw error;
  }
};

// ✅ Fetch File List
export const fetchFiles = async () => {
  const url = `${FILES_URL}/getFiles`;

  try {
    console.log("📂 Fetching file list from:", url);
    const response = await fetch(url, { method: "GET" });

    if (!response.ok) {
      throw new Error(`Failed to fetch files. Server responded with ${response.status}`);
    }

    const data = await response.json();
    console.log("📄 Files fetched:", data);

    return data; // ✅ Returns the list of files
  } catch (error) {
    console.error("❌ Error fetching files:", error.message);
    throw error;
  }
};

// ✅ Fetch File for Viewing (Opening in New Tab)
export const getFileURL = (fileId) => {
  return `${FILES_URL}/${fileId}`; // ✅ Correct API route to access files
};

// ✅ Delete File
export const deleteFile = async (fileId) => {
  const url = `${FILES_URL}/delete/${fileId}`;

  console.log("🗑️ DELETE FILE URL:", url);

  try {
    const response = await fetch(url, { method: "DELETE" });

    if (!response.ok) {
      throw new Error(`Failed to delete file: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`🗑️ File deleted: ${fileId}`, data);
    return data;
  } catch (error) {
    console.error("❌ Error deleting file:", error.message);
    throw error;
  }
};

export const fetchJobDetails = async (jobId) => {
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
    return data;
  } catch (error) {
    console.error('❌ Error fetching job details:', error.message);
    throw error;
  }
};


// Fetch parsed resume data, job description, and skill comparison for a specific job
export const fetchSkillComparison = async (jobId, resumeFile) => {
  //const url = `${CORS_PROXY}${BACKEND_URL_LG}/parse-and-compare/${jobId}`;
  const url = `${LETTER_GENERATOR_URL}/parse-and-compare/${jobId}`;
  console.log('Fetch URL (Parse and Compare):', url);

  try {
    if (!(resumeFile instanceof Blob)) {
      throw new Error('Resume file is not a valid Blob');
    }

    // Create FormData object
    const formData = new FormData();
    formData.append('resume', resumeFile, 'resume.pdf'); // Provide a filename

    console.log('FormData entries before fetch:');
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}:`, pair[1]);
    }

    // Make the POST request
    const apiResponse = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!apiResponse.ok) {
      throw new Error(`Failed to fetch skill comparison. Server responded with ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    console.log('Skill Comparison Data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching skill comparison:', error.message);
    throw error;
  }
};


export const generateCoverLetter = async (payload) => {
  //const url = `${CORS_PROXY}${BACKEND_URL_LG}/generate`;
  const url = `${LETTER_GENERATOR_URL}/generate`;
  console.log('Fetch URL (LETTER GENERATOR):', url); // Debug log
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload), // Send the job details and resume in the payload
    });

    if (!response.ok) {
      throw new Error(`Failed to generate cover letter. Server responded with ${response.status}`);
    }

    const data = await response.json();
    return data.cover_letter; // Return the generated cover letter
  } catch (error) {
    console.error('Error generating cover letter:', error.message);
    throw error; // Re-throw the error for the calling component to handle
  }
};


// Answer a custom question based on job description and user input
export const answerCustomQuestion = async (jobId, question) => {
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
  } catch (error) {
    console.error('Error fetching custom question answer:', error.message);
    throw error; // Re-throw the error for the calling component to handle
  }
};


/**
 * Start Browser Automation for Job Application
 * @param {string} jobUrl - The URL of the job application page
 * @param {object} userInfo - The user information to autofill the form
 * @returns {Promise<object>}
 */
export const startAutomation = async (jobId) => {
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
  } catch (error) {
    console.error('❌ Error in startAutomation:', error.message);
    return { error: `Automation failed for job ${jobId}` };
  }
};

export const applyForJob = async (jobId) => {
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
  } catch (error) {
    console.error('❌ Error applying for job:', error.message);
    return { error: `Application failed for job ${jobId}` };
  }
};

// ✅ Upload Resume and Extract Text
export const uploadResume = async (file) => {
  const url = `${RESUME_URL}/upload-resume`;

  const formData = new FormData();
  formData.append("file", file);

  console.log("📤 Uploading Resume:", url);

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload resume. Server responded with ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Resume Uploaded & Parsed:", data);
    return data;
  } catch (error) {
    console.error("❌ Error uploading resume:", error.message);
    throw error;
  }
};

// ✅ Fetch Parsed Resume Data (if needed for future)
export const fetchParsedResume = async (filename) => {
  const url = `${RESUME_URL}/parsed/${filename}`;

  console.log("📂 Fetching Parsed Resume:", url);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch parsed resume. Server responded with ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Parsed Resume Data:", data);
    return data;
  } catch (error) {
    console.error("❌ Error fetching parsed resume:", error.message);
    throw error;
  }
};

