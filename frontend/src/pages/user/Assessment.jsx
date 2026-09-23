import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    fetchAssessments,
    createAssessmentAttempt
} from "../../slices/user/UserAssessmentSlice";

export default function Assessment() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { assessments, loading, serverError } = useSelector((state) => {
        return state.userAssessment;
    });

    const [activeTab, setActiveTab] = useState("all"); // 'all' | 'pending' | 'completed'
    const [searchTerm, setSearchTerm] = useState("");
    const [difficultyFilter, setDifficultyFilter] = useState("all");
    const [startingAssessmentId, setStartingAssessmentId] = useState(null);

    useEffect(() => {
        dispatch(fetchAssessments());
    }, [dispatch]);

    const safeAssessments = useMemo(() => {
        return Array.isArray(assessments) ? assessments : [];
    }, [assessments]);

    const pendingAssessments = useMemo(() => {
        return safeAssessments.filter((assessment) => assessment.status === "pending");
    }, [safeAssessments]);

    const completedAssessments = useMemo(() => {
        return safeAssessments.filter((assessment) => assessment.status === "completed");
    }, [safeAssessments]);

    // Filter by tab, search term, and difficulty
    const filteredAssessments = useMemo(() => {
        return safeAssessments.filter((assessment) => {
            // Tab filter
            if (activeTab === "pending" && assessment.status !== "pending") return false;
            if (activeTab === "completed" && assessment.status !== "completed") return false;

            // Search filter
            const matchesSearch =
                !searchTerm.trim() ||
                assessment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                assessment.targetRole?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                assessment.mentorId?.username?.toLowerCase().includes(searchTerm.toLowerCase());

            // Difficulty filter
            const matchesDifficulty =
                difficultyFilter === "all" ||
                assessment.difficulty?.toLowerCase() === difficultyFilter.toLowerCase();

            return matchesSearch && matchesDifficulty;
        });
    }, [safeAssessments, activeTab, searchTerm, difficultyFilter]);

    async function handleTakeAssessment(assessmentId) {
        try {
            setStartingAssessmentId(assessmentId);
            await dispatch(createAssessmentAttempt(assessmentId)).unwrap();
            navigate(`/user/assessment/${assessmentId}/interview`);
        } catch (err) {
            console.log("Assessment start error:", err);
            // Navigate directly to interview if already initiated
            navigate(`/user/assessment/${assessmentId}/interview`);
        } finally {
            setStartingAssessmentId(null);
        }
    }

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

    const errorMessage =
        typeof serverError === "string"
            ? serverError
            : serverError?.message || null;

    // Shimmer Skeleton Loader matching CareerGuru standard
    if (loading) {
        return (
            <div className="p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto space-y-8 text-left animate-pulse">
                {/* Header Skeleton */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border-default">
                    <div className="space-y-2">
                        <div className="w-64 h-8 bg-bg-muted rounded-lg"></div>
                        <div className="w-96 h-4 bg-bg-muted/60 rounded-md"></div>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-24 h-8 bg-bg-muted rounded-full"></div>
                        <div className="w-24 h-8 bg-bg-muted rounded-full"></div>
                    </div>
                </div>

                {/* Filter Bar Skeleton */}
                <div className="h-16 bg-bg-muted/50 rounded-xl"></div>

                {/* Cards Skeleton Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
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
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                            AI Mock Interview Assessments
                        </h1>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-subtle text-brand-primary border border-brand-primary/20">
                            Live Studio
                        </span>
                    </div>
                    <p className="text-xs sm:text-sm text-text-secondary">
                        Practice real-time technical & behavioural questions with AI video recording, speech transcription, and automated evaluation.
                    </p>
                </div>

                {/* Quick Counts */}
                <div className="flex items-center gap-2">
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-status-warning-subtle text-status-warning border border-status-warning/20">
                        {pendingAssessments.length} Pending
                    </span>
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-status-success-subtle text-status-success border border-status-success/20">
                        {completedAssessments.length} Completed
                    </span>
                </div>
            </div>

            {/* Error state */}
            {errorMessage && (
                <div className="p-4 sm:p-5 rounded-xl bg-status-danger-subtle border border-status-danger/30 text-status-danger text-xs sm:text-sm flex items-center justify-between">
                    <div>
                        <strong className="font-semibold">Notice:</strong> {errorMessage}
                    </div>
                    <button
                        type="button"
                        onClick={() => dispatch(fetchAssessments())}
                        className="px-4 py-2 bg-status-danger hover:bg-status-danger/90 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Filter & Controls Card */}
            <div className="bg-bg-surface border border-border-default rounded-xl p-4 sm:p-5 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between shadow-subtle">
                {/* Search Bar */}
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
                        placeholder="Search by title, role, or mentor..."
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

                {/* Status Switcher Tabs & Difficulty Filters */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                    {/* Status Tabs */}
                    <div className="flex items-center p-1 bg-bg-muted rounded-lg border border-border-default shrink-0">
                        <button
                            type="button"
                            onClick={() => setActiveTab("all")}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                                activeTab === "all"
                                    ? "bg-bg-surface text-brand-primary shadow-xs font-bold"
                                    : "text-text-secondary hover:text-text-primary"
                            }`}
                        >
                            All ({safeAssessments.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("pending")}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                                activeTab === "pending"
                                    ? "bg-bg-surface text-brand-primary shadow-xs font-bold"
                                    : "text-text-secondary hover:text-text-primary"
                            }`}
                        >
                            Pending ({pendingAssessments.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("completed")}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                                activeTab === "completed"
                                    ? "bg-bg-surface text-brand-primary shadow-xs font-bold"
                                    : "text-text-secondary hover:text-text-primary"
                            }`}
                        >
                            Completed ({completedAssessments.length})
                        </button>
                    </div>

                    {/* Difficulty Dropdown filter */}
                    <select
                        value={difficultyFilter}
                        onChange={(e) => setDifficultyFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg text-xs font-semibold bg-bg-app border border-border-default text-text-secondary focus:outline-hidden focus:ring-2 focus:ring-brand-ring cursor-pointer"
                    >
                        <option value="all">All Difficulties</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>
            </div>

            {/* Assessments Grid */}
            {filteredAssessments.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAssessments.map((assessment) => {
                        const isCompleted = assessment.status === "completed";
                        const isStarting = startingAssessmentId === assessment._id;

                        return (
                            <div
                                key={assessment._id}
                                className={`bg-bg-surface border border-border-default rounded-xl p-6 shadow-subtle hover:shadow-card transition-all duration-200 flex flex-col justify-between ${
                                    isCompleted
                                        ? "border-t-4 border-t-status-success"
                                        : "border-t-4 border-t-brand-primary"
                                }`}
                            >
                                <div>
                                    {/* Top Status & Difficulty Badges */}
                                    <div className="flex items-start justify-between gap-3 mb-4">
                                        {isCompleted ? (
                                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-status-success-subtle text-status-success border border-status-success/20 flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse"></span>
                                                Completed
                                            </span>
                                        ) : (
                                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-status-warning-subtle text-status-warning border border-status-warning/20 flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-status-warning animate-pulse"></span>
                                                Pending Interview
                                            </span>
                                        )}

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
                                                Created:
                                            </span>
                                            <span className="font-semibold text-text-primary">
                                                {new Date(assessment.createdAt).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric"
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                {isCompleted ? (
                                    <div className="space-y-2">
                                        <button
                                            type="button"
                                            onClick={() => navigate("/user/assessment-report")}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-bg-surface border border-status-success/30 text-status-success hover:bg-status-success-subtle text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                                        >
                                            <svg className="w-4 h-4 text-status-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            <span>View AI Report & Recording</span>
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => handleTakeAssessment(assessment._id)}
                                        disabled={isStarting}
                                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isStarting ? (
                                            <>
                                                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                                                <span>Opening Studio...</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span>Start Live AI Interview</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Empty State when search/filters return 0 */}
            {safeAssessments.length > 0 && filteredAssessments.length === 0 && (
                <div className="bg-bg-surface border border-border-default rounded-xl p-8 sm:p-12 text-center max-w-md mx-auto space-y-4 shadow-subtle">
                    <div className="w-12 h-12 mx-auto rounded-lg bg-brand-subtle text-brand-primary flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-base font-bold text-text-primary">
                            No matching assessments
                        </h4>
                        <p className="text-xs text-text-muted">
                            Try adjusting your search keywords or switching difficulty filters.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            setSearchTerm("");
                            setDifficultyFilter("all");
                            setActiveTab("all");
                        }}
                        className="px-4 py-2 text-xs font-semibold rounded-lg bg-bg-muted hover:bg-border-default transition text-text-secondary cursor-pointer border border-border-default"
                    >
                        Reset Filters
                    </button>
                </div>
            )}

            {/* Empty State when zero assessments exist */}
            {safeAssessments.length === 0 && (
                <div className="bg-bg-surface border border-border-default border-t-4 border-t-brand-primary rounded-xl p-8 sm:p-12 text-center max-w-lg mx-auto space-y-6 shadow-subtle">
                    <div className="w-14 h-14 mx-auto rounded-xl bg-brand-subtle text-brand-primary flex items-center justify-center">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h6.586a2 2 0 011.414.586l3.414 3.414A2 2 0 0119 8.414V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-text-primary">
                            No Assessments Assigned Yet
                        </h3>
                        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-sm mx-auto">
                            When your mentor prepares and assigns an AI mock interview for your career development, it will appear here for you to practice.
                        </p>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/user/dashboard")}
                            className="px-4 py-2.5 rounded-lg bg-bg-muted hover:bg-border-default text-text-secondary text-xs font-semibold transition cursor-pointer border border-border-default"
                        >
                            Return to Dashboard
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/user/explore-mentors")}
                            className="px-4 py-2.5 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                        >
                            Find a Mentor
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}