import { useEffect, useRef } from "react";

export default function ChatBox({ messages, currentUserId, loading }) {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if (loading) {
        return <p className="chat-loading">Loading messages...</p>;
    }

    if (messages.length === 0) {
        return (
            <div className="empty-chat">
                <h3>Start the conversation</h3>
                <p>Send a message to get started.</p>
            </div>
        );
    }

    return (
        <>
            {messages.map((item) => {
                const isOwn = item.sender?._id === currentUserId;

                return (
                    <div
                        key={item._id}
                        className={`message-row ${isOwn ? "own-message" : "other-message"}`}
                    >
                        <div className="message-bubble">
                            <p>{item.message}</p>
                        </div>
                    </div>
                );
            })}
            <div ref={bottomRef} />
        </>
    );
}
