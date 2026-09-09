import { useNavigate } from "react-router-dom";
import "./MenteeCard.css";

export default function MenteeCard({mentee,studentId}) {
    const navigate = useNavigate();


    const { conversationId, student, profile } = mentee;

    const initial = student?.username?.charAt(0).toUpperCase() || "S";

    function handleViewChat() {
        navigate(`/mentor/chat/${conversationId}`);
    }

    function handleViewReport(){
        navigate(`/mentor/mentees/report/${studentId}`)
    }
    

    return (
        <div className="mentee-card">

            {/* Header */}
            <div className="mentee-header">
                <div className="mentee-avatar">
                    {initial}
                </div>

                <div className="mentee-title">
                    <h2>{student?.username || "Unknown Student"}</h2>
                    <p>{student?.email || "\u00A0"}</p>
                </div>
            </div>

            {profile ? (
                <>
                    {/* Info grid */}
                    <div className="mentee-info">
                        <div className="mentee-info-item">
                            <span>Education</span>
                            <strong>{profile.education || "\u00A0"}</strong>
                        </div>

                        <div className="mentee-info-item">
                            <span>Experience</span>
                            <strong>
                                {profile.experience !== undefined && profile.experience !== null
                                    ? `${profile.experience} Years`
                                    : "\u00A0"}
                            </strong>
                        </div>

                        <div className="mentee-info-item">
                            <span>Job Role</span>
                            <strong>{profile.preferredJobRole || "\u00A0"}</strong>
                        </div>

                        <div className="mentee-info-item">
                            <span>Location</span>
                            <strong>{profile.preferredLocation || "\u00A0"}</strong>
                        </div>
                    </div>

                    {/* Specialization tags */}
                    <div className="mentee-section">
                        <span className="mentee-section-title">Preferred Specialization</span>

                        <div className="mentee-tags">
                            {profile.preferredSpecialization?.length > 0
                                ? profile.preferredSpecialization.map((item, index) => (
                                    <span className="mentee-tag" key={index}>
                                        {item}
                                    </span>
                                ))
                                : <span className="mentee-tag">&nbsp;</span>}
                        </div>
                    </div>
                </>
            ) : (
                <p className="mentee-no-profile">
                    This student hasn't set up their profile yet.
                </p>
            )}

            {/* Buttons */}
            <div className="mentee-buttons">
                <button
                    className="mentee-chat-btn"
                    onClick={handleViewReport}
                >
                    View Report
                </button>
                
                <button
                    className="mentee-chat-btn"
                    onClick={handleViewChat}
                >
                    View Chat
                </button>

                {profile?.linkedin && (
                    <a
                        className="mentee-linkedin-btn"
                        href={profile.linkedin.startsWith("http") ? profile.linkedin : `https://${profile.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        LinkedIn
                    </a>
                )}
            </div>

        </div>
    );
}
