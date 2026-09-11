import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { createConversation, fetchMessages, clearChat, addMessage } from "../../slices/MentorChatSlice";
import socket from "../../services/socket.jsx";
import ChatHeader from "../../components/shared/chat/ChatHeader";
import ChatBox from "../../components/shared/chat/ChatBox";
import ChatInput from "../../components/shared/chat/ChatInput";

export default function UserChat() {
    const { mentorId } = useParams();
    const { state: locationState } = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { conversation, messages, loading, messagesLoading, serverError } = useSelector(
        (state) => state.mentorChat
    );
    
    const { user } = useSelector((state) => state.auth);

    const [message, setMessage] = useState("");

    const mentorName = locationState?.mentorName || "Technical Mentor";
    const mentorInitial = locationState?.mentorInitial || mentorName?.charAt(0).toUpperCase() || "M";

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
        if (!token || !conversation?._id) return;

        socket.auth = { token };

        function handleConnect() {
            socket.emit("joinConversation", { conversationId: conversation._id }, () => {});
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

    if (loading) {
        return (
            <div className="p-6 sm:p-8 max-w-4xl mx-auto min-h-[60vh] flex flex-col items-center justify-center space-y-3">
                <svg className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-500" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-zinc-400">
                    Connecting to encrypted mentor chat room...
                </p>
            </div>
        );
    }

    if (serverError) {
        return (
            <div className="p-6 sm:p-8 max-w-2xl mx-auto mt-10">
                <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-left space-y-3">
                    <h3 className="text-base font-bold text-red-900 dark:text-red-200">
                        Unable to connect with mentor
                    </h3>
                    <p className="text-xs sm:text-sm text-red-700 dark:text-red-300">
                        {serverError?.message || "There was an issue opening this conversation."}
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate("/user/my-mentors")}
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                        Back to My Mentors
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-3 sm:p-6 max-w-4xl mx-auto h-[calc(100vh-5rem)] flex flex-col transition-colors duration-300">
            <div className="flex-1 bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden flex flex-col">
                <ChatHeader
                    name={mentorName}
                    initial={mentorInitial}
                    subtitle="Industry Mentor"
                    backPath="/user/my-mentors"
                />

                <div className="flex-1 overflow-y-auto bg-slate-50/40 dark:bg-zinc-950/40">
                    <ChatBox
                        messages={messages}
                        currentUserId={user?._id}
                        loading={messagesLoading}
                    />
                </div>

                <ChatInput
                    value={message}
                    onChange={setMessage}
                    onSubmit={handleSend}
                />
            </div>
        </div>
    );
}
