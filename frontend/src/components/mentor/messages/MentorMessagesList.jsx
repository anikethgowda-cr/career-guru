import { useNavigate } from "react-router-dom";
import "./MentorMessagesList.css";

function formatTime(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function MentorMessagesList({ conversations }) {
    const navigate = useNavigate();

    if (!conversations.length) {
        return (
            <div className="mentor-messages-empty">
                <h3>No messages yet</h3>
                <p>Students who send you a message will appear here.</p>
            </div>
        );
    }

    return (
        <div className="mentor-messages-list">
            {conversations.map((conv) => {
                const student = conv.student;
                const name = student?.username || "Student";
                const initial = name.charAt(0).toUpperCase();
                const preview = conv.lastMessage?.message || "";
                const time = formatTime(conv.lastMessage?.createdAt);

                return (
                    <div
                        key={conv._id}
                        className="mentor-msg-item"
                        onClick={() => navigate(`/mentor/chat/${conv._id}`)}
                    >
                        <div className="mentor-msg-avatar">{initial}</div>

                        <div className="mentor-msg-info">
                            <p className="mentor-msg-name">{name}</p>
                            <p className="mentor-msg-preview">{preview}</p>
                        </div>

                        <span className="mentor-msg-time">{time}</span>
                    </div>
                );
            })}
        </div>
    );
}
