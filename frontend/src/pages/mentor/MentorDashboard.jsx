import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMentorDashboardData, clearMentorDashboardState } from "../../slices/mentor/MentorDashboardSlice";

import TotalMentees from "../../components/mentor/dashboard/TotalMentees";
import TotalConversations from "../../components/mentor/dashboard/TotalConversations";
import Time from "../../components/mentor/dashboard/Time";
import MyMentees from "../../components/mentor/dashboard/MyMentees";
import PauseMentorship from "../../components/mentor/dashboard/PauseMentorship";
import QuickAccess from "../../components/mentor/dashboard/QuickAccess";

export default function MentorDashboard() {
    const dispatch = useDispatch();

    const { user } = useSelector((state) => state.auth);
    const { recentMentees, loading, serverError } = useSelector((state) => state.mentorDashboard);

    useEffect(() => {
        dispatch(fetchMentorDashboardData());
        return () => {
            dispatch(clearMentorDashboardState());
        };
    }, [dispatch]);

    if (loading) {
        return (
            <div className="p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto space-y-8 animate-pulse text-left">
                {/* Hero Skeleton */}
                <div className="h-44 bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-3xl p-8 space-y-4">
                    <div className="w-48 h-6 bg-slate-200 dark:bg-zinc-800 rounded"></div>
                    <div className="w-96 h-4 bg-slate-200/60 dark:bg-zinc-800/60 rounded"></div>
                </div>

                {/* Stats Row Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-28 bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-3xl p-6"></div>
                    ))}
                </div>

                {/* Main Content Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-72 bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-3xl p-6"></div>
                    <div className="h-72 bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-3xl p-6"></div>
                </div>
            </div>
        );
    }

    if (serverError) {
        return (
            <div className="p-6 sm:p-8 max-w-xl mx-auto mt-12 text-left">
                <div className="p-6 rounded-3xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 space-y-3">
                    <h3 className="text-base font-bold text-red-900 dark:text-red-200">
                        Failed to load dashboard data
                    </h3>
                    <p className="text-xs sm:text-sm text-red-700 dark:text-red-300">
                        {serverError.message || "An unexpected error occurred while fetching mentor dashboard stats."}
                    </p>
                    <button
                        type="button"
                        onClick={() => dispatch(fetchMentorDashboardData())}
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
            {/* Hero Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-50/80 via-white to-slate-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950 border border-indigo-100 dark:border-zinc-800 p-6 sm:p-8 shadow-xs">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-zinc-800 text-indigo-700 dark:text-zinc-300 text-xs font-semibold border border-indigo-100 dark:border-zinc-700">
                            <span>🎓</span>
                            <span>Mentor Workspace</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Welcome back, {user?.username || "Mentor"}!
                        </h1>
                        <p className="text-sm text-slate-600 dark:text-zinc-400 max-w-xl">
                            Empower your mentees with expert feedback, analyze their career roadmaps, and guide them to high-impact career outcomes.
                        </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-3">
                        <div className="px-4 py-2.5 rounded-2xl bg-[#FFFFFF]/90 dark:bg-zinc-800/80 border border-[#E2E8F0] dark:border-zinc-700 shadow-xs flex items-center gap-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                Portal Online
                            </span>
                        </div>
                    </div>
                </div>

                <div className="absolute -top-16 -right-16 w-48 h-48 bg-indigo-400/15 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Stat Row: Total Conversations, Total Mentees, Clock */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <TotalConversations />
                <TotalMentees />
                <Time />
            </div>

            {/* Main Operational Row: Recent Mentees (2 col) & Mentorship Status (1 col) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                <div className="lg:col-span-2">
                    <MyMentees mentees={recentMentees} />
                </div>
                <div className="lg:col-span-1">
                    <PauseMentorship />
                </div>
            </div>

            {/* Quick Access */}
            <QuickAccess />
        </div>
    );
}