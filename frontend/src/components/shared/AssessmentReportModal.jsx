import { useEffect, useRef } from "react";

export default function AssessmentReportModal({ isOpen, onClose, report, loading, error }) {
    const modalRef = useRef(null);

    // Close on Escape key press
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const overall = report?.overallReport || {};
    const questions = report?.questionAnalysis || [];
    const videoURL = report?.videoURL || "";

    // Badge styling for recommendation matching CareerGuru standard
    const getRecommendationBadge = (rec) => {
        switch (rec) {
            case "Strong Hire":
                return "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60";
            case "Hire":
                return "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800/60";
            case "Needs Practice":
                return "bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60";
            case "Not Ready":
                return "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60";
            default:
                return "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700";
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
        if (score >= 65) return "text-indigo-600 dark:text-indigo-400";
        if (score >= 50) return "text-amber-600 dark:text-amber-400";
        return "text-rose-600 dark:text-rose-400";
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs transition-all duration-200">
            <div
                ref={modalRef}
                className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden transition-all text-left"
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                            AI
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                    {report?.assessmentId?.title || "Assessment Evaluation Report"}
                                </h2>
                                {overall?.finalRecommendation && (
                                    <span
                                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRecommendationBadge(
                                            overall.finalRecommendation
                                        )}`}
                                    >
                                        {overall.finalRecommendation}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                                Candidate: <strong className="text-slate-800 dark:text-zinc-200">{report?.studentId?.username || "Candidate"}</strong> • Role: <strong className="text-slate-800 dark:text-zinc-200">{report?.targetRole || "Role"}</strong> • Mentor: <strong className="text-slate-800 dark:text-zinc-200">{report?.mentorId?.username || "Mentor"}</strong>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-300 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-700 transition cursor-pointer"
                            title="Print Assessment Report"
                        >
                            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Print
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                            aria-label="Close modal"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
                    {/* Loading state */}
                    {loading && (
                        <div className="py-20 flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="relative w-14 h-14">
                                <div className="absolute inset-0 rounded-full border-4 border-indigo-200 dark:border-indigo-950"></div>
                                <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    Generating AI Evaluation Report...
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm">
                                    Gemini AI is analyzing candidate speech transcripts and scoring each question response.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Error state */}
                    {!loading && error && (
                        <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 space-y-2">
                            <h4 className="font-semibold text-sm">Failed to load report</h4>
                            <p className="text-xs">{error}</p>
                            <button
                                type="button"
                                onClick={onClose}
                                className="mt-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
                            >
                                Close
                            </button>
                        </div>
                    )}

                    {/* Report Content */}
                    {!loading && !error && report && (
                        <>
                            {/* SECTION 1: Recorded Video & Key Score Metrics */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                {/* Video Player Card */}
                                <div className="lg:col-span-7 bg-black rounded-2xl overflow-hidden border border-[#E2E8F0] dark:border-zinc-800 shadow-xs flex flex-col">
                                    <div className="px-4 py-2.5 bg-slate-900 border-b border-zinc-800 flex items-center justify-between text-xs text-slate-300">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                            <span className="font-semibold text-white">Interview Video Recording</span>
                                        </div>
                                        <span className="text-[11px] text-slate-400">Cloudinary Stream</span>
                                    </div>

                                    <div className="relative aspect-video bg-black flex items-center justify-center">
                                        {videoURL ? (
                                            <video
                                                controls
                                                playsInline
                                                controlsList="nodownload"
                                                src={videoURL}
                                                className="w-full h-full object-contain"
                                            >
                                                Your browser does not support video playback.
                                            </video>
                                        ) : (
                                            <div className="text-center p-6 space-y-2">
                                                <svg className="w-10 h-10 mx-auto text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                                <p className="text-xs text-slate-400">Interview video not available</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Overall Score & Ratings */}
                                <div className="lg:col-span-5 space-y-4">
                                    {/* Overall Score Highlight */}
                                    <div className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-[#E2E8F0] dark:border-zinc-800 border-t-4 border-t-indigo-500 shadow-xs flex items-center justify-between">
                                        <div>
                                            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                                                Overall Score
                                            </span>
                                            <div className="flex items-baseline gap-1 mt-1">
                                                <span className={`text-4xl font-extrabold ${getScoreColor(overall.overallScore || 0)}`}>
                                                    {overall.overallScore || 0}
                                                </span>
                                                <span className="text-sm font-semibold text-slate-400 dark:text-zinc-500">
                                                    / 100
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                                                Evaluated by AI against target role
                                            </p>
                                        </div>

                                        <div className="w-22 h-20 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-[#E2E8F0] dark:border-zinc-700/60 flex flex-col items-center justify-center text-center p-2">
                                            <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-zinc-400 leading-tight">
                                                Status
                                            </span>
                                            <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 mt-0.5 leading-tight">
                                                {overall.finalRecommendation || "Completed"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Metric Bars */}
                                    <div className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-[#E2E8F0] dark:border-zinc-800 shadow-xs space-y-4">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                                            Skill Competency Ratings
                                        </h4>

                                        {/* Technical Score */}
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-xs">
                                                <span className="font-medium text-slate-700 dark:text-zinc-300">Technical Depth</span>
                                                <span className="font-bold text-slate-900 dark:text-zinc-100">{overall.technicalScore || 0}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                                                    style={{ width: `${Math.min(100, Math.max(0, overall.technicalScore || 0))}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Communication Score */}
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-xs">
                                                <span className="font-medium text-slate-700 dark:text-zinc-300">Communication & Clarity</span>
                                                <span className="font-bold text-slate-900 dark:text-zinc-100">{overall.communicationScore || 0}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-violet-600 rounded-full transition-all duration-500"
                                                    style={{ width: `${Math.min(100, Math.max(0, overall.communicationScore || 0))}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 2: Executive Summary */}
                            {overall.overallSummary && (
                                <div className="p-5 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-[#E2E8F0] dark:border-zinc-800 space-y-2">
                                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Executive Assessment Summary
                                    </div>
                                    <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-zinc-300">
                                        {overall.overallSummary}
                                    </p>
                                </div>
                            )}

                            {/* SECTION 3: Key Strengths and Improvements */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Strengths */}
                                <div className="p-5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 space-y-3">
                                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                                        <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Candidate Strengths
                                    </div>
                                    <ul className="space-y-2 text-xs text-slate-700 dark:text-zinc-300">
                                        {(overall.strengths || []).map((str, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                                                <span>{str}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Areas for Improvement */}
                                <div className="p-5 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-800/60 space-y-3">
                                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
                                        <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        Areas For Improvement
                                    </div>
                                    <ul className="space-y-2 text-xs text-slate-700 dark:text-zinc-300">
                                        {(overall.areasForImprovement || []).map((imp, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                                                <span>{imp}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* SECTION 4: Question-by-Question Analysis */}
                            <div className="space-y-4 pt-2">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-zinc-800">
                                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                                        Detailed Question-by-Question Evaluation ({questions.length})
                                    </h3>
                                    <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                                        Scored out of 10
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    {questions.map((q, idx) => (
                                        <div
                                            key={q.questionId || idx}
                                            className="p-5 bg-white dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-2xl shadow-xs space-y-4"
                                        >
                                            {/* Question header */}
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="space-y-1">
                                                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                                                        Question {idx + 1}
                                                    </span>
                                                    <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 leading-snug">
                                                        {q.question}
                                                    </h4>
                                                </div>
                                                <span
                                                    className={`px-3 py-1 rounded-xl text-xs font-bold border shrink-0 ${
                                                        (q.score || 0) >= 8
                                                            ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                                                            : (q.score || 0) >= 5
                                                            ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                                                            : "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800"
                                                    }`}
                                                >
                                                    Score: {q.score || 0} / 10
                                                </span>
                                            </div>

                                            {/* Candidate Speech Transcript */}
                                            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-[#E2E8F0] dark:border-zinc-800 space-y-1">
                                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                                                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
                                                    </svg>
                                                    Candidate Speech Transcript:
                                                </div>
                                                <p className="text-xs text-slate-700 dark:text-zinc-300 italic">
                                                    "{q.transcript || "No speech recorded for this question."}"
                                                </p>
                                            </div>

                                            {/* AI Feedback */}
                                            {q.feedback && (
                                                <div className="space-y-1">
                                                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                                                        AI Analysis & Feedback:
                                                    </span>
                                                    <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                                                        {q.feedback}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Strengths & Improvements tags */}
                                            {(q.strengths?.length > 0 || q.improvements?.length > 0) && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                                    {q.strengths?.length > 0 && (
                                                        <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-xs">
                                                            <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
                                                                ✓ Strong Points:
                                                            </span>
                                                            <ul className="space-y-0.5 text-slate-600 dark:text-zinc-400 text-[11px]">
                                                                {q.strengths.map((s, sIdx) => (
                                                                    <li key={sIdx}>• {s}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {q.improvements?.length > 0 && (
                                                        <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs">
                                                            <span className="font-bold text-amber-800 dark:text-amber-300 block mb-1">
                                                                ▲ Needs Work:
                                                            </span>
                                                            <ul className="space-y-0.5 text-slate-600 dark:text-zinc-400 text-[11px]">
                                                                {q.improvements.map((i, iIdx) => (
                                                                    <li key={iIdx}>• {i}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Ideal Benchmark Answer */}
                                            {q.idealAnswer && (
                                                <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-1">
                                                    <span className="text-[11px] font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                        </svg>
                                                        Ideal Answer Benchmark:
                                                    </span>
                                                    <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                                                        {q.idealAnswer}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-[#E2E8F0] dark:border-zinc-800 bg-white dark:bg-zinc-900 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 shadow-xs transition cursor-pointer"
                    >
                        Close Report
                    </button>
                </div>
            </div>
        </div>
    );
}
