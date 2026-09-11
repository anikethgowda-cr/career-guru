import { Link, useNavigate } from "react-router-dom";

function formatTime(dateStr) {
    if (!dateStr) return "";
    try {
        const date = new Date(dateStr);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        if (isToday) {
            return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        }
        return date.toLocaleDateString([], { month: "short", day: "numeric" });
    } catch {
        return "";
    }
}

export default function MyMentorsList({ conversations }) {
    const navigate = useNavigate();

    if (!Array.isArray(conversations) || conversations.length === 0) {
        return (
            <div className="p-10 sm:p-12 rounded-2xl bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </div>
                <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        No Active Mentor Chats Yet
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-sm mx-auto">
                        Explore verified industry mentors and start a direct conversation to receive tailored technical guidance.
                    </p>
                </div>
                <div className="pt-2">
                    <Link
                        to="/user/explore-mentors"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-violet-700 dark:from-indigo-600 dark:to-indigo-700 dark:hover:from-indigo-700 dark:hover:to-indigo-800 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 dark:shadow-indigo-600/30 transition-all duration-200 cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span>Explore Mentors Directory</span>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {conversations.map((conv) => {
                const mentor = conv.mentor;
                const name = mentor?.username || mentor?.name || "Technical Mentor";
                const initial = name.charAt(0).toUpperCase();
                const preview = conv.lastMessage?.message || "Conversation started. Send a message to get guidance!";
                const time = formatTime(conv.lastMessage?.createdAt || conv.updatedAt);

                return (
                    <div
                        key={conv._id}
                        onClick={() =>
                            navigate(`/user/mentor/chat/${mentor?._id}`, {
                                state: {
                                    mentorName: name,
                                    mentorInitial: initial,
                                    conversationId: conv._id
                                }
                            })
                        }
                        className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-500/60 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex items-center justify-between gap-4 cursor-pointer group text-left"
                    >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            {/* Avatar */}
                            <div className="relative shrink-0">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 dark:from-indigo-600 dark:to-indigo-700 text-white flex items-center justify-center font-bold text-base shadow-xs group-hover:scale-105 transition-transform duration-200">
                                    {initial}
                                </div>
                                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#FFFFFF] dark:border-zinc-900"></span>
                            </div>

                            {/* Name & Preview */}
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                    <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                                        {name}
                                    </h4>
                                    {time && (
                                        <span className="text-[11px] font-medium text-slate-400 dark:text-zinc-500 shrink-0">
                                            {time}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                                    {preview}
                                </p>
                            </div>
                        </div>

                        {/* Chevron right */}
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-slate-700 dark:text-zinc-500 dark:group-hover:text-zinc-300 group-hover:bg-slate-200/50 dark:group-hover:bg-zinc-800 transition-colors shrink-0">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
