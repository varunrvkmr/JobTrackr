import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  fetchJobDetails, 
  //fetchFileContent,
  fetchSkillComparison, 
  generateCoverLetter, 
  answerCustomQuestion, 
  applyForJob, 
  startAutomation 
} from '../services/api';
import '../styles/JobDetails.css';

function JobDetails() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState('');
  const [comparisonData, setComparisonData] = useState(null);
  const [isComparisonReady, setIsComparisonReady] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isAutomationRunning, setIsAutomationRunning] = useState(false);
  const [automationMessage, setAutomationMessage] = useState(""); 

  useEffect(() => {
    const loadJobDetails = async () => {
      try {
        const jobData = await fetchJobDetails(jobId);
        setJob(jobData);

        try {
          //const resumeContent = await fetchFileContent('resume.pdf');
          //setResume(resumeContent);
        } catch (err) {
          console.warn("No resume found in the database.");
          setResume(null);
        }
      } catch (err) {
        setError('Failed to load job details or resume');
      } finally {
        setLoading(false);
      }
    };
    loadJobDetails();
  }, [jobId]);

  const handleCompareResume = async () => {
    try {
      if (!resume) {
        alert('Please upload a resume before comparing.');
        return;
      }
  
      const resumeBlob = new Blob([resume], { type: 'application/pdf' });
      const data = await fetchSkillComparison(jobId, resumeBlob);
      
      if (data && !data.error) {
        setComparisonData(data);
        setIsComparisonReady(true);
      } else {
        alert(data?.error || 'Invalid response from API.');
      }
    } catch (err) {
      alert('Failed to compare resumes');
    }
  };

  const handleStartAutomation = async () => {
    if (!job || !job.link) {
        alert("Invalid job link.");
        return;
    }

    setIsAutomationRunning(true);
    setAutomationMessage("");

    const userInfo = {
        name: "John Doe",
        email: "johndoe@example.com",
        phone: "123-456-7890",
        cover_letter: "Dear Hiring Manager, I am excited to apply..."
    };

    const response = await startAutomation(job.link, userInfo);
    setIsAutomationRunning(false);

    setAutomationMessage(response.error ? `Error: ${response.error}` : response.message);
  };

  const handleGenerateCoverLetter = async () => {
    try {
      const letter = await generateCoverLetter({ job, resume });
      setCoverLetter(letter);
    } catch (err) {
      alert('Failed to generate cover letter');
    }
  };

  const handleAnswerQuestion = async () => {
    if (!question) {
      alert('Please enter a question.');
      return;
    }
  
    try {
      const response = await answerCustomQuestion(jobId, question);
      setAnswer(response || 'No answer available.');
    } catch (error) {
      alert('Failed to get an answer. Please try again.');
    }
  };

  const handleApplyNow = async () => {
    setIsAutomationRunning(true);
    setAutomationMessage("");

    try {
        const response = await applyForJob(jobId);

        if (response.error) {
            setAutomationMessage(`Error: ${response.error}`);
        } else {
            setAutomationMessage(response.message || "Job application process started!");
        }
    } catch (error) {
        setAutomationMessage("❌ Failed to start job application.");
    } finally {
        setIsAutomationRunning(false);
    }
};

  
  if (loading) return <div>Loading job details...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!job) return <div>Job not found</div>;

  return (
    <div className="job-details">
      <h2>Job Details</h2>
      <p><strong>Title:</strong> {job.position}</p>
      <p><strong>Company:</strong> {job.company}</p>
      <p><strong>Location:</strong> {job.location}</p>
      <p><strong>Status:</strong> {job.status}</p>
      <p><strong>Date Applied:</strong> {new Date(job.date_applied).toLocaleDateString()}</p>
      <p>
        <strong>Link:</strong>{' '}
        <a href={job.link} target="_blank" rel="noopener noreferrer">
          View Job Posting
        </a>
      </p>

      <hr />

      <div className="resume-section">
        <h3>Resume</h3>
        {resume ? (
          <textarea className="resume-textarea" readOnly value={resume} rows="6" />
        ) : (
          <p className="no-resume">No Resume on File</p>
        )}
      </div>

      <hr />

      <h3>Resume Comparison</h3>
      {job.job_description && (
        <div>
          <h4>Job Description</h4>
          <textarea className="job-description-textarea" readOnly value={job.job_description} rows="6" />
        </div>
      )}
      <hr />

      <button className="compare-btn" onClick={handleCompareResume}>Compare Resume</button>
      {comparisonData ? (
        <div className="comparison-section">
          <h4>Comparison Results</h4>

          <div className="comparison-category">
            <h5>Matched Skills</h5>
            {comparisonData.matched_skills.length > 0 ? (
              <ul>{comparisonData.matched_skills.map((skill, index) => <li key={index}>{skill}</li>)}</ul>
            ) : <p>No matched skills found.</p>}
          </div>

          <div className="comparison-category">
            <h5>Missing Skills</h5>
            {comparisonData.missing_skills.length > 0 ? (
              <ul>{comparisonData.missing_skills.map((skill, index) => <li key={index}>{skill}</li>)}</ul>
            ) : <p>No missing skills found.</p>}
          </div>

          <div className="comparison-category">
            <h5>Matched Experience</h5>
            {comparisonData.matched_experience.length > 0 ? (
              <ul>{comparisonData.matched_experience.map((experience, index) => <li key={index}>{experience}</li>)}</ul>
            ) : <p>No matched experience found.</p>}
          </div>

          <div className="comparison-category">
            <h5>Missing Experience</h5>
            {comparisonData.missing_experience.length > 0 ? (
              <ul>{comparisonData.missing_experience.map((experience, index) => <li key={index}>{experience}</li>)}</ul>
            ) : <p>No missing experience found.</p>}
          </div>
        </div>
      ) : (
        <p>{isComparisonReady ? 'Comparison in progress...' : 'Click "Compare Resume" to start comparison.'}</p>
      )}

      <hr />

      <div className="cover-letter-section">
        <h3>Cover Letter</h3>
        <button className="generate-btn" onClick={handleGenerateCoverLetter}>Generate Cover Letter</button>
        {coverLetter && (
          <textarea className="cover-letter-textarea" readOnly value={coverLetter} rows="10" />
        )}
      </div>

      <hr />

      <div className="custom-question-section">
        <h3>Custom Question</h3>
        <textarea className="question-textarea" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Enter your question here..." rows="4" />
        <button className="get-answer-btn" onClick={handleAnswerQuestion}>Get Answer</button>
        {answer && <textarea className="answer-textarea" readOnly value={answer} rows="6" />}
      </div>

      <hr />

      <button className="apply-btn" onClick={handleApplyNow} disabled={isAutomationRunning}>
          {isAutomationRunning ? "Applying..." : "Apply Now"}
      </button>
      {automationMessage && <p className="automation-message">{automationMessage}</p>}
    </div>
  );
}

export default JobDetails;
