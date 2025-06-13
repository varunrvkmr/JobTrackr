"use client"

import type React from "react"

import { useState, useEffect } from "react"
import "./user-profile.css"
import { createUserProfile, updateUserProfile, getUserProfileById } from "src/services/api";
import type { UserProfile, UserProfileFormData, ApiResponse } from "@/types"

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

const EnhancedUserProfile = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasProfile, setHasProfile] = useState(false)
  const [formData, setFormData] = useState<UserProfileFormData>({
    id: "", // Ensure id is initialized
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",  // Change from cityState to separate fields
    state: "",
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
  });
  

  // Load profile data on component mount
  /*PREVIOUSLY WORKING CODE 
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        
        // Using API service layer instead of direct fetch
        const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5050/api";
        const USER_PROFILE_URL = `${BASE_URL}/user-profile`;

        const response = await fetch(`${USER_PROFILE_URL}/profile?email=${formData.email}`);
        if (response.ok) {
          const data = await response.json();
          setFormData(data);
          setHasProfile(true);
          setIsEditing(false);
        } else {
          setIsEditing(true);
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchProfile();
  }, []);
  */

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
  
        const userId = localStorage.getItem("userId");
        if (!userId) {
          setIsEditing(true);
          setIsLoading(false);
          return;
        }
  
        const response = await getUserProfileById(userId); // Use your service layer
        if (response && response.data) {
          setFormData(response.data);
          setHasProfile(true);
          setIsEditing(false);
        } else {
          setIsEditing(true);
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
        setIsEditing(true);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchProfile();
  }, []);  
  
  

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
    if (!isEditing) return

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
    if (!isEditing) return

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
    event.preventDefault();
    const saveBtn = document.getElementById("saveButton") as HTMLButtonElement | null;
  
    try {
      if (saveBtn) {
        saveBtn.textContent = "Saving...";
        saveBtn.setAttribute("disabled", "true");
      }
  
      // Construct the UserProfile object
      const userProfileData: UserProfile = {
        id: formData.id || "",
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        state: formData.state,
        education: formData.education,
        workExperience: formData.workExperience,
        skills: formData.skills,
        gender: formData.gender,
        race: formData.race,
        ethnicity: formData.ethnicity,
        disabilityStatus: formData.disabilityStatus,
        veteranStatus: formData.veteranStatus,
        linkedin: formData.linkedin,
        github: formData.github,
      };
  
      let response: ApiResponse<UserProfile> | null = null;
  
      if (hasProfile && userProfileData.id) {
        response = await updateUserProfile(userProfileData.id, userProfileData);
      } else {
        response = await createUserProfile(userProfileData);
      }
  
      if (response && response.data) {
        const { data } = response;
      
        if (!hasProfile && data.id) {
          setFormData((prev) => ({ ...prev, id: data.id }));
          setHasProfile(true);
        }
      
        alert("User profile saved successfully!");
        setIsEditing(false);
      } else {
        throw new Error("Profile save failed");
      }      
    } catch (error) {
      console.error("Error saving user profile:", error);
      alert("Failed to save user profile. Please try again.");
    } finally {
      if (saveBtn) {
        saveBtn.textContent = "Save Profile";
        saveBtn.removeAttribute("disabled");
      }
    }
  };
  
  
  // Handle edit button click
  const handleEdit = () => {
    setIsEditing(true)
  }

  // Handle cancel button click
  const handleCancel = () => {
    // If user has a saved profile, revert to it
    if (hasProfile) {
      const storedProfile = localStorage.getItem("userProfile")
      if (storedProfile) {
        setFormData(JSON.parse(storedProfile))
      }
      setIsEditing(false)
    } else {
      // If no saved profile, just keep editing
      alert("Please save your profile first.")
    }
  }

  if (isLoading) {
    return (
      <div className="user-profile-container">
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading profile data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="user-profile-container">
      <div className="profile-header">
        <h1 className="profile-title">User Profile</h1>
        <div className="profile-status">
          {hasProfile && <span className="profile-badge">{isEditing ? "Editing Profile" : "Profile Saved"}</span>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className={isEditing ? "" : "view-mode"}>
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
                disabled={!isEditing}
                required
                className={!isEditing ? "readonly-field" : ""}
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
                disabled={!isEditing}
                required
                className={!isEditing ? "readonly-field" : ""}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                required
                className={!isEditing ? "readonly-field" : ""}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                className={!isEditing ? "readonly-field" : ""}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="city">City</label>
            <input
              type="text"
              id="city"
              name="City"
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g. New York"
              //disabled={!isEditing}
              className={!isEditing ? "readonly-field" : ""}
            />
          </div>
          <div className="form-group">
            <label htmlFor="cityState">State</label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g. NY"
              //disabled={!isEditing}
              className={!isEditing ? "readonly-field" : ""}
            />
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h2 className="section-title">Education Experience</h2>
            {isEditing && (
              <button type="button" className="add-button" onClick={() => addField("education")}>
                + Add Education
              </button>
            )}
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
                    disabled={!isEditing}
                    className={!isEditing ? "readonly-field" : ""}
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
                    disabled={!isEditing}
                    className={!isEditing ? "readonly-field" : ""}
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
                    disabled={!isEditing}
                    className={!isEditing ? "readonly-field" : ""}
                  />
                </div>

                {isEditing && index > 0 && (
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
            {isEditing && (
              <button type="button" className="add-button" onClick={() => addField("workExperience")}>
                + Add Work Experience
              </button>
            )}
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
                    disabled={!isEditing}
                    className={!isEditing ? "readonly-field" : ""}
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
                    disabled={!isEditing}
                    className={!isEditing ? "readonly-field" : ""}
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
                    disabled={!isEditing}
                    className={!isEditing ? "readonly-field" : ""}
                  />
                </div>

                {isEditing && index > 0 && (
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
              disabled={!isEditing}
              className={!isEditing ? "readonly-field" : ""}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="linkedin">LinkedIn URL</label>
              <input
                type="text"
                id="linkedin"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
                disabled={!isEditing}
                className={!isEditing ? "readonly-field" : ""}
              />
            </div>

            <div className="form-group">
              <label htmlFor="github">GitHub URL</label>
              <input
                type="text"
                id="github"
                name="github"
                value={formData.github}
                onChange={handleChange}
                placeholder="https://github.com/username"
                disabled={!isEditing}
                className={!isEditing ? "readonly-field" : ""}
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
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                disabled={!isEditing}
                className={!isEditing ? "readonly-field" : ""}
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not">Prefer not to say</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="race">Race</label>
              <select
                id="race"
                name="race"
                value={formData.race}
                onChange={handleChange}
                disabled={!isEditing}
                className={!isEditing ? "readonly-field" : ""}
              >
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
                disabled={!isEditing || formData.race === "hispanic"}
                className={!isEditing ? "readonly-field" : ""}
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
                disabled={!isEditing}
                className={!isEditing ? "readonly-field" : ""}
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
            <select
              id="veteranStatus"
              name="veteranStatus"
              value={formData.veteranStatus}
              onChange={handleChange}
              disabled={!isEditing}
              className={!isEditing ? "readonly-field" : ""}
            >
              <option value="">Select</option>
              <option value="no">Not a veteran</option>
              <option value="yes">Veteran</option>
              <option value="active">Active duty</option>
              <option value="prefer-not">Prefer not to say</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          {isEditing ? (
            <>
              <button type="button" className="cancel-button" onClick={handleCancel}>
                Cancel
              </button>
              <button type="submit" className="submit-button" id="saveButton">
                Save Profile
              </button>
            </>
          ) : (
            <button type="button" className="edit-button" onClick={handleEdit}>
              Edit Profile
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default EnhancedUserProfile

