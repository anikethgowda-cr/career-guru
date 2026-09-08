import { Link, useNavigate } from "react-router-dom";
import "./MyMentorsList.css";

function formatTime(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function MyMentorsList({ conversations }) {
    const navigate = useNavigate();

    if (!conversations.length) {
        return (
            <div className="my-mentors-empty">
                <h3>No active conversations yet</h3>
                <p>Find a mentor and start a conversation to see them here.</p>
                <Link to="/user/explore-mentors">Explore Mentors</Link>
            </div>
        );
    }

    return (
        <div className="conversation-list">
            {conversations.map((conv) => {
                const mentor = conv.mentor;
                const name = mentor?.username || "Mentor";
                const initial = name.charAt(0).toUpperCase();
                const preview = conv.lastMessage?.message || "";
                const time = formatTime(conv.lastMessage?.createdAt);

                return (
                    <div
                        key={conv._id}
                        className="conversation-item"
                        onClick={() => navigate(`/user/mentor/chat/${mentor._id}`, {
                            state: {
                                mentorName: name,
                                mentorInitial: initial,
                                conversationId: conv._id
                            }
                        })}
                    >
                        <div className="conv-avatar">{initial}</div>

                        <div className="conv-info">
                            <p className="conv-name">{name}</p>
                            <p className="conv-last-message">{preview}</p>
                        </div>

                        <span className="conv-time">{time}</span>
                    </div>
                );
            })}
        </div>
    );
}
