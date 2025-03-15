import React, { useState } from 'react';

function JobParser() {
  const [url, setUrl] = useState('');
  const [message, setMessage] = useState('');

  const handleParse = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8080/api/jobs/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      setMessage(data.message || data.error);
    } catch (error) {
      console.error('Failed to parse job:', error);
    }
  };

  return (
    <div>
      <h2>Job Parser</h2>
      <input
        type="text"
        placeholder="Enter job posting URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button onClick={handleParse}>Parse Job</button>
      <p>{message}</p>
    </div>
  );
}

export default JobParser;