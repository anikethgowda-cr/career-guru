import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function MyMentees({ mentees = [] }) {
    const navigate = useNavigate();

    function getRelativeTime(dateStr) {
        if (!dateStr) return "";
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "Just now";
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    }

    return (
        <div className="my-mentees-card">
            <div className="my-mentees-card-header">
                <h3>My Mentees</h3>
                <Link to="/mentor/mentees">View All &rarr;</Link>
            </div>

            {mentees.length === 0 ? (
                <div className="mentees-empty-state">
                    <span className="empty-icon">👥</span>
                    <p>No mentees yet.</p>
                    <p>Students who message you will appear here.</p>
                </div>
            ) : (
                <div className="mentees-list">
                    {mentees.map((mentee) => (
                        <div className="mentee-row" key={mentee.conversationId}>
                            <div className="mentee-row-avatar">
                                {mentee.student?.username?.charAt(0).toUpperCase() || "S"}
                            </div>

                            <div className="mentee-row-info">
                                <p className="mentee-row-name">
                                    {mentee.student?.username || "Student"}
                                </p>
                                <p className="mentee-row-role">
                                    {mentee.profile?.preferredJobRole || "Candidate"}
                                </p>
                                {mentee.lastMessage && (
                                    <p className="mentee-row-message">
                                        "{mentee.lastMessage.message}"
                                    </p>
                                )}
                            </div>

                            <div className="mentee-row-meta">
                                {mentee.lastMessage?.createdAt && (
                                    <span className="mentee-row-time">
                                        {getRelativeTime(mentee.lastMessage.createdAt)}
                                    </span>
                                )}
                                <button
                                    className="mentee-row-chat-btn"
                                    onClick={() => navigate(`/mentor/chat/${mentee.conversationId}`)}
                                >
                                    Chat
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
