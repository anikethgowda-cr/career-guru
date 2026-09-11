import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchResumeAnalysis } from "../../slices/user/DashboardSlice";

import Strengths from "../../components/user/dashboard/Strengths";
import Weakness from "../../components/user/dashboard/Weakness";
import Suggestion from "../../components/user/dashboard/Suggestions";
import Skills from "../../components/user/dashboard/Skills";
import AtsSpeedometer from "../../components/user/dashboard/AtsSpeedometor.jsx.jsx";
import MissingSkills from "../../components/user/dashboard/MissingSkills.jsx";

export default function Dashboard() {
  const dispatch = useDispatch();

  const { data, loading, serverError } = useSelector((state) => {
    return state.dashboard;
  });

  useEffect(() => {
    dispatch(fetchResumeAnalysis());
  }, [dispatch]);

  // Server Error State
  if (serverError && !loading) {
    return (
      <div className="p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto text-left">
        <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1 text-left">
            <h3 className="text-base font-bold text-red-900 dark:text-red-200">
              Unable to Load Resume Analysis
            </h3>
            <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 mt-1">
              {serverError?.status ? `Error ${serverError.status}: ` : ""}{serverError?.message || (typeof serverError === "string" ? serverError : "Failed to connect to the resume analysis service.")}
            </p>
            <div className="flex items-center gap-3 mt-4">
              <button
                type="button"
                onClick={() => dispatch(fetchResumeAnalysis())}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Retry Analysis
              </button>
              <Link
                to="/user/profile"
                className="px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/60 transition-colors"
              >
                Check Resume Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty State (No Analysis yet)
  if (!loading && !serverError && !data) {
    return (
      <div className="p-6 sm:p-8 lg:p-10 max-w-3xl mx-auto text-left">
        <div className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 border-t-4 border-t-indigo-500 dark:border-t-indigo-500 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6 text-left">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Add resume to see the report
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
              Upload your PDF resume in your profile to unlock your ATS compatibility score, strength breakdowns, missing skill gaps, and AI career guidance.
            </p>
          </div>
          <Link
            to="/user/profile"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-600 dark:to-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <span>Add Resume in Profile</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  // Loading State
  if (loading) {
    return (
      <div className="p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto space-y-8 text-left animate-pulse">
        {/* Skeleton Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-zinc-800">
          <div className="space-y-2">
            <div className="w-56 sm:w-72 h-8 bg-slate-200 dark:bg-zinc-800 rounded-xl"></div>
            <div className="w-72 sm:w-96 h-4 bg-slate-200/60 dark:bg-zinc-800/60 rounded-lg"></div>
          </div>
          <div className="w-36 h-7 bg-slate-200/80 dark:bg-zinc-800 rounded-full"></div>
        </div>

        {/* Row 1: 3 Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {/* Card 1: ATS Gauge Skeleton */}
          <div className="bg-white/80 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 border-t-4 border-t-indigo-400 dark:border-t-indigo-700 rounded-2xl p-6 min-h-[320px] flex flex-col justify-between items-center">
            <div className="w-full flex justify-between">
              <div className="w-24 h-4 bg-slate-200 dark:bg-zinc-800 rounded"></div>
              <div className="w-16 h-4 bg-slate-200 dark:bg-zinc-800 rounded-full"></div>
            </div>
            <div className="w-40 h-24 rounded-t-full border-8 border-b-0 border-slate-200 dark:border-zinc-800 my-auto"></div>
            <div className="w-32 h-3 bg-slate-200/60 dark:bg-zinc-800/60 rounded"></div>
          </div>

          {/* Card 2: Strengths Skeleton */}
          <div className="bg-white/80 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 border-t-4 border-t-emerald-400 dark:border-t-emerald-700 rounded-2xl p-6 min-h-[320px] flex flex-col justify-between">
            <div className="w-full flex justify-between items-center pb-3 border-b border-slate-100 dark:border-zinc-800/80">
              <div className="w-28 h-5 bg-slate-200 dark:bg-zinc-800 rounded"></div>
              <div className="w-14 h-4 bg-slate-200 dark:bg-zinc-800 rounded-full"></div>
            </div>
            <div className="space-y-3 my-auto">
              <div className="w-full h-8 bg-slate-100 dark:bg-zinc-800/50 rounded-xl"></div>
              <div className="w-full h-8 bg-slate-100 dark:bg-zinc-800/50 rounded-xl"></div>
              <div className="w-full h-8 bg-slate-100 dark:bg-zinc-800/50 rounded-xl"></div>
            </div>
          </div>

          {/* Card 3: Weaknesses Skeleton */}
          <div className="bg-white/80 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 border-t-4 border-t-indigo-400 dark:border-t-amber-700 rounded-2xl p-6 min-h-[320px] flex flex-col justify-between">
            <div className="w-full flex justify-between items-center pb-3 border-b border-slate-100 dark:border-zinc-800/80">
              <div className="w-32 h-5 bg-slate-200 dark:bg-zinc-800 rounded"></div>
              <div className="w-14 h-4 bg-slate-200 dark:bg-zinc-800 rounded-full"></div>
            </div>
            <div className="space-y-3 my-auto">
              <div className="w-full h-8 bg-slate-100 dark:bg-zinc-800/50 rounded-xl"></div>
              <div className="w-full h-8 bg-slate-100 dark:bg-zinc-800/50 rounded-xl"></div>
              <div className="w-full h-8 bg-slate-100 dark:bg-zinc-800/50 rounded-xl"></div>
            </div>
          </div>
        </div>

        {/* Row 2: 2 Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Card 4: Skills Skeleton */}
          <div className="bg-white/80 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 border-t-4 border-t-indigo-400 dark:border-t-indigo-700 rounded-2xl p-6 min-h-[260px] flex flex-col justify-between">
            <div className="w-full flex justify-between items-center pb-3 border-b border-slate-100 dark:border-zinc-800/80">
              <div className="w-32 h-5 bg-slate-200 dark:bg-zinc-800 rounded"></div>
              <div className="w-16 h-4 bg-slate-200 dark:bg-zinc-800 rounded-full"></div>
            </div>
            <div className="flex flex-wrap gap-2.5 my-auto">
              <div className="w-24 h-7 bg-slate-100 dark:bg-zinc-800 rounded-xl"></div>
              <div className="w-20 h-7 bg-slate-100 dark:bg-zinc-800 rounded-xl"></div>
              <div className="w-28 h-7 bg-slate-100 dark:bg-zinc-800 rounded-xl"></div>
              <div className="w-24 h-7 bg-slate-100 dark:bg-zinc-800 rounded-xl"></div>
              <div className="w-16 h-7 bg-slate-100 dark:bg-zinc-800 rounded-xl"></div>
              <div className="w-24 h-7 bg-slate-100 dark:bg-zinc-800 rounded-xl"></div>
            </div>
          </div>

          {/* Card 5: Missing Skills Skeleton */}
          <div className="bg-white/80 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 border-t-4 border-t-rose-400 dark:border-t-rose-700 rounded-2xl p-6 min-h-[260px] flex flex-col justify-between">
            <div className="w-full flex justify-between items-center pb-3 border-b border-slate-100 dark:border-zinc-800/80">
              <div className="w-32 h-5 bg-slate-200 dark:bg-zinc-800 rounded"></div>
              <div className="w-16 h-4 bg-slate-200 dark:bg-zinc-800 rounded-full"></div>
            </div>
            <div className="flex flex-wrap gap-2.5 my-auto">
              <div className="w-24 h-7 bg-slate-100 dark:bg-zinc-800 rounded-xl"></div>
              <div className="w-28 h-7 bg-slate-100 dark:bg-zinc-800 rounded-xl"></div>
              <div className="w-20 h-7 bg-slate-100 dark:bg-zinc-800 rounded-xl"></div>
              <div className="w-24 h-7 bg-slate-100 dark:bg-zinc-800 rounded-xl"></div>
            </div>
          </div>
        </div>

        {/* Row 3: Full-width Skeleton Card */}
        <div className="w-full bg-[#FFFFFF]/80 dark:bg-zinc-900/80 border border-[#E2E8F0]/80 dark:border-zinc-800 border-t-4 border-t-sky-400 dark:border-t-sky-700 rounded-2xl p-6 space-y-4">
          <div className="w-48 h-5 bg-slate-200 dark:bg-zinc-800 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="h-20 bg-slate-100 dark:bg-zinc-800/50 rounded-xl"></div>
            <div className="h-20 bg-slate-100 dark:bg-zinc-800/50 rounded-xl"></div>
            <div className="h-20 bg-slate-100 dark:bg-zinc-800/50 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto space-y-8 text-left">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E2E8F0] dark:border-zinc-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {data?.userId?.username || "User"} 👋
          </h1>
          <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1">
            Here is your comprehensive AI resume analysis and career roadmap.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Target Role:</span>
          <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/60 shadow-2xs">
            {data?.roleAnalysis?.role || "Software Developer"}
          </span>
        </div>
      </div>

      {/* Row 1: Top 3 Cards (ATS Score, Strengths, Weaknesses) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        <AtsSpeedometer />
        <Strengths />
        <Weakness />
      </div>

      {/* Row 2: Skills Analysis (2 Side-by-Side Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <Skills />
        <MissingSkills />
      </div>

      {/* Row 3: Actionable Advice (1 Wide Full-Width Card) */}
      <div className="w-full">
        <Suggestion />
      </div>
    </div>
  );
}