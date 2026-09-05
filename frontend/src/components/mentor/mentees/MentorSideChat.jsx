import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchMessages, clearChat, addMessage } from "../../../slices/MentorChatSlice";
import socket from "../../../services/socket";
import "../../user/mentor/MentorChat.css";

export default function MentorSideChat() {
    const { conversationId } = useParams();
    const dispatch = useDispatch();

    const { messages, messagesLoading, serverError } = useSelector(
        (state) => state.mentorChat
    );

    const { user } = useSelector((state) => state.auth);

    const [message, setMessage] = useState("");

    useEffect(() => {
        if (conversationId) {
            dispatch(fetchMessages(conversationId));
        }

        return () => {
            dispatch(clearChat());
        };
    }, [dispatch, conversationId]);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            return;
        }

        socket.auth = {
            token
        };

        function handleConnect() {
            console.log("MENTOR SOCKET CONNECTED:", socket.id);

            socket.emit(
                "joinConversation",
                {
                    conversationId
                },
                (response) => {
                    console.log("MENTOR JOIN RESPONSE:", response);
                }
            );
        }

        function handleReceiveMessage(newMessage) {
            console.log("MENTOR RECEIVED MESSAGE:", newMessage);

            if (
                newMessage.conversation?.toString() ===
                conversationId?.toString()
            ) {
                dispatch(addMessage(newMessage));
            }
        }

        function handleConnectError(error) {
            console.log(
                "MENTOR SOCKET ERROR:",
                error.message
            );
        }

        socket.on("connect", handleConnect);
        socket.on("receiveMessage", handleReceiveMessage);
        socket.on("connect_error", handleConnectError);

        socket.connect();

        return () => {
            socket.off("connect", handleConnect);
            socket.off("receiveMessage", handleReceiveMessage);
            socket.off("connect_error", handleConnectError);

            if (socket.connected) {
                socket.disconnect();
            }
        };
    }, [dispatch, conversationId]);

    function handleSendMessage(e) {
        e.preventDefault();

        if (!message.trim()) {
            return;
        }

        if (!socket.connected) {
            console.log("Socket is not connected");
            return;
        }

        socket.emit(
            "sendMessage",
            {
                conversationId,
                message: message.trim()
            },
            (response) => {
                console.log("MENTOR SEND RESPONSE:", response);

                if (!response?.success) {
                    console.log(
                        "Send error:",
                        response?.message
                    );
                }
            }
        );

        setMessage("");
    }

    if (messagesLoading) {
        return <p>Loading messages...</p>;
    }

    if (serverError) {
        return <p>{serverError.message}</p>;
    }

    return (
        <div className="chat-page">
            <div className="chat-container">

                <div className="chat-header">
                    <div className="chat-avatar">
                        S
                    </div>

                    <div className="chat-user-info">
                        <h2>Student</h2>
                        <p>Mentor Conversation</p>
                    </div>

                    <div className="chat-status">
                        <span></span>
                        Connected
                    </div>
                </div>

                <div className="chat-messages">

                    {messages.length === 0 ? (
                        <div className="empty-chat">
                            <h3>No messages yet</h3>

                            <p>
                                Start the conversation with your student.
                            </p>
                        </div>
                    ) : (
                        messages.map((item) => {

                            const isOwnMessage =
                                item.sender?._id === user?._id;

                            return (
                                <div
                                    className={`message-row ${
                                        isOwnMessage
                                            ? "own-message"
                                            : "mentor-message"
                                    }`}
                                    key={item._id}
                                >
                                    <div className="message-bubble">
                                        <p>
                                            {item.message}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}

                </div>

                <form
                    className="chat-input-container"
                    onSubmit={handleSendMessage}
                >
                    <input
                        type="text"
                        placeholder="Type your message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />

                    <button type="submit">
                        Send
                    </button>
                </form>

            </div>
        </div>
    );
}