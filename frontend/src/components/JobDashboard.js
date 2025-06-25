import React, { useEffect, useState } from 'react';
import { fetchJobs, deleteJob, updateJobStatus, saveJob} from '../services/api';
import { FaTrash } from 'react-icons/fa';

function JobDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredStatus, setFilteredStatus] = useState(null);
  const [sortBy, setSortBy] = useState('');
  const [originalJobs, setOriginalJobs] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
      <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '20px 0', gap: '20px' }}>
        <input
          type="text"
          placeholder="Search jobs..."
          value={searchQuery}
          onChange={handleSearchChange}
          style={{
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            width: '30%',
            fontSize: '16px',
          }}
        />
        <div>
          <label htmlFor="sortBy" style={{ marginRight: '10px', fontWeight: 'bold' }}>
            Sort By:
          </label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={handleSortChange}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #007BFF',
              backgroundColor: '#f9f9f9',
              color: '#333',
              fontSize: '16px',
              cursor: 'pointer',
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
            padding: '10px 20px',
            backgroundColor: '#007BFF',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Add Job
        </button>
      </div>
      {filteredJobs.length === 0 ? (
        <p>No jobs found. Add a new job below!</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '10px' }}>Title</th>
              <th style={{ border: '1px solid #ccc', padding: '10px' }}>Company</th>
              <th style={{ border: '1px solid #ccc', padding: '10px' }}>Location</th>
              <th style={{ border: '1px solid #ccc', padding: '10px' }}>Status</th>
              <th style={{ border: '1px solid #ccc', padding: '10px' }}>Link</th>
              <th style={{ border: '1px solid #ccc', padding: '10px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map((job) => (
              <tr key={job.id}>
                <td style={{ border: '1px solid #ccc', padding: '10px' }}>{job.job_title}</td>
                <td style={{ border: '1px solid #ccc', padding: '10px' }}>{job.company}</td>
                <td style={{ border: '1px solid #ccc', padding: '10px' }}>{job.location}</td>
                <td style={{ border: '1px solid #ccc', padding: '10px' }}>
                  <select
                    value={job.posting_status}
                    onChange={(e) => handleStatusChange(job.id, e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #007BFF',
                      backgroundColor: '#f9f9f9',
                      color: '#333',
                      fontSize: '14px',
                      cursor: 'pointer',
                      width: '100%',
                    }}
                  >
                    <option value="Saved">Saved</option>
                    <option value="Applied">Applied</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </td>
                <td style={{ border: '1px solid #ccc', padding: '10px' }}>
                  <a href={job.job_link} target="_blank" rel="noopener noreferrer">
                    View Job
                  </a>
                </td>
                <td style={{ border: '1px solid #ccc', padding: '10px', textAlign: 'center' }}>
                  <FaTrash
                    onClick={() => handleDeleteJob(job.id)}
                    style={{ cursor: 'pointer', color: 'red' }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showDialog && (
      <div>
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '40px',
            backgroundColor: '#fff',
            borderRadius: '10px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            zIndex: 1001,
            width: '500px',
          }}
        >
          <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>Add New Job</h3>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Company</label>
            <input
              type="text"
              name="company"
              value={newJob.company}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
              }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Job Title</label>
            <input
              type="text"
              name="job_title"
              value={newJob.job_title}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
              }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Location</label>
            <input
              type="text"
              name="location"
              value={newJob.location}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
              }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description</label>
            <textarea
              name="job_description"
              value={newJob.job_description}
              onChange={handleInputChange}
              rows={5}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                resize: 'vertical', // Allow resizing vertically
              }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Status <span style={{ color: 'red' }}>*</span>
            </label>
            <select
              name="status"
              value={newJob.posting_status}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
              }}
            >
              <option value="">Select Status</option>
              <option value="Saved">Saved</option>
              <option value="Applied">Applied</option>
              <option value="Interviewing">Interviewing</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Link</label>
            <input
              type="url"
              name="job_link"
              value={newJob.job_link}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
              }}
            />
          </div>
          <div style={{ textAlign: 'right' }}>
              <button
              onClick={handleCloseDialog}
              style={{
                marginRight: '10px',
                padding: '10px 15px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                backgroundColor: '#f5f5f5',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleAddJob}
              style={{
                padding: '10px 15px',
                borderRadius: '5px',
                border: 'none',
                backgroundColor: '#007BFF',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Save
            </button>
          </div>
        </div>
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
          }}
          onClick={() => setShowDialog(false)}
        />
      </div>
    )}

    </div>
  );
}

export default JobDashboard;
