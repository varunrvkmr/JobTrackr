import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
  console.log("✅ Sidebar component is loading...");
  return (
    <div style={{
      width: '200px',
      background: '#f4f4f4',
      minHeight: '100vh',
      padding: '10px'
    }}>
      <h2>JobTrackr</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/jobs">Job Dashboard</Link></li>
        <li><Link to="/files">File Manager</Link></li>
        <li><Link to="/user-profile" className="text-blue-500 hover:underline font-semibold">User Profile</Link></li>
        <li><Link to="/snippets">Text Snippets</Link></li>
        <li><Link to="/letter-generator">Generate Letters</Link></li>
      </ul>
    </div>
  );
}

export default Sidebar;