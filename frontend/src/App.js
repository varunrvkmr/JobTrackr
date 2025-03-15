import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';  // ✅ Add these imports
import { fetchBackendStatus } from './services/api';
import Sidebar from './components/Sidebar';
import JobDashboard from './components/JobDashboard';
import FileManager from './components/FileManager';
import TextSnippets from './components/TextSnippets';
import LetterGenerator from './components/LetterGenerator';
import JobDetails from './components/JobDetails';
import JobParser from './components/JobParser';
import UserProfile from "./components/UserProfile";


function App() {
  useEffect(() => {
    fetchBackendStatus();
  }, []);

  return (
    <Router>
      <div style={{ display: 'flex' }}>
        {/* Sidebar Component */}
        <Sidebar />

        {/* Main Content */}
        <div style={{ flexGrow: 1, padding: '20px' }}>
          <h1>JobTrackr</h1>
          <p>Let's find a job!</p>
          <Routes>
            <Route path="/jobs" element={<JobDashboard/>} />
            <Route path="/files" element={<FileManager />} />
            <Route path="/snippets" element={<TextSnippets />} />
            <Route path="/user-profile" element={<UserProfile />} />
            <Route path="/letter-generator" element={<LetterGenerator />} />
            <Route path="/letter-generator/:jobId" element={<JobDetails />} />
            <Route
              path="/"
              element={
                <div>
                  <h2>Welcome to JobTrackr!</h2>
                  <p>Select an option from the sidebar to get started.</p>
                </div>
              }
            />
            <Route path="/parse-job" element={<JobParser />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;