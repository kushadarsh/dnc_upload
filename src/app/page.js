"use client";

import { useState } from 'react';

export default function Home() {
  const [uploadType, setUploadType] = useState("file");
  const [file, setFile] = useState(null); // Store the selected file
  const [fileUrl, setFileUrl] = useState(""); // URL of the uploaded file
  const [singleEmail, setSingleEmail] = useState("");
  const [checkbox, setCheckbox] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleUploadTypeChange = (type) => {
    setUploadType(type);
    setFile(null);
    setFileUrl("");
    setSingleEmail("");
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSingleEmailChange = (e) => {
    setSingleEmail(e.target.value);
  };

  const handleCheckboxChange = () => {
    setCheckbox(!checkbox);
  };

  const uploadFileToS3 = async () => {
    if (!file) return;
  
    const fileName = file.name;
    const fileType = file.type;
  
    // Request presigned URL from API
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName, fileType }),
    });
  
    const { uploadUrl, fileUrl: uploadedFileUrl } = await response.json();
    
  
    // Upload file to S3 using the presigned URL
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': fileType, // Ensure this matches the ContentType in the presigned URL
      },
      body: file,
    });
  
    if (!uploadResponse.ok) {
      console.error('Failed to upload to S3:', await uploadResponse.text());
      throw new Error('File upload failed');
    }
  
    return uploadedFileUrl; 
  };
  
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      // Upload the file to S3 if there's a file
      let uploadedFileUrl;
      let uploadedFileName = ""; // Initialize variable to store file name
  
      if (file && uploadType === "file") {
        uploadedFileUrl = await uploadFileToS3(); // Get S3 URL
        uploadedFileName = file.name; // Get the file name from the uploaded file
      }
    
  
      const apiKey = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
      const baseId = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;
      const tableName = process.env.NEXT_PUBLIC_AIRTABLE_TABLE_NAME;
  
      // Prepare data for Airtable with the S3 URL as an attachment, including the filename
      const data = {
        fields: {
          "Email": email,
          "Upload Type": uploadType,
          "File": uploadedFileUrl ? uploadedFileUrl  : null,
          "DNC Mail": singleEmail,
          "Confirmed": checkbox,
        },
      };
  
     
  
      // Send the data to Airtable
      const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
  
      const responseData = await response.json();

  
      if (response.ok) {
        setSuccessMessage("Successfully Uploaded to Your Do-Not-Contact List.");
        setEmail("");
        setFile(null);
        setSingleEmail("");
        setCheckbox(false);
        setUploadType("file");
      } else {
        console.error("Error Uploading:", responseData);
      }
    } catch (error) {
      console.error("Request failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.mainHeading}>Do Not Contact (DNC) List Upload</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>App.Leadbird.io Login Email</label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="your@leadbird.io"
              required
              style={styles.input}
            />
          </div>
          <div style={styles.uploadTypeContainer}>
            <button
              type="button"
              style={uploadType === "file" ? styles.activeTab : styles.tab}
              onClick={() => handleUploadTypeChange("file")}
            >
              File Upload
            </button>
            <button
              type="button"
              style={uploadType === "single" ? styles.activeTab : styles.tab}
              onClick={() => handleUploadTypeChange("single")}
            >
              Single Entry
            </button>
          </div>

          {uploadType === "file" ? (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Upload File (CSV or TXT)</label>
              <input
                type="file"
                onChange={handleFileChange}
                required
                style={styles.input}
              />
              <div style={styles.checkboxContainer}>
                <input type="checkbox" checked={checkbox} onChange={handleCheckboxChange} />
                <label style={styles.checkboxLabel}>
                  I confirm that the list contains only emails or domains
                </label>
              </div>
            </div>
          ) : (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Enter Email</label>
              <input
                type="email"
                value={singleEmail}
                onChange={handleSingleEmailChange}
                placeholder="Enter single email"
                required
                style={styles.input}
              />
            </div>
          )}

          <button type="submit" style={styles.submitButton} disabled={loading}>
            {loading ? "Uploading..." : "Upload DNC List"}
          </button>
        </form>

        {successMessage && <p style={styles.successMessage}>{successMessage}</p>}
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#ffffff",
  },
  container: {
    maxWidth: "600px", // Increase this value if you'd like a wider container
    width: "100%",
    padding: "20px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
    textAlign: "left", // Align container content to the left
  },
  mainHeading: {
    fontSize: "1.5em",
    fontWeight: "bold",
    color: "#0073e6",
    marginBottom: "20px",
    textAlign: "left", // Align heading text to the left
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  },
  inputGroup: {
    marginBottom: "15px",
    textAlign: "left", // Align input group text to the left
  },
  label: {
    display: "block",
    fontWeight: "500",
    marginBottom: "5px",
    textAlign: "left", // Align label text to the left
  },
  input: {
    width: "100%", // Ensures input takes full width of container
    padding: "10px",
    fontSize: "1em",
    borderRadius: "4px",
    border: "1px solid #ddd",
  },
  uploadTypeContainer: {
    display: "flex",
    justifyContent: "space-around",
    marginBottom: "15px",
  },
  tab: {
    flex: 1,
    padding: "10px",
    fontSize: "1em",
    border: "1px solid #ddd",
    backgroundColor: "#f9f9f9",
    cursor: "pointer",
    textAlign: "left", // Align tab text to the left
  },
  activeTab: {
    flex: 1,
    padding: "10px",
    fontSize: "1em",
    border: "1px solid #0073e6",
    backgroundColor: "#0073e6",
    color: "#fff",
    cursor: "pointer",
    textAlign: "left", // Align active tab text to the left
  },
  checkboxContainer: {
    display: "flex",
    alignItems: "center",
    marginTop: "10px",
    textAlign: "left", // Align checkbox container text to the left
  },
  checkboxLabel: {
    marginLeft: "8px",
    fontSize: "0.9em",
    textAlign: "left", // Align checkbox label text to the left
  },
  submitButton: {
    marginTop: "20px",
    padding: "10px",
    fontSize: "1em",
    backgroundColor: "#0073e6",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    textAlign: "center", // Center-align the button text
  },
  successMessage: {
    color: "green",
    marginTop: "15px",
    fontSize: "1em",
    textAlign: "left", // Align success message text to the left
    paddingLeft: "10px",
  },
};

