import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchAssessmentReport, clearSelectedReport } from "../../slices/AssessmentReportSlice";

export default function AssessmentReportFullPage({ role = "user" }) {
    const { assessmentId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { selectedReport, reportLoading, reportError } = useSelector(
        (state) => state.assessmentReport
    );

    useEffect(() => {
        if (assessmentId) {
            dispatch(fetchAssessmentReport(assessmentId));
        }
        return () => {
            dispatch(clearSelectedReport());
        };
    }, [assessmentId, dispatch]);

    const handleRetry = () => {
        if (assessmentId) {
            dispatch(fetchAssessmentReport(assessmentId));
        }
    };

    const handleBack = () => {
        navigate(role === "mentor" ? "/mentor/assessment-report" : "/user/assessment-report");
    };

    const overall = selectedReport?.overallReport || {};
    const questions = selectedReport?.questionAnalysis || [];
    const videoURL = selectedReport?.videoURL || "";

    const getRecommendationBadge = (rec) => {
        switch (rec) {
            case "Strong Hire":
                return "bg-status-success-subtle text-status-success border-status-success/30";
            case "Hire":
                return "bg-brand-subtle text-brand-primary border-brand-primary/30";
            case "Needs Practice":
                return "bg-status-warning-subtle text-status-warning border-status-warning/30";
            case "Not Ready":
                return "bg-status-danger-subtle text-status-danger border-status-danger/30";
            default:
                return "bg-bg-muted text-text-secondary border-border-default";
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return "text-status-success";
        if (score >= 65) return "text-brand-primary";
        if (score >= 50) return "text-status-warning";
        return "text-status-danger";
    };

    const getScoreBadgeBg = (score) => {
        if (score >= 80) return "bg-status-success-subtle text-status-success border-status-success/30";
        if (score >= 65) return "bg-brand-subtle text-brand-primary border-brand-primary/30";
        if (score >= 50) return "bg-status-warning-subtle text-status-warning border-status-warning/30";
        return "bg-status-danger-subtle text-status-danger border-status-danger/30";
    };

    // ─── Loading / Generating State ──────────────────────────────────────────
    if (reportLoading) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
                <div className="max-w-md w-full bg-bg-surface border border-border-default rounded-2xl p-8 sm:p-10 shadow-elevated space-y-6">
                    <div className="relative w-16 h-16 mx-auto">
                        <div className="absolute inset-0 rounded-full border-4 border-brand-primary/20"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-brand-primary border-t-transparent animate-spin"></div>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-text-primary">
                            Generating AI Assessment Report
                        </h2>
                        <p className="text-sm text-text-secondary leading-relaxed">
                            Our AI is analyzing candidate speech transcripts, evaluating technical answers against industry standards, and scoring competencies.
                        </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-bg-muted border border-border-default text-xs text-text-muted flex items-center justify-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-primary animate-ping"></span>
                        <span>This may take 15–30 seconds for deep evaluations</span>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Error / Failed Generation State ─────────────────────────────────────
    if (reportError && !selectedReport) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                <div className="max-w-md w-full bg-bg-surface border border-border-default rounded-2xl p-8 shadow-elevated space-y-5">
                    <div className="w-14 h-14 rounded-full bg-status-danger-subtle text-status-danger mx-auto flex items-center justify-center">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.332.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-text-primary">
                            Report Generation Failed
                        </h2>
                        <p className="text-sm text-text-secondary leading-relaxed">
                            {reportError || "Unable to generate or retrieve the assessment report at this moment. You can try generating it again below."}
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleRetry}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-primary-hover shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Try Generating Report Again
                        </button>
                        <button
                            type="button"
                            onClick={handleBack}
                            className="px-4 py-2.5 rounded-xl bg-bg-muted text-text-secondary text-sm font-medium hover:bg-border-default border border-border-default transition cursor-pointer"
                        >
                            Back to Reports
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!selectedReport) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
                <p className="text-sm text-text-secondary">No report data found for this assessment.</p>
                <button
                    type="button"
                    onClick={handleBack}
                    className="px-4 py-2 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-primary-hover transition cursor-pointer"
                >
                    Back to Assessments
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8 text-left transition-colors duration-200">
            {/* Top Navigation & Breadcrumbs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-default">
                <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text-primary transition cursor-pointer"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Back to Assessments</span>
                </button>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">Assessment ID:</span>
                    <code className="text-xs font-mono px-2 py-0.5 rounded bg-bg-muted text-text-secondary border border-border-default">
                        {selectedReport?.assessmentId?._id || assessmentId}
                    </code>
                </div>
            </div>

            {/* Assessment Header Card */}
            <div className="bg-bg-surface border border-border-default rounded-2xl p-6 sm:p-8 shadow-card relative overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-subtle text-brand-primary border border-brand-primary/20">
                                AI Evaluated Report
                            </span>
                            {selectedReport?.assessmentId?.difficulty && (
                                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-bg-muted text-text-secondary border border-border-default uppercase tracking-wider">
                                    {selectedReport.assessmentId.difficulty}
                                </span>
                            )}
                            {overall?.finalRecommendation && (
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRecommendationBadge(overall.finalRecommendation)}`}>
                                    {overall.finalRecommendation}
                                </span>
                            )}
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                            {selectedReport?.assessmentId?.title || "Technical Interview Assessment"}
                        </h1>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-text-secondary">
                            <div>
                                <span className="text-text-muted">Candidate: </span>
                                <strong className="text-text-primary font-semibold">
                                    {selectedReport?.studentId?.username || "Candidate"}
                                </strong>
                            </div>
                            <span className="text-border-strong hidden sm:inline">•</span>
                            <div>
                                <span className="text-text-muted">Target Role: </span>
                                <strong className="text-text-primary font-semibold">
                                    {selectedReport?.targetRole || "Software Engineer"}
                                </strong>
                            </div>
                            <span className="text-border-strong hidden sm:inline">•</span>
                            <div>
                                <span className="text-text-muted">Mentor: </span>
                                <strong className="text-text-primary font-semibold">
                                    {selectedReport?.mentorId?.username || "Assigned Mentor"}
                                </strong>
                            </div>
                        </div>
                    </div>

                    {/* Overall Score Badge Banner */}
                    <div className="flex sm:flex-col items-center justify-center p-4 sm:p-6 rounded-2xl bg-bg-muted/50 border border-border-default min-w-[160px] text-center shrink-0">
                        <div className={`text-4xl sm:text-5xl font-black ${getScoreColor(overall.overallScore || 0)}`}>
                            {overall.overallScore ?? "--"}
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-text-muted mt-1">
                            Overall Score
                        </span>
                        <span className="text-[11px] text-text-muted mt-0.5">Out of 100</span>
                    </div>
                </div>
            </div>

            {/* Performance Metrics & Competency Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Technical Competency Card */}
                <div className="bg-bg-surface border border-border-default rounded-2xl p-6 shadow-card space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-brand-primary flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-text-primary">Technical Knowledge</h3>
                                <p className="text-xs text-text-muted">Domain accuracy and problem understanding</p>
                            </div>
                        </div>
                        <span className={`text-xl font-extrabold ${getScoreColor(overall.technicalScore || 0)}`}>
                            {overall.technicalScore ?? "--"}%
                        </span>
                    </div>
                    <div className="w-full h-3 bg-bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-brand-primary rounded-full transition-all duration-700"
                            style={{ width: `${Math.min(100, Math.max(0, overall.technicalScore || 0))}%` }}
                        ></div>
                    </div>
                </div>

                {/* Communication Competency Card */}
                <div className="bg-bg-surface border border-border-default rounded-2xl p-6 shadow-card space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-status-success flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-text-primary">Communication & Clarity</h3>
                                <p className="text-xs text-text-muted">Articulation, structure, and pacing</p>
                            </div>
                        </div>
                        <span className={`text-xl font-extrabold ${getScoreColor(overall.communicationScore || 0)}`}>
                            {overall.communicationScore ?? "--"}%
                        </span>
                    </div>
                    <div className="w-full h-3 bg-bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-status-success rounded-full transition-all duration-700"
                            style={{ width: `${Math.min(100, Math.max(0, overall.communicationScore || 0))}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Executive Summary Callout */}
            {overall.overallSummary && (
                <div className="bg-brand-subtle/40 border border-brand-primary/20 rounded-2xl p-6 shadow-xs space-y-2">
                    <div className="flex items-center gap-2 text-brand-primary">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="text-sm font-bold uppercase tracking-wider">Executive Evaluation Summary</h3>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">
                        {overall.overallSummary}
                    </p>
                </div>
            )}

            {/* Strengths & Actionable Improvements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="bg-bg-surface border border-border-default rounded-2xl p-6 shadow-card space-y-4">
                    <div className="flex items-center gap-2 text-status-success">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-base font-bold text-text-primary">Key Strengths Observed</h3>
                    </div>
                    {Array.isArray(overall.strengths) && overall.strengths.length > 0 ? (
                        <ul className="space-y-2.5">
                            {overall.strengths.map((str, idx) => (
                                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-text-secondary leading-relaxed">
                                    <span className="w-1.5 h-1.5 rounded-full bg-status-success mt-2 shrink-0"></span>
                                    <span>{str}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-xs text-text-muted italic">No specific strengths documented.</p>
                    )}
                </div>

                {/* Areas for Improvement */}
                <div className="bg-bg-surface border border-border-default rounded-2xl p-6 shadow-card space-y-4">
                    <div className="flex items-center gap-2 text-status-warning">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.332.192 3 1.732 3z" />
                        </svg>
                        <h3 className="text-base font-bold text-text-primary">Recommendations & Growth Areas</h3>
                    </div>
                    {Array.isArray(overall.areasForImprovement) && overall.areasForImprovement.length > 0 ? (
                        <ul className="space-y-2.5">
                            {overall.areasForImprovement.map((area, idx) => (
                                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-text-secondary leading-relaxed">
                                    <span className="w-1.5 h-1.5 rounded-full bg-status-warning mt-2 shrink-0"></span>
                                    <span>{area}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-xs text-text-muted italic">No specific growth areas documented.</p>
                    )}
                </div>
            </div>

            {/* Video Recording Review */}
            {videoURL ? (
                <div className="bg-bg-surface border border-border-default rounded-2xl p-6 shadow-card space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-brand-subtle text-brand-primary flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-text-primary">Interview Recording Review</h3>
                                <p className="text-xs text-text-muted">Recorded live stream of candidate responses</p>
                            </div>
                        </div>

                        <a
                            href={videoURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-muted hover:bg-border-default text-xs font-semibold text-text-secondary transition"
                        >
                            <span>Open In New Tab</span>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    </div>

                    <div className="relative aspect-video max-w-3xl mx-auto rounded-xl overflow-hidden bg-black border border-border-default shadow-sm">
                        <video
                            src={videoURL}
                            controls
                            playsInline
                            className="w-full h-full object-contain"
                        >
                            Your browser does not support HTML5 video playback.
                        </video>
                    </div>
                </div>
            ) : null}

            {/* Question-by-Question Deep Dive Analysis */}
            <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border-default">
                    <div>
                        <h2 className="text-xl font-bold text-text-primary">
                            Question-by-Question Analysis
                        </h2>
                        <p className="text-xs sm:text-sm text-text-muted">
                            Detailed AI scoring and feedback for each interview response
                        </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-bg-muted text-text-secondary border border-border-default">
                        {questions.length} Question{questions.length !== 1 ? "s" : ""}
                    </span>
                </div>

                <div className="space-y-4">
                    {questions.map((q, idx) => (
                        <div
                            key={idx}
                            className="bg-bg-surface border border-border-default rounded-2xl p-6 shadow-card space-y-5"
                        >
                            {/* Question Header */}
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-border-default">
                                <div className="space-y-1.5 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-xs shrink-0">
                                            {idx + 1}
                                        </span>
                                        <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                                            Question {idx + 1}
                                        </span>
                                    </div>
                                    <h4 className="text-base sm:text-lg font-semibold text-text-primary leading-snug">
                                        {q.question || `Question #${idx + 1}`}
                                    </h4>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <span className={`px-3 py-1 rounded-xl text-sm font-extrabold border ${getScoreBadgeBg(q.score * 10)}`}>
                                        {q.score} / 10
                                    </span>
                                </div>
                            </div>

                            {/* Candidate's Transcript */}
                            <div className="space-y-1.5">
                                <span className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
                                    </svg>
                                    Candidate Spoken Answer
                                </span>
                                <div className="p-4 rounded-xl bg-bg-muted border border-border-default text-xs sm:text-sm text-text-primary leading-relaxed font-sans italic">
                                    "{q.transcript ? q.transcript.trim() : "No answer spoken or recorded for this question."}"
                                </div>
                            </div>

                            {/* Constructive Feedback */}
                            {q.feedback && (
                                <div className="space-y-1.5">
                                    <span className="text-xs font-bold uppercase tracking-wider text-brand-primary flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                        Evaluation Feedback
                                    </span>
                                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed bg-brand-subtle/20 border border-brand-primary/10 rounded-xl p-3.5">
                                        {q.feedback}
                                    </p>
                                </div>
                            )}

                            {/* Strengths & Improvements in 2 cols */}
                            {(q.strengths?.length > 0 || q.improvements?.length > 0) && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                                    {q.strengths?.length > 0 && (
                                        <div className="p-3.5 rounded-xl bg-status-success-subtle/40 border border-status-success/20 space-y-1.5">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-status-success">
                                                Key Strengths
                                            </span>
                                            <ul className="space-y-1">
                                                {q.strengths.map((str, sIdx) => (
                                                    <li key={sIdx} className="text-xs text-text-secondary flex items-start gap-1.5">
                                                        <span className="text-status-success font-bold">•</span>
                                                        <span>{str}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {q.improvements?.length > 0 && (
                                        <div className="p-3.5 rounded-xl bg-status-warning-subtle/40 border border-status-warning/20 space-y-1.5">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-status-warning">
                                                Improvement Points
                                            </span>
                                            <ul className="space-y-1">
                                                {q.improvements.map((imp, iIdx) => (
                                                    <li key={iIdx} className="text-xs text-text-secondary flex items-start gap-1.5">
                                                        <span className="text-status-warning font-bold">•</span>
                                                        <span>{imp}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Ideal Model Answer */}
                            {q.idealAnswer && (
                                <div className="p-4 rounded-xl bg-bg-muted/70 border border-border-default space-y-1.5">
                                    <span className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        Benchmark / Ideal Answer Reference
                                    </span>
                                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                                        {q.idealAnswer}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
