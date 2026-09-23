import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchConversations } from "../../slices/MentorChatSlice";
import MyMentorsList from "../../components/user/myMentors/MyMentorsList";

export default function MyMentors() {
    const dispatch = useDispatch();
    const { conversations, conversationsLoading, serverError } = useSelector(
        (state) => state.mentorChat
    );
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        dispatch(fetchConversations());
    }, [dispatch]);

    const filteredConversations = useMemo(() => {
        if (!Array.isArray(conversations)) return [];
        if (!searchQuery.trim()) return conversations;

        const q = searchQuery.toLowerCase();
        return conversations.filter((c) => {
            const name = (c.mentor?.username || c.mentor?.name || "").toLowerCase();
            const lastMsg = (c.lastMessage?.message || "").toLowerCase();
            return name.includes(q) || lastMsg.includes(q);
        });
    }, [conversations, searchQuery]);

    // Shimmer Skeleton Loader
    if (conversationsLoading) {
        return (
            <div className="p-6 sm:p-8 lg:p-10 max-w-4xl mx-auto space-y-6 text-left animate-pulse">
                <div className="space-y-2 pb-6 border-b border-border-default">
                    <div className="w-48 h-8 bg-bg-muted rounded-xl"></div>
                    <div className="w-72 h-4 bg-bg-muted/60 rounded-lg"></div>
                </div>

                <div className="space-y-3">
                    {[1, 2, 3].map((n) => (
                        <div
                            key={n}
                            className="bg-bg-surface border border-border-default rounded-xl p-5 h-20 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3.5">
                                <div className="w-12 h-12 bg-bg-muted rounded-xl"></div>
                                <div className="space-y-2">
                                    <div className="w-32 h-4 bg-bg-muted rounded"></div>
                                    <div className="w-48 h-3 bg-bg-muted/60 rounded"></div>
                                </div>
                            </div>
                            <div className="w-16 h-3.5 bg-bg-muted rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 sm:p-8 lg:p-10 max-w-4xl mx-auto space-y-6 text-left transition-colors duration-300">
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border-default">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                        My Mentors
                    </h1>
                    <p className="text-xs sm:text-sm text-text-muted">
                        Continue active 1-on-1 conversations and review guidance history.
                    </p>
                </div>

                {Array.isArray(conversations) && (
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-brand-subtle text-brand-primary border border-brand-primary/20 shadow-2xs">
                        {conversations.length} Active {conversations.length === 1 ? "Chat" : "Chats"}
                    </span>
                )}
            </div>

            {/* Error Alert */}
            {serverError && (
                <div className="p-5 rounded-2xl bg-status-danger-subtle border border-status-danger-border flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-status-danger-subtle text-status-danger flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div className="flex-1 text-left">
                        <h4 className="text-sm font-semibold text-status-danger">
                            Failed to load conversations
                        </h4>
                        <p className="text-xs text-text-secondary mt-0.5">
                            {serverError?.status ? `Status ${serverError.status}: ` : ""}{serverError?.message || "Please try again."}
                        </p>
                        <button
                            type="button"
                            onClick={() => dispatch(fetchConversations())}
                            className="mt-3 px-3.5 py-1.5 rounded-lg bg-status-danger hover:bg-red-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            )}

            {/* Quick Search */}
            {!serverError && Array.isArray(conversations) && conversations.length > 0 && (
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search conversations by mentor name or message..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-default bg-bg-surface text-text-primary text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-subtle focus:border-brand-primary placeholder:text-text-muted transition-colors"
                    />
                </div>
            )}

            {/* Conversation List */}
            {!serverError && (
                <MyMentorsList conversations={filteredConversations} />
            )}
        </div>
    );
}
