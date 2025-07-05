"use client"

import { useState, useRef, useEffect } from "react"

interface WorkExperience {
  id: string
  company: string
  jobTitle: string
  startDate: string
  endDate: string
  description: string
}

interface Education {
  id: string
  school: string
  degree: string
  startDate: string
  endDate: string
  description: string
}

interface ResumeData {
  firstName: string
  lastName: string
  objective: string
  email: string
  phone: string
  website: string
  github: string
  location: string
  workExperiences: WorkExperience[]
  educations: Education[]
}

export default function ResumeBuilder() {
  const [resumeData, setResumeData] = useState<ResumeData>({
    firstName: "Sal",
    lastName: "Khan",
    objective: "Entrepreneur and educator obsessed with making education free for anyone",
    email: "hello@khanacademy.org",
    phone: "(123) 456-7890",
    website: "linkedin.com/in/khanacademy",
    github: "github.com/salman-khan",
    location: "NYC, NY",
    workExperiences: [
      {
        id: "1",
        company: "Khan Academy",
        jobTitle: "Software Engineer",
        startDate: "2022-06",
        endDate: "2024-12",
        description: "• Developed educational software solutions\n• Led team initiatives for platform improvements",
      },
    ],
    educations: [
      {
        id: "1",
        school: "MIT",
        degree: "Bachelor of Science in Computer Science",
        startDate: "2018-09",
        endDate: "2022-05",
        description: "• Graduated Magna Cum Laude\n• Relevant coursework: Data Structures, Algorithms",
      },
    ],
  })

  const [zoom, setZoom] = useState(58)
  const [targetPages, setTargetPages] = useState(1)
  const [autoScale, setAutoScale] = useState(true)
  const [scalingStrategy, setScalingStrategy] = useState<"conservative" | "aggressive">("conservative")
  const [currentScale, setCurrentScale] = useState(1)
  const resumeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleResize = () => {
      calculateOptimalScale()
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [targetPages, autoScale, scalingStrategy])

  const handleInputChange = (field: keyof ResumeData, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleWorkExperienceChange = (id: string, field: keyof WorkExperience, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      workExperiences: prev.workExperiences.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)),
    }))
  }

  const handleEducationChange = (id: string, field: keyof Education, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      educations: prev.educations.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)),
    }))
  }

  const addWorkExperience = () => {
    const newExp: WorkExperience = {
      id: Date.now().toString(),
      company: "",
      jobTitle: "",
      startDate: "",
      endDate: "",
      description: "",
    }
    setResumeData((prev) => ({
      ...prev,
      workExperiences: [...prev.workExperiences, newExp],
    }))
  }

  const removeWorkExperience = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      workExperiences: prev.workExperiences.filter((exp) => exp.id !== id),
    }))
  }

  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      school: "",
      degree: "",
      startDate: "",
      endDate: "",
      description: "",
    }
    setResumeData((prev) => ({
      ...prev,
      educations: [...prev.educations, newEdu],
    }))
  }

  const removeEducation = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      educations: prev.educations.filter((edu) => edu.id !== id),
    }))
  }

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short" })
  }

  const calculateOptimalScale = () => {
    if (!resumeRef.current || !autoScale) return

    const resumeElement = resumeRef.current
    const targetHeight = targetPages * 11 * 96 // 11 inches * 96 DPI
    const currentHeight = resumeElement.scrollHeight

    // Calculate available width based on sidebar state
    const availableWidth = window.innerWidth
    const formPanelWidth = Math.min(600, availableWidth * 0.4) // 40% of available width, max 600px
    const previewPanelWidth = availableWidth - formPanelWidth

    // Adjust scaling based on available space
    const contentRatio = currentHeight / targetHeight
    const widthRatio = previewPanelWidth < 800 ? previewPanelWidth / 800 : 1 // Minimum comfortable width

    let newFontScale = 1
    let newSpacingScale = 1

    if (contentRatio > 1 || widthRatio < 1) {
      const combinedRatio = Math.max(contentRatio, 1 / widthRatio)

      if (scalingStrategy === "conservative") {
        newSpacingScale = Math.max(0.85, 1 / Math.sqrt(combinedRatio))
        if (combinedRatio > 1.2) {
          newFontScale = Math.max(0.9, 1 / Math.pow(combinedRatio, 0.2))
        }
      } else {
        newFontScale = Math.max(0.8, 1 / Math.sqrt(combinedRatio))
        newSpacingScale = Math.max(0.75, 1 / combinedRatio)
      }
    }

    setCurrentScale(newFontScale)
    resumeElement.style.setProperty("--spacing-scale", newSpacingScale.toString())
    resumeElement.style.setProperty("--font-scale", newFontScale.toString())
  }

  // Update the existing scaling useEffect
  useEffect(() => {
    const timeoutId = setTimeout(calculateOptimalScale, 100)
    return () => clearTimeout(timeoutId)
  }, [resumeData, targetPages, autoScale, scalingStrategy])

  return (
    <div style={styles.container}>
      <div style={styles.mainContent}>
        {/* Left Form Panel */}
        <div style={styles.formPanel}>
          <div style={styles.formRow}>
            <div style={styles.formSection}>
              <label style={styles.label}>First Name</label>
              <input
                type="text"
                value={resumeData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.formSection}>
              <label style={styles.label}>Last Name</label>
              <input
                type="text"
                value={resumeData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.formSection}>
            <label style={styles.label}>Objective</label>
            <textarea
              value={resumeData.objective}
              onChange={(e) => handleInputChange("objective", e.target.value)}
              style={styles.textarea}
              rows={3}
            />
          </div>

          <div style={styles.formRow}>
            <div style={styles.formSection}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={resumeData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.formSection}>
              <label style={styles.label}>Phone</label>
              <input
                type="tel"
                value={resumeData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formSection}>
              <label style={styles.label}>Website</label>
              <input
                type="url"
                value={resumeData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.formSection}>
              <label style={styles.label}>GitHub</label>
              <input
                type="url"
                value={resumeData.github}
                onChange={(e) => handleInputChange("github", e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.formSection}>
            <label style={styles.label}>Location</label>
            <input
              type="text"
              value={resumeData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              style={styles.input}
            />
          </div>

          {/* Work Experience Section */}
          <div style={styles.sectionHeader}>
            <span style={styles.sectionIcon}>📋</span>
            <span style={styles.sectionTitle}>WORK EXPERIENCE</span>
            <button style={styles.addButton} onClick={addWorkExperience}>
              + Add
            </button>
          </div>

          {resumeData.workExperiences.map((exp, index) => (
            <div key={exp.id} style={styles.experienceCard}>
              <div style={styles.cardHeader}>
                <span style={styles.cardTitle}>Work Experience {index + 1}</span>
                {resumeData.workExperiences.length > 1 && (
                  <button style={styles.removeButton} onClick={() => removeWorkExperience(exp.id)}>
                    Remove
                  </button>
                )}
              </div>

              <div style={styles.formSection}>
                <label style={styles.label}>Company</label>
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => handleWorkExperienceChange(exp.id, "company", e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.formSection}>
                <label style={styles.label}>Job Title</label>
                <input
                  type="text"
                  value={exp.jobTitle}
                  onChange={(e) => handleWorkExperienceChange(exp.id, "jobTitle", e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formSection}>
                  <label style={styles.label}>Start Date</label>
                  <input
                    type="date"
                    value={exp.startDate}
                    onChange={(e) => handleWorkExperienceChange(exp.id, "startDate", e.target.value)}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formSection}>
                  <label style={styles.label}>End Date</label>
                  <input
                    type="date"
                    value={exp.endDate}
                    onChange={(e) => handleWorkExperienceChange(exp.id, "endDate", e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formSection}>
                <label style={styles.label}>Description</label>
                <textarea
                  value={exp.description}
                  onChange={(e) => handleWorkExperienceChange(exp.id, "description", e.target.value)}
                  style={styles.textarea}
                  rows={4}
                />
              </div>
            </div>
          ))}

          {/* Education Section */}
          <div style={styles.sectionHeader}>
            <span style={styles.sectionIcon}>🎓</span>
            <span style={styles.sectionTitle}>EDUCATION</span>
            <button style={styles.addButton} onClick={addEducation}>
              + Add
            </button>
          </div>

          {resumeData.educations.map((edu, index) => (
            <div key={edu.id} style={styles.experienceCard}>
              <div style={styles.cardHeader}>
                <span style={styles.cardTitle}>Education {index + 1}</span>
                {resumeData.educations.length > 1 && (
                  <button style={styles.removeButton} onClick={() => removeEducation(edu.id)}>
                    Remove
                  </button>
                )}
              </div>

              <div style={styles.formSection}>
                <label style={styles.label}>School</label>
                <input
                  type="text"
                  value={edu.school}
                  onChange={(e) => handleEducationChange(edu.id, "school", e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.formSection}>
                <label style={styles.label}>Degree</label>
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => handleEducationChange(edu.id, "degree", e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formSection}>
                  <label style={styles.label}>Start Date</label>
                  <input
                    type="date"
                    value={edu.startDate}
                    onChange={(e) => handleEducationChange(edu.id, "startDate", e.target.value)}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formSection}>
                  <label style={styles.label}>End Date</label>
                  <input
                    type="date"
                    value={edu.endDate}
                    onChange={(e) => handleEducationChange(edu.id, "endDate", e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formSection}>
                <label style={styles.label}>Description</label>
                <textarea
                  value={edu.description}
                  onChange={(e) => handleEducationChange(edu.id, "description", e.target.value)}
                  style={styles.textarea}
                  rows={3}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Right Preview Panel */}
        <div
          style={{
            flex: "1", // Take remaining space
            minWidth: "400px",
            backgroundColor: "#f3f4f6",
            display: "flex",
            flexDirection: "column" as const,
            boxSizing: "border-box" as const,
            height: "100vh", // Full viewport height
            position: "relative" as const, // This allows absolute positioning of children
          }}
        >
          {/* Preview Controls */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              padding: "1rem 2rem",
              backgroundColor: "white",
              borderBottom: "1px solid #e5e7eb",
              flexWrap: "wrap" as const,
              flexShrink: 0,
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div style={styles.controlGroup}>
              <label style={styles.controlLabel}>
                Target Pages:
                <select
                  value={targetPages}
                  onChange={(e) => setTargetPages(Number(e.target.value))}
                  style={styles.select}
                >
                  <option value={1}>1 Page</option>
                  <option value={2}>2 Pages</option>
                  <option value={3}>3 Pages</option>
                </select>
              </label>
            </div>

            {autoScale && (
              <div style={styles.controlGroup}>
                <label style={styles.controlLabel}>
                  Strategy:
                  <select
                    value={scalingStrategy}
                    onChange={(e) => setScalingStrategy(e.target.value as "conservative" | "aggressive")}
                    style={styles.select}
                  >
                    <option value="conservative">Conservative</option>
                    <option value="aggressive">Aggressive</option>
                  </select>
                </label>
              </div>
            )}

            <div style={styles.zoomControls}>
              <span>🔍</span>
              <input
                type="range"
                min="25"
                max="100"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                style={styles.zoomSlider}
              />
              <span>{zoom}%</span>
            </div>

            <button style={styles.downloadButton}>⬇ Download Resume</button>
          </div>
          <div
            style={{
              flex: 1,
              padding: "2rem",
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              overflowY: "auto" as const,
              overflowX: "hidden" as const,
              paddingTop: "0", // Add space for the fixed controls
            }}
          >
            <div
              ref={resumeRef}
              style={{
                ...styles.resumePreview,
                transform: `scale(${zoom / 100})`,
                fontSize: `calc(1rem * var(--font-scale, 1))`,
              }}
            >
              {/* Resume Header */}
              <div style={styles.resumeHeader}>
                <h1 style={styles.resumeName}>
                  {resumeData.firstName} {resumeData.lastName}
                </h1>
                <div style={styles.contactInfo}>
                  <span>{resumeData.email}</span>
                  <span>{resumeData.phone}</span>
                  <span>{resumeData.website}</span>
                  <span>{resumeData.github}</span>
                  <span>{resumeData.location}</span>
                </div>
              </div>

              {/* Objective */}
              {resumeData.objective && (
                <div style={styles.resumeSection}>
                  <p style={styles.objective}>{resumeData.objective}</p>
                </div>
              )}

              {/* Work Experience */}
              {resumeData.workExperiences.length > 0 && (
                <div style={styles.resumeSection}>
                  <h2 style={styles.sectionHeading}>WORK EXPERIENCE</h2>
                  {resumeData.workExperiences.map((exp) => (
                    <div key={exp.id} style={styles.experienceItem}>
                      <div style={styles.experienceHeader}>
                        <div>
                          <h3 style={styles.jobTitle}>{exp.jobTitle}</h3>
                          <p style={styles.company}>{exp.company}</p>
                        </div>
                        <span style={styles.date}>
                          {formatDateForDisplay(exp.startDate)} - {formatDateForDisplay(exp.endDate)}
                        </span>
                      </div>
                      <div style={styles.description}>
                        {exp.description.split("\n").map((line, index) => (
                          <p key={index} style={styles.descriptionLine}>
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Education */}
              {resumeData.educations.length > 0 && (
                <div style={styles.resumeSection}>
                  <h2 style={styles.sectionHeading}>EDUCATION</h2>
                  {resumeData.educations.map((edu) => (
                    <div key={edu.id} style={styles.experienceItem}>
                      <div style={styles.experienceHeader}>
                        <div>
                          <h3 style={styles.jobTitle}>{edu.degree}</h3>
                          <p style={styles.company}>{edu.school}</p>
                        </div>
                        <span style={styles.date}>
                          {formatDateForDisplay(edu.startDate)} - {formatDateForDisplay(edu.endDate)}
                        </span>
                      </div>
                      <div style={styles.description}>
                        {edu.description.split("\n").map((line, index) => (
                          <p key={index} style={styles.descriptionLine}>
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Skills Section */}
              <div style={styles.resumeSection}>
                <h2 style={styles.sectionHeading}>SKILLS</h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    minHeight: "100%", // Changed from 100vh
    backgroundColor: "#f8f9fa",
    display: "flex",
    width: "100%",
    boxSizing: "border-box" as const,
  },
  mainContent: {
    display: "flex",
    height: "100vh", // Changed to 100vh for explicit viewport height
    width: "100%",
    boxSizing: "border-box" as const,
    overflow: "hidden",
  },
  formPanel: {
    flex: "0 0 clamp(350px, 35vw, 500px)", // Fixed width that adapts to viewport
    padding: "2rem",
    backgroundColor: "white",
    overflowY: "auto" as const, // Add 'as const' to fix TypeScript error
    borderRight: "1px solid #e5e7eb",
    boxSizing: "border-box" as const,
    height: "100vh", // Add explicit height
    maxHeight: "100vh", // Ensure it doesn't exceed viewport height
  },
  formSection: {
    marginBottom: "1.5rem",
  },
  formRow: {
    display: "flex",
    gap: "1rem",
  },
  label: {
    display: "block",
    marginBottom: "0.5rem",
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#374151",
  },
  input: {
    width: "100%",
    padding: "0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box" as const,
  },
  textarea: {
    width: "100%",
    padding: "0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    outline: "none",
    resize: "vertical" as const,
    fontFamily: "inherit",
    boxSizing: "border-box" as const,
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "1.5rem",
    marginTop: "2rem",
  },
  sectionIcon: {
    fontSize: "1.25rem",
  },
  sectionTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    flex: 1,
  },
  addButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "0.375rem",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: "500",
  },
  experienceCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "0.5rem",
    padding: "1.5rem",
    marginBottom: "1.5rem",
    backgroundColor: "#f9fafb",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  cardTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#374151",
  },
  removeButton: {
    padding: "0.25rem 0.75rem",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "0.25rem",
    cursor: "pointer",
    fontSize: "0.75rem",
  },
  resumeContainer: {
    flex: 1,
    padding: "2rem",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    overflowY: "auto" as const,
    overflowX: "hidden" as const,
    paddingTop: "0", // Add space for the fixed controls
  },
  resumePreview: {
    width: "8.5in",
    minHeight: "11in",
    backgroundColor: "white",
    padding: "calc(0.75in * var(--spacing-scale, 1))",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    transformOrigin: "top center",
    fontSize: "calc(1rem * var(--font-scale, 1))",
    lineHeight: "calc(1.5 * var(--spacing-scale, 1))",
    flexShrink: 0,
  },
  resumeHeader: {
    marginBottom: "1.5rem",
  },
  resumeName: {
    fontSize: "calc(2rem * var(--font-scale, 1))",
    fontWeight: "bold",
    margin: "0 0 calc(0.5rem * var(--spacing-scale, 1)) 0",
    color: "#1f2937",
  },
  contactInfo: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "calc(1rem * var(--spacing-scale, 1))",
    fontSize: "calc(0.875rem * var(--font-scale, 1))",
    color: "#6b7280",
  },
  resumeSection: {
    marginBottom: "calc(1rem * var(--spacing-scale, 1))", // Reduced from 1.5rem to 1rem
  },
  objective: {
    fontSize: "calc(0.875rem * var(--font-scale, 1))",
    lineHeight: "calc(1.5 * var(--spacing-scale, 1))",
    color: "#374151",
    margin: 0,
  },
  sectionHeading: {
    fontSize: "calc(1rem * var(--font-scale, 1))",
    fontWeight: "bold",
    color: "#3b82f6",
    borderBottom: "2px solid #3b82f6",
    paddingBottom: "calc(0.25rem * var(--spacing-scale, 1))",
    marginBottom: "calc(1rem * var(--spacing-scale, 1))",
    margin: "0 0 calc(1rem * var(--spacing-scale, 1)) 0",
  },
  experienceItem: {
    marginBottom: "calc(1rem * var(--spacing-scale, 1))", // Reduced from 1.5rem to 1rem
  },
  experienceHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "0.5rem",
  },
  jobTitle: {
    fontSize: "calc(1rem * var(--font-scale, 1))",
    fontWeight: "600",
    margin: "0 0 calc(0.25rem * var(--spacing-scale, 1)) 0",
    color: "#1f2937",
  },
  company: {
    fontSize: "calc(0.875rem * var(--font-scale, 1))",
    color: "#6b7280",
    margin: 0,
  },
  date: {
    fontSize: "calc(0.875rem * var(--font-scale, 1))",
    color: "#6b7280",
  },
  description: {
    fontSize: "calc(0.875rem * var(--font-scale, 1))",
    lineHeight: "calc(1.5 * var(--spacing-scale, 1))",
    color: "#374151",
  },
  descriptionLine: {
    margin: "0 0 0.25rem 0",
  },
  controlGroup: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  controlLabel: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.875rem",
    whiteSpace: "nowrap" as const,
  },
  select: {
    padding: "0.25rem 0.5rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.25rem",
    fontSize: "0.875rem",
    backgroundColor: "white",
  },
  zoomControls: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  zoomSlider: {
    width: "100px",
  },
  autoscaleLabel: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.875rem",
    cursor: "pointer",
  },
  downloadButton: {
    marginLeft: "auto",
    padding: "0.5rem 1rem",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "0.375rem",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: "500",
  },
}
