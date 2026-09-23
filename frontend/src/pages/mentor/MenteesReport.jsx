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
        if (!content) return <span className="text-text-muted italic">Not available</span>;
        if (Array.isArray(content)) {
            return (
                <ul className="space-y-1.5 list-disc list-inside text-text-secondary text-sm">
                    {content.map((item, idx) => (
                        <li key={idx} className="leading-relaxed">{item}</li>
                    ))}
                </ul>
            );
        }
        return <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">{content}</p>;
    };

    if (reportLoading) {
        return (
            <div className="p-6 sm:p-8 lg:p-10 max-w-5xl mx-auto space-y-8 animate-pulse text-left">
                <div className="h-10 w-32 bg-bg-muted rounded-lg"></div>
                <div className="h-40 bg-bg-surface border border-border-default rounded-xl p-6 space-y-3">
                    <div className="w-48 h-6 bg-bg-muted rounded"></div>
                    <div className="w-full h-4 bg-bg-muted/60 rounded"></div>
                    <div className="w-3/4 h-4 bg-bg-muted/60 rounded"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-64 bg-bg-surface border border-border-default rounded-xl p-6"></div>
                    <div className="h-64 bg-bg-surface border border-border-default rounded-xl p-6"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 sm:p-8 lg:p-10 max-w-5xl mx-auto space-y-8 transition-colors duration-200 text-left">
            {/* Top Navigation & Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-bg-muted hover:bg-border-default text-text-primary text-xs font-semibold border border-border-default transition-colors cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Mentees
                    </button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                            Mentee Assessment Report
                        </h1>
                        <p className="text-xs sm:text-sm text-text-muted">
                            AI-powered candidate analysis and mentorship roadmap
                        </p>
                    </div>
                </div>

                <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-semibold bg-status-success-subtle text-status-success border border-status-success/20">
                    Comprehensive Analysis
                </span>
            </div>

            {serverError ? (
                <div className="p-6 rounded-xl bg-status-danger-subtle border border-status-danger/30 space-y-3">
                    <h3 className="text-base font-bold text-status-danger">
                        {serverError.status ? `Error (${serverError.status})` : "Failed to load report"}
                    </h3>
                    <p className="text-xs sm:text-sm text-text-secondary">
                        {serverError.message || "Could not retrieve the evaluation report for this mentee."}
                    </p>
                    <button
                        type="button"
                        onClick={() => dispatch(fetchReport(studentId))}
                        className="px-4 py-2 rounded-lg bg-status-danger hover:bg-status-danger/90 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                        Retry Fetch
                    </button>
                </div>
            ) : !report ? (
                <div className="p-12 rounded-xl bg-bg-surface border border-border-default text-center space-y-3 shadow-subtle">
                    <p className="text-sm text-text-muted">
                        No report data generated yet for this student.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Mentor Guidance Banner */}
                    {report.mentorGuidance && (
                        <div className="p-6 sm:p-7 rounded-xl bg-gradient-to-br from-indigo-50/80 via-white to-slate-50 dark:from-brand-subtle dark:via-bg-surface dark:to-bg-surface border border-brand-primary/30 shadow-subtle space-y-2">
                            <div className="flex items-center gap-2.5 text-brand-primary">
                                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                <h3 className="text-base font-bold">Mentor Guidance & Coaching Recommendation</h3>
                            </div>
                            <div className="pl-7">
                                {renderListOrText(report.mentorGuidance)}
                            </div>
                        </div>
                    )}

                    {/* Career Summary & Goals */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-bg-surface border border-border-default rounded-xl p-6 shadow-subtle space-y-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-brand-subtle text-brand-primary flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-base font-bold text-text-primary">Career Goals</h3>
                            </div>
                            <div className="pt-2 border-t border-border-default">
                                {renderListOrText(report.careerGoals || report.careerSummary)}
                            </div>
                        </div>

                        <div className="bg-bg-surface border border-border-default rounded-xl p-6 shadow-subtle space-y-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-brand-subtle text-brand-primary flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-base font-bold text-text-primary">Profile Overview</h3>
                            </div>
                            <div className="pt-2 border-t border-border-default">
                                {renderListOrText(report.careerSummary || report.careerGoals)}
                            </div>
                        </div>
                    </div>

                    {/* Strengths & Weaknesses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-bg-surface border border-status-success/30 rounded-xl p-6 shadow-subtle space-y-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-status-success-subtle text-status-success flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-base font-bold text-status-success">Candidate Strengths</h3>
                            </div>
                            <div className="pt-2 border-t border-status-success/20">
                                {renderListOrText(report.strengths)}
                            </div>
                        </div>

                        <div className="bg-bg-surface border border-status-danger/30 rounded-xl p-6 shadow-subtle space-y-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-status-danger-subtle text-status-danger flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <h3 className="text-base font-bold text-status-danger">Areas for Improvement</h3>
                            </div>
                            <div className="pt-2 border-t border-status-danger/20">
                                {renderListOrText(report.weaknesses)}
                            </div>
                        </div>
                    </div>

                    {/* Missing Skills & Value Addition */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-bg-surface border border-border-default rounded-xl p-6 shadow-subtle space-y-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-brand-subtle text-brand-primary flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <h3 className="text-base font-bold text-text-primary">Missing Target Skills</h3>
                            </div>
                            <div className="pt-2 border-t border-border-default">
                                {renderListOrText(report.missingSkills)}
                            </div>
                        </div>

                        <div className="bg-bg-surface border border-border-default rounded-xl p-6 shadow-subtle space-y-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-brand-subtle text-brand-primary flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                                <h3 className="text-base font-bold text-text-primary">High Value Additions</h3>
                            </div>
                            <div className="pt-2 border-t border-border-default">
                                {renderListOrText(report.valueAddingSkills)}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}