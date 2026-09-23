import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMentees, clearMentees } from "../../slices/mentor/MenteesSlice";
import MenteeCard from "../../components/mentor/mentees/MenteeCard";

export default function Mentees() {
    const dispatch = useDispatch();
    const { mentees, loading, serverError } = useSelector((state) => state.mentees);

    useEffect(() => {
        dispatch(fetchMentees());
        return () => {
            dispatch(clearMentees());
        };
    }, [dispatch]);

    if (loading) {
        return (
            <div className="p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto space-y-8 animate-pulse text-left">
                <div className="space-y-2">
                    <div className="w-48 h-8 bg-bg-muted rounded-lg"></div>
                    <div className="w-80 h-4 bg-bg-muted/60 rounded"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div key={n} className="h-80 bg-bg-surface border border-border-default rounded-xl p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-bg-muted rounded-lg"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="w-32 h-4 bg-bg-muted rounded"></div>
                                    <div className="w-44 h-3 bg-bg-muted/60 rounded"></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 pt-4">
                                <div className="h-14 bg-bg-muted/40 rounded-lg"></div>
                                <div className="h-14 bg-bg-muted/40 rounded-lg"></div>
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
                        Failed to load mentees
                    </h3>
                    <p className="text-xs sm:text-sm text-text-secondary">
                        {serverError.message || "An error occurred while fetching your assigned mentees."}
                    </p>
                    <button
                        type="button"
                        onClick={() => dispatch(fetchMentees())}
                        className="px-4 py-2 rounded-lg bg-status-danger hover:bg-status-danger/90 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto space-y-8 transition-colors duration-200 text-left">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                            My Mentees
                        </h1>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-subtle text-brand-primary border border-brand-primary/20">
                            {mentees.length} Total
                        </span>
                    </div>
                    <p className="text-sm text-text-secondary">
                        Students who have engaged in mentorship, requested feedback, or messaged you.
                    </p>
                </div>
            </div>

            {/* Mentees Grid or Empty State */}
            {mentees.length === 0 ? (
                <div className="p-12 sm:p-16 rounded-xl bg-bg-surface border border-border-default text-center space-y-4 shadow-subtle">
                    <div className="w-16 h-16 rounded-xl bg-brand-subtle text-brand-primary mx-auto flex items-center justify-center">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold text-text-primary">
                            No mentees connected yet
                        </h3>
                        <p className="text-xs sm:text-sm text-text-muted max-w-md mx-auto">
                            When students find you on Explore Mentors and initiate conversations, their profile cards and assessment reports will appear here.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mentees.map((mentee) => (
                        <MenteeCard
                            key={mentee.conversationId}
                            mentee={mentee}
                            studentId={mentee?.student?._id}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}