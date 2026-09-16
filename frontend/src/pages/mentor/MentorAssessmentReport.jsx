import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    fetchMentorCompletedAssessments,
    fetchAssessmentReport,
    clearSelectedReport,
    deleteMentorAssessment
} from "../../slices/AssessmentReportSlice";
import AssessmentReportModal from "../../components/shared/AssessmentReportModal";

export default function MentorAssessmentReport() {
    const dispatch = useDispatch();

    const { mentorAssessments, selectedReport, loading, reportLoading, serverError, reportError } =
        useSelector((state) => state.assessmentReport);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeAssessmentId, setActiveAssessmentId] = useState(null);
    const [activeTab, setActiveTab] = useState("completed"); // "completed" | "pending"
    const [deletingId, setDeletingId] = useState(null);
    const [deleteError, setDeleteError] = useState("");

    useEffect(() => {
        dispatch(fetchMentorCompletedAssessments());
    }, [dispatch]);

    const completedAssessments = mentorAssessments?.filter((assessment) => {
        return assessment.status === "completed";
    }) || [];

    const pendingAssessments = mentorAssessments?.filter((assessment) => {
        return assessment.status !== "completed";
    }) || [];

    const handleViewReport = (assessmentId) => {
        setActiveAssessmentId(assessmentId);
        setIsModalOpen(true);
        dispatch(fetchAssessmentReport(assessmentId));
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setActiveAssessmentId(null);
        dispatch(clearSelectedReport());
    };

    const handleDeleteAssessment = async (assessmentId, isCompleted = false) => {
        const confirmMessage = isCompleted
            ? "Are you sure you want to delete this completed assessment and its AI evaluation report? This action cannot be undone."
            : "Are you sure you want to delete this pending assessment? This action cannot be undone.";

        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            setDeletingId(assessmentId);
            setDeleteError("");
            await dispatch(deleteMentorAssessment(assessmentId)).unwrap();
        } catch (err) {
            setDeleteError(err?.message || "Failed to delete assessment");
        } finally {
            setDeletingId(null);
        }
    };

    const displayedAssessments = activeTab === "completed" ? completedAssessments : pendingAssessments;

    return (
        <div className="p-6 sm:p-8 lg:p-10 max-w-6xl mx-auto text-left">
            {/* Page Header */}
            <div className="mb-6 space-y-1">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h6.586a2 2 0 011.414.586l3.414 3.414A2 2 0 0119 8.414V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-zinc-100">
                        Mentee Assessment Reports
                    </h1>
                </div>
                <p className="text-sm text-slate-500 dark:text-zinc-400">
                    Track mentee assessment progress, watch interview recordings, and inspect detailed AI evaluation reports.
                </p>
            </div>

            {/* Tab Switcher (Similar to Auth Role Switcher) */}
            <div className="flex p-1.5 bg-slate-100 dark:bg-zinc-800/80 rounded-2xl mb-8 max-w-md border border-slate-200/60 dark:border-zinc-700/50 shadow-xs">
                <button
                    type="button"
                    onClick={() => setActiveTab("completed")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-medium rounded-xl transition-all duration-200 cursor-pointer ${
                        activeTab === "completed"
                            ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm font-bold"
                            : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                    <span>Completed</span>
                    <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            activeTab === "completed"
                                ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                                : "bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-400"
                        }`}
                    >
                        {completedAssessments.length}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("pending")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-medium rounded-xl transition-all duration-200 cursor-pointer ${
                        activeTab === "pending"
                            ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm font-bold"
                            : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                >
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 animate-pulse"></span>
                    <span>Pending & Ongoing</span>
                    <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            activeTab === "pending"
                                ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                                : "bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-400"
                        }`}
                    >
                        {pendingAssessments.length}
                    </span>
                </button>
            </div>

            {/* Error banners */}
            {(serverError || deleteError) && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm flex items-center justify-between">
                    <span>{deleteError || serverError}</span>
                    {deleteError && (
                        <button
                            type="button"
                            onClick={() => setDeleteError("")}
                            className="text-xs font-semibold underline hover:no-underline ml-4"
                        >
                            Dismiss
                        </button>
                    )}
                </div>
            )}

            {/* Loading state */}
            {loading && (
                <div className="py-16 flex flex-col items-center justify-center space-y-3 text-center">
                    <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"></div>
                    <p className="text-sm text-slate-500 dark:text-zinc-400">
                        Loading mentee assessments...
                    </p>
                </div>
            )}

            {/* Assessments Grid */}
            {!loading && displayedAssessments.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedAssessments.map((assessment) => {
                        const isCompleted = assessment.status === "completed";

                        return (
                            <div
                                key={assessment._id}
                                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                            >
                                <div>
                                    {/* Top Badges */}
                                    <div className="flex items-start justify-between gap-3 mb-4">
                                        {isCompleted ? (
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                Completed
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                                Pending Submission
                                            </span>
                                        )}

                                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300 capitalize">
                                            {assessment.difficulty}
                                        </span>
                                    </div>

                                    {/* Title & Target Role */}
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 leading-snug mb-1">
                                        {assessment.title}
                                    </h3>
                                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-4">
                                        {assessment.targetRole}
                                    </p>

                                    {/* Mentee Metadata */}
                                    <div className="space-y-2 py-3 border-y border-slate-100 dark:border-zinc-800/80 mb-5 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 dark:text-zinc-400">Mentee / Candidate:</span>
                                            <span className="font-semibold text-slate-800 dark:text-zinc-200">
                                                {assessment.studentId?.username || "Student"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 dark:text-zinc-400">Mentee Email:</span>
                                            <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate max-w-[180px]">
                                                {assessment.studentId?.email || "—"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 dark:text-zinc-400">Total Questions:</span>
                                            <span className="font-semibold text-slate-800 dark:text-zinc-200">
                                                {assessment.questions?.length || 0} Questions
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 dark:text-zinc-400">
                                                {isCompleted ? "Completed Date:" : "Assigned Date:"}
                                            </span>
                                            <span className="font-semibold text-slate-800 dark:text-zinc-200">
                                                {new Date(
                                                    isCompleted
                                                        ? assessment.updatedAt || assessment.createdAt
                                                        : assessment.createdAt
                                                ).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric"
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Button / Status indicator */}
                                {isCompleted ? (
                                    <div className="space-y-2">
                                        <button
                                            type="button"
                                            onClick={() => handleViewReport(assessment._id)}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold rounded-xl shadow-xs shadow-indigo-600/20 transition-all cursor-pointer"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            <span>View Mentee Report & Recording</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleDeleteAssessment(assessment._id, true)}
                                            disabled={deletingId === assessment._id}
                                            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/60 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl border border-red-200 dark:border-red-900/50 transition cursor-pointer disabled:opacity-50"
                                            title="Delete Completed Assessment"
                                        >
                                            {deletingId === assessment._id ? (
                                                <>
                                                    <div className="w-3.5 h-3.5 rounded-full border-2 border-red-600 dark:border-red-400 border-t-transparent animate-spin"></div>
                                                    <span>Deleting Assessment...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    <span>Delete Assessment</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-xl border border-amber-200 dark:border-amber-800/60">
                                            <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>Awaiting Mentee Submission</span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleDeleteAssessment(assessment._id)}
                                            disabled={deletingId === assessment._id}
                                            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/60 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl border border-red-200 dark:border-red-900/50 transition cursor-pointer disabled:opacity-50"
                                            title="Delete Pending Assessment"
                                        >
                                            {deletingId === assessment._id ? (
                                                <>
                                                    <div className="w-3.5 h-3.5 rounded-full border-2 border-red-600 dark:border-red-400 border-t-transparent animate-spin"></div>
                                                    <span>Deleting Assessment...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    <span>Delete Assessment</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Empty State */}
            {!loading && displayedAssessments.length === 0 && (
                <div className="p-12 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-center max-w-lg mx-auto space-y-4 shadow-xs">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h6.586a2 2 0 011.414.586l3.414 3.414A2 2 0 0119 8.414V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                            {activeTab === "completed"
                                ? "No Completed Mentee Assessments"
                                : "No Pending Assessments"}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                            {activeTab === "completed"
                                ? "Assessments assigned to your mentees will appear here once they finish and submit their interview."
                                : "All assigned assessments have been completed by your mentees."}
                        </p>
                    </div>
                </div>
            )}

            {/* AI Report Modal */}
            <AssessmentReportModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                report={selectedReport}
                loading={reportLoading}
                error={reportError}
            />
        </div>
    );
}