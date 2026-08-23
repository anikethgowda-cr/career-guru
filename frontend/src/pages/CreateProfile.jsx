import { useState,useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const CreateProfile = () => {
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();

  // Step tracking: 1 = Profile form, 2 = Resume upload, 3 = Done
  const [step, setStep] = useState(1);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    education: "",
    experience: "",
    skills: "",
    preferredJobRole: "",
    preferredLocation: "",
    linkedin: "",
  });

  // Resume upload state
  const [file, setFile] = useState(null);
  const [dragover, setDragover] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  const authToken = token || localStorage.getItem("token");

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  // Step 1: Submit profile
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        ...profileForm,
        experience: Number(profileForm.experience),
        skills: profileForm.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      const res = await fetch("http://localhost:3000/api/user/create-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create profile");

      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check if profile exists already
  useEffect(() => {
    const checkProfile = async () => {
      try {
        const authToken = token || localStorage.getItem("token");
        const res = await fetch("http://localhost:3000/api/user/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });
        
        const data = await res.json();

        if (res.ok && data.data?.profile) {
          const analysisData = data.data.analysis;
          if (analysisData && analysisData.roleAnalysis?.length > 0) {
            // Profile & Resume analysis both complete -> redirect to dashboard
            navigate("/dashboard");
          } else {
            // Profile exists but resume missing -> jump directly to step 2 (Resume upload)
            setStep(2);
          }
        }
      } catch (err) {
        console.error("Error checking profile:", err);
      }
    };
    if (isAuthenticated) {
      checkProfile();
    }
  }, [isAuthenticated, token, navigate]);

  // Handle inputselection
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

  // Step 2: Upload resume + run AI analysis, then go to dashboard
  const handleUploadAndAnalyze = async () => {
    if (!file) return;
    setError("");
    setUploading(true);

    try {
      // Upload resume
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

      // Run AI analysis
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

      // Success — redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
      setUploading(false);
      setAnalyzing(false);
    }
  };

  return (
    <div className="page-center" style={{ flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Step indicator */}
      <div className="step-indicator">
        <div className={`step-dot ${step >= 1 ? "active" : ""}`}>
          <span>1</span>
        </div>
        <div className={`step-line ${step >= 2 ? "active" : ""}`} />
        <div className={`step-dot ${step >= 2 ? "active" : ""}`}>
          <span>2</span>
        </div>
      </div>

      <div className="auth-container" style={{ maxWidth: "540px" }}>
        <div className="card">

          {/* ===== STEP 1: Profile Form ===== */}
          {step === 1 && (
            <>
              <h1 className="auth-title">Create Career Profile</h1>
              <p className="auth-subtitle">
                Tell us about your career goals and experience
              </p>

              {error && <div className="alert alert-error">{error}</div>}

              <form onSubmit={handleProfileSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="education">Education</label>
                  <input
                    className="form-input"
                    type="text"
                    id="education"
                    name="education"
                    placeholder="e.g., B.Tech in Computer Science"
                    value={profileForm.education}
                    onChange={handleProfileChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="experience">Years of Experience</label>
                  <input
                    className="form-input"
                    type="number"
                    id="experience"
                    name="experience"
                    placeholder="e.g., 2"
                    min="0"
                    value={profileForm.experience}
                    onChange={handleProfileChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="skills">Skills</label>
                  <input
                    className="form-input"
                    type="text"
                    id="skills"
                    name="skills"
                    placeholder="React, Node.js, Python, SQL"
                    value={profileForm.skills}
                    onChange={handleProfileChange}
                    required
                  />
                  <span className="form-hint">Separate skills with commas</span>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="preferredJobRole">Preferred Job Role</label>
                  <input
                    className="form-input"
                    type="text"
                    id="preferredJobRole"
                    name="preferredJobRole"
                    placeholder="e.g., Full Stack Developer"
                    value={profileForm.preferredJobRole}
                    onChange={handleProfileChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="preferredLocation">Preferred Location</label>
                  <input
                    className="form-input"
                    type="text"
                    id="preferredLocation"
                    name="preferredLocation"
                    placeholder="e.g., Bangalore, Remote"
                    value={profileForm.preferredLocation}
                    onChange={handleProfileChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="linkedin">LinkedIn Profile (optional)</label>
                  <input
                    className="form-input"
                    type="url"
                    id="linkedin"
                    name="linkedin"
                    placeholder="https://linkedin.com/in/yourname"
                    value={profileForm.linkedin}
                    onChange={handleProfileChange}
                  />
                </div>

                <button
                  className="btn btn-primary btn-full btn-lg"
                  type="submit"
                  disabled={loading}
                  id="create-profile-submit"
                >
                  {loading ? <span className="spinner" /> : "Continue to Resume Upload →"}
                </button>
              </form>
            </>
          )}

          {/* ===== STEP 2: Resume Upload & Analyze ===== */}
          {step === 2 && (
            <>
              <h1 className="auth-title">Upload Your Resume</h1>
              <p className="auth-subtitle">
                Upload your resume to get AI-powered ATS analysis for your preferred role
              </p>

              {error && <div className="alert alert-error">{error}</div>}

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
                <div className="upload-zone-desc">Only PDF files up to 5MB</div>
              </div>

              {file && (
                <div className="upload-file-info">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  </svg>
                  <span className="upload-file-name">{file.name}</span>
                  <span className="upload-file-size">{(file.size / 1024).toFixed(1)} KB</span>
                </div>
              )}

              {analyzing && (
                <div style={{ textAlign: "center", marginTop: "var(--space-6)", color: "var(--text-secondary)" }}>
                  <div className="spinner-center">
                    <div className="spinner spinner-lg" />
                  </div>
                  <p>AI is analyzing your resume... This may take a moment.</p>
                </div>
              )}

              <div style={{ display: "flex", gap: "var(--space-4)", marginTop: "var(--space-6)" }}>
                <button
                  className="btn btn-primary btn-full btn-lg"
                  onClick={handleUploadAndAnalyze}
                  disabled={!file || uploading || analyzing}
                  id="upload-analyze-btn"
                >
                  {uploading
                    ? <><span className="spinner" /> Uploading...</>
                    : analyzing
                    ? <><span className="spinner" /> Analyzing...</>
                    : "Upload & Generate Analysis"}
                </button>
              </div>

              <button
                className="btn btn-secondary btn-full"
                onClick={() => navigate("/dashboard")}
                style={{ marginTop: "var(--space-3)" }}
                disabled={uploading || analyzing}
              >
                Skip for now
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateProfile;
