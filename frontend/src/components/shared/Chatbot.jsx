import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import axios from "../../config/axios-config";

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [copiedIndex, setCopiedIndex] = useState(null);

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, loading, isOpen]);

    const handleCopy = (text, index) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        }
    };

    const handleClearChat = () => {
        setMessages([]);
        setError("");
    };

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
            const response = await axios.post("/chatbot/message", { message: userMessage });

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
                <div className="fixed right-6 bottom-24 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-8rem)] bg-[#F8FAFC] dark:bg-zinc-900 rounded-2xl shadow-2xl border border-[#E2E8F0] dark:border-zinc-800 flex flex-col overflow-hidden text-left animate-in fade-in slide-in-from-bottom-5 duration-200">
                    
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-600 dark:to-indigo-700 text-white px-5 py-3.5 flex items-center justify-between shadow-xs">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold text-sm shadow-inner">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm leading-tight text-white flex items-center gap-2">
                                    CareerPilot AI
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                </h3>
                                <span className="text-[11px] text-indigo-100 dark:text-indigo-100 font-medium">AI Career Assistant</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            {/* Clear Conversation Button */}
                            {messages.length > 0 && (
                                <button
                                    type="button"
                                    onClick={handleClearChat}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                    title="Clear conversation"
                                    aria-label="Clear conversation"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            )}

                            {/* Close Chat Button */}
                            <button
                                type="button"
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                onClick={() => setIsOpen(false)}
                                aria-label="Close Chat"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Messages Scroll Area */}
                    <div className="flex-1 p-4 overflow-y-auto bg-[#F4EFE6]/60 dark:bg-zinc-950 space-y-3.5 text-left">
                        {messages.length === 0 && (
                            <div className="p-4 bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-2xl shadow-xs space-y-3">
                                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                                    <span>Hi! 👋</span>
                                </div>

                                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                                    I'm your CareerPilot AI Assistant. Ask me about career paths, skills, resume optimization, interview prep, or personalized learning.
                                </p>

                                <div className="space-y-1.5 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => setMessage("How can I become a full stack developer?")}
                                        className="w-full text-left p-2.5 rounded-xl border border-indigo-100 bg-indigo-50/60 hover:bg-indigo-50 text-indigo-900 dark:border-indigo-900/40 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/60 dark:text-indigo-300 text-xs font-medium transition-colors cursor-pointer flex items-center justify-between"
                                    >
                                        <span>Full Stack Roadmap</span>
                                        <span className="text-indigo-600 dark:text-indigo-400">&rarr;</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setMessage("How can I improve my resume?")}
                                        className="w-full text-left p-2.5 rounded-xl border border-indigo-100 bg-indigo-50/60 hover:bg-indigo-50 text-indigo-900 dark:border-indigo-900/40 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/60 dark:text-indigo-300 text-xs font-medium transition-colors cursor-pointer flex items-center justify-between"
                                    >
                                        <span>Improve Resume</span>
                                        <span className="text-indigo-600 dark:text-indigo-400">&rarr;</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setMessage("What should I prepare for a JavaScript interview?")}
                                        className="w-full text-left p-2.5 rounded-xl border border-indigo-100 bg-indigo-50/60 hover:bg-indigo-50 text-indigo-900 dark:border-indigo-900/40 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/60 dark:text-indigo-300 text-xs font-medium transition-colors cursor-pointer flex items-center justify-between"
                                    >
                                        <span>Interview Preparation</span>
                                        <span className="text-indigo-600 dark:text-indigo-400">&rarr;</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {messages.map((item, index) => (
                            <div
                                key={index}
                                className={`flex ${item.sender === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[85%] px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                                        item.sender === "user"
                                            ? "rounded-2xl rounded-br-xs bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-600 dark:to-indigo-600 text-white shadow-xs"
                                            : "rounded-2xl rounded-bl-xs bg-[#FFFFFF] dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 border border-[#E2E8F0] dark:border-zinc-800 shadow-xs prose prose-sm dark:prose-invert max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-1 [&_strong]:font-semibold [&_code]:bg-indigo-50 dark:[&_code]:bg-zinc-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs"
                                    }`}
                                >
                                    {item.sender === "ai" ? (
                                        <>
                                            <ReactMarkdown>
                                                {item.message}
                                            </ReactMarkdown>

                                            {/* AI Message Action Footer: Copy Button */}
                                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E2E8F0] dark:border-zinc-800 text-[11px] text-slate-400 dark:text-zinc-500">
                                                <span>CareerPilot</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy(item.message, index)}
                                                    className="flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-slate-200/50 dark:hover:bg-zinc-800"
                                                    title="Copy response"
                                                >
                                                    {copiedIndex === index ? (
                                                        <>
                                                            <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Copied</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                            </svg>
                                                            <span>Copy</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        item.message
                                    )}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="px-4 py-3 rounded-2xl rounded-bl-xs bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 shadow-xs flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></span>
                                </div>
                            </div>
                        )}

                        {/* Auto-scroll anchor */}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="mx-4 mb-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-600 dark:text-red-400 flex items-center justify-between gap-2">
                            <span>{error}</span>
                            <button
                                type="button"
                                onClick={() => setError("")}
                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200 text-sm font-bold px-1 rounded cursor-pointer shrink-0"
                                aria-label="Dismiss error"
                            >
                                &times;
                            </button>
                        </div>
                    )}

                    {/* Input Footer */}
                    <form
                        className="p-3 bg-[#FFFFFF] dark:bg-zinc-900 border-t border-[#E2E8F0] dark:border-zinc-800 flex items-center gap-2"
                        onSubmit={sendMessage}
                    >
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Ask CareerPilot..."
                            disabled={loading}
                            className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#E0D8C8] dark:border-zinc-700 bg-white dark:bg-zinc-950/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
                        />

                        <button
                            type="submit"
                            disabled={loading || !message.trim()}
                            className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-violet-700 dark:from-indigo-600 dark:to-indigo-600 text-white flex items-center justify-center shadow-xs shadow-indigo-600/20 dark:shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 cursor-pointer"
                            aria-label="Send Message"
                        >
                            <svg className="w-4 h-4 translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </form>

                </div>
            )}

            {/* Floating Launcher Button */}
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="fixed right-6 bottom-6 z-50 w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 dark:from-indigo-600 dark:via-indigo-600 dark:to-indigo-500 text-white shadow-xl shadow-indigo-600/20 dark:shadow-indigo-600/30 hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center justify-center cursor-pointer"
                aria-label="Toggle AI Chatbot"
            >
                {isOpen ? (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <div className="relative">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-indigo-600 dark:ring-indigo-600"></span>
                    </div>
                )}
            </button>
        </>
    );
}