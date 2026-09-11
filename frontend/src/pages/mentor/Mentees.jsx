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
                    <div className="w-48 h-8 bg-slate-200 dark:bg-zinc-800 rounded-xl"></div>
                    <div className="w-80 h-4 bg-slate-200/60 dark:bg-zinc-800/60 rounded"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div key={n} className="h-80 bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-3xl p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-slate-200 dark:bg-zinc-800 rounded-2xl"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="w-32 h-4 bg-slate-200 dark:bg-zinc-800 rounded"></div>
                                    <div className="w-44 h-3 bg-slate-200/60 dark:bg-zinc-800/60 rounded"></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 pt-4">
                                <div className="h-14 bg-slate-200/40 dark:bg-zinc-800/40 rounded-xl"></div>
                                <div className="h-14 bg-slate-200/40 dark:bg-zinc-800/40 rounded-xl"></div>
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
                <div className="p-6 rounded-3xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 space-y-3">
                    <h3 className="text-base font-bold text-red-900 dark:text-red-200">
                        Failed to load mentees
                    </h3>
                    <p className="text-xs sm:text-sm text-red-700 dark:text-red-300">
                        {serverError.message || "An error occurred while fetching your assigned mentees."}
                    </p>
                    <button
                        type="button"
                        onClick={() => dispatch(fetchMentees())}
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto space-y-8 transition-colors duration-300 text-left">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            My Mentees
                        </h1>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-zinc-800 text-indigo-700 dark:text-zinc-300 border border-indigo-100 dark:border-zinc-700">
                            {mentees.length} Total
                        </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-zinc-400">
                        Students who have engaged in mentorship, requested feedback, or messaged you.
                    </p>
                </div>
            </div>

            {/* Mentees Grid or Empty State */}
            {mentees.length === 0 ? (
                <div className="p-12 sm:p-16 rounded-3xl bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50/60 dark:bg-zinc-800 border border-indigo-100 dark:border-zinc-700 mx-auto flex items-center justify-center text-3xl">
                        👥
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            No mentees connected yet
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
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