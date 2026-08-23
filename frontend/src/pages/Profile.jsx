import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Profile = () => {
  const { token } = useAuth();
  const [userData, setUserData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [dragover, setDragover] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState("");

  const [hasAnalysis, setHasAnalysis] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const authToken = token || localStorage.getItem("token");
        
        const profileRes = await fetch("http://localhost:3000/api/user/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        const profileJson = await profileRes.json();
        if (profileRes.ok) {
          setUserData(profileJson.data.user);
          setProfileData(profileJson.data.profile);
          
          if (profileJson.data.analysis && profileJson.data.analysis.roleAnalysis?.length > 0) {
            setHasAnalysis(true);
          }
        } else {
          setError(profileJson.error || "Failed to load profile");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type === "application/pdf") {
      setFile(selected);
      setError("");
      setUploadSuccess("");
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
      setUploadSuccess("");
    } else {
      setError("Only PDF files are allowed");
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!file) return;
    setError("");
    setUploadSuccess("");
    setUploading(true);

    try {
      const authToken = token || localStorage.getItem("token");
      const formData = new FormData();
      formData.append("resume", file);

      const uploadRes = await fetch("http://localhost:3000/api/resumes/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");

      setUploading(false);
      setAnalyzing(true);

      const analyzeRes = await fetch("http://localhost:3000/api/resume/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({}),
      });

      const analyzeData = await analyzeRes.json();
      if (!analyzeRes.ok) throw new Error(analyzeData.error || "Analysis failed");

      setUploadSuccess("Resume successfully uploaded and analyzed!");
      setFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="spinner-center">
          <div className="spinner spinner-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="dash-header-row">
        <div>
          <h1 className="dashboard-greeting">My Profile</h1>
          <p className="dashboard-subtitle">Manage your career information</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: "800px", margin: "0 auto" }}>
        {profileData ? (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
              <div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "4px" }}>
                  {userData?.username}
                </h2>
                <div style={{ color: "var(--text-secondary)" }}>{userData?.email}</div>
              </div>
              <div style={{ padding: "8px 16px", backgroundColor: "var(--bg-tertiary)", borderRadius: "var(--radius-md)", color: "var(--text-secondary)", fontWeight: "500" }}>
                {userData?.role === "mentor" ? "Mentor Account" : "Student Track"}
              </div>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid var(--border-light)", margin: "var(--space-6) 0" }} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)", marginBottom: "var(--space-6)" }}>
              <div>
                <div style={{ fontSize: "var(--font-size-sm)", color: "var(--text-tertiary)", marginBottom: "4px" }}>Preferred Job Role</div>
                <div style={{ fontWeight: "500", color: "var(--text-primary)", fontSize: "1.1rem" }}>{profileData.preferredJobRole || "Not Set"}</div>
              </div>
              <div>
                <div style={{ fontSize: "var(--font-size-sm)", color: "var(--text-tertiary)", marginBottom: "4px" }}>Experience</div>
                <div style={{ fontWeight: "500", color: "var(--text-primary)", fontSize: "1.1rem" }}>{profileData.experience} Years</div>
              </div>
              <div>
                <div style={{ fontSize: "var(--font-size-sm)", color: "var(--text-tertiary)", marginBottom: "4px" }}>Education</div>
                <div style={{ fontWeight: "500", color: "var(--text-primary)", fontSize: "1.1rem" }}>{profileData.education}</div>
              </div>
              <div>
                <div style={{ fontSize: "var(--font-size-sm)", color: "var(--text-tertiary)", marginBottom: "4px" }}>Location</div>
                <div style={{ fontWeight: "500", color: "var(--text-primary)", fontSize: "1.1rem" }}>{profileData.preferredLocation}</div>
              </div>
            </div>

            <div style={{ marginBottom: "var(--space-6)" }}>
              <div style={{ fontSize: "var(--font-size-sm)", color: "var(--text-tertiary)", marginBottom: "8px" }}>Self-Reported Skills</div>
              <div className="skill-tags">
                {profileData.skills?.map((skill, i) => (
                  <span key={i} className="skill-pill">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {profileData.linkedin && (
              <div style={{ marginBottom: "var(--space-6)" }}>
                <div style={{ fontSize: "var(--font-size-sm)", color: "var(--text-tertiary)", marginBottom: "4px" }}>LinkedIn Profile</div>
                <a href={profileData.linkedin} target="_blank" rel="noreferrer" style={{ color: "var(--accent-primary)", fontWeight: "500" }}>
                  {profileData.linkedin}
                </a>
              </div>
            )}

            <hr style={{ border: "none", borderTop: "1px solid var(--border-light)", margin: "var(--space-6) 0" }} />

            {hasAnalysis ? (
              <div style={{ background: "var(--bg-tertiary)", padding: "var(--space-4)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: "12px" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <div>
                  <div style={{ fontWeight: "600", color: "var(--text-primary)" }}>Resume Uploaded & Analyzed</div>
                  <div style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)" }}>Your profile and resume details are locked.</div>
                </div>
              </div>
            ) : (
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "var(--space-2)" }}>Upload Resume</h3>
                <p style={{ color: "var(--text-secondary)", marginBottom: "var(--space-4)" }}>Upload your resume to complete your setup and generate your ATS analysis.</p>

                {uploadSuccess && <div className="alert alert-success">{uploadSuccess}</div>}

                <div
                  className={`upload-zone ${dragover ? "dragover" : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
                  onDragLeave={() => setDragover(false)}
                  onDrop={handleDrop}
                  style={{ padding: "var(--space-4)", minHeight: "120px" }}
                >
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    id="resume-file-input"
                  />
                  <div className="upload-zone-icon" style={{ color: "var(--accent-primary)", marginBottom: "8px" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                  </div>
                  <div className="upload-zone-title" style={{ fontSize: "var(--font-size-sm)" }}>
                    {file ? file.name : "Drop PDF here or click to browse"}
                  </div>
                </div>

                {file && (
                  <button
                    className="btn btn-primary"
                    onClick={handleUploadAndAnalyze}
                    disabled={uploading || analyzing}
                    style={{ marginTop: "var(--space-4)" }}
                  >
                    {uploading ? "Uploading..." : analyzing ? "Analyzing..." : "Upload & Analyze"}
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "var(--space-8) 0" }}>
            <p style={{ color: "var(--text-secondary)", marginBottom: "var(--space-4)" }}>You haven't completed your profile setup yet.</p>
            <Link to="/create-profile">
              <button className="btn btn-primary">Complete Setup</button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
