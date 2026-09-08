import { useNavigate } from "react-router-dom";

export default function ChatHeader({ name, initial, subtitle, backPath }) {
    const navigate = useNavigate();

    return (
        <div className="chat-header">
            {backPath && (
                <button className="chat-back-btn" onClick={() => navigate(backPath)}>
                    ←
                </button>
            )}

            <div className="chat-avatar">{initial}</div>

            <div className="chat-user-info">
                <h2>{name}</h2>
                <p>{subtitle}</p>
            </div>

            <div className="chat-status">
                <span></span>
                Online
            </div>
        </div>
    );
}
