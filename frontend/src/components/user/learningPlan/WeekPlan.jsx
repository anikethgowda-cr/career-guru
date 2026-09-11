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
                <div className="w-36 h-8 bg-slate-200 dark:bg-zinc-800 rounded-xl"></div>
                <div className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-2xl p-6 h-32"></div>
                <div className="space-y-4">
                    <div className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-2xl p-6 h-48"></div>
                    <div className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-2xl p-6 h-48"></div>
                </div>
            </div>
        );
    }

    // Server Error State
    if (serverError) {
        return (
            <div className="p-6 sm:p-8 lg:p-10 max-w-5xl mx-auto text-left">
                <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-left">
                    <h4 className="text-sm font-semibold text-red-900 dark:text-red-200">Failed to load week curriculum</h4>
                    <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                        {serverError?.status ? `Error ${serverError.status}: ` : ""}{serverError?.message || (typeof serverError === "string" ? serverError : "Failed to load week curriculum")}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                        <button
                            type="button"
                            onClick={() => dispatch(fetchLearningPlan())}
                            className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        >
                            Retry Loading
                        </button>
                        <Link
                            to="/user/learning-plan"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 dark:text-red-300 hover:underline"
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
                <div className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-2xl p-8 text-center space-y-3">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Week Not Found</h3>
                    <p className="text-xs text-slate-600 dark:text-zinc-400">
                        The requested curriculum milestone (Week {weekNumber}) could not be located in your active learning plan.
                    </p>
                    <Link
                        to="/user/learning-plan"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-xs"
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
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Back to Learning Roadmap</span>
                </Link>
            </div>

            {/* Week Header Hero Card */}
            {week && (
                <div className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 border-t-4 border-t-indigo-500 dark:border-t-indigo-500 rounded-2xl p-6 sm:p-8 shadow-xs space-y-3 text-left">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50">
                            WEEK {week.weekNumber < 10 ? `0${week.weekNumber}` : week.weekNumber}
                        </span>
                        <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                            {week.sessions?.length || 0} Structured Sessions
                        </span>
                    </div>

                    <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                            Weekly Objective
                        </span>
                        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            {week.overview}
                        </h1>
                    </div>
                </div>
            )}

            {/* Sessions List */}
            {week && (
                <div className="space-y-6 text-left">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]/80 dark:border-zinc-800">
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">
                            Curriculum Sessions
                        </h2>
                        <span className="text-xs text-slate-500 dark:text-zinc-400">
                            Complete sequentially for best retention
                        </span>
                    </div>

                    {week.sessions?.map((plan, index) => (
                        <div
                            key={index}
                            className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 border-l-4 border-l-indigo-500 dark:border-l-indigo-500 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6 text-left"
                        >
                            {/* Session Header & Skills */}
                            <div className="space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                                        Session {index + 1 < 10 ? `0${index + 1}` : index + 1}
                                    </span>

                                    {plan.skills && plan.skills.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 items-center">
                                            <span className="text-[11px] font-medium text-slate-400 dark:text-zinc-500">Target Skills:</span>
                                            {plan.skills.map((skill, sIdx) => (
                                                <span
                                                    key={sIdx}
                                                    className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight">
                                    {plan.title}
                                </h3>
                            </div>

                            {/* Topics Covered */}
                            {plan.topics && plan.topics.length > 0 && (
                                <div className="space-y-2">
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                                        Topics Covered
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {plan.topics.map((topic, tIdx) => (
                                            <span
                                                key={tIdx}
                                                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-zinc-950 text-slate-700 dark:text-zinc-300 border border-slate-200/80 dark:border-zinc-800 flex items-center gap-1.5 shadow-2xs"
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 shrink-0"></span>
                                                {topic}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Study Materials & Resources */}
                            {plan.materials && plan.materials.length > 0 && (
                                <div className="space-y-2.5 pt-2 border-t border-[#E2E8F0]/60 dark:border-zinc-800/80">
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                                        Study Materials & Resources
                                    </span>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {plan.materials.map((material, mIdx) => (
                                            <a
                                                key={mIdx}
                                                href={material.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-950/60 border border-[#E2E8F0] dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-xs transition-all duration-200 group"
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/60 shrink-0">
                                                        {material.type || "RESOURCE"}
                                                    </span>
                                                    <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-zinc-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 truncate">
                                                        {material.name}
                                                    </span>
                                                </div>

                                                <svg className="w-4 h-4 text-slate-400 dark:text-zinc-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
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