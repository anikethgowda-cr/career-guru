import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchAll = async () => {
      try {
        const authToken = token || localStorage.getItem("token");

        // Fetch profile
        const profileRes = await fetch("http://localhost:3000/api/user/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        const profileJson = await profileRes.json();
        if (profileRes.ok) {
          if (!profileJson.data || !profileJson.data.profile) {
            navigate("/create-profile");
            return;
          }
          setUserData(profileJson.data.user);
          setProfileData(profileJson.data.profile);
          if (profileJson.data.analysis) {
            setAnalysis(profileJson.data.analysis);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [isAuthenticated, token, navigate]);

  const getReadinessLabel = (score) => {
    if (score >= 75) return "Proficient";
    if (score >= 50) return "Intermediate";
    return "Developing";
  };

  const getReadinessColor = (score) => {
    if (score >= 75) return "var(--success)";
    if (score >= 50) return "var(--warning)";
    return "var(--error)";
  };

  const formatParagraph = (text) => {
    const splitIndex = text.indexOf(":");
    if (splitIndex !== -1 && splitIndex < 50) {
      return (
        <>
          <strong>{text.substring(0, splitIndex + 1)}</strong>
          {text.substring(splitIndex + 1)}
        </>
      );
    }
    return text;
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

  // Use the first role analysis if available
  const roleData = analysis?.roleAnalysis?.[0];

  let acquiredCount = 0;
  let missingCount = 0;
  let totalSkills = 0;
  let atsScore = 0;
  let targetRole = "Not set";

  if (roleData) {
    acquiredCount = roleData.valueAddingSkills?.length || 0;
    missingCount = roleData.missingSkills?.length || 0;
    totalSkills = acquiredCount + missingCount;
    atsScore = roleData.atsScore || 0;
    targetRole = roleData.role || "Unknown Role";
  }

  const readinessLabel = getReadinessLabel(atsScore);
  const readinessColor = getReadinessColor(atsScore);

  return (
    <div className="page-wrapper">
      {/* Header Row */}
      <div className="dash-header-row">
        <div>
          <h1 className="dashboard-greeting">
            Welcome back, {userData?.username || "USER"}
          </h1>
          <p className="dashboard-subtitle">
            student Track • Here's your career readiness overview
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {!profileData && (
        <div className="card" style={{ marginBottom: "var(--space-8)", textAlign: "center" }}>
          <p style={{ color: "var(--text-secondary)", marginBottom: "var(--space-4)" }}>
            You haven't created a career profile yet.
          </p>
          <Link to="/create-profile">
            <button className="btn btn-primary" id="create-profile-cta">Create Your Profile →</button>
          </Link>
        </div>
      )}

      {/* Metrics Row */}
      <div className="dash-metrics-grid">
        <div className="dash-metric-card">
          <div className="dash-metric-label">Target Role</div>
          <div className="dash-metric-value" style={{ textTransform: "capitalize" }}>{targetRole}</div>
        </div>

        <div className="dash-metric-card">
          <div className="dash-metric-label">Skills Mastery</div>
          <div className="dash-metric-value">{acquiredCount} <span style={{ fontSize: "var(--font-size-base)", color: "var(--text-secondary)" }}>/ {totalSkills || "-"} Acquired</span></div>
        </div>

        <div className="dash-metric-card">
          <div className="dash-metric-label">Readiness</div>
          <div className="dash-metric-value" style={{ color: readinessColor }}>{atsScore}% <span style={{ fontSize: "var(--font-size-base)", color: "var(--text-secondary)" }}>{readinessLabel}</span></div>
          <div className="dash-metric-sub">Based on industry match</div>
        </div>

        <div className="dash-metric-card">
          <div className="dash-metric-label">Active Streak</div>
          <div className="dash-metric-value">{profileData?.activeStreak || 0} Days</div>
          <div className="dash-metric-sub">{profileData?.xp || 0} XP Earned</div>
        </div>
      </div>

      {roleData ? (
        <>
          {/* Analysis Details Section (3 Columns) */}
          <div className="dash-capabilities-section">
            <div className="card">
              <h2 className="matrix-col-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
                Core Capabilities
              </h2>
              {roleData.strengths?.map((str, i) => (
                <div key={i} className="dash-list-item">
                  <div className="dash-list-icon" style={{ color: "var(--success)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <div className="dash-para">{formatParagraph(str)}</div>
                </div>
              ))}
            </div>

            <div className="card">
              <h2 className="matrix-col-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                Critical Skill Gaps
              </h2>
              {roleData.weaknesses?.map((weak, i) => (
                <div key={i} className="dash-list-item">
                  <div className="dash-list-icon" style={{ color: "var(--warning)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="6"></circle>
                    </svg>
                  </div>
                  <div className="dash-para">{formatParagraph(weak)}</div>
                </div>
              ))}
            </div>

            <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <h2 className="matrix-col-title" style={{ alignSelf: "flex-start" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                Role Compatibility
              </h2>
              <div className="gauge-container">
                <div className="gauge-bg"></div>
                <div className="gauge-fill" style={{ borderColor: readinessColor, transform: `rotate(${-45 + (atsScore / 100) * 180}deg)` }}></div>
                <div className="gauge-value">
                  <div className="gauge-score">{atsScore}%</div>
                  <div className="gauge-label">{readinessLabel}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Capabilities Matrix */}
          <div className="card dash-matrix">
            <h2 className="matrix-col-title" style={{ fontSize: "var(--font-size-lg)" }}>Capabilities Matrix</h2>
            <p className="text-muted" style={{ marginBottom: "var(--space-6)", fontSize: "var(--font-size-sm)" }}>
              Keywords matched against standard industry roles
            </p>

            <div style={{ marginBottom: "var(--space-6)" }}>
              <div className="matrix-col-title">
                Acquired Skills
                <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", fontWeight: "normal" }}>({acquiredCount})</span>
              </div>
              <div className="skill-tags">
                {roleData.valueAddingSkills?.map((skill, i) => (
                  <span key={i} className="skill-pill">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--success)" }}>
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    {skill}
                  </span>
                ))}
                {(!roleData.valueAddingSkills || roleData.valueAddingSkills.length === 0) && (
                  <span className="text-muted">No skills acquired yet.</span>
                )}
              </div>
            </div>

            <div>
              <div className="matrix-col-title">
                Skills to Develop
                <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", fontWeight: "normal" }}>({missingCount})</span>
              </div>
              <div className="skill-tags">
                {roleData.missingSkills?.map((skill, i) => (
                  <span key={i} className="skill-pill">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--border-strong)" }}>
                      <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                    {skill}
                  </span>
                ))}
                {(!roleData.missingSkills || roleData.missingSkills.length === 0) && (
                  <span className="text-muted">No missing skills detected.</span>
                )}
              </div>
            </div>

            <div style={{ marginTop: "var(--space-8)", borderTop: "1px solid var(--border-light)", paddingTop: "var(--space-6)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                {showDetails && (
                  <div style={{ marginBottom: "var(--space-4)" }}>
                    <h3 className="matrix-col-title">AI Suggestions</h3>
                    <ul className="dash-para" style={{ paddingLeft: "var(--space-4)" }}>
                      {roleData.suggestions?.map((sug, i) => (
                        <li key={i} style={{ marginBottom: "8px" }}>{sug}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <button className="btn btn-outline" onClick={() => setShowDetails(!showDetails)}>
                {showDetails ? "Hide Details" : "View Details"}
              </button>
            </div>
          </div>
        </>
      ) : (
        profileData && (
          <div className="card" style={{ textAlign: "center" }}>
            <p style={{ color: "var(--text-secondary)", marginBottom: "var(--space-4)" }}>
              No resume analysis found. Upload your resume on the Profile page to get your career readiness overview.
            </p>
            <Link to="/profile">
              <button className="btn btn-primary">Go to Profile</button>
            </Link>
          </div>
        )
      )}
    </div>
  );
};

export default Dashboard;
