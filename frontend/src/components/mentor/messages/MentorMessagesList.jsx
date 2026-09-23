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
            <div className="p-12 sm:p-16 rounded-xl bg-bg-surface border border-border-default text-center space-y-4 shadow-subtle">
                <div className="w-16 h-16 rounded-xl bg-brand-subtle text-brand-primary mx-auto flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </div>
                <div className="space-y-1">
                    <h3 className="text-lg font-bold text-text-primary">
                        No conversations yet
                    </h3>
                    <p className="text-xs sm:text-sm text-text-muted max-w-md mx-auto">
                        Students who reach out with mentorship questions will appear in this inbox.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-bg-surface border border-border-default rounded-xl p-4 sm:p-6 shadow-subtle divide-y divide-border-default text-left">
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
                        className="py-4 px-3 sm:px-4 rounded-lg hover:bg-bg-muted/50 transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 group"
                    >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                                {initial}
                            </div>

                            <div className="min-w-0 flex-1 space-y-0.5">
                                <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-bold text-text-primary group-hover:text-brand-primary transition-colors truncate">
                                        {name}
                                    </h4>
                                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-brand-subtle text-brand-primary shrink-0">
                                        Mentee
                                    </span>
                                </div>
                                <p className="text-xs text-text-muted truncate">
                                    {preview}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            {time && (
                                <span className="text-xs font-medium text-text-muted">
                                    {time}
                                </span>
                            )}
                            <div className="w-8 h-8 rounded-lg bg-bg-muted flex items-center justify-center text-text-muted group-hover:text-brand-primary group-hover:bg-brand-subtle transition-all">
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
