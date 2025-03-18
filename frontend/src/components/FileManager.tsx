import React, { useState, useEffect } from "react";
import { uploadFile, fetchFiles, deleteFile, getFileURL } from "../services/api"; // API functions for file management
import "./FileManager.css"; // Styles

const BACKEND_URL_FILES = "http://localhost:5050/api/files"; // ✅ Ensure this matches backend routes

interface FileData {
  id: string;
  name: string;
  path: string;
}

interface UploadResponse {
  file_path: string;
  status: string;
}

interface DeleteResponse {
  message: string;
}

const FileManager: React.FC = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }

    try {
      const response: UploadResponse = await uploadFile(selectedFile);

      if (!response || !response.file_path || !response.status) {
        throw new Error(`File upload failed. Invalid response: ${JSON.stringify(response)}`);
      }

      alert(`✅ File uploaded successfully: ${response.file_path}`);
      setSelectedFile(null);
      fetchFilesList(); // Refresh file list after upload
    } catch (err) {
      if (err instanceof Error) {
        console.error("❌ Error uploading file:", err.message);
        alert(`Error uploading file: ${err.message}`);
      } else {
        console.error("❌ Unknown error uploading file:", err);
        alert("An unknown error occurred while uploading the file.");
      }
    }
  };

  const fetchFilesList = async () => {
    try {
      const filesData: FileData[] = await fetchFiles();
      if (!Array.isArray(filesData)) {
        throw new Error(`Invalid response format: Expected an array, got ${JSON.stringify(filesData)}`);
      }
      setFiles(filesData); // ✅ Store objects [{ id, name, path }]
    } catch (err) {
      if (err instanceof Error) {
        console.error("❌ Error fetching files:", err.message);
      } else {
        console.error("❌ Unknown error fetching files:", err);
      }
    }
  };

  useEffect(() => {
    fetchFilesList();
  }, []);

  const handleFileClick = (file: FileData) => {
    const fileUrl = getFileURL(file.id);
    window.open(fileUrl, "_blank");
  };

  const handleDeleteClick = async (fileId: string) => {
    try {
      const response: DeleteResponse = await deleteFile(fileId); // ✅ Using `file.id` instead of `file.name`
      alert(response.message);
      fetchFilesList(); // Refresh list
    } catch (error) {
      if (error instanceof Error) {
        console.error("❌ Error deleting file:", error.message);
        alert(`Error deleting file: ${error.message}`);
      } else {
        console.error("❌ Unknown error deleting file:", error);
        alert("An unknown error occurred while deleting the file.");
      }
    }
  };

  return (
    <div className="file-manager">
      <div className="file-upload-section">
        <input
          type="text"
          className="file-name-input"
          value={selectedFile ? selectedFile.name : ""}
          placeholder="File Name"
          readOnly
        />
        <input
          type="file"
          id="file-upload"
          className="file-input"
          onChange={handleFileChange}
        />
        <label htmlFor="file-upload" className="choose-file-button">
          Choose File
        </label>
        <button onClick={handleFileUpload} className="upload-button">
          Upload File
        </button>
      </div>
      <h3>Uploaded Files</h3>
      <div className="file-grid">
        {files.map((file) => (
          <div key={file.id} className="file-card">
            <div className="file-thumbnail" onClick={() => handleFileClick(file)}>
              <span className="file-icon">📄</span>
            </div>
            <div className="file-name">{file.name}</div>
            <button
              className="delete-button"
              onClick={() => handleDeleteClick(file.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileManager;