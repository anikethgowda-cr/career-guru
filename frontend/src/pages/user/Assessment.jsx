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
                return "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60";
            case "medium":
                return "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60";
            case "hard":
                return "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60";
            default:
                return "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700";
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E2E8F0]/80 dark:border-zinc-800">
                    <div className="space-y-2">
                        <div className="w-64 h-8 bg-slate-200 dark:bg-zinc-800 rounded-xl"></div>
                        <div className="w-96 h-4 bg-slate-200/60 dark:bg-zinc-800/60 rounded-lg"></div>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-24 h-8 bg-slate-200 dark:bg-zinc-800 rounded-full"></div>
                        <div className="w-24 h-8 bg-slate-200 dark:bg-zinc-800 rounded-full"></div>
                    </div>
                </div>

                {/* Filter Bar Skeleton */}
                <div className="h-16 bg-slate-200/50 dark:bg-zinc-800/50 rounded-2xl"></div>

                {/* Cards Skeleton Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div
                            key={n}
                            className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-2xl p-6 h-64 flex flex-col justify-between"
                        >
                            <div className="flex justify-between items-center">
                                <div className="w-20 h-5 bg-slate-200 dark:bg-zinc-800 rounded-full"></div>
                                <div className="w-16 h-5 bg-slate-200 dark:bg-zinc-800 rounded-full"></div>
                            </div>
                            <div className="w-3/4 h-5 bg-slate-200 dark:bg-zinc-800 rounded"></div>
                            <div className="space-y-2">
                                <div className="w-full h-3 bg-slate-200/60 dark:bg-zinc-800/60 rounded"></div>
                                <div className="w-2/3 h-3 bg-slate-200/60 dark:bg-zinc-800/60 rounded"></div>
                            </div>
                            <div className="w-full h-10 bg-slate-200 dark:bg-zinc-800 rounded-xl"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto space-y-8 text-left transition-colors duration-300">
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E2E8F0] dark:border-zinc-800">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        AI Interview Assessments
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
                        Practice mentor-assigned interview challenges with live voice guidance, camera stream, and speech evaluation.
                    </p>
                </div>

                {/* Quick Stats Pills */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/60 shadow-2xs">
                        Total: {safeAssessments.length}
                    </span>
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 shadow-2xs">
                        Pending: {pendingAssessments.length}
                    </span>
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs">
                        Completed: {completedAssessments.length}
                    </span>
                </div>
            </div>

            {/* Error Banner with Retry */}
            {errorMessage && (
                <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-red-900 dark:text-red-200">
                                Failed to Load Assessments
                            </h4>
                            <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">
                                {errorMessage}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => dispatch(fetchAssessments())}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Filter & Controls Card */}
            <div className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between shadow-xs">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by title, role, or mentor..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-zinc-800/60 border border-[#E2E8F0] dark:border-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-2xs"
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => setSearchTerm("")}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Status Switcher Tabs & Difficulty Filters */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                    {/* Status Tabs */}
                    <div className="flex items-center p-1 bg-slate-100 dark:bg-zinc-800/80 rounded-xl border border-slate-200/70 dark:border-zinc-700/60 shrink-0">
                        <button
                            type="button"
                            onClick={() => setActiveTab("all")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                activeTab === "all"
                                    ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                            }`}
                        >
                            All ({safeAssessments.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("pending")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                activeTab === "pending"
                                    ? "bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-xs font-bold"
                                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                            }`}
                        >
                            Pending ({pendingAssessments.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("completed")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                activeTab === "completed"
                                    ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold"
                                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                            }`}
                        >
                            Completed ({completedAssessments.length})
                        </button>
                    </div>

                    {/* Difficulty Pills */}
                    <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-zinc-800/80 rounded-xl border border-slate-200/70 dark:border-zinc-700/60 shrink-0">
                        {["all", "easy", "medium", "hard"].map((diff) => (
                            <button
                                key={diff}
                                type="button"
                                onClick={() => setDifficultyFilter(diff)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                                    difficultyFilter === diff
                                        ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                                        : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                                }`}
                            >
                                {diff}
                            </button>
                        ))}
                    </div>
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
                                className={`bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
                                    isCompleted
                                        ? "border-t-4 border-t-emerald-500 dark:border-t-emerald-500"
                                        : "border-t-4 border-t-indigo-500 dark:border-t-indigo-500"
                                }`}
                            >
                                <div>
                                    {/* Top Status & Difficulty Badges */}
                                    <div className="flex items-start justify-between gap-3 mb-4">
                                        {isCompleted ? (
                                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                Completed
                                            </span>
                                        ) : (
                                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                                Pending Interview
                                            </span>
                                        )}

                                        <span
                                            className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold border capitalize ${getDifficultyBadge(
                                                assessment.difficulty
                                            )}`}
                                        >
                                            {assessment.difficulty}
                                        </span>
                                    </div>

                                    {/* Target Role Tag */}
                                    <div className="inline-block px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/60 text-xs font-semibold mb-2 shadow-2xs">
                                        {assessment.targetRole}
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug mb-4 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                        {assessment.title}
                                    </h3>

                                    {/* Metadata Details */}
                                    <div className="space-y-2.5 py-3.5 border-y border-slate-100 dark:border-zinc-800 mb-6 text-xs">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Assigned By Mentor:
                                            </span>
                                            <span className="font-semibold text-slate-800 dark:text-zinc-200">
                                                {assessment.mentorId?.username || "Mentor"}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Interview Rounds:
                                            </span>
                                            <span className="font-semibold text-slate-800 dark:text-zinc-200">
                                                {assessment.questions?.length || 0} Questions
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                Created:
                                            </span>
                                            <span className="font-semibold text-slate-800 dark:text-zinc-200">
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
                                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white dark:bg-zinc-900 border border-emerald-300 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                                        >
                                            <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-3xl p-8 sm:p-12 text-center max-w-md mx-auto space-y-4 shadow-xs">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">
                            No matching assessments
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">
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
                        className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 transition text-slate-700 dark:text-zinc-300 cursor-pointer"
                    >
                        Reset Filters
                    </button>
                </div>
            )}

            {/* Empty State when zero assessments exist */}
            {safeAssessments.length === 0 && (
                <div className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 border-t-4 border-t-indigo-500 rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto space-y-6 shadow-sm">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h6.586a2 2 0 011.414.586l3.414 3.414A2 2 0 0119 8.414V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            No Assessments Assigned Yet
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed max-w-sm mx-auto">
                            When your mentor prepares and assigns an AI mock interview for your career development, it will appear here for you to practice.
                        </p>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/user/dashboard")}
                            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-semibold transition cursor-pointer"
                        >
                            Return to Dashboard
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/user/assessment-report")}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
                        >
                            <span>Past Reports</span>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}