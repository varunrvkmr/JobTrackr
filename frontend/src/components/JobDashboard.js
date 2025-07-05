import React, { useEffect, useState } from 'react';
import { fetchJobs, deleteJob, updateJobStatus, saveJob, fetchJobDetails} from '../services/api';
import { FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'

function JobDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredStatus, setFilteredStatus] = useState(null);
  const [sortBy, setSortBy] = useState('');
  const [originalJobs, setOriginalJobs] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [newJob, setNewJob] = useState({
    company: '',
    job_title: '',
    location: '',
    job_description: '',
    posting_status: 'Saved',
    job_link: '',
    country: ''
  });  
  

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const data = await fetchJobs();
        setJobs(data);
        setOriginalJobs(data);
      } catch (err) {
        setError('Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };
    loadJobs();
  }, []);

  const handleRowClick = async (jobId) => {
    try {
      const { data, error } = await fetchJobDetails(String(jobId));
      if (error) {
        console.error('❌ Failed to load job details:', error);
        // → you could show a toast/dialog here
        return;
      }

      // → optionally stash `data` in context or state if needed
      // now navigate to your letter-generator page
      navigate(`/letter-generator/${jobId}`);
    } catch (err) {
      console.error('⚠️ Unexpected error in handleRowClick:', err);
    }
  };


  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query === '') {
      setJobs(originalJobs);
    } else {
      const filtered = originalJobs.filter((job) =>
        job.company.toLowerCase().includes(query) ||
        job.job_title.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query)
      );
      setJobs(filtered);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Really delete this job?")) return;

    try {
      const { status, message } = await deleteJob(String(jobId));

      if (status === "success") {
        // remove it from local state
        setJobs(prev => prev.filter(job => job.id !== jobId));
      } else {
        // show the server’s error message
        alert(message || "Could not delete job.");
      }
    } catch (err) {
      console.error("Delete error", err);
      alert("An unexpected error occurred.");
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      const updatedJob = await updateJobStatus(jobId, newStatus);
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === jobId
            ? { ...job, posting_status: updatedJob.posting_status }  // ✅ updated
            : job
        )
      );
    } catch (err) {
      alert(`Failed to update job status: ${err.message}`);
    }
  };
  

  const handleAddJob = async () => {
    if (!newJob.company || !newJob.job_title || !newJob.posting_status) {
      alert('Please fill out all required fields.');
      return;
    }
  
    try {
      const result = await saveJob(newJob);
  
      if (!result || !result.job || !result.job.posting_status) {
        throw new Error('Invalid job data received from the backend.');
      }
  
      setJobs((prevJobs) => [...prevJobs, result.job]);
      setOriginalJobs((prevJobs) => [...prevJobs, result.job]);
      setShowDialog(false);
    } catch (error) {
      alert(error.message || 'An unexpected error occurred. Please try again.');
    }
  };  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewJob((prev) => ({ ...prev, [name]: value }));
  };

  const calculateJobCounts = () => {
    const statusCounts = {
      Saved: 0,
      Applied: 0,
      Interviewing: 0,
      Accepted: 0,
      Rejected: 0,
    };
  
    jobs.forEach((job) => {
      if (job && job.posting_status && statusCounts[job.posting_status] !== undefined) {
        statusCounts[job.posting_status] += 1;
      }
    });
  
    return statusCounts;
  };  
  
  const handleCloseDialog = () => {
    setNewJob({
      company: '',
      job_title: '',
      location: '',
      posting_status: 'Saved', // default value
      job_link: '',
      job_description: '',
      country: 'USA'
    });
  
    setShowDialog(false);
  };
  
  const handleSortChange = (e) => {
    const sortKey = e.target.value;
    setSortBy(sortKey);
  
    if (sortKey === '') {
      setJobs(originalJobs);
      return;
    }
  
    const sortedJobs = [...jobs];
    if (sortKey === 'posting_status') {
      sortedJobs.sort((a, b) => a.posting_status.localeCompare(b.posting_status));
    } else if (sortKey === 'company') {
      sortedJobs.sort((a, b) => a.company.localeCompare(b.company));
    } else if (sortKey === 'location') {
      sortedJobs.sort((a, b) => a.location?.localeCompare(b.location));
    }    
  
    setJobs(sortedJobs);
  };

  const handleFilterClick = (status) => {
    setFilteredStatus((prevStatus) => (prevStatus === status ? null : status));
  };

  const filteredJobs = filteredStatus
  ? jobs.filter((job) => job.posting_status === filteredStatus)
  : jobs;

  const renderStatusSummary = () => {
    const counts = calculateJobCounts();
    const statuses = Object.keys(counts);

    return (
      <div style={{ display: 'flex', gap: '20px', margin: '20px 0' }}>
        {statuses.map((status) => (
          <div
            key={status}
            onClick={() => handleFilterClick(status)}
            style={{
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '5px',
              textAlign: 'center',
              flex: '1',
              backgroundColor: filteredStatus === status ? '#ddd' : '#fff',
              cursor: 'pointer',
            }}
          >
            <h4>{counts[status]}</h4>
            <p>{status}</p>
          </div>
        ))}
      </div>
    );
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Dashboard</h2>
      {renderStatusSummary()}
      <div style={{ display: "flex", justifyContent: "flex-end", margin: "20px 0", gap: "20px" }}>
        <input
          type="text"
          placeholder="Search jobs..."
          value={searchQuery}
          onChange={handleSearchChange}
          style={{
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            width: "30%",
            fontSize: "16px",
          }}
        />
        <div>
          <label htmlFor="sortBy" style={{ marginRight: "10px", fontWeight: "bold" }}>
            Sort By:
          </label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={handleSortChange}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #007BFF",
              backgroundColor: "#f9f9f9",
              color: "#333",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            <option value="posting_status">Status</option>
            <option value="company">Company</option>
            <option value="location">Location</option>
          </select>
        </div>
        <button
          onClick={() => setShowDialog(true)}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007BFF",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Add Job
        </button>
      </div>
      {filteredJobs.length === 0 ? (
        <p>No jobs found. Add a new job below!</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: "10px" }}>Title</th>
              <th style={{ border: "1px solid #ccc", padding: "10px" }}>Company</th>
              <th style={{ border: "1px solid #ccc", padding: "10px" }}>Location</th>
              <th style={{ border: "1px solid #ccc", padding: "10px" }}>Status</th>
              <th style={{ border: "1px solid #ccc", padding: "10px" }}>Link</th>
              <th style={{ border: "1px solid #ccc", padding: "10px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map((job) => (
              <tr
                key={job.id}
                onClick={() => handleRowClick(job.id)}
                style={{
                  cursor: "pointer",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f5f5f5"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent"
                }}
              >
                <td style={{ border: "1px solid #ccc", padding: "10px" }}>{job.job_title}</td>
                <td style={{ border: "1px solid #ccc", padding: "10px" }}>{job.company}</td>
                <td style={{ border: "1px solid #ccc", padding: "10px" }}>{job.location}</td>
                <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                  <select
                    value={job.posting_status}
                    onChange={(e) => handleStatusChange(job.id, e.target.value, e)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #007BFF",
                      backgroundColor: "#f9f9f9",
                      color: "#333",
                      fontSize: "14px",
                      cursor: "pointer",
                      width: "100%",
                    }}
                  >
                    <option value="Saved">Saved</option>
                    <option value="Applied">Applied</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </td>
                <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                  <a
                    href={job.job_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()} // Prevent row click when clicking link
                  >
                    View Job
                  </a>
                </td>
                <td style={{ border: "1px solid #ccc", padding: "10px", textAlign: "center" }}>
                  <FaTrash onClick={(e) => handleDeleteJob(job.id, e)} style={{ cursor: "pointer", color: "red" }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showDialog && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          {/* Backdrop */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(4px)",
            }}
            onClick={handleCloseDialog}
          />

          {/* Modal */}
          <div
            style={{
              position: "relative",
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              width: "100%",
              maxWidth: "672px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "24px",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#111827",
                  margin: 0,
                }}
              >
                Add New Job
              </h2>
              <button
                onClick={handleCloseDialog}
                style={{
                  padding: "8px",
                  backgroundColor: "transparent",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#f3f4f6")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
              >
                <svg
                  style={{ width: "20px", height: "20px", color: "#6b7280" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form Content */}
            <div style={{ padding: "24px" }}>
              {/* Company & Job Title Row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "16px",
                  marginBottom: "24px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "8px",
                    }}
                  >
                    Company <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={newJob.company}
                    onChange={handleInputChange}
                    placeholder="Enter company name"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#3b82f6"
                      e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)"
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#d1d5db"
                      e.target.style.boxShadow = "none"
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "8px",
                    }}
                  >
                    Job Title <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="job_title"
                    value={newJob.job_title}
                    onChange={handleInputChange}
                    placeholder="Enter job title"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#3b82f6"
                      e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)"
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#d1d5db"
                      e.target.style.boxShadow = "none"
                    }}
                  />
                </div>
              </div>

              {/* Location & Status Row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "16px",
                  marginBottom: "24px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "8px",
                    }}
                  >
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={newJob.location}
                    onChange={handleInputChange}
                    placeholder="Enter location"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#3b82f6"
                      e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)"
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#d1d5db"
                      e.target.style.boxShadow = "none"
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "8px",
                    }}
                  >
                    Status <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <select
                    name="posting_status"
                    value={newJob.posting_status}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      backgroundColor: "white",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#3b82f6"
                      e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)"
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#d1d5db"
                      e.target.style.boxShadow = "none"
                    }}
                  >
                    <option value="Saved">Saved</option>
                    <option value="Applied">Applied</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Job Link */}
              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                    marginBottom: "8px",
                  }}
                >
                  Job Link
                </label>
                <input
                  type="url"
                  name="job_link"
                  value={newJob.job_link}
                  onChange={handleInputChange}
                  placeholder="https://example.com/job-posting"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#3b82f6"
                    e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)"
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#d1d5db"
                    e.target.style.boxShadow = "none"
                  }}
                />
              </div>

              {/* Job Description */}
              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                    marginBottom: "8px",
                  }}
                >
                  Job Description
                </label>
                <textarea
                  name="job_description"
                  value={newJob.job_description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Paste the job description here..."
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                    outline: "none",
                    resize: "vertical",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#3b82f6"
                    e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)"
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#d1d5db"
                    e.target.style.boxShadow = "none"
                  }}
                />
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "12px",
                padding: "24px",
                borderTop: "1px solid #e5e7eb",
                backgroundColor: "#f9fafb",
                borderBottomLeftRadius: "12px",
                borderBottomRightRadius: "12px",
              }}
            >
              <button
                onClick={handleCloseDialog}
                style={{
                  padding: "8px 16px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                  backgroundColor: "white",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "background-color 0.2s, border-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#f9fafb"
                  e.target.style.borderColor = "#9ca3af"
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "white"
                  e.target.style.borderColor = "#d1d5db"
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddJob}
                style={{
                  padding: "8px 16px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "white",
                  backgroundColor: "#2563eb",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#1d4ed8")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#2563eb")}
              >
                Add Job
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default JobDashboard
