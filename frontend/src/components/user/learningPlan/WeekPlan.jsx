import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchLearningPlan } from "../../../slices/user/LearningPlanSlice";

export default function WeekPlan() {
    const dispatch = useDispatch();
    const { weekNumber } = useParams();

    const { data, loading, serverError } = useSelector(
        (state) => state.learningPlan
    );

    useEffect(() => {
        if (!data) {
            dispatch(fetchLearningPlan());
        }
    }, [data, dispatch]);

    const week = data?.weeks?.find((w) => w.weekNumber === Number(weekNumber));

    // Loading State
    if (loading) {
        return (
            <div className="p-6 sm:p-8 lg:p-10 max-w-5xl mx-auto space-y-8 text-left animate-pulse">
                <div className="w-36 h-8 bg-bg-muted rounded-lg"></div>
                <div className="bg-bg-surface border border-border-default rounded-xl p-6 h-32"></div>
                <div className="space-y-4">
                    <div className="bg-bg-surface border border-border-default rounded-xl p-6 h-48"></div>
                    <div className="bg-bg-surface border border-border-default rounded-xl p-6 h-48"></div>
                </div>
            </div>
        );
    }

    // Server Error State
    if (serverError) {
        return (
            <div className="p-6 sm:p-8 lg:p-10 max-w-5xl mx-auto text-left">
                <div className="p-5 rounded-xl bg-status-danger-subtle border border-status-danger/30 text-left">
                    <h4 className="text-sm font-semibold text-status-danger">Failed to load week curriculum</h4>
                    <p className="text-xs text-text-secondary mt-1">
                        {serverError?.status ? `Error ${serverError.status}: ` : ""}{serverError?.message || (typeof serverError === "string" ? serverError : "Failed to load week curriculum")}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                        <button
                            type="button"
                            onClick={() => dispatch(fetchLearningPlan())}
                            className="px-3.5 py-1.5 rounded-lg bg-status-danger hover:bg-status-danger/90 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        >
                            Retry Loading
                        </button>
                        <Link
                            to="/user/learning-plan"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-status-danger hover:underline"
                        >
                            &larr; Back to Learning Roadmap
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Week Not Found
    if (data && !week) {
        return (
            <div className="p-6 sm:p-8 lg:p-10 max-w-5xl mx-auto text-left space-y-4">
                <div className="bg-bg-surface border border-border-default rounded-xl p-8 text-center space-y-3 shadow-subtle">
                    <h3 className="text-lg font-bold text-text-primary">Week Not Found</h3>
                    <p className="text-xs text-text-secondary">
                        The requested curriculum milestone (Week {weekNumber}) could not be located in your active learning plan.
                    </p>
                    <Link
                        to="/user/learning-plan"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                        &larr; Return to Learning Roadmap
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 sm:p-8 lg:p-10 max-w-5xl mx-auto space-y-8 text-left">
            {/* Back Navigation Bar */}
            <div>
                <Link
                    to="/user/learning-plan"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-brand-primary transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Back to Learning Roadmap</span>
                </Link>
            </div>

            {/* Week Header Hero Card */}
            {week && (
                <div className="bg-bg-surface border border-border-default border-t-4 border-t-brand-primary rounded-xl p-6 sm:p-8 shadow-subtle space-y-3 text-left">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="px-3 py-1 rounded-md text-xs font-bold bg-brand-subtle text-brand-primary border border-brand-primary/20">
                            WEEK {week.weekNumber < 10 ? `0${week.weekNumber}` : week.weekNumber}
                        </span>
                        <span className="text-xs font-medium text-text-muted">
                            {week.sessions?.length || 0} Structured Sessions
                        </span>
                    </div>

                    <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                            Weekly Objective
                        </span>
                        <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                            {week.overview}
                        </h1>
                    </div>
                </div>
            )}

            {/* Sessions List */}
            {week && (
                <div className="space-y-6 text-left">
                    <div className="flex items-center justify-between pb-2 border-b border-border-default">
                        <h2 className="text-base font-bold text-text-primary">
                            Curriculum Sessions
                        </h2>
                        <span className="text-xs text-text-muted">
                            Complete sequentially for best retention
                        </span>
                    </div>

                    {week.sessions?.map((plan, index) => (
                        <div
                            key={index}
                            className="bg-bg-surface border border-border-default border-l-4 border-l-brand-primary rounded-xl p-6 sm:p-7 shadow-subtle space-y-6 text-left"
                        >
                            {/* Session Header & Skills */}
                            <div className="space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-bg-muted text-text-secondary border border-border-default">
                                        Session {index + 1 < 10 ? `0${index + 1}` : index + 1}
                                    </span>

                                    {plan.skills && plan.skills.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 items-center">
                                            <span className="text-[11px] font-medium text-text-muted">Target Skills:</span>
                                            {plan.skills.map((skill, sIdx) => (
                                                <span
                                                    key={sIdx}
                                                    className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-brand-subtle text-brand-primary border border-brand-primary/20"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-lg sm:text-xl font-bold text-text-primary leading-tight">
                                    {plan.title}
                                </h3>
                            </div>

                            {/* Topics Covered */}
                            {plan.topics && plan.topics.length > 0 && (
                                <div className="space-y-2">
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                                        Topics Covered
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {plan.topics.map((topic, tIdx) => (
                                            <span
                                                key={tIdx}
                                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-bg-muted text-text-secondary border border-border-default flex items-center gap-1.5 shadow-xs"
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0"></span>
                                                {topic}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Study Materials & Resources */}
                            {plan.materials && plan.materials.length > 0 && (
                                <div className="space-y-2.5 pt-2 border-t border-border-default">
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                                        Study Materials & Resources
                                    </span>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {plan.materials.map((material, mIdx) => (
                                            <a
                                                key={mIdx}
                                                href={material.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between p-3 rounded-lg bg-bg-muted/50 border border-border-default hover:border-brand-primary/50 hover:bg-bg-muted shadow-xs transition-all duration-200 group"
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-brand-subtle text-brand-primary border border-brand-primary/20 shrink-0">
                                                        {material.type || "RESOURCE"}
                                                    </span>
                                                    <span className="text-xs sm:text-sm font-medium text-text-primary group-hover:text-brand-primary truncate">
                                                        {material.name}
                                                    </span>
                                                </div>

                                                <svg className="w-4 h-4 text-text-muted group-hover:text-brand-primary shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}