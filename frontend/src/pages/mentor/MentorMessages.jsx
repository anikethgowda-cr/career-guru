import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchConversations } from "../../slices/MentorChatSlice";
import MentorMessagesList from "../../components/mentor/messages/MentorMessagesList";

export default function MentorMessages() {
    const dispatch = useDispatch();
    const { conversations, conversationsLoading, serverError } = useSelector(
        (state) => state.mentorChat
    );

    useEffect(() => {
        dispatch(fetchConversations());
    }, [dispatch]);

    if (conversationsLoading) {
        return (
            <div className="p-6 sm:p-8 lg:p-10 max-w-5xl mx-auto space-y-8 animate-pulse text-left">
                <div className="space-y-2">
                    <div className="w-48 h-8 bg-bg-muted rounded-lg"></div>
                    <div className="w-80 h-4 bg-bg-muted/60 rounded"></div>
                </div>

                <div className="bg-bg-surface border border-border-default rounded-xl p-6 space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-4 py-3">
                            <div className="w-12 h-12 rounded-lg bg-bg-muted shrink-0"></div>
                            <div className="flex-1 space-y-2">
                                <div className="w-36 h-4 bg-bg-muted rounded"></div>
                                <div className="w-64 h-3 bg-bg-muted/60 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (serverError) {
        return (
            <div className="p-6 sm:p-8 max-w-xl mx-auto mt-12 text-left">
                <div className="p-6 rounded-xl bg-status-danger-subtle border border-status-danger/30 space-y-3">
                    <h3 className="text-base font-bold text-status-danger">
                        Failed to load conversations
                    </h3>
                    <p className="text-xs sm:text-sm text-text-secondary">
                        {serverError.message || "An unexpected error occurred while loading student message threads."}
                    </p>
                    <button
                        type="button"
                        onClick={() => dispatch(fetchConversations())}
                        className="px-4 py-2 rounded-lg bg-status-danger hover:bg-status-danger/90 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 sm:p-8 lg:p-10 max-w-5xl mx-auto space-y-8 transition-colors duration-200 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                            Messages
                        </h1>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-subtle text-brand-primary border border-brand-primary/20">
                            {conversations?.length || 0} Threads
                        </span>
                    </div>
                    <p className="text-sm text-text-secondary">
                        Direct messaging and mentorship conversations with your enrolled students.
                    </p>
                </div>
            </div>

            <MentorMessagesList conversations={conversations} />
        </div>
    );
}
