import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchInterviewQuestions, generateInterviewQuestions } from "../../slices/user/InterviewQuestionsSlice";
import { fetchProfileDetails } from "../../slices/ProfileSlice";
import { specializations as catalogSpecializations } from "../../constants/jobOptions";
import Questions from "../../components/user/interviewQuestions/Questions";

export default function InterviewQuestions() {
    const dispatch = useDispatch();
    const { data, loading, generating, serverError } = useSelector((state) => {
        return state.interviewQuestions;
    });

    const { user } = useSelector((state) => state.auth);
    const profile = useSelector((state) => state.profile?.data?.profile || state.profile?.data);

    const [difficulty, setDifficulty] = useState("beginner");
    const [selectedSpecialization, setSelectedSpecialization] = useState("all");

    useEffect(() => {
        dispatch(fetchInterviewQuestions());
        if (!profile) {
            dispatch(fetchProfileDetails(user?.role || "user"));
        }
    }, [dispatch, user?.role, profile]);

    const jobRole = profile?.preferredJobRole || data?.role || "Software Developer";
    const userSpecs = Array.isArray(profile?.preferredSpecialization) ? profile.preferredSpecialization : [];
    const specializations = userSpecs.length > 0 ? userSpecs : (catalogSpecializations[jobRole] || []);

    function handleGenerate() {
        dispatch(generateInterviewQuestions({ 
            difficulty, 
            specialization: selectedSpecialization 
        }));
    }

    // Shimmer Skeleton Loader
    if (loading) {
        return (
            <div className="p-6 sm:p-8 lg:p-10 max-w-5xl mx-auto space-y-8 text-left animate-pulse">
                <div className="space-y-2 pb-6 border-b border-[#E2E8F0]/80 dark:border-zinc-800">
                    <div className="w-64 h-8 bg-slate-200 dark:bg-zinc-800 rounded-xl"></div>
                    <div className="w-96 h-4 bg-slate-200/60 dark:bg-zinc-800/60 rounded-lg"></div>
                </div>

                <div className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-2xl p-6 h-28"></div>

                <div className="space-y-4">
                    {[1, 2, 3, 4].map((n) => (
                        <div
                            key={n}
                            className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-2xl p-6 h-28 flex flex-col justify-between"
                        >
                            <div className="flex justify-between items-center">
                                <div className="w-16 h-5 bg-slate-200 dark:bg-zinc-800 rounded-full"></div>
                                <div className="w-20 h-5 bg-slate-200 dark:bg-zinc-800 rounded-full"></div>
                            </div>
                            <div className="w-3/4 h-5 bg-slate-200 dark:bg-zinc-800 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 sm:p-8 lg:p-10 max-w-5xl mx-auto space-y-8 text-left">
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E2E8F0] dark:border-zinc-800">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        AI Interview Questions
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
                        Practice role-specific interview challenges and review model responses curated for your career path.
                    </p>
                </div>

                {jobRole && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Target Role:</span>
                        <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/60 shadow-2xs">
                            {jobRole}
                        </span>
                    </div>
                )}
            </div>

            {/* Server Error Alert */}
            {serverError && !loading && (
                <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div className="flex-1 text-left">
                        <h4 className="text-sm font-semibold text-red-900 dark:text-red-200">
                            Failed to process interview questions
                        </h4>
                        <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">
                            {serverError?.status ? `Error ${serverError.status}: ` : ""}{serverError?.message || (typeof serverError === "string" ? serverError : "Something went wrong.")}
                        </p>
                        <button
                            type="button"
                            onClick={() => dispatch(fetchInterviewQuestions())}
                            className="mt-3 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            )}

            {/* Generator Toolbar Card */}
            <div className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 border-t-4 border-t-indigo-500 dark:border-t-indigo-500 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6 text-left">
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-[#E2E8F0]/80 dark:border-zinc-800/80">
                    <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">
                            Configure AI Interview Challenge
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                            Tailor question focus based on your target role, preferred specialization, and difficulty.
                        </p>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-zinc-800 text-[11px] font-semibold text-indigo-900 dark:text-zinc-300 border border-indigo-100 dark:border-zinc-700">
                        <span className="text-slate-400 dark:text-zinc-500">Role:</span>
                        <span>{jobRole}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Specialization Dropdown */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                                Preferred Specialization
                            </label>
                            <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                                {specializations.length} available
                            </span>
                        </div>

                        <select
                            value={selectedSpecialization}
                            onChange={(e) => setSelectedSpecialization(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0D8C8] dark:border-zinc-700 bg-white dark:bg-zinc-950/60 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors cursor-pointer"
                        >
                            <option value="all">
                                All Specializations {specializations.length > 0 ? `(${specializations.join(", ")})` : ""}
                            </option>
                            {specializations.map((spec, index) => (
                                <option key={index} value={spec} className="dark:bg-zinc-900">
                                    {spec} Focus
                                </option>
                            ))}
                        </select>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                            Select a specific specialization from your profile to practice targeted technical scenarios.
                        </p>
                    </div>

                    {/* Difficulty Segmented Selector */}
                    <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                            Difficulty Level
                        </label>

                        <div className="flex items-center p-1 rounded-xl bg-slate-200/50 dark:bg-zinc-800 border border-[#E2E8F0] dark:border-zinc-700/60 h-[42px]">
                            {["beginner", "intermediate", "advanced"].map((lvl) => (
                                <button
                                    key={lvl}
                                    type="button"
                                    onClick={() => setDifficulty(lvl)}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-200 cursor-pointer text-center ${
                                        difficulty === lvl
                                            ? "bg-[#FFFFFF] dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs font-bold"
                                            : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                                    }`}
                                >
                                    {lvl}
                                </button>
                            ))}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                            Adjusts the depth of system design, edge cases, and algorithmic complexity.
                        </p>
                    </div>
                </div>

                {/* Footer Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#E2E8F0]/80 dark:border-zinc-800/80">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>
                            Focus: <strong className="text-slate-800 dark:text-zinc-200">{jobRole}</strong>
                            {" "}&bull;{" "}
                            <strong className="text-slate-800 dark:text-zinc-200 capitalize">
                                {selectedSpecialization === "all" ? "All Specializations" : selectedSpecialization}
                            </strong>
                            {" "}&bull;{" "}
                            <strong className="text-slate-800 dark:text-zinc-200 capitalize">{difficulty}</strong>
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={handleGenerate}
                        disabled={generating}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-violet-700 dark:from-indigo-600 dark:to-indigo-700 dark:hover:from-indigo-700 dark:hover:to-indigo-800 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 dark:shadow-indigo-600/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {generating ? (
                            <>
                                <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Generating AI Questions...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span>Generate Questions</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Empty State */}
            {!loading && !serverError && !data && (
                <div className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-2xl p-8 sm:p-10 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        No Questions Generated Yet
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                        Select your preferred specialization and difficulty above and click <strong>Generate Questions</strong> to generate comprehensive interview questions tailored to your target role.
                    </p>
                </div>
            )}

            {/* Questions List */}
            {data && <Questions />}
        </div>
    );
}