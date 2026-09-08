import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useLocation } from "react-router-dom";
import { createConversation, fetchMessages, clearChat, addMessage } from "../../slices/MentorChatSlice";
import socket from "../../services/socket.jsx";
import ChatHeader from "../../components/shared/chat/ChatHeader";
import ChatBox from "../../components/shared/chat/ChatBox";
import ChatInput from "../../components/shared/chat/ChatInput";
import "../../components/shared/chat/Chat.css";

export default function UserChat() {
    const { mentorId } = useParams();
    const { state: locationState } = useLocation();
    const dispatch = useDispatch();

    const { conversation, messages, loading, messagesLoading, serverError } = useSelector(
        (state) => state.mentorChat
    );
    const { user } = useSelector((state) => state.auth);

    const [message, setMessage] = useState("");

    const mentorName = locationState?.mentorName || "Mentor";
    const mentorInitial = locationState?.mentorInitial || "M";

    useEffect(() => {
        dispatch(createConversation(mentorId));
        return () => { dispatch(clearChat()); };
    }, [dispatch, mentorId]);

    useEffect(() => {
        if (conversation?._id) {
            dispatch(fetchMessages(conversation._id));
        }
    }, [dispatch, conversation?._id]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token || !conversation?._id) return;

        socket.auth = { token };

        function handleConnect() {
            socket.emit("joinConversation", { conversationId: conversation._id }, (res) => {
                console.log("USER JOIN:", res);
            });
        }

        function handleReceiveMessage(newMsg) {
            if (newMsg.conversation?.toString() === conversation._id?.toString()) {
                dispatch(addMessage(newMsg));
            }
        }

        socket.on("connect", handleConnect);
        socket.on("receiveMessage", handleReceiveMessage);

        if (socket.connected) {
            handleConnect();
        } else {
            socket.connect();
        }

        return () => {
            socket.off("connect", handleConnect);
            socket.off("receiveMessage", handleReceiveMessage);
            if (socket.connected) socket.disconnect();
        };
    }, [dispatch, conversation?._id]);

    function handleSend(e) {
        e.preventDefault();
        if (!message.trim() || !conversation?._id || !socket.connected) return;

        socket.emit("sendMessage", { conversationId: conversation._id, message: message.trim() }, (res) => {
            if (res?.success) {
                setMessage("");
            }
        });
    }

    if (loading) return <p>Setting up conversation...</p>;
    if (serverError) return <p>{serverError.message}</p>;

    return (
        <div className="chat-page">
            <div className="chat-container">
                <ChatHeader
                    name={mentorName}
                    initial={mentorInitial}
                    subtitle="Mentor"
                    backPath="/user/my-mentors"
                />
                <div className="chat-messages">
                    <ChatBox
                        messages={messages}
                        currentUserId={user?._id}
                        loading={messagesLoading}
                    />
                </div>
                <ChatInput value={message} onChange={setMessage} onSubmit={handleSend} />
            </div>
        </div>
    );
}
