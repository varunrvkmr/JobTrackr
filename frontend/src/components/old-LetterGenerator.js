import React, { useEffect, useState } from 'react';
import { fetchJobs } from '../services/api';
import { Link } from 'react-router-dom';

function LetterGenerator() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const jobList = await fetchJobs();
        setJobs(jobList);
      } catch (err) {
        setError('Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };
    loadJobs();
  }, []);

  if (loading) return <div>Loading jobs...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Job List</h2>
      {jobs.length === 0 ? (
        <p>No jobs available.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '10px' }}>Title</th>
              <th style={{ border: '1px solid #ccc', padding: '10px' }}>Company</th>
              <th style={{ border: '1px solid #ccc', padding: '10px' }}>Date Applied</th>
              <th style={{ border: '1px solid #ccc', padding: '10px' }}>Status</th>
              <th style={{ border: '1px solid #ccc', padding: '10px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td style={{ border: '1px solid #ccc', padding: '10px' }}>{job.position}</td>
                <td style={{ border: '1px solid #ccc', padding: '10px' }}>{job.company}</td>
                <td style={{ border: '1px solid #ccc', padding: '10px' }}>
                  {new Date(job.date_applied).toLocaleDateString()}
                </td>
                <td style={{ border: '1px solid #ccc', padding: '10px' }}>{job.status}</td>
                <td style={{ border: '1px solid #ccc', padding: '10px', textAlign: 'center' }}>
                  <Link to={`/letter-generator/${job.id}`}>
                    <button>View Details</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default LetterGenerator;
