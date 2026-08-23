import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ResumeAnalysis = () => {
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [dragover, setDragover] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type === "application/pdf") {
      setFile(selected);
      setError("");
    } else {
      setError("Only PDF files are allowed");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragover(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type === "application/pdf") {
      setFile(dropped);
      setError("");
    } else {
      setError("Only PDF files are allowed");
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");
    setUploadSuccess("");

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const authToken = token || localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/resumes/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setUploadSuccess(data.message || "Resume uploaded successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError("");

    try {
      const authToken = token || localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/resume/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setAnalysis(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 75) return "#10b981";
    if (score >= 50) return "#f59e0b";
    return "#ef4444";
  };

  const circumference = 2 * Math.PI * 56;

  return (
    <div className="page-wrapper">
      <h1 className="dashboard-greeting">
        Resume <span className="dashboard-greeting-name">Analysis</span>
      </h1>
      <p className="dashboard-subtitle" style={{ marginBottom: "var(--space-8)" }}>
        Upload your resume and get AI-powered ATS analysis
      </p>

      {error && <div className="alert alert-error">⚠ {error}</div>}
      {uploadSuccess && <div className="alert alert-success">✓ {uploadSuccess}</div>}

      {/* Upload Zone */}
      <div className="glass-card-static" style={{ marginBottom: "var(--space-6)" }}>
        <h2 className="section-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
          Upload Resume
        </h2>

        <div
          className={`upload-zone ${dragover ? "dragover" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
          onDragLeave={() => setDragover(false)}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            id="resume-file-input"
          />
          <div className="upload-zone-icon" style={{ color: "var(--accent-primary)" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </div>
          <div className="upload-zone-title">
            Drop your PDF resume here or click to browse
          </div>
          <div className="upload-zone-desc">
            Only PDF files up to 5MB are accepted
          </div>
        </div>

        {file && (
          <div className="upload-file-info">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            </svg>
            <span className="upload-file-name">{file.name}</span>
            <span className="upload-file-size">
              {(file.size / 1024).toFixed(1)} KB
            </span>
          </div>
        )}

        <div style={{ display: "flex", gap: "var(--space-4)", marginTop: "var(--space-6)" }}>
          <button
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={!file || uploading}
            id="upload-resume-btn"
          >
            {uploading ? <><span className="spinner" /> Uploading...</> : "Upload Resume"}
          </button>

          <button
            className="btn btn-secondary"
            onClick={handleAnalyze}
            disabled={analyzing}
            id="analyze-resume-btn"
          >
            {analyzing ? <><span className="spinner" /> Analyzing...</> : "Analyze Resume"}
          </button>
        </div>
      </div>

      {/* Analyzing State */}
      {analyzing && (
        <div className="glass-card-static" style={{ textAlign: "center" }}>
          <div className="spinner-center">
            <div className="spinner spinner-lg" />
          </div>
          <p style={{ color: "var(--text-secondary)" }}>
            AI is analyzing your resume... This may take a moment.
          </p>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && analysis.roleAnalysis && analysis.roleAnalysis.map((role, idx) => (
        <div key={idx} className="analysis-section">
          <div className="glass-card-static" style={{ marginBottom: "var(--space-6)" }}>
            <div className="analysis-header">
              <div className="analysis-role">{role.role}</div>
            </div>

            {/* ATS Score Ring */}
            <div className="ats-score-container">
              <div className="ats-score-ring">
                <svg viewBox="0 0 128 128">
                  <circle className="ats-score-ring-bg" cx="64" cy="64" r="56" />
                  <circle
                    className="ats-score-ring-progress"
                    cx="64"
                    cy="64"
                    r="56"
                    stroke={getScoreColor(role.atsScore)}
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - (role.atsScore / 100) * circumference}
                  />
                </svg>
                <div className="ats-score-value">
                  <div
                    className="ats-score-number"
                    style={{ color: getScoreColor(role.atsScore) }}
                  >
                    {role.atsScore}
                  </div>
                  <div className="ats-score-label">ATS Score</div>
                </div>
              </div>
              <div className="ats-score-breakdown">
                <p className="ats-score-summary">
                  Your resume scored <strong>{role.atsScore}/100</strong> for the{" "}
                  <strong>{role.role}</strong> role.{" "}
                  {role.atsScore >= 75
                    ? "Great match! Your resume is well-suited for this role."
                    : role.atsScore >= 50
                    ? "Decent fit, but there's room for improvement."
                    : "Consider updating your resume to better target this role."}
                </p>
              </div>
            </div>

            {/* Skills Analysis */}
            {(role.missingSkills?.length > 0 || role.valueAddingSkills?.length > 0) && (
              <div style={{ marginBottom: "var(--space-6)" }}>
                <h3 className="section-title" style={{ fontSize: "var(--font-base)" }}>
                  Skills Assessment
                </h3>
                <div className="analysis-grid">
                  {role.valueAddingSkills?.length > 0 && (
                    <div>
                      <div className="analysis-list-title" style={{ color: "var(--success)" }}>
                        Value-Adding Skills
                      </div>
                      <div className="skill-tags">
                        {role.valueAddingSkills.map((skill, i) => (
                          <span key={i} className="skill-tag skill-tag-value">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {role.missingSkills?.length > 0 && (
                    <div>
                      <div className="analysis-list-title" style={{ color: "var(--error)" }}>
                        Missing Skills
                      </div>
                      <div className="skill-tags">
                        {role.missingSkills.map((skill, i) => (
                          <span key={i} className="skill-tag skill-tag-missing">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <hr className="section-divider" />

            {/* Strengths, Weaknesses, Suggestions */}
            <div className="analysis-grid">
              {role.strengths?.length > 0 && (
                <div>
                  <div className="analysis-list-title">Strengths</div>
                  <ul className="analysis-list">
                    {role.strengths.map((item, i) => (
                      <li key={i} className="analysis-list-item">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {role.weaknesses?.length > 0 && (
                <div>
                  <div className="analysis-list-title">Weaknesses</div>
                  <ul className="analysis-list">
                    {role.weaknesses.map((item, i) => (
                      <li key={i} className="analysis-list-item">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {role.suggestions?.length > 0 && (
                <div>
                  <div className="analysis-list-title">Suggestions</div>
                  <ul className="analysis-list">
                    {role.suggestions.map((item, i) => (
                      <li key={i} className="analysis-list-item">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResumeAnalysis;
