import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchMessages, fetchConversations, clearChat, addMessage } from "../../slices/MentorChatSlice";
import socket from "../../services/socket.jsx";
import ChatHeader from "../../components/shared/chat/ChatHeader";
import ChatBox from "../../components/shared/chat/ChatBox";
import ChatInput from "../../components/shared/chat/ChatInput";
import "../../components/shared/chat/Chat.css";

export default function MentorChat() {
    const { conversationId } = useParams();
    const dispatch = useDispatch();

    const { conversations, messages, messagesLoading, conversationsLoading, serverError } = useSelector(
        (state) => state.mentorChat
    );
    const { user } = useSelector((state) => state.auth);

    const [message, setMessage] = useState("");

    // Resolve student info from conversations list (fetched if not already loaded)
    const currentConversation = conversations.find((c) => c._id === conversationId);
    const studentName = currentConversation?.student?.username || "Student";
    const studentInitial = studentName.charAt(0).toUpperCase();

    useEffect(() => {
        // If conversations not loaded yet (direct page refresh), fetch them
        if (!conversations.length) {
            dispatch(fetchConversations());
        }
        if (conversationId) {
            dispatch(fetchMessages(conversationId));
        }
        return () => { dispatch(clearChat()); };
    }, [dispatch, conversationId]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token || !conversationId) return;

        socket.auth = { token };

        function handleConnect() {
            socket.emit("joinConversation", { conversationId }, (res) => {
                console.log("MENTOR JOIN:", res);
            });
        }

        function handleReceiveMessage(newMsg) {
            if (newMsg.conversation?.toString() === conversationId?.toString()) {
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
    }, [dispatch, conversationId]);

    function handleSend(e) {
        e.preventDefault();
        if (!message.trim() || !socket.connected) return;

        socket.emit("sendMessage", { conversationId, message: message.trim() }, (res) => {
            if (res?.success) {
                setMessage("");
            }
        });
    }

    if (serverError) return <p>{serverError.message}</p>;

    return (
        <div className="chat-page">
            <div className="chat-container">
                <ChatHeader
                    name={studentName}
                    initial={studentInitial}
                    subtitle="Student"
                    backPath="/mentor/mentees"
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
