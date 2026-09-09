import { useState } from "react";
import ReactMarkdown from "react-markdown";
import axios from "../../config/axios-config";
import "./Chatbot.css";

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const sendMessage = async (e) => {
        e.preventDefault();

        if (!message.trim() || loading) {
            return;
        }

        const userMessage = message.trim();

        setMessages((prev) => [
            ...prev,
            {
                sender: "user",
                message: userMessage
            }
        ]);

        setMessage("");
        setError("");
        setLoading(true);

        try {
            const response = await axios.post("/chatbot/message", {
                message: userMessage
            });

            setMessages((prev) => [
                ...prev,
                {
                    sender: "ai",
                    message: response.data.data.reply
                }
            ]);
        } catch (error) {
            console.error("CHATBOT ERROR:", error);

            setError(
                error.response?.data?.message ||
                "Failed to get AI response"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {isOpen && (
                <div className="chatbot-window">

                    <div className="chatbot-header">
                        <div>
                            <h3>CareerPilot AI</h3>
                            <span>AI Career Assistant</span>
                        </div>

                        <button
                            className="chatbot-close"
                            onClick={() => setIsOpen(false)}
                        >
                            ×
                        </button>
                    </div>

                    <div className="chatbot-messages">

                        {messages.length === 0 && (
                            <div className="chatbot-welcome">
                                <h4>Hi! 👋</h4>

                                <p>
                                    I'm your CareerPilot AI Assistant.
                                    Ask me about careers, skills, resumes,
                                    interviews or learning.
                                </p>

                                <div className="chatbot-suggestions">
                                    <button onClick={() => setMessage("How can I become a full stack developer?")}>
                                        Full Stack Roadmap
                                    </button>

                                    <button onClick={() => setMessage("How can I improve my resume?")}>
                                        Improve Resume
                                    </button>

                                    <button onClick={() => setMessage("What should I prepare for a JavaScript interview?")}>
                                        Interview Preparation
                                    </button>
                                </div>
                            </div>
                        )}

                        {messages.map((item, index) => (
                            <div
                                key={index}
                                className={`chatbot-message ${item.sender}`}
                            >
                                <div className="chatbot-message-content">
                                    {item.sender === "ai" ? (
                                        <ReactMarkdown>
                                            {item.message}
                                        </ReactMarkdown>
                                    ) : (
                                        item.message
                                    )}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="chatbot-message ai">
                                <div className="chatbot-message-content chatbot-thinking">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )}

                    </div>

                    {error && (
                        <p className="chatbot-error">{error}</p>
                    )}

                    <form
                        className="chatbot-input"
                        onSubmit={sendMessage}
                    >
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Ask CareerPilot..."
                            disabled={loading}
                        />

                        <button
                            type="submit"
                            disabled={loading || !message.trim()}
                        >
                            ➤
                        </button>
                    </form>

                </div>
            )}

            <button
                className="chatbot-button"
                onClick={() => setIsOpen((prev) => !prev)}
            >
                {isOpen ? "×" : "AI"}
            </button>
        </>
    );
}