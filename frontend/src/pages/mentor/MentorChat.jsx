import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
    fetchMessages,
    fetchConversations,
    clearChat,
    addMessage
} from "../../slices/MentorChatSlice";
import socket from "../../services/socket.jsx";
import ChatHeader from "../../components/shared/chat/ChatHeader";
import ChatBox from "../../components/shared/chat/ChatBox";
import ChatInput from "../../components/shared/chat/ChatInput";
import { useCall } from "../../context/CallContext.jsx";

export default function MentorChat() {
    const { conversationId } = useParams();
    const dispatch = useDispatch();

    const {
        conversations,
        messages,
        messagesLoading,
        serverError
    } = useSelector(
        (state) => state.mentorChat
    );

    const { user } = useSelector(
        (state) => state.auth
    );

    const [message, setMessage] = useState("");
    const { startCall } = useCall();
    const [socketConnected, setSocketConnected] =
        useState(socket.connected);

    const currentConversation =
        conversations.find(
            (c) => c._id === conversationId
        );

    const studentName =
        currentConversation?.student?.username ||
        "Student";

    const studentInitial =
        studentName.charAt(0).toUpperCase();

    useEffect(() => {
        if (!conversations.length) {
            dispatch(fetchConversations());
        }

        if (conversationId) {
            dispatch(
                fetchMessages(conversationId)
            );
        }

        return () => {
            dispatch(clearChat());
        };
    }, [
        dispatch,
        conversationId
    ]);

    useEffect(() => {
        const token =
            localStorage.getItem("token");

        if (!token || !conversationId) {
            return;
        }

        socket.auth = { token };

        function handleConnect() {
            setSocketConnected(true);

            socket.emit(
                "joinConversation",
                {
                    conversationId
                },
                () => {}
            );
        }

        function handleDisconnect() {
            setSocketConnected(false);
        }

        function handleReceiveMessage(newMsg) {
            if (
                newMsg.conversation?.toString() ===
                conversationId?.toString()
            ) {
                dispatch(addMessage(newMsg));
            }
        }

        socket.on(
            "connect",
            handleConnect
        );

        socket.on(
            "disconnect",
            handleDisconnect
        );

        socket.on(
            "receiveMessage",
            handleReceiveMessage
        );

        if (socket.connected) {
            handleConnect();
        } else {
            socket.connect();
        }

        return () => {
            socket.off(
                "connect",
                handleConnect
            );

            socket.off(
                "disconnect",
                handleDisconnect
            );

            socket.off(
                "receiveMessage",
                handleReceiveMessage
            );

            setSocketConnected(false);
        };
    }, [
        dispatch,
        conversationId
    ]);

    function handleSend(e) {
        e.preventDefault();

        if (
            !message.trim() ||
            !socketConnected
        ) {
            return;
        }

        socket.emit(
            "sendMessage",
            {
                conversationId,
                message: message.trim()
            },
            (res) => {
                if (res?.success) {
                    setMessage("");
                }
            }
        );
    }

    const studentId =
        currentConversation?.student?._id ||
        (typeof currentConversation?.student === "string" ? currentConversation.student : null);

    function handleStartVoiceCall() {
        if (!conversationId || !studentId) {
            return;
        }

        startCall({
            conversationId,
            targetUserId: studentId,
            callType: "voice",
            recipientName: studentName || "Student"
        });
    }

    function handleStartVideoCall() {
        if (!conversationId || !studentId) {
            return;
        }

        startCall({
            conversationId,
            targetUserId: studentId,
            callType: "video",
            recipientName: studentName || "Student"
        });
    }

    if (serverError) {
        return (
            <div className="p-6 max-w-2xl mx-auto mt-10">

                <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-left">

                    <p className="text-xs sm:text-sm text-red-700 dark:text-red-300">
                        {serverError.message}
                    </p>

                </div>

            </div>
        );
    }

    return (
        <div className="p-3 sm:p-6 max-w-4xl mx-auto h-[calc(100vh-5rem)] flex flex-col transition-colors duration-300">

            <div className="flex-1 bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden flex flex-col">

                <ChatHeader
                    name={studentName}
                    initial={studentInitial}
                    subtitle="Student Mentee"
                    backPath="/mentor/mentees"
                />

                <div className="flex justify-end gap-2 px-4 py-2 border-b border-slate-100 dark:border-zinc-800">

                    <button
                        type="button"
                        onClick={handleStartVoiceCall}
                        disabled={
                            !studentId ||
                            !socketConnected
                        }
                        className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        📞 Voice Call
                    </button>

                    <button
                        type="button"
                        onClick={handleStartVideoCall}
                        disabled={
                            !studentId ||
                            !socketConnected
                        }
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        📹 Video Call
                    </button>

                </div>

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