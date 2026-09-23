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
        <div className="bg-bg-surface border border-border-default rounded-xl p-6 transition-all duration-200 shadow-subtle text-left h-full flex flex-col justify-between">
            <div>
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-border-default">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-brand-subtle text-brand-primary flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-text-primary leading-tight">
                                Recent Mentees
                            </h3>
                            <p className="text-xs text-text-muted leading-tight">
                                Active student interactions
                            </p>
                        </div>
                    </div>

                    <Link
                        to="/mentor/mentees"
                        className="text-xs font-semibold text-brand-primary hover:text-brand-primary-hover flex items-center gap-1 transition-colors group"
                    >
                        View All
                        <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                    </Link>
                </div>

                {mentees.length === 0 ? (
                    <div className="py-12 px-4 text-center space-y-3">
                        <div className="w-12 h-12 rounded-xl bg-brand-subtle text-brand-primary mx-auto flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-text-primary">
                                No mentees yet
                            </p>
                            <p className="text-xs text-text-muted mt-0.5">
                                Students who message you or book mentorship will appear here.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="divide-y divide-border-default mt-2">
                        {mentees.map((mentee) => {
                            const studentName = mentee.student?.username || "Student";
                            const initial = studentName.charAt(0).toUpperCase();

                            return (
                                <div
                                    key={mentee.conversationId}
                                    className="py-3.5 flex items-center justify-between gap-3 group hover:bg-bg-muted/50 px-2 rounded-lg transition-colors"
                                >
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-primary to-brand-primary/80 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                                            {initial}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold text-text-primary truncate">
                                                    {studentName}
                                                </p>
                                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-brand-subtle text-brand-primary truncate">
                                                    {mentee.profile?.preferredJobRole || "Candidate"}
                                                </span>
                                            </div>

                                            {mentee.lastMessage && (
                                                <p className="text-xs text-text-muted truncate mt-0.5">
                                                    "{mentee.lastMessage.message}"
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                        {mentee.lastMessage?.createdAt && (
                                            <span className="text-[11px] font-medium text-text-muted hidden sm:inline-block">
                                                {getRelativeTime(mentee.lastMessage.createdAt)}
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/mentor/chat/${mentee.conversationId}`)}
                                            className="px-3 py-1.5 rounded-lg bg-bg-muted hover:bg-brand-primary text-text-primary hover:text-white border border-border-default hover:border-transparent text-xs font-semibold transition-all duration-200 cursor-pointer"
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

            {/* Bottom Footer Alignment Bar */}
            <div className="pt-4 mt-6 border-t border-border-default flex items-center justify-between text-xs text-text-muted">
                <span>
                    {mentees.length} active conversation{mentees.length === 1 ? "" : "s"}
                </span>
                <Link
                    to="/mentor/messages"
                    className="font-semibold text-brand-primary hover:text-brand-primary-hover flex items-center gap-1 transition-colors"
                >
                    All Messages &rarr;
                </Link>
            </div>
        </div>
    );
}
