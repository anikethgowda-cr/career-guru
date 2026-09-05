import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
    createConversation,
    fetchMessages,
    clearChat,
    addMessage
} from "../../../slices/MentorChatSlice";
import socket from "../../../services/socket";
import "./MentorChat.css";

export default function MentorChat() {
    const { mentorId } = useParams();
    const dispatch = useDispatch();

    const {
        conversation,
        messages,
        loading,
        messagesLoading,
        serverError
    } = useSelector((state) => state.mentorChat);

    const { user } = useSelector((state) => state.auth);

    const [message, setMessage] = useState("");

    useEffect(() => {
        dispatch(createConversation(mentorId));

        return () => {
            dispatch(clearChat());
        };
    }, [dispatch, mentorId]);

    useEffect(() => {
        if (conversation?._id) {
            dispatch(fetchMessages(conversation._id));
        }
    }, [dispatch, conversation?._id]);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token || !conversation?._id) {
            return;
        }

        socket.auth = {
            token
        };

        function handleConnect() {
            console.log("USER SOCKET CONNECTED:", socket.id);

            socket.emit(
                "joinConversation",
                {
                    conversationId: conversation._id
                },
                (response) => {
                    console.log("USER JOIN RESPONSE:", response);
                }
            );
        }

        function handleReceiveMessage(newMessage) {
            console.log("USER RECEIVED MESSAGE:", newMessage);

            if (
                newMessage.conversation?.toString() ===
                conversation._id?.toString()
            ) {
                dispatch(addMessage(newMessage));
            }
        }

        function handleConnectError(error) {
            console.log(
                "USER SOCKET ERROR:",
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
    }, [dispatch, conversation?._id]);

    function handleSendMessage(e) {
        e.preventDefault();

        if (!message.trim() || !conversation?._id) {
            return;
        }

        if (!socket.connected) {
            console.log("Socket is not connected");
            return;
        }

        socket.emit(
            "sendMessage",
            {
                conversationId: conversation._id,
                message: message.trim()
            },
            (response) => {
                console.log(
                    "USER SEND RESPONSE:",
                    response
                );

                if (!response?.success) {
                    console.log(
                        response?.message
                    );
                }
            }
        );

        setMessage("");
    }

    if (loading) {
        return <p>Creating conversation...</p>;
    }

    if (serverError) {
        return <p>{serverError.message}</p>;
    }

    return (
        <div className="chat-page">

            <div className="chat-container">

                <div className="chat-header">

                    <div className="chat-avatar">
                        M
                    </div>

                    <div className="chat-user-info">
                        <h2>Mentor</h2>
                        <p>Available for conversation</p>
                    </div>

                    <div className="chat-status">
                        <span></span>
                        Online
                    </div>

                </div>

                <div className="chat-messages">

                    {messagesLoading ? (
                        <p className="chat-loading">
                            Loading messages...
                        </p>
                    ) : messages.length === 0 ? (
                        <div className="empty-chat">
                            <h3>Start a conversation</h3>

                            <p>
                                Send a message to start talking with your mentor.
                            </p>
                        </div>
                    ) : (
                        messages.map((item) => {

                            const isOwnMessage =
                                item.sender?._id === user?._id;

                            return (
                                <div
                                    key={item._id}
                                    className={`message-row ${
                                        isOwnMessage
                                            ? "own-message"
                                            : "mentor-message"
                                    }`}
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
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                    />

                    <button type="submit">
                        Send
                    </button>

                </form>

            </div>

        </div>
    );
}