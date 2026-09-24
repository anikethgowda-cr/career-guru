import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMentorDashboardData, clearMentorDashboardState } from "../../slices/mentor/MentorDashboardSlice";

import TotalMentees from "../../components/mentor/dashboard/TotalMentees";
import MyMentees from "../../components/mentor/dashboard/MyMentees";
import PauseMentorship from "../../components/mentor/dashboard/PauseMentorship";

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
                <div className="h-44 bg-bg-surface border border-border-default rounded-xl p-8 space-y-4">
                    <div className="w-48 h-6 bg-bg-muted rounded"></div>
                    <div className="w-96 h-4 bg-bg-muted/60 rounded"></div>
                </div>

                {/* Main Content Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    <div className="lg:col-span-2 h-96 bg-bg-surface border border-border-default rounded-xl p-6"></div>
                    <div className="lg:col-span-1 space-y-6">
                        <div className="h-28 bg-bg-surface border border-border-default rounded-xl p-6"></div>
                        <div className="h-64 bg-bg-surface border border-border-default rounded-xl p-6"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (serverError) {
        return (
            <div className="p-6 sm:p-8 max-w-xl mx-auto mt-12 text-left">
                <div className="p-6 rounded-xl bg-status-danger-subtle border border-status-danger/30 space-y-3">
                    <h3 className="text-base font-bold text-status-danger">
                        Failed to load dashboard data
                    </h3>
                    <p className="text-xs sm:text-sm text-text-secondary">
                        {serverError.message || "An unexpected error occurred while fetching mentor dashboard stats."}
                    </p>
                    <button
                        type="button"
                        onClick={() => dispatch(fetchMentorDashboardData())}
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
            {/* Hero Welcome Banner */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50/80 via-white to-slate-50 dark:from-bg-surface dark:via-bg-surface dark:to-bg-muted border border-border-default p-6 sm:p-8 shadow-subtle">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-subtle text-brand-primary text-xs font-semibold border border-brand-primary/20">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                            </svg>
                            <span>Mentor Workspace</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                            Welcome back, {user?.username || "Mentor"}!
                        </h1>
                        <p className="text-sm text-text-secondary max-w-xl">
                            Empower your mentees with expert feedback, analyze their career roadmaps, and guide them to high-impact career outcomes.
                        </p>
                    </div>


                </div>

                <div className="absolute -top-16 -right-16 w-48 h-48 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Main Content Grid: Recent Mentees (2 col) & Sidebar Controls (1 col) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                <div className="order-2 lg:order-1 lg:col-span-2 flex flex-col">
                    <MyMentees mentees={recentMentees} />
                </div>
                <div className="order-1 lg:order-2 lg:col-span-1 flex flex-col gap-6">
                    <TotalMentees />
                    <PauseMentorship />
                </div>
            </div>
        </div>
    );
}