import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchMessages, fetchConversations, clearChat, addMessage } from "../../slices/MentorChatSlice";
import socket from "../../services/socket.jsx";
import ChatHeader from "../../components/shared/chat/ChatHeader";
import ChatBox from "../../components/shared/chat/ChatBox";
import ChatInput from "../../components/shared/chat/ChatInput";

export default function MentorChat() {
    const { conversationId } = useParams();
    const dispatch = useDispatch();

    const { conversations, messages, messagesLoading, serverError } = useSelector(
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

    if (serverError) {
        return (
            <div className="p-6 max-w-2xl mx-auto mt-10">
                <div className="p-6 rounded-xl bg-status-danger-subtle border border-status-danger/30 text-left">
                    <p className="text-xs sm:text-sm text-status-danger">{serverError.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-3 sm:p-6 max-w-4xl mx-auto h-[calc(100vh-5rem)] flex flex-col transition-colors duration-200">
            <div className="flex-1 bg-bg-surface border border-border-default rounded-xl shadow-subtle overflow-hidden flex flex-col">
                <ChatHeader
                    name={studentName}
                    initial={studentInitial}
                    subtitle="Student Mentee"
                    backPath="/mentor/mentees"
                />
                <div className="flex-1 overflow-y-auto bg-bg-app">
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
