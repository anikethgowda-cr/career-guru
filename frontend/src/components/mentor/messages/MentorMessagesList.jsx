import { useNavigate } from "react-router-dom";

function formatTime(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function MentorMessagesList({ conversations }) {
    const navigate = useNavigate();

    if (!conversations.length) {
        return (
            <div className="p-12 sm:p-16 rounded-3xl bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50/60 dark:bg-zinc-800 border border-indigo-100 dark:border-zinc-700 mx-auto flex items-center justify-center text-3xl">
                    💬
                </div>
                <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        No conversations yet
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                        Students who reach out with mentorship questions will appear in this inbox.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-3xl p-4 sm:p-6 shadow-xs divide-y divide-[#E2E8F0]/60 dark:divide-zinc-800/60 text-left">
            {conversations.map((conv) => {
                const student = conv.student;
                const name = student?.username || "Student";
                const initial = name.charAt(0).toUpperCase();
                const preview = conv.lastMessage?.message || "No messages yet";
                const time = formatTime(conv.lastMessage?.createdAt);

                return (
                    <div
                        key={conv._id}
                        onClick={() => navigate(`/mentor/chat/${conv._id}`)}
                        className="py-4 px-3 sm:px-4 rounded-2xl hover:bg-indigo-50/60 dark:hover:bg-zinc-800/50 transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 group"
                    >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 dark:from-indigo-600 dark:to-indigo-700 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                                {initial}
                            </div>

                            <div className="min-w-0 flex-1 space-y-0.5">
                                <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors truncate">
                                        {name}
                                    </h4>
                                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-zinc-800 text-indigo-700 dark:text-zinc-300 shrink-0">
                                        Mentee
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                                    {preview}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            {time && (
                                <span className="text-xs font-medium text-slate-400 dark:text-zinc-500">
                                    {time}
                                </span>
                            )}
                            <div className="w-8 h-8 rounded-xl bg-indigo-50/60 dark:bg-zinc-800 flex items-center justify-center text-slate-400 dark:text-zinc-500 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 group-hover:bg-indigo-100/70 dark:group-hover:bg-zinc-700 transition-all">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

