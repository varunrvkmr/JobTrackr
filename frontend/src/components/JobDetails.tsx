"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { fetchJobDetails } from "src/services/api"
import { useParams } from "react-router-dom";

import "./job-details.css"
import type { Job, ComparisonData } from "@/types" // Updated import path

interface JobDetailsProps {
  //jobId?: string; // Make jobId optional since useParams might return undefined
}

const JobDetails: React.FC<JobDetailsProps> = ({ }) => {
  const [job, setJob] = useState<Job | null>(null)
  const { jobId } = useParams<{ jobId: string }>()
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [coverLetter, setCoverLetter] = useState<string>("")
  const [resume, setResume] = useState<string | null>(null)
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null)
  const [isComparisonReady, setIsComparisonReady] = useState<boolean>(false)
  const [question, setQuestion] = useState<string>("")
  const [answer, setAnswer] = useState<string>("")
  const [isAutomationRunning, setIsAutomationRunning] = useState<boolean>(false)
  const [automationMessage, setAutomationMessage] = useState<string>("")
  const [activeTab, setActiveTab] = useState<string>("details")

  useEffect(() => {
    const loadJobDetails = async () => {
      try {
        // For demo purposes, create mock data if API is not available
        const mockJob: Job = {
          id: "mock-job-123", // ✅ Add a mock ID
          job_title: "Senior Frontend Developer",
          company: "Tech Solutions Inc.",
          location: "San Francisco, CA",
          posting_status: "Applied",
          job_link: "https://example.com/job",
          job_description:
            "We are looking for a Senior Frontend Developer with experience in React, TypeScript, and modern web technologies. The ideal candidate will have 5+ years of experience building responsive web applications and a strong understanding of UI/UX principles.\n\nResponsibilities:\n- Develop new user-facing features\n- Build reusable components and libraries for future use\n- Translate designs and wireframes into high-quality code\n- Optimize applications for maximum speed and scalability\n\nRequirements:\n- Strong proficiency in JavaScript, including DOM manipulation and the JavaScript object model\n- Thorough understanding of React.js and its core principles\n- Experience with TypeScript, Redux, and modern frontend build pipelines\n- Familiarity with RESTful APIs and modern authorization mechanisms",
        };
        

        // Use mock data or API call
        const response = await fetchJobDetails(jobId as string); // ✅ Ensure it's a string
        const jobData = response.data ?? mockJob; // Extract `data` or use `mockJob`
        setJob(jobData);


        try {
          // Mock resume data
          const mockResume =
            "JOHN DOE\nSenior Frontend Developer\njohn.doe@example.com | (123) 456-7890 | San Francisco, CA\n\nSUMMARY\nExperienced Frontend Developer with 6+ years of expertise in building responsive web applications using React, JavaScript, and TypeScript. Passionate about creating intuitive user interfaces and optimizing application performance.\n\nSKILLS\n- Frontend: React, Redux, TypeScript, JavaScript, HTML5, CSS3, Sass\n- Testing: Jest, React Testing Library, Cypress\n- Tools: Webpack, Git, npm, Jira\n\nEXPERIENCE\nSenior Frontend Developer | Tech Innovations | 2020 - Present\n- Developed and maintained multiple React applications serving 100,000+ users\n- Implemented responsive designs ensuring cross-browser compatibility\n- Reduced application load time by 40% through code optimization\n\nFrontend Developer | Web Solutions Co. | 2017 - 2020\n- Built reusable components and frontend libraries for future use\n- Collaborated with UX designers to implement intuitive interfaces\n- Integrated RESTful APIs with frontend applications"

          // Use mock data or actual API call
          setResume(mockResume)
        } catch (err) {
          console.warn("No resume found in the database.")
          setResume(null)
        }
      } catch (err) {
        setError("Failed to load job details or resume")
      } finally {
        setLoading(false)
      }
    }
    loadJobDetails()
  }, [jobId])

  const handleCompareResume = async () => {
    try {
      if (!resume) {
        alert("Please upload a resume before comparing.")
        return
      }

      setIsComparisonReady(true)

      // Mock comparison data
      const mockComparisonData = {
        matched_skills: ["React", "TypeScript", "JavaScript", "HTML5", "CSS3"],
        missing_skills: ["Redux", "RESTful APIs", "UI/UX principles"],
        matched_experience: ["Developed responsive web applications", "Built reusable components"],
        missing_experience: ["Authorization mechanisms", "Frontend build pipelines"],
        match_percentage: 75,
        recommendation:
          "Your resume matches many of the key requirements for this position. Consider highlighting your experience with React and TypeScript more prominently and addressing your familiarity with RESTful APIs in your cover letter.",
      }

      // Simulate API delay
      setTimeout(() => {
        setComparisonData(mockComparisonData)
      }, 1500)
    } catch (err) {
      alert("Failed to compare resumes")
      setIsComparisonReady(false)
    }
  }

  const handleGenerateCoverLetter = async () => {
    try {
      setCoverLetter("Generating cover letter...")

      // Mock cover letter generation
      setTimeout(() => {
        const mockCoverLetter = `Dear Hiring Manager,

I am writing to express my interest in the Senior Frontend Developer position at Tech Solutions Inc. With over 6 years of experience in frontend development, I am confident that my skills and experience make me an ideal candidate for this role.

Throughout my career, I have focused on building responsive and intuitive web applications using React, TypeScript, and modern JavaScript. At Tech Innovations, I developed and maintained multiple React applications serving over 100,000 users, which has given me extensive experience with the technologies you're looking for.

My experience includes:
• Developing reusable components and libraries
• Translating designs into high-quality code
• Optimizing applications for maximum speed and scalability
• Working with RESTful APIs and modern authorization mechanisms

I am particularly excited about the opportunity to join Tech Solutions Inc. because of your company's innovative approach to web development and commitment to creating exceptional user experiences.

Thank you for considering my application. I look forward to the possibility of discussing how my skills and experience can contribute to your team.

Sincerely,
John Doe`

        setCoverLetter(mockCoverLetter)
      }, 2000)
    } catch (err) {
      alert("Failed to generate cover letter")
      setCoverLetter("")
    }
  }

  const handleAnswerQuestion = async () => {
    if (!question) {
      alert("Please enter a question.")
      return
    }

    try {
      setAnswer("Generating answer...")

      // Mock answer generation
      setTimeout(() => {
        const mockAnswer = `Based on my experience as a Senior Frontend Developer with expertise in React, TypeScript, and modern web technologies, I would approach this challenge by first analyzing the existing codebase to understand the current architecture and identify performance bottlenecks. I would then implement a strategy that might include code splitting, lazy loading components, memoization of expensive calculations, and optimizing render cycles.

In my previous role at Tech Innovations, I faced a similar challenge where I reduced application load time by 40% through implementing these techniques. I also have experience with performance profiling tools like Chrome DevTools and Lighthouse to measure improvements objectively.

I believe my combination of technical knowledge and practical experience makes me well-equipped to tackle performance optimization challenges in your application.`

        setAnswer(mockAnswer)
      }, 1500)
    } catch (error) {
      alert("Failed to get an answer. Please try again.")
      setAnswer("")
    }
  }

  const handleApplyNow = async () => {
      setIsAutomationRunning(true);
      setAutomationMessage("Starting application process...");

      try {
          setAutomationMessage("Connect chrome extension logic");
      } catch (error) {
          setAutomationMessage("❌ Failed to start job application.");
      } finally {
          setIsAutomationRunning(false);
      }
  };


  if (loading)
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading job details...</p>
      </div>
    )

  if (error)
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <p>Error: {error}</p>
        <button className="retry-button" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    )

  if (!job)
    return (
      <div className="not-found-container">
        <div className="not-found-icon">🔍</div>
        <p>Job not found</p>
        <button className="back-button" onClick={() => window.history.back()}>
          Go Back
        </button>
      </div>
    )

  return (
    <div className="job-details-container">
      <div className="job-header">
        <div className="job-title-section">
          <h1>{job.job_title}</h1>
          <div className="job-subtitle">
            <span className="company-name">{job.company}</span>
            <span className="location-dot">•</span>
            <span className="job-location">{job.location}</span>
          </div>
          <div className="job-meta">
          </div>
        </div>
        <div className="job-actions">
          <a href={job.job_link} target="_blank" rel="noopener noreferrer" className="view-posting-btn">
            View Original Posting
          </a>
        </div>
      </div>

      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === "details" ? "active" : ""}`}
          onClick={() => setActiveTab("details")}
        >
          Job Details
        </button>
        <button
          className={`tab-button ${activeTab === "resume" ? "active" : ""}`}
          onClick={() => setActiveTab("resume")}
        >
          Resume
        </button>
        <button
          className={`tab-button ${activeTab === "comparison" ? "active" : ""}`}
          onClick={() => setActiveTab("comparison")}
        >
          Skills Comparison
        </button>
        <button
          className={`tab-button ${activeTab === "cover-letter" ? "active" : ""}`}
          onClick={() => setActiveTab("cover-letter")}
        >
          Cover Letter
        </button>
        <button
          className={`tab-button ${activeTab === "questions" ? "active" : ""}`}
          onClick={() => setActiveTab("questions")}
        >
          Custom Questions
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "details" && (
          <div className="job-description-section">
            <div className="section-header">
              <h2>Job Description</h2>
            </div>
            <div className="description-content">
              {job.job_description ? (
                <div className="job-description-text">
                  {job.job_description.split("\n").map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              ) : (
                <p className="no-description">No job description available.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "resume" && (
          <div className="resume-section">
            <div className="section-header">
              <h2>Your Resume</h2>
            </div>
            <div className="resume-content">
              {resume ? (
                <div className="resume-display">
                  <textarea className="resume-textarea" readOnly value={resume} rows={12} />
                </div>
              ) : (
                <div className="no-resume-container">
                  <p className="no-resume">No Resume on File</p>
                  <button className="upload-resume-btn">Upload Resume</button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "comparison" && (
          <div className="comparison-section">
            <div className="section-header">
              <h2>Resume Comparison</h2>
              <button
                className="compare-btn"
                onClick={handleCompareResume}
                disabled={!resume || (isComparisonReady && !comparisonData)}
              >
                {isComparisonReady && !comparisonData ? "Comparing..." : "Compare Resume"}
              </button>
            </div>

            {!isComparisonReady && !comparisonData && (
              <div className="comparison-placeholder">
                <p>Click "Compare Resume" to analyze how your resume matches this job description.</p>
              </div>
            )}

            {isComparisonReady && !comparisonData && (
              <div className="comparison-loading">
                <div className="loading-spinner"></div>
                <p>Analyzing your resume against the job description...</p>
              </div>
            )}

            {comparisonData && (
              <div className="comparison-results">
                <div className="comparison-grid">
                  <div className="comparison-card matched-skills">
                    <h3>Matched Skills</h3>
                    {comparisonData.matched_skills.length > 0 ? (
                      <ul className="skill-list">
                        {comparisonData.matched_skills.map((skill: string, index: number) => (
                          <li key={index} className="matched-item">
                            {skill}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="no-items">No matched skills found.</p>
                    )}
                  </div>

                  <div className="comparison-card missing-skills">
                    <h3>Missing Skills</h3>
                    {comparisonData.missing_skills.length > 0 ? (
                      <ul className="skill-list">
                        {comparisonData.missing_skills.map((skill: string, index: number) => (
                          <li key={index} className="missing-item">
                            {skill}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="no-items">No missing skills found.</p>
                    )}
                  </div>

                  <div className="comparison-card matched-experience">
                    <h3>Matched Experience</h3>
                    {comparisonData.matched_experience.length > 0 ? (
                      <ul className="experience-list">
                        {comparisonData.matched_experience.map((exp: string, index: number) => (
                          <li key={index} className="matched-item">
                            {exp}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="no-items">No matched experience found.</p>
                    )}
                  </div>

                  <div className="comparison-card missing-experience">
                    <h3>Missing Experience</h3>
                    {comparisonData.missing_experience.length > 0 ? (
                      <ul className="experience-list">
                        {comparisonData.missing_experience.map((exp: string, index: number) => (
                          <li key={index} className="missing-item">
                            {exp}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="no-items">No missing experience found.</p>
                    )}
                  </div>
                </div>

                <div className="match-summary">
                  <div className="match-percentage">
                    <div className="percentage-circle">
                      <span>{comparisonData.match_percentage || 75}%</span>
                    </div>
                    <p>Overall Match</p>
                  </div>
                  <div className="match-recommendation">
                    <h3>Recommendation</h3>
                    <p>
                      {comparisonData.recommendation ||
                        "Your resume matches many of the key requirements for this position. Consider highlighting your matched skills more prominently and addressing the missing skills in your cover letter."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "cover-letter" && (
          <div className="cover-letter-section">
            <div className="section-header">
              <h2>Cover Letter</h2>
              <button
                className="generate-btn"
                onClick={handleGenerateCoverLetter}
                disabled={coverLetter === "Generating cover letter..."}
              >
                {coverLetter === "Generating cover letter..." ? "Generating..." : "Generate Cover Letter"}
              </button>
            </div>

            {!coverLetter && (
              <div className="cover-letter-placeholder">
                <p>Click "Generate Cover Letter" to create a personalized cover letter for this job application.</p>
              </div>
            )}

            {coverLetter && (
              <div className="cover-letter-content">
                <textarea
                  className="cover-letter-textarea"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={16}
                />
                <div className="cover-letter-actions">
                  <button className="copy-btn" onClick={() => navigator.clipboard.writeText(coverLetter)}>
                    Copy to Clipboard
                  </button>
                  <button className="download-btn">Download as PDF</button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "questions" && (
          <div className="custom-question-section">
            <div className="section-header">
              <h2>Custom Application Questions</h2>
            </div>

            <div className="question-input-area">
              <p className="question-helper">
                Need help with application questions? Enter them below to get AI-generated responses.
              </p>
              <textarea
                className="question-textarea"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter an application question here..."
                rows={4}
              />
              <button
                className="get-answer-btn"
                onClick={handleAnswerQuestion}
                disabled={!question || answer === "Generating answer..."}
              >
                {answer === "Generating answer..." ? "Generating..." : "Get Answer"}
              </button>
            </div>

            {answer && (
              <div className="answer-container">
                <h3>Suggested Answer</h3>
                <textarea
                  className="answer-textarea"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={8}
                />
                <button className="copy-answer-btn" onClick={() => navigator.clipboard.writeText(answer)}>
                  Copy Answer
                </button>
              </div>
            )}

            <div className="saved-questions">
              <h3>Saved Questions & Answers</h3>
              <p className="no-saved-questions">No saved questions yet.</p>
            </div>
          </div>
        )}
      </div>

      <div className="apply-section">
        <button className="apply-btn" onClick={handleApplyNow} disabled={isAutomationRunning}>
          {isAutomationRunning ? "Applying..." : "Apply Now"}
        </button>
        {automationMessage && (
          <div className={`automation-message ${automationMessage.includes("Error") ? "error" : "success"}`}>
            {automationMessage}
          </div>
        )}
      </div>
    </div>
  )
}

export default JobDetails

