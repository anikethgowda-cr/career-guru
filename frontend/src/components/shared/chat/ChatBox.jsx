import { useEffect, useRef } from "react";

function formatMessageTime(dateStr) {
    if (!dateStr) return "";
    try {
        const d = new Date(dateStr);
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
        return "";
    }
}

export default function ChatBox({ messages = [], currentUserId, loading }) {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center p-8">
                <div className="flex items-center gap-2.5 text-slate-500 dark:text-zinc-400 text-xs font-medium animate-pulse">
                    <svg className="w-5 h-5 animate-spin text-indigo-600 dark:text-indigo-400" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Loading conversation history...</span>
                </div>
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </div>
                <div className="space-y-1 max-w-sm">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Start the Conversation
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Say hello and ask your questions about tech stack choices, career advice, or interview prep.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 p-4 sm:p-6 overflow-y-auto">
            {messages.map((item) => {
                const isOwn = (item.sender?._id || item.sender) === currentUserId;
                const timeText = formatMessageTime(item.createdAt);

                return (
                    <div
                        key={item._id || Math.random()}
                        className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
                    >
                        <div
                            className={`max-w-[85%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs break-words text-left ${
                                isOwn
                                    ? "bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-600 dark:to-indigo-700 text-white rounded-br-xs"
                                    : "bg-white dark:bg-zinc-800 border border-[#E2E8F0] dark:border-zinc-700/80 text-slate-900 dark:text-zinc-100 rounded-bl-xs"
                            }`}
                        >
                            <p className="whitespace-pre-wrap">{item.message}</p>
                        </div>
                        {timeText && (
                            <span className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1 px-1">
                                {timeText}
                            </span>
                        )}
                    </div>
                );
            })}
            <div ref={bottomRef} />
        </div>
    );
}
