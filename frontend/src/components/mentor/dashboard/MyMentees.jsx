import { useNavigate, Link } from "react-router-dom";

export default function MyMentees({ mentees = [] }) {
    const navigate = useNavigate();

    function getRelativeTime(dateStr) {
        if (!dateStr) return "";
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "Just now";
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    }

    return (
        <div className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-3xl p-6 transition-all duration-300 shadow-xs text-left">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]/80 dark:border-zinc-800/80">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-zinc-300 flex items-center justify-center shrink-0 text-sm">
                        👥
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                            Recent Mentees
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 leading-tight">
                            Active student interactions
                        </p>
                    </div>
                </div>

                <Link
                    to="/mentor/mentees"
                    className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors group"
                >
                    View All
                    <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                </Link>
            </div>

            {mentees.length === 0 ? (
                <div className="py-12 px-4 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50/60 dark:bg-zinc-800 border border-indigo-100 dark:border-zinc-700/60 mx-auto flex items-center justify-center text-xl">
                        👥
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-zinc-200">
                            No mentees yet
                        </p>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                            Students who message you or book mentorship will appear here.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="divide-y divide-[#E2E8F0]/60 dark:divide-zinc-800/60 mt-2">
                    {mentees.map((mentee) => {
                        const studentName = mentee.student?.username || "Student";
                        const initial = studentName.charAt(0).toUpperCase();

                        return (
                            <div
                                key={mentee.conversationId}
                                className="py-3.5 flex items-center justify-between gap-3 group hover:bg-indigo-50/60 dark:hover:bg-zinc-800/40 px-2 rounded-2xl transition-colors"
                            >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 dark:from-indigo-600 dark:to-indigo-700 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                                        {initial}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">
                                                {studentName}
                                            </p>
                                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-zinc-800 text-indigo-700 dark:text-zinc-300 truncate">
                                                {mentee.profile?.preferredJobRole || "Candidate"}
                                            </span>
                                        </div>

                                        {mentee.lastMessage && (
                                            <p className="text-xs text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                                                "{mentee.lastMessage.message}"
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                    {mentee.lastMessage?.createdAt && (
                                        <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 hidden sm:inline-block">
                                            {getRelativeTime(mentee.lastMessage.createdAt)}
                                        </span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/mentor/chat/${mentee.conversationId}`)}
                                        className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-indigo-900 dark:text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
                                    >
                                        Chat
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

