import React, { useState } from "react";
import "./ResumeParser.css"; // Import the CSS file

const ResumeParser: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [text, setText] = useState<string>("");

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Please select a file");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("http://localhost:5050/api/resume/upload-resume", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            if (response.ok) {
                setText(data.extracted_text);
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            alert("Failed to upload the file");
        }
    };

    return (
        <div className="resume-parser-container">
            <h2>Upload Resume for Parsing</h2>
            <input type="file" accept=".pdf" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload</button>
            {text && (
                <div className="extracted-text-container">
                    <h3>Extracted Text:</h3>
                    <pre>{text}</pre>
                </div>
            )}
        </div>
    );
};

export default ResumeParser;