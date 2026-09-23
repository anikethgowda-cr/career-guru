import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    fetchMentorCompletedAssessments,
    deleteMentorAssessment
} from "../../slices/AssessmentReportSlice";

export default function MentorAssessmentReport() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { mentorAssessments, loading, serverError } =
        useSelector((state) => state.assessmentReport);

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
        navigate(`/mentor/assessment-report/${assessmentId}`);
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
        <div className="p-6 sm:p-8 lg:p-10 max-w-6xl mx-auto text-left space-y-6">
            {/* Page Header */}
            <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand-subtle text-brand-primary flex items-center justify-center font-bold text-sm">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h6.586a2 2 0 011.414.586l3.414 3.414A2 2 0 0119 8.414V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
                        Mentee Assessment Reports
                    </h1>
                </div>
                <p className="text-sm text-text-secondary">
                    Track mentee assessment progress, watch interview recordings, and inspect detailed AI evaluation reports.
                </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex p-1 bg-bg-muted rounded-lg max-w-md border border-border-default shadow-xs">
                <button
                    type="button"
                    onClick={() => setActiveTab("completed")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer ${
                        activeTab === "completed"
                            ? "bg-bg-surface text-text-primary shadow-xs font-bold"
                            : "text-text-secondary hover:text-text-primary"
                    }`}
                >
                    <span className="w-2 h-2 rounded-full bg-status-success shrink-0"></span>
                    <span>Completed</span>
                    <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            activeTab === "completed"
                                ? "bg-brand-subtle text-brand-primary"
                                : "bg-bg-muted text-text-muted border border-border-default"
                        }`}
                    >
                        {completedAssessments.length}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("pending")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer ${
                        activeTab === "pending"
                            ? "bg-bg-surface text-text-primary shadow-xs font-bold"
                            : "text-text-secondary hover:text-text-primary"
                    }`}
                >
                    <span className="w-2 h-2 rounded-full bg-status-warning shrink-0 animate-pulse"></span>
                    <span>Pending & Ongoing</span>
                    <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            activeTab === "pending"
                                ? "bg-brand-subtle text-brand-primary"
                                : "bg-bg-muted text-text-muted border border-border-default"
                        }`}
                    >
                        {pendingAssessments.length}
                    </span>
                </button>
            </div>

            {/* Error banners */}
            {(serverError || deleteError) && (
                <div className="p-4 rounded-xl bg-status-danger-subtle border border-status-danger/30 text-status-danger text-sm flex items-center justify-between">
                    <span>{deleteError || serverError}</span>
                    {deleteError && (
                        <button
                            type="button"
                            onClick={() => setDeleteError("")}
                            className="text-xs font-semibold underline hover:no-underline ml-4 cursor-pointer"
                        >
                            Dismiss
                        </button>
                    )}
                </div>
            )}

            {/* Loading state */}
            {loading && (
                <div className="py-16 flex flex-col items-center justify-center space-y-3 text-center">
                    <div className="w-8 h-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin"></div>
                    <p className="text-sm text-text-muted">
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
                                className="bg-bg-surface border border-border-default rounded-xl p-6 shadow-subtle hover:shadow-card transition-all duration-200 flex flex-col justify-between"
                            >
                                <div>
                                    {/* Top Badges */}
                                    <div className="flex items-start justify-between gap-3 mb-4">
                                        {isCompleted ? (
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-status-success-subtle text-status-success border border-status-success/20 flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span>
                                                Completed
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-status-warning-subtle text-status-warning border border-status-warning/20 flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-status-warning animate-pulse"></span>
                                                Pending Submission
                                            </span>
                                        )}

                                        <span className="px-2.5 py-0.5 rounded-md bg-bg-muted text-xs font-medium text-text-secondary border border-border-default capitalize">
                                            {assessment.difficulty}
                                        </span>
                                    </div>

                                    {/* Title & Target Role */}
                                    <h3 className="text-lg font-bold text-text-primary leading-snug mb-1">
                                        {assessment.title}
                                    </h3>
                                    <p className="text-sm font-medium text-brand-primary mb-4">
                                        {assessment.targetRole}
                                    </p>

                                    {/* Mentee Metadata */}
                                    <div className="space-y-2 py-3 border-y border-border-default mb-5 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-text-muted">Mentee / Candidate:</span>
                                            <span className="font-semibold text-text-primary">
                                                {assessment.studentId?.username || "Student"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-text-muted">Mentee Email:</span>
                                            <span className="font-semibold text-text-primary truncate max-w-[180px]">
                                                {assessment.studentId?.email || "—"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-text-muted">Total Questions:</span>
                                            <span className="font-semibold text-text-primary">
                                                {assessment.questions?.length || 0} Questions
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-text-muted">
                                                {isCompleted ? "Completed Date:" : "Assigned Date:"}
                                            </span>
                                            <span className="font-semibold text-text-primary">
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
                                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer"
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
                                            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-status-danger-subtle hover:bg-status-danger/20 text-status-danger text-xs font-semibold rounded-lg border border-status-danger/30 transition cursor-pointer disabled:opacity-50"
                                            title="Delete Completed Assessment"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            <span>Delete Assessment</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="p-3 rounded-lg bg-bg-muted/60 border border-border-default text-center">
                                            <span className="text-xs text-text-muted flex items-center justify-center gap-1.5">
                                                <svg className="w-3.5 h-3.5 text-status-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Awaiting mentee completion
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleDeleteAssessment(assessment._id, false)}
                                            disabled={deletingId === assessment._id}
                                            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-status-danger-subtle hover:bg-status-danger/20 text-status-danger text-xs font-semibold rounded-lg border border-status-danger/30 transition cursor-pointer disabled:opacity-50"
                                            title="Delete Pending Assessment"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            <span>Delete Assessment</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Empty states */}
            {!loading && displayedAssessments.length === 0 && (
                <div className="p-12 sm:p-16 rounded-xl bg-bg-surface border border-border-default text-center space-y-4 shadow-subtle max-w-lg mx-auto">
                    <div className="w-14 h-14 rounded-xl bg-brand-subtle text-brand-primary mx-auto flex items-center justify-center">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h6.586a2 2 0 011.414.586l3.414 3.414A2 2 0 0119 8.414V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold text-text-primary">
                            {activeTab === "completed" ? "No Completed Assessments" : "No Pending Assessments"}
                        </h3>
                        <p className="text-xs sm:text-sm text-text-muted">
                            {activeTab === "completed"
                                ? "When your mentees finish an assigned AI interview, their reports and video recordings will appear here."
                                : "You currently have no pending assessments assigned to mentees."}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}