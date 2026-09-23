import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLearningPlan, generateLearningPlan } from "../../slices/user/LearningPlanSlice";
import WeeksPlan from "../../components/user/learningPlan/WeeksPlan";

export default function LearningPlan() {
    const dispatch = useDispatch();

    const { data, targetRole, missingSkills, loading, generating, serverError } = useSelector((state) => {
        return state.learningPlan;
    });

    useEffect(() => {
        dispatch(fetchLearningPlan());
    }, [dispatch]);

    // Shimmer Skeleton Loader
    if (loading) {
        return (
            <div className="p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto space-y-8 text-left animate-pulse">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border-default">
                    <div className="space-y-2">
                        <div className="w-64 h-8 bg-bg-muted rounded-lg"></div>
                        <div className="w-80 h-4 bg-bg-muted rounded-lg"></div>
                    </div>
                    <div className="w-32 h-8 bg-bg-muted rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div key={n} className="bg-bg-surface border border-border-default rounded-xl p-6 h-56 flex flex-col justify-between">
                            <div className="flex justify-between items-center">
                                <div className="w-20 h-5 bg-bg-muted rounded-full"></div>
                                <div className="w-16 h-4 bg-bg-muted rounded"></div>
                            </div>
                            <div className="space-y-2">
                                <div className="w-full h-5 bg-bg-muted rounded"></div>
                                <div className="w-3/4 h-4 bg-bg-muted rounded"></div>
                            </div>
                            <div className="w-full h-10 bg-bg-muted rounded-lg"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto space-y-8 text-left">
            {/* Server Error Alert */}
            {serverError && !loading && (
                <div className="p-5 rounded-xl bg-status-danger-subtle border border-red-200 dark:border-red-900/60 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-status-danger shrink-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div className="flex-1 text-left">
                        <h4 className="text-sm font-semibold text-red-900 dark:text-red-200">Failed to load learning plan</h4>
                        <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">
                            {serverError?.status ? `Error ${serverError.status}: ` : ""}{serverError?.message || "An unexpected error occurred."}
                        </p>
                        <button
                            type="button"
                            onClick={() => dispatch(fetchLearningPlan())}
                            className="mt-3 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition-colors cursor-pointer"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            )}

            {/* Empty State / Plan Generator Screen */}
            {!loading && !serverError && !data && (
                <div className="max-w-3xl mx-auto space-y-6">
                    {/* Header Banner */}
                    <div className="bg-bg-surface border border-border-default border-t-4 border-t-brand-primary rounded-xl p-8 sm:p-10 shadow-card space-y-8 text-left">
                        
                        {/* Title & Badge */}
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-subtle border border-border-default text-brand-primary text-xs font-semibold">
                                <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
                                AI Personalized Roadmap
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                                Build Your Learning Plan
                            </h1>

                            <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
                                Based on your resume analysis, we have pinpointed key skill gaps that will accelerate your readiness for top industry positions.
                            </p>
                        </div>

                        {/* Target Role Capsule */}
                        {targetRole && (
                            <div className="p-4 rounded-xl bg-bg-muted border border-border-default flex items-center justify-between gap-4">
                                <div className="space-y-0.5">
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                                        Target Role
                                    </span>
                                    <h2 className="text-base sm:text-lg font-bold text-text-primary">
                                        {targetRole}
                                    </h2>
                                </div>
                                <span className="px-3 py-1 rounded-lg bg-bg-surface text-xs font-semibold text-text-secondary border border-border-default shadow-xs">
                                    Active Target
                                </span>
                            </div>
                        )}

                        {/* Missing Skills Section */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                                    Skills You Should Improve
                                </h3>
                                <span className="text-xs text-text-muted">
                                    {missingSkills?.length || 0} gap{missingSkills?.length === 1 ? "" : "s"} identified
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-1">
                                {missingSkills && missingSkills.length > 0 ? (
                                    missingSkills.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/60 shadow-xs"
                                        >
                                            {skill}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-xs text-text-muted italic">
                                        No missing skills detected.
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* CTA Info Box */}
                        <div className="p-5 rounded-xl bg-bg-app border border-border-default text-left space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-brand-subtle text-brand-primary flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <p className="text-xs text-text-secondary leading-relaxed">
                                    CareerGuru AI will generate a comprehensive <strong className="font-semibold text-text-primary">6-week milestone curriculum</strong> packed with structured sessions, direct learning resources, and practical exercises.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => dispatch(generateLearningPlan())}
                                disabled={generating}
                                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {generating ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Generating 6-Week Plan with AI...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        <span>Generate Learning Plan</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Plan Display View */}
            {data && <WeeksPlan />}
        </div>
    );
}