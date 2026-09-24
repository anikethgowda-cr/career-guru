import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchUserCompletedAssessments } from "../../slices/AssessmentReportSlice";

export default function AssessmentReport() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { userAssessments, loading, serverError } = useSelector((state) => state.assessmentReport);

    const [searchTerm, setSearchTerm] = useState("");
    const [difficultyFilter, setDifficultyFilter] = useState("all");

    useEffect(() => {
        dispatch(fetchUserCompletedAssessments());
    }, [dispatch]);

    const completedAssessments = useMemo(() => {
        return Array.isArray(userAssessments)
            ? userAssessments.filter((assessment) => assessment.status === "completed")
            : [];
    }, [userAssessments]);

    // Filter by search and difficulty
    const filteredAssessments = useMemo(() => {
        return completedAssessments.filter((assessment) => {
            const matchesSearch =
                !searchTerm.trim() ||
                assessment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                assessment.targetRole?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                assessment.mentorId?.username?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesDifficulty =
                difficultyFilter === "all" ||
                assessment.difficulty?.toLowerCase() === difficultyFilter.toLowerCase();

            return matchesSearch && matchesDifficulty;
        });
    }, [completedAssessments, searchTerm, difficultyFilter]);

    const handleViewReport = (assessmentId) => {
        navigate(`/user/assessment-report/${assessmentId}`);
    };

    const getDifficultyBadge = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case "easy":
                return "bg-status-success-subtle text-status-success border-status-success/20";
            case "medium":
                return "bg-status-warning-subtle text-status-warning border-status-warning/20";
            case "hard":
                return "bg-status-danger-subtle text-status-danger border-status-danger/20";
            default:
                return "bg-bg-muted text-text-secondary border-border-default";
        }
    };

    // Shimmer Skeleton Loader
    if (loading) {
        return (
            <div className="p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto space-y-8 text-left animate-pulse">
                {/* Header Skeleton */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border-default">
                    <div className="space-y-2">
                        <div className="w-72 h-8 bg-bg-muted rounded-lg"></div>
                        <div className="w-96 h-4 bg-bg-muted/60 rounded-md"></div>
                    </div>
                    <div className="w-32 h-8 bg-bg-muted rounded-full"></div>
                </div>

                {/* Filter Bar Skeleton */}
                <div className="h-16 bg-bg-muted/50 rounded-xl"></div>

                {/* Cards Skeleton Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((n) => (
                        <div
                            key={n}
                            className="bg-bg-surface border border-border-default rounded-xl p-6 h-64 flex flex-col justify-between"
                        >
                            <div className="flex justify-between items-center">
                                <div className="w-20 h-5 bg-bg-muted rounded-full"></div>
                                <div className="w-16 h-5 bg-bg-muted rounded-full"></div>
                            </div>
                            <div className="w-3/4 h-5 bg-bg-muted rounded"></div>
                            <div className="space-y-2">
                                <div className="w-full h-3 bg-bg-muted/60 rounded"></div>
                                <div className="w-2/3 h-3 bg-bg-muted/60 rounded"></div>
                            </div>
                            <div className="w-full h-10 bg-bg-muted rounded-lg"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto space-y-8 text-left transition-colors duration-200">
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border-default">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                        Assessment Performance Reports
                    </h1>
                    <p className="text-xs sm:text-sm text-text-secondary">
                        Review detailed AI performance evaluations, question scores, transcripts, and watch recorded mock interviews.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-status-success-subtle text-status-success border border-status-success/20">
                        Completed: {completedAssessments.length}
                    </span>
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-brand-subtle text-brand-primary border border-brand-primary/20">
                        AI Evaluated: On-Demand
                    </span>
                </div>
            </div>

            {/* Error Banner */}
            {serverError && (
                <div className="p-5 rounded-xl bg-status-danger-subtle border border-status-danger/30 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-status-danger/20 flex items-center justify-center text-status-danger shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-status-danger">
                                Failed to fetch completed assessments
                            </h4>
                            <p className="text-xs text-text-secondary mt-0.5">
                                {serverError.message || "An unexpected error occurred while loading your assessments."}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => dispatch(fetchUserCompletedAssessments())}
                        className="px-3.5 py-1.5 bg-status-danger hover:bg-status-danger/90 text-white rounded-lg text-xs font-semibold transition shrink-0"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Filter Bar */}
            <div className="bg-bg-surface border border-border-default rounded-xl p-4 sm:p-5 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between shadow-subtle">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search completed reports by title, role..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg text-xs sm:text-sm bg-bg-app border border-border-default text-text-primary placeholder:text-text-muted focus:outline-hidden focus:ring-2 focus:ring-brand-ring focus:border-brand-primary transition shadow-2xs"
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => setSearchTerm("")}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-text-muted hover:text-text-primary cursor-pointer"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Difficulty Filters */}
                <div className="flex items-center p-1 bg-bg-muted rounded-lg border border-border-default shrink-0">
                    {["all", "easy", "medium", "hard"].map((diff) => (
                        <button
                            key={diff}
                            type="button"
                            onClick={() => setDifficultyFilter(diff)}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all cursor-pointer ${
                                difficultyFilter === diff
                                    ? "bg-bg-surface text-brand-primary shadow-xs font-bold"
                                    : "text-text-secondary hover:text-text-primary"
                            }`}
                        >
                            {diff}
                        </button>
                    ))}
                </div>
            </div>

            {/* Completed Assessments Grid */}
            {filteredAssessments.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAssessments.map((assessment) => (
                        <div
                            key={assessment._id}
                            className="bg-bg-surface border border-border-default border-t-4 border-t-status-success rounded-xl p-6 shadow-subtle hover:shadow-card transition-all duration-200 flex flex-col justify-between"
                        >
                            <div>
                                {/* Top Badges */}
                                <div className="flex items-start justify-between gap-3 mb-4">
                                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-status-success-subtle text-status-success border border-status-success/20 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse"></span>
                                        Completed
                                    </span>

                                    <span
                                        className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border capitalize ${getDifficultyBadge(
                                            assessment.difficulty
                                        )}`}
                                    >
                                        {assessment.difficulty}
                                    </span>
                                </div>

                                {/* Target Role Tag */}
                                <div className="inline-block px-3 py-1 rounded-md bg-brand-subtle text-brand-primary border border-brand-primary/20 text-xs font-semibold mb-2">
                                    {assessment.targetRole}
                                </div>

                                {/* Title */}
                                <h3 className="text-base sm:text-lg font-bold text-text-primary leading-snug mb-4 hover:text-brand-primary transition-colors">
                                    {assessment.title}
                                </h3>

                                {/* Metadata Details */}
                                <div className="space-y-2.5 py-3.5 border-y border-border-default mb-6 text-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="text-text-muted flex items-center gap-1.5">
                                            <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            Assigned By Mentor:
                                        </span>
                                        <span className="font-semibold text-text-primary">
                                            {assessment.mentorId?.username || "Mentor"}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-text-muted flex items-center gap-1.5">
                                            <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Interview Rounds:
                                        </span>
                                        <span className="font-semibold text-text-primary">
                                            {assessment.questions?.length || 0} Questions
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-text-muted flex items-center gap-1.5">
                                            <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Completed:
                                        </span>
                                        <span className="font-semibold text-text-primary">
                                            {new Date(assessment.updatedAt || assessment.createdAt).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric"
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* View AI Report Action */}
                            <button
                                type="button"
                                onClick={() => handleViewReport(assessment._id)}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs hover:shadow-card transition-all cursor-pointer"
                            >
                                <svg className="w-4 h-4 text-brand-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span>View AI Report & Recording</span>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State when search has no results */}
            {completedAssessments.length > 0 && filteredAssessments.length === 0 && (
                <div className="bg-bg-surface border border-border-default rounded-xl p-8 sm:p-12 text-center max-w-md mx-auto space-y-4 shadow-subtle">
                    <div className="w-12 h-12 mx-auto rounded-lg bg-brand-subtle text-brand-primary flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-base font-bold text-text-primary">
                            No matching reports found
                        </h4>
                        <p className="text-xs text-text-muted">
                            Adjust your search terms or filter to find your assessment.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            setSearchTerm("");
                            setDifficultyFilter("all");
                        }}
                        className="px-4 py-2 text-xs font-semibold rounded-lg bg-bg-muted hover:bg-border-default transition text-text-secondary cursor-pointer border border-border-default"
                    >
                        Reset Filters
                    </button>
                </div>
            )}

            {/* Empty State when no completed assessments exist at all */}
            {completedAssessments.length === 0 && (
                <div className="bg-bg-surface border border-border-default border-t-4 border-t-brand-primary rounded-xl p-8 sm:p-12 text-center max-w-lg mx-auto space-y-6 shadow-subtle">
                    <div className="w-14 h-14 mx-auto rounded-xl bg-brand-subtle text-brand-primary flex items-center justify-center">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h6.586a2 2 0 011.414.586l3.414 3.414A2 2 0 0119 8.414V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-text-primary">
                            No Completed Interviews Yet
                        </h3>
                        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-sm mx-auto">
                            Complete an assigned assessment interview in the Candidate Portal to automatically generate your recording playback and comprehensive AI evaluation report.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate("/user/assessment")}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-white text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer"
                    >
                        <span>Go to My Assessments</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
}
