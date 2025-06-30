"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import "./user-profile.css"
import { fetchCurrentUserProfile, updateCurrentUserProfile, addEducation, updateEducation, deleteEducation,
  addWork, updateWork, deleteWork } from "src/services/api";
import type { UserProfile, UserProfilePayload, Education, WorkExperience } from "@/types"

const EnhancedUserProfile = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState<UserProfile>({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    education: [],
    workExperience: [],
    gender: "",
    race: "",
    ethnicity: "",
    disabilityStatus: "",
    veteranStatus: "",
    //isHispanic: "",
    linkedin: "",
    github: "",
  })

  const prevEducationRef = useRef<Education[]>([]);
  const prevWorkRef      = useRef<WorkExperience[]>([]);

  // Load profile data on component mount
  useEffect(() => {
  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const profile = await fetchCurrentUserProfile();
      setFormData(profile);
      prevEducationRef.current = profile.education
      prevWorkRef.current      = profile.workExperience
    } catch (err) {
      console.log("Failed to load profile:", err);
    } finally {
      setIsLoading(false);
    }
  };
  loadProfile();
}, []);


  // Copy to clipboard function
  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
      console.log(`Copied ${fieldName}: ${text}`)
    } catch (err) {
      console.error("Failed to copy text: ", err)
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
    }
  }

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement
    >,
    index?: number,
    section?: "education" | "workExperience"
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;

    // 1️⃣ Education entry update
    if (section === "education" && typeof index === "number") {
      const updated = formData.education.map((edu, i) =>
        i === index
          ? {
              ...edu,
              // name is keyof Education now
              [name as keyof Education]: type === "checkbox" ? checked : value,
            }
          : edu
      );
      setFormData({ ...formData, education: updated });
      return;
    }

    // 2️⃣ Work entry update
    if (section === "workExperience" && typeof index === "number") {
      const updated = formData.workExperience.map((work, i) =>
        i === index
          ? {
              ...work,
              [name as keyof WorkExperience]: type === "checkbox"
                ? checked
                : value,
            }
          : work
      );
      setFormData({ ...formData, workExperience: updated });
      return;
    }

    // 3️⃣ Top‐level profile field
    // We know 'name' is one of the keys on UserProfilePayload,
    // but TS sees formData as UserProfile, so we assert here:
    setFormData({
      ...formData,
      [name]: value,
    } as UserProfile);
  };

  // helper to add a blank entry
  const addField = (section: "education" | "workExperience") => {
    if (section === "education") {
      setFormData({
        ...formData,
        education: [
          ...formData.education,
          { school: "", degree: "", focus: "", isCurrent: false, startDate: "", endDate: "" },
        ],
      })
    } else {
      setFormData({
        ...formData,
        workExperience: [
          ...formData.workExperience,
          { company: "", position: "", description: "", isCurrent: false, startDate: "", endDate: "" },
        ],
      })
    }
  }

  // helper to remove an entry
  const removeField = (section: "education" | "workExperience", index: number) => {
    if (section === "education") {
      setFormData({
        ...formData,
        education: formData.education.filter((_, i) => i !== index),
      })
    } else {
      setFormData({
        ...formData,
        workExperience: formData.workExperience.filter((_, i) => i !== index),
      })
    }
  }

  const handleReadFromResume = async () => {
    // TODO: Implement resume reading functionality
    // This would typically involve:
    // 1. Opening a file picker for resume upload
    // 2. Sending the resume to your backend for parsing
    // 3. Populating the form fields with extracted data
    console.log("Read from Resume clicked - implement resume parsing logic here")
    alert("Resume reading functionality will be implemented here")
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const saveBtn = document.getElementById("saveButton") as HTMLButtonElement | null;

    if (saveBtn) {
      saveBtn.textContent = "Saving…";
      saveBtn.disabled = true;
    }

    // 1️⃣ Base profile payload
    const payload: UserProfilePayload = {
      first_name:       formData.firstName,
      last_name:        formData.lastName,
      phone:            formData.phone,
      location:         formData.location,
      bio:              formData.bio,
      linkedin:         formData.linkedin,
      github:           formData.github,
      race:             formData.race,
      ethnicity:        formData.ethnicity,
      gender:           formData.gender,
      disability_status:formData.disabilityStatus,
      veteran_status:   formData.veteranStatus,
    };

    try {
      // save profile row
      await updateCurrentUserProfile(payload);

      // 2️⃣ Diff + sync Education
      const prevEd = prevEducationRef.current;
      const currEd = formData.education;

      // new entries (no id)
      const toAddEd = currEd.filter(e => !e.id);
      // deleted entries (in prev but missing now)
      const toDelEd = prevEd
        .filter(pe => !currEd.some(e => e.id === pe.id))
        .map(pe => pe.id!);
      // updated entries (id exists but data changed)
      const toUpdEd = currEd.filter(e =>
        e.id &&
        JSON.stringify(e) !== JSON.stringify(prevEd.find(pe => pe.id === e.id))
      ) as Education[];

      const eduPromises = [
        ...toAddEd.map(e =>
          addEducation({
            school_name:    e.school,
            degree:         e.degree,
            field_of_study: e.focus,
            is_current:     e.isCurrent,
            start_date:     e.startDate,
            end_date:       e.endDate,
          })
        ),
        ...toUpdEd.map(e =>
          updateEducation(e.id!, {
            school_name:   e.school,
            degree:        e.degree,
            field_of_study:e.focus,
            is_current:    e.isCurrent,
            start_date:    e.startDate,
            end_date:      e.endDate,
          })
        ),
        ...toDelEd.map(id => deleteEducation(id)),
      ];

      // 3️⃣ Diff + sync Work
      const prevW = prevWorkRef.current;
      const currW = formData.workExperience;

      const toAddW = currW.filter(w => !w.id);
      const toDelW = prevW
        .filter(pw => !currW.some(w => w.id === pw.id))
        .map(pw => pw.id!);
      const toUpdW = currW.filter(w =>
        w.id &&
        JSON.stringify(w) !== JSON.stringify(prevW.find(pw => pw.id === w.id))
      ) as WorkExperience[];

      const workPromises = [
        ...toAddW.map(w =>
          addWork({
            company:      w.company,
            position:     w.position,
            description:  w.description,
            is_current:   w.isCurrent,
            start_date:   w.startDate,
            end_date:     w.endDate,
          })
        ),
        ...toUpdW.map(w =>
          updateWork(w.id!, {
            company:      w.company,
            position:     w.position,
            description:  w.description,
            is_current:   w.isCurrent,
            start_date:   w.startDate,
            end_date:     w.endDate,
          })
        ),
        ...toDelW.map(id => deleteWork(id)),
      ];

      // 4️⃣ Run all in parallel
      await Promise.all([...eduPromises, ...workPromises]);

      // 5️⃣ Refresh and reset refs
      const fresh = await fetchCurrentUserProfile();
      setFormData(fresh);
      prevEducationRef.current = fresh.education;
      prevWorkRef.current      = fresh.workExperience;

      alert("Profile, education & work saved!");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Save failed.");
    } finally {
      if (saveBtn) {
        saveBtn.textContent = "Save Profile";
        saveBtn.disabled = false;
      }
    }
  };

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
        <button type="button" className="read-resume-button" onClick={handleReadFromResume}>
          📄 Read from Resume
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h2 className="section-title">Personal Information</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <div className="input-with-copy">
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
                {formData.firstName && (
                  <button
                    type="button"
                    className="copy-button"
                    onClick={() => copyToClipboard(formData.firstName, "First Name")}
                    title="Copy to clipboard"
                  >
                    📋
                  </button>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <div className="input-with-copy">
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
                {formData.lastName && (
                  <button
                    type="button"
                    className="copy-button"
                    onClick={() => copyToClipboard(formData.lastName, "Last Name")}
                    title="Copy to clipboard"
                  >
                    📋
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-with-copy">
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
                {formData.email && (
                  <button
                    type="button"
                    className="copy-button"
                    onClick={() => copyToClipboard(formData.email, "Email")}
                    title="Copy to clipboard"
                  >
                    📋
                  </button>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <div className="input-with-copy">
                <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                {formData.phone && (
                  <button
                    type="button"
                    className="copy-button"
                    onClick={() => copyToClipboard(formData.phone ?? "", "Phone")}
                    title="Copy to clipboard"
                  >
                    📋
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <div className="input-with-copy">
              <input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. San Francisco, CA"
              />
              {formData.location && (
                <button
                  type="button"
                  className="copy-button"
                  onClick={() => copyToClipboard(formData.phone ?? "", "Phone")}
                  title="Copy to clipboard"
                >
                  📋
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h2 className="section-title">Education Experience</h2>
            <button type="button" className="add-button" onClick={() => addField("education")}>
              + Add Education
            </button>
          </div>

          {(formData.education ?? []).map((edu, index) => (
            <div key={index} className="repeatable-section">
              {index > 0 && <div className="section-divider"></div>}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor={`school-${index}`}>University</label>
                  <div className="input-with-copy">
                    <input
                      type="text"
                      id={`school-${index}`}
                      name="school"
                      value={edu.school || ""}
                      onChange={(e) => handleChange(e, index, "education")}
                    />
                    {edu.school && (
                      <button
                        type="button"
                        className="copy-button"
                        onClick={() => copyToClipboard(edu.school, "School")}
                        title="Copy to clipboard"
                      >
                        📋
                      </button>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor={`degree-${index}`}>Degree</label>
                  <div className="input-with-copy">
                    <input
                      type="text"
                      id={`degree-${index}`}
                      name="degree"
                      value={edu.degree || ""}
                      onChange={(e) => handleChange(e, index, "education")}
                    />
                    {edu.degree && (
                      <button
                        type="button"
                        className="copy-button"
                        onClick={() => copyToClipboard(edu.degree ?? "", "Degree")}
                        title="Copy to clipboard"
                      >
                        📋
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor={`focus-${index}`}>Discipline/Field of Study</label>
                  <div className="input-with-copy">
                    <input
                      type="text"
                      id={`focus-${index}`}
                      name="focus"
                      value={edu.focus || ""}
                      onChange={(e) => handleChange(e, index, "education")}
                    />
                    {edu.focus && (
                      <button
                        type="button"
                        className="copy-button"
                        onClick={() => copyToClipboard(edu.focus ?? "", "Discipline")}
                        title="Copy to clipboard"
                      >
                        📋
                      </button>
                    )}
                  </div>
                </div>

                <div className="form-group checkbox-group">
                  <label htmlFor={`isCurrent-${index}`} className="checkbox-label">
                    <input
                      type="checkbox"
                      id={`isCurrent-${index}`}
                      name="isCurrent"
                      checked={edu.isCurrent || false}
                      onChange={(e) => handleChange(e, index, "education")}
                    />
                    Currently Attending
                  </label>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor={`startDate-${index}`}>Start Date</label>
                  <input
                    type="date"
                    id={`startDate-${index}`}
                    name="startDate"
                    value={edu.startDate || ""}
                    onChange={(e) => handleChange(e, index, "education")}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor={`endDate-${index}`}>End Date</label>
                  <input
                    type="date"
                    id={`endDate-${index}`}
                    name="endDate"
                    value={edu.endDate || ""}
                    onChange={(e) => handleChange(e, index, "education")}
                    disabled={edu.isCurrent}
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

          {(formData.workExperience ?? []).map((work, index) => (
            <div key={index} className="repeatable-section">
              {index > 0 && <div className="section-divider"></div>}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor={`company-${index}`}>Company</label>
                  <div className="input-with-copy">
                    <input
                      type="text"
                      id={`company-${index}`}
                      name="company"
                      value={work.company || ""}
                      onChange={(e) => handleChange(e, index, "workExperience")}
                    />
                    {work.company && (
                      <button
                        type="button"
                        className="copy-button"
                        onClick={() => copyToClipboard(work.company, "Company")}
                        title="Copy to clipboard"
                      >
                        📋
                      </button>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor={`position-${index}`}>Position</label>
                  <div className="input-with-copy">
                    <input
                      type="text"
                      id={`position-${index}`}
                      name="position"
                      value={work.position || ""}
                      onChange={(e) => handleChange(e, index, "workExperience")}
                    />
                    {work.position && (
                      <button
                        type="button"
                        className="copy-button"
                        onClick={() => copyToClipboard(work.position ?? "", "Phone")}
                        title="Copy to clipboard"
                      >
                        📋
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor={`description-${index}`}>Description</label>
                  <div className="input-with-copy">
                    <textarea
                      id={`description-${index}`}
                      name="description"
                      value={work.description || ""}
                      onChange={(e) => handleChange(e, index, "workExperience")}
                      placeholder="Describe your role and responsibilities..."
                      rows={3}
                    />
                    {work.description && (
                      <button
                        type="button"
                        className="copy-button textarea-copy"
                        onClick={() => copyToClipboard(work.description ?? "", "Description")}
                        title="Copy to clipboard"
                      >
                        📋
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor={`work-startDate-${index}`}>Start Date</label>
                  <input
                    type="date"
                    id={`work-startDate-${index}`}
                    name="startDate"
                    value={work.startDate || ""}
                    onChange={(e) => handleChange(e, index, "workExperience")}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor={`work-endDate-${index}`}>End Date</label>
                  <input
                    type="date"
                    id={`work-endDate-${index}`}
                    name="endDate"
                    value={work.endDate || ""}
                    onChange={(e) => handleChange(e, index, "workExperience")}
                    disabled={work.isCurrent}
                  />
                </div>

                <div className="form-group checkbox-group">
                  <label htmlFor={`isCurrent-${index}`} className="checkbox-label">
                    <input
                      type="checkbox"
                      id={`isCurrent-${index}`}
                      name="isCurrent"
                      checked={work.isCurrent || false}
                      onChange={(e) => handleChange(e, index, "workExperience")}
                    />
                    Currently Working
                  </label>
                </div>
              </div>

              {index > 0 && (
                <div className="form-row">
                  <div className="form-group remove-group">
                    <button
                      type="button"
                      className="remove-button"
                      onClick={() => removeField("workExperience", index)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="form-section">
          <h2 className="section-title">Professional Profiles</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="linkedin">LinkedIn URL</label>
              <div className="input-with-copy">
                <input
                  type="text"
                  id="linkedin"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                />
                {formData.linkedin && (
                  <button
                    type="button"
                    className="copy-button"
                    onClick={() => copyToClipboard(formData.linkedin ?? "", "LinkedIn")}
                    title="Copy to clipboard"
                  >
                    📋
                  </button>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="github">GitHub URL</label>
              <div className="input-with-copy">
                <input
                  type="text"
                  id="github"
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  placeholder="https://github.com/username"
                />
                {formData.github && (
                  <button
                    type="button"
                    className="copy-button"
                    onClick={() => copyToClipboard(formData.github ?? "", "GitHub")}
                    title="Copy to clipboard"
                  >
                    📋
                  </button>
                )}
              </div>
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
              <label htmlFor="isHispanic">Is Hispanic?</label>
              <select id="isHispanic" name="isHispanic" value={"formData.isHispanic"} onChange={handleChange}>
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>

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
          <button type="submit" className="submit-button" id="saveButton">
            Save Profile
          </button>
        </div>
      </form>
    </div>
  )
}

export default EnhancedUserProfile
