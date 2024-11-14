"use client";

import { useState } from 'react';

export default function Home() {
  const [uploadType, setUploadType] = useState("file");
  const [fileUrl, setFileUrl] = useState(""); // URL of the file
  const [singleEmail, setSingleEmail] = useState("");
  const [checkbox, setCheckbox] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleUploadTypeChange = (type) => {
    setUploadType(type);
    setFileUrl("");
    setSingleEmail("");
  };

  const handleFileUrlChange = (e) => {
    setFileUrl(e.target.value);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const apiKey = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
    const baseId = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;
    const tableName = process.env.NEXT_PUBLIC_AIRTABLE_TABLE_NAME;

    // Prepare data for Airtable
    const data = {
      fields: {
        "Email": email,
        "Upload Type": uploadType,
        "File URL": fileUrl
          ? fileUrl
          : null,
        "DNC Mail": singleEmail,
        "Confirmed": checkbox,
      },
    };
    console.log(data)

    try {
      const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSuccessMessage("Successfully uploaded");
        setEmail("");
        setFileUrl("");
        setSingleEmail("");
        setCheckbox(false);
        setUploadType("file");
      } else {
        const errorData = await response.json();
        console.error("Error Uploading:", errorData);
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
              <label style={styles.label}>File URL (Google Drive or any direct link)</label>
              <input
                type="url"
                value={fileUrl}
                onChange={handleFileUrlChange}
                placeholder="https://drive.google.com/yourfilelink"
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
    maxWidth: "600px",
    width: "100%",
    padding: "20px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  },
  mainHeading: {
    fontSize: "1.5em",
    fontWeight: "bold",
    color: "#0073e6",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  },
  inputGroup: {
    marginBottom: "15px",
  },
  label: {
    display: "block",
    fontWeight: "500",
    marginBottom: "5px",
  },
  input: {
    width: "100%",
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
  },
  activeTab: {
    flex: 1,
    padding: "10px",
    fontSize: "1em",
    border: "1px solid #0073e6",
    backgroundColor: "#0073e6",
    color: "#fff",
    cursor: "pointer",
  },
  checkboxContainer: {
    display: "flex",
    alignItems: "center",
    marginTop: "10px",
  },
  checkboxLabel: {
    marginLeft: "8px",
    fontSize: "0.9em",
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
  },
  successMessage: {
    color: "green",
    marginTop: "15px",
    fontSize: "1em",
  },
};
