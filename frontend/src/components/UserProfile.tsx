"use client"

import type React from "react"
import { useState } from "react"
import "./user-profile.css"

interface Education {
  school: string
  degree: string
  year: string
}

interface WorkExperience {
  company: string
  position: string
  years: string
}

interface UserProfileFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  cityState: string
  education: Education[]
  workExperience: WorkExperience[]
  skills: string
  gender: string
  race: string
  ethnicity: string
  disabilityStatus: string
  veteranStatus: string
  linkedin: string
  github: string
}

interface UserProfilePayload {
  first_name: string
  last_name: string
  email: string
  phone: string
  city: string
  state: string
  skills: string
  gender: string
  race: string
  ethnicity: string
  disability_status: string
  veteran_status: string
  linkedin: string
  github: string
}

const UserProfile: React.FC = () => {
  const [formData, setFormData] = useState<UserProfileFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    cityState: "",
    education: [{ school: "", degree: "", year: "" }],
    workExperience: [{ company: "", position: "", years: "" }],
    skills: "",
    gender: "",
    race: "",
    ethnicity: "",
    disabilityStatus: "",
    veteranStatus: "",
    linkedin: "",
    github: "",
  })

  // Handle input changes
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    index: number | null = null,
    section: keyof UserProfileFormData | null = null,
  ) => {
    const { name, value } = event.target

    if (section && index !== null) {
      const sectionData = formData[section]
      if (Array.isArray(sectionData)) {
        const updatedSection = [...sectionData]
        if (section === "education") {
          ;(updatedSection[index] as Education)[name as keyof Education] = value
        } else if (section === "workExperience") {
          ;(updatedSection[index] as WorkExperience)[name as keyof WorkExperience] = value
        }
        setFormData({ ...formData, [section]: updatedSection })
      }
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  // Add education/work experience
  const addField = (section: keyof UserProfileFormData) => {
    const sectionData = formData[section]
    if (Array.isArray(sectionData)) {
      const newField =
        section === "education" ? { school: "", degree: "", year: "" } : { company: "", position: "", years: "" }
      setFormData({
        ...formData,
        [section]: [...sectionData, newField],
      })
    }
  }

  // Remove education/work experience
  const removeField = (section: keyof UserProfileFormData, index: number) => {
    const sectionData = formData[section]

    if (Array.isArray(sectionData)) {
      const updatedSection = (sectionData as Array<Education | WorkExperience>).filter((_, i) => i !== index)
      setFormData((prevFormData) => ({
        ...prevFormData,
        [section]: updatedSection,
      }))
    }
  }

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    try {
      // Prepare payload for the backend
      const userData: UserProfilePayload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        city: formData.cityState.split(",")[0]?.trim(), // Extract city from input
        state: formData.cityState.split(",")[1]?.trim(), // Extract state
        skills: formData.skills,
        gender: formData.gender,
        race: formData.race,
        ethnicity: formData.ethnicity,
        disability_status: formData.disabilityStatus,
        veteran_status: formData.veteranStatus,
        linkedin: formData.linkedin,
        github: formData.github,
      }

      console.log("Submitting user profile:", userData)

      // Call API to create user profile
      // const response = await createUserProfile(userData);

      // Mock successful response for demo
      const response = { id: "123", ...userData }

      if (response && response.id) {
        alert("User profile created successfully!")
      } else {
        throw new Error("Failed to create user profile.")
      }
    } catch (error) {
      console.error("Error submitting user profile:", error)
      alert("Failed to save user profile. Please try again.")
    }
  }

  return (
    <div className="user-profile-container">
      <h1 className="profile-title">User Profile</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h2 className="section-title">Personal Information</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="cityState">City, State</label>
            <input
              type="text"
              id="cityState"
              name="cityState"
              value={formData.cityState}
              onChange={handleChange}
              placeholder="e.g. New York, NY"
              required
            />
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h2 className="section-title">Education Experience</h2>
            <button type="button" className="add-button" onClick={() => addField("education")}>
              + Add Education
            </button>
          </div>

          {formData.education.map((edu, index) => (
            <div key={index} className="repeatable-section">
              {index > 0 && <div className="section-divider"></div>}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor={`school-${index}`}>School/University</label>
                  <input
                    type="text"
                    id={`school-${index}`}
                    name="school"
                    value={edu.school}
                    onChange={(e) => handleChange(e, index, "education")}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor={`degree-${index}`}>Degree</label>
                  <input
                    type="text"
                    id={`degree-${index}`}
                    name="degree"
                    value={edu.degree}
                    onChange={(e) => handleChange(e, index, "education")}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor={`year-${index}`}>Year</label>
                  <input
                    type="text"
                    id={`year-${index}`}
                    name="year"
                    value={edu.year}
                    onChange={(e) => handleChange(e, index, "education")}
                    required
                  />
                </div>

                {index > 0 && (
                  <div className="form-group remove-group">
                    <button type="button" className="remove-button" onClick={() => removeField("education", index)}>
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="form-section">
          <div className="section-header">
            <h2 className="section-title">Work Experience</h2>
            <button type="button" className="add-button" onClick={() => addField("workExperience")}>
              + Add Work Experience
            </button>
          </div>

          {formData.workExperience.map((work, index) => (
            <div key={index} className="repeatable-section">
              {index > 0 && <div className="section-divider"></div>}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor={`company-${index}`}>Company</label>
                  <input
                    type="text"
                    id={`company-${index}`}
                    name="company"
                    value={work.company}
                    onChange={(e) => handleChange(e, index, "workExperience")}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor={`position-${index}`}>Position</label>
                  <input
                    type="text"
                    id={`position-${index}`}
                    name="position"
                    value={work.position}
                    onChange={(e) => handleChange(e, index, "workExperience")}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor={`years-${index}`}>Years</label>
                  <input
                    type="text"
                    id={`years-${index}`}
                    name="years"
                    value={work.years}
                    onChange={(e) => handleChange(e, index, "workExperience")}
                    required
                  />
                </div>

                {index > 0 && (
                  <div className="form-group remove-group">
                    <button
                      type="button"
                      className="remove-button"
                      onClick={() => removeField("workExperience", index)}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="form-section">
          <h2 className="section-title">Skills & Professional Profiles</h2>
          <div className="form-group">
            <label htmlFor="skills">Skills</label>
            <textarea
              id="skills"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="Enter your skills (separated by commas)"
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="linkedin">LinkedIn URL</label>
              <input
                type="url"
                id="linkedin"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="github">GitHub URL</label>
              <input
                type="url"
                id="github"
                name="github"
                value={formData.github}
                onChange={handleChange}
                placeholder="https://github.com/username"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2 className="section-title">Demographic Information</h2>
          <p className="section-description">
            This information is collected for diversity and inclusion purposes only.
          </p>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select id="gender" name="gender" value={formData.gender} onChange={handleChange}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not">Prefer not to say</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="race">Race</label>
              <select id="race" name="race" value={formData.race} onChange={handleChange}>
                <option value="">Select</option>
                <option value="hispanic">Hispanic</option>
                <option value="non-hispanic">Non-Hispanic</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ethnicity">Ethnicity</label>
              <select
                id="ethnicity"
                name="ethnicity"
                value={formData.ethnicity}
                onChange={handleChange}
                disabled={formData.race === "hispanic"}
              >
                <option value="">Select</option>
                <option value="asian">Asian</option>
                <option value="black">Black or African American</option>
                <option value="white">White</option>
                <option value="native">Native American</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="disabilityStatus">Disability Status</label>
              <select
                id="disabilityStatus"
                name="disabilityStatus"
                value={formData.disabilityStatus}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="prefer-not">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="veteranStatus">Veteran Status</label>
            <select id="veteranStatus" name="veteranStatus" value={formData.veteranStatus} onChange={handleChange}>
              <option value="">Select</option>
              <option value="no">Not a veteran</option>
              <option value="yes">Veteran</option>
              <option value="active">Active duty</option>
              <option value="prefer-not">Prefer not to say</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button">
            Save Profile
          </button>
        </div>
      </form>
    </div>
  )
}

export default UserProfile

