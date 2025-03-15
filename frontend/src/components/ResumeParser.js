import React, { useState } from "react";
import "./ResumeParser.css"; // Import the CSS file

const ResumeParser = () => {
    const [file, setFile] = useState(null);
    const [text, setText] = useState("");

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
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

    return React.createElement(
        "div",
        { className: "resume-parser-container" },
        React.createElement("h2", null, "Upload Resume for Parsing"),
        React.createElement("input", {
            type: "file",
            accept: ".pdf",
            onChange: handleFileChange,
        }),
        React.createElement("button", { onClick: handleUpload }, "Upload"),
        text &&
            React.createElement(
                "div",
                { className: "extracted-text-container" },
                React.createElement("h3", null, "Extracted Text:"),
                React.createElement("pre", null, text)
            )
    );
};

export default ResumeParser;
