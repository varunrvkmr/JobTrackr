import React, { useState } from "react";
import "./UserProfile.css"; // Import CSS for styling
import { createUserProfile } from "../services/api";


const UserProfile = () => {
    const [formData, setFormData] = useState({
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
    });

    // Handle input changes
    const handleChange = (event, index = null, section = null) => {
        const { name, value } = event.target;

        if (section) {
            const updatedSection = [...formData[section]];
            updatedSection[index][name] = value;
            setFormData({ ...formData, [section]: updatedSection });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    // Add education/work experience
    const addField = (section) => {
        setFormData({
            ...formData,
            [section]: [...formData[section], { school: "", degree: "", year: "" }]
        });
    };

    const addWorkField = () => {
        setFormData({
            ...formData,
            workExperience: [...formData.workExperience, { company: "", position: "", years: "" }]
        });
    };

    // Remove education/work experience
    const removeField = (section, index) => {
        const updatedSection = formData[section].filter((_, i) => i !== index);
        setFormData({ ...formData, [section]: updatedSection });
    };

    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();
    
        try {
            // Prepare payload for the backend
            const userData = {
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                city: formData.cityState.split(",")[0]?.trim(), // Extract city from input
                state: formData.cityState.split(",")[1]?.trim(), // Extract state
                //education: JSON.stringify(formData.education),
                //work_experience: JSON.stringify(formData.workExperience),
                skills: formData.skills,
                gender: formData.gender,
                race: formData.race,
                ethnicity: formData.ethnicity,
                disability_status: formData.disabilityStatus,
                veteran_status: formData.veteranStatus,
                linkedin: formData.linkedin,
                github: formData.github,
            };
    
            console.log("Submitting user profile:", userData);
    
            // Call API to create user profile
            const response = await createUserProfile(userData);
    
            if (response && response.id) {
                alert("User profile created successfully!");
            } else {
                throw new Error("Failed to create user profile.");
            }
        } catch (error) {
            console.error("Error submitting user profile:", error.message);
            alert("Failed to save user profile. Please try again.");
        }
    };
    

    return (
        <div className="user-profile-container">
            <h2>User Profile</h2>
            <form onSubmit={handleSubmit}>

                <div className="input-group">
                    <label>First Name:</label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
                </div>

                <div className="input-group">
                    <label>Last Name:</label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
                </div>

                <div className="input-group">
                    <label>Email:</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>

                <div className="input-group">
                    <label>Phone:</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />
                </div>

                <div className="input-group">
                    <label>City & State:</label>
                    <input type="text" name="cityState" value={formData.cityState} onChange={handleChange} required />
                </div>

                <h3>Education Experience</h3>
                {formData.education.map((edu, index) => (
                    <div key={index} className="input-group education-group">
                        <input type="text" name="school" placeholder="School" value={edu.school} onChange={(e) => handleChange(e, index, "education")} required />
                        <input type="text" name="degree" placeholder="Degree" value={edu.degree} onChange={(e) => handleChange(e, index, "education")} required />
                        <input type="text" name="year" placeholder="Year" value={edu.year} onChange={(e) => handleChange(e, index, "education")} required />
                        {index > 0 && <button type="button" className="remove-btn" onClick={() => removeField("education", index)}>Remove</button>}
                    </div>
                ))}
                <button type="button" onClick={() => addField("education")}>+ Add Education</button>

                <h3>Work Experience</h3>
                {formData.workExperience.map((work, index) => (
                    <div key={index} className="input-group work-group">
                        <input type="text" name="company" placeholder="Company" value={work.company} onChange={(e) => handleChange(e, index, "workExperience")} required />
                        <input type="text" name="position" placeholder="Position" value={work.position} onChange={(e) => handleChange(e, index, "workExperience")} required />
                        <input type="text" name="years" placeholder="Years Worked" value={work.years} onChange={(e) => handleChange(e, index, "workExperience")} required />
                        {index > 0 && <button type="button" className="remove-btn" onClick={() => removeField("workExperience", index)}>Remove</button>}
                    </div>
                ))}
                <button type="button" onClick={addWorkField}>+ Add Work Experience</button>

                <div className="input-group">
                    <label>Race:</label>
                    <select name="race" value={formData.race} onChange={handleChange}>
                        <option value="">Select</option>
                        <option value="hispanic">Hispanic</option>
                        <option value="non-hispanic">Non-Hispanic</option>
                    </select>
                </div>

                <div className="input-group">
                    <label>Ethnicity:</label>
                    <select name="ethnicity" value={formData.ethnicity} onChange={handleChange} disabled={formData.race === "hispanic"}>
                        <option value="">Select</option>
                        <option value="asian">Asian</option>
                        <option value="black">Black or African American</option>
                        <option value="white">White</option>
                        <option value="native">Native American</option>
                    </select>
                </div>

                <div className="input-group">
                    <label>Gender:</label>
                    <select name="gender" value={formData.gender} onChange={handleChange}>
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="other">Prefer not to say</option>
                    </select>
                </div>

                <div className="input-group">
                    <label>Disability Status:</label>
                    <select name="disabilityStatus" value={formData.disabilityStatus} onChange={handleChange}>
                        <option value="">Select</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                        <option value="prefer-not">Prefer not to say</option>
                    </select>
                </div>

                <div className="input-group">
                    <label>Veteran Status:</label>
                    <select name="veteranStatus" value={formData.veteranStatus} onChange={handleChange}>
                        <option value="">Select</option>
                        <option value="no">Not a veteran</option>
                        <option value="yes">Veteran</option>
                        <option value="active">Active duty</option>
                        <option value="prefer-not">Prefer not to say</option>
                    </select>
                </div>

                <button type="submit">Save Profile</button>
            </form>
        </div>
    );
};

export default UserProfile;
