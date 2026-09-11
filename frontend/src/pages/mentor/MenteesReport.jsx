import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchReport, clearReportServerError } from "../../slices/mentor/MenteesSlice";

export default function MenteesReport() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { studentId } = useParams();

    const { report, reportLoading, serverError } = useSelector((state) => state.mentees);

    useEffect(() => {
        if (studentId) {
            dispatch(fetchReport(studentId));
        }
        return () => {
            dispatch(clearReportServerError());
        };
    }, [studentId, dispatch]);

    function handleBack() {
        navigate("/mentor/mentees");
    }

    const renderListOrText = (content) => {
        if (!content) return <span className="text-slate-400 dark:text-zinc-500 italic">Not available</span>;
        if (Array.isArray(content)) {
            return (
                <ul className="space-y-1.5 list-disc list-inside text-slate-700 dark:text-zinc-300 text-sm">
                    {content.map((item, idx) => (
                        <li key={idx} className="leading-relaxed">{item}</li>
                    ))}
                </ul>
            );
        }
        return <p className="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">{content}</p>;
    };

    if (reportLoading) {
        return (
            <div className="p-6 sm:p-8 lg:p-10 max-w-5xl mx-auto space-y-8 animate-pulse text-left">
                <div className="h-10 w-32 bg-slate-200 dark:bg-zinc-800 rounded-xl"></div>
                <div className="h-40 bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-3xl p-6 space-y-3">
                    <div className="w-48 h-6 bg-slate-200 dark:bg-zinc-800 rounded"></div>
                    <div className="w-full h-4 bg-slate-200/60 dark:bg-zinc-800/60 rounded"></div>
                    <div className="w-3/4 h-4 bg-slate-200/60 dark:bg-zinc-800/60 rounded"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-64 bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-3xl p-6"></div>
                    <div className="h-64 bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-3xl p-6"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 sm:p-8 lg:p-10 max-w-5xl mx-auto space-y-8 transition-colors duration-300 text-left">
            {/* Top Navigation & Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-50/60 hover:bg-indigo-100/70 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-indigo-900 dark:text-zinc-200 text-xs font-semibold border border-indigo-100 dark:border-zinc-700 transition-colors cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Mentees
                    </button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Mentee Assessment Report
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
                            AI-powered candidate analysis and mentorship roadmap
                        </p>
                    </div>
                </div>

                <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                    Comprehensive Analysis
                </span>
            </div>

            {serverError ? (
                <div className="p-6 rounded-3xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 space-y-3">
                    <h3 className="text-base font-bold text-red-900 dark:text-red-200">
                        {serverError.status ? `Error (${serverError.status})` : "Failed to load report"}
                    </h3>
                    <p className="text-xs sm:text-sm text-red-700 dark:text-red-300">
                        {serverError.message || "Could not retrieve the evaluation report for this mentee."}
                    </p>
                    <button
                        type="button"
                        onClick={() => dispatch(fetchReport(studentId))}
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                        Retry Fetch
                    </button>
                </div>
            ) : !report ? (
                <div className="p-12 rounded-3xl bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 text-center space-y-3">
                    <p className="text-sm text-slate-500 dark:text-zinc-400">
                        No report data generated yet for this student.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Mentor Guidance Banner */}
                    {report.mentorGuidance && (
                        <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-indigo-50/80 via-white to-slate-50 dark:from-indigo-950/40 dark:via-zinc-900 dark:to-zinc-900 border border-indigo-100 dark:border-indigo-900/60 shadow-xs space-y-2">
                            <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-400">
                                <span className="text-lg">💡</span>
                                <h3 className="text-base font-bold">Mentor Guidance & Coaching Recommendation</h3>
                            </div>
                            <div className="pl-7">
                                {renderListOrText(report.mentorGuidance)}
                            </div>
                        </div>
                    )}

                    {/* Career Summary & Goals */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-zinc-300 flex items-center justify-center shrink-0 text-sm">
                                    🎯
                                </div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">Career Goals</h3>
                            </div>
                            <div className="pt-2 border-t border-[#E2E8F0]/80 dark:border-zinc-800/80">
                                {renderListOrText(report.careerGoals || report.careerSummary)}
                            </div>
                        </div>

                        <div className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-zinc-300 flex items-center justify-center shrink-0 text-sm">
                                    📑
                                </div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">Profile Overview</h3>
                            </div>
                            <div className="pt-2 border-t border-[#E2E8F0]/80 dark:border-zinc-800/80">
                                {renderListOrText(report.careerSummary || report.careerGoals)}
                            </div>
                        </div>
                    </div>

                    {/* Strengths & Weaknesses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[#FFFFFF] dark:bg-zinc-900 border border-emerald-200/60 dark:border-emerald-900/50 rounded-3xl p-6 shadow-xs space-y-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 text-sm">
                                    💪
                                </div>
                                <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-300">Candidate Strengths</h3>
                            </div>
                            <div className="pt-2 border-t border-emerald-100 dark:border-emerald-900/40">
                                {renderListOrText(report.strengths)}
                            </div>
                        </div>

                        <div className="bg-[#FFFFFF] dark:bg-zinc-900 border border-rose-200/60 dark:border-rose-900/50 rounded-3xl p-6 shadow-xs space-y-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-rose-100/80 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center shrink-0 text-sm">
                                    ⚠️
                                </div>
                                <h3 className="text-base font-bold text-rose-900 dark:text-rose-300">Areas for Improvement</h3>
                            </div>
                            <div className="pt-2 border-t border-rose-100 dark:border-rose-900/40">
                                {renderListOrText(report.weaknesses)}
                            </div>
                        </div>
                    </div>

                    {/* Missing Skills & Value Addition */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-zinc-300 flex items-center justify-center shrink-0 text-sm">
                                    🧩
                                </div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">Missing Target Skills</h3>
                            </div>
                            <div className="pt-2 border-t border-[#E2E8F0]/80 dark:border-zinc-800/80">
                                {renderListOrText(report.missingSkills)}
                            </div>
                        </div>

                        <div className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-blue-100/80 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0 text-sm">
                                    🚀
                                </div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">High Value Additions</h3>
                            </div>
                            <div className="pt-2 border-t border-[#E2E8F0]/80 dark:border-zinc-800/80">
                                {renderListOrText(report.valueAddingSkills)}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}