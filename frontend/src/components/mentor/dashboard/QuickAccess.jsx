import { useNavigate } from "react-router-dom";

export default function QuickAccess() {
    const navigate = useNavigate();

    return (
        <div className="quick-access-card">
            <h3>Quick Access</h3>
            <div className="quick-access-buttons">
                <button
                    className="quick-access-btn"
                    onClick={() => navigate("/mentor/messages")}
                >
                    <span className="btn-icon">💬</span>
                    Messages
                </button>
                <button
                    className="quick-access-btn"
                    onClick={() => navigate("/mentor/mentees")}
                >
                    <span className="btn-icon">👥</span>
                    Mentees
                </button>
                <button
                    className="quick-access-btn"
                    onClick={() => navigate("/mentor/profile")}
                >
                    <span className="btn-icon">👤</span>
                    Profile
                </button>
            </div>
        </div>
    );
}
