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
        <div className="p-6 rounded-xl bg-status-danger-subtle border border-red-200 dark:border-red-900/60 flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-status-danger shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
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
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Retry Analysis
              </button>
              <Link
                to="/user/profile"
                className="px-4 py-2 rounded-lg bg-bg-surface border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs font-semibold hover:bg-status-danger-subtle transition-colors"
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
        <div className="bg-bg-surface border border-border-default border-t-4 border-t-brand-primary rounded-xl p-8 sm:p-10 shadow-card space-y-6 text-left">
          <div className="w-12 h-12 rounded-xl bg-brand-subtle text-brand-primary flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-text-primary">
              Add resume to see the report
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Upload your PDF resume in your profile to unlock your ATS compatibility score, strength breakdowns, missing skill gaps, and AI career guidance.
            </p>
          </div>
          <Link
            to="/user/profile"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <span>Add Resume in Profile</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border-default">
          <div className="space-y-2">
            <div className="w-56 sm:w-72 h-8 bg-bg-muted rounded-lg"></div>
            <div className="w-72 sm:w-96 h-4 bg-bg-muted rounded-lg"></div>
          </div>
          <div className="w-36 h-7 bg-bg-muted rounded-full"></div>
        </div>

        {/* Row 1: 3 Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-bg-surface border border-border-default rounded-xl p-6 min-h-[320px] flex flex-col justify-between">
              <div className="w-full flex justify-between">
                <div className="w-24 h-4 bg-bg-muted rounded"></div>
                <div className="w-16 h-4 bg-bg-muted rounded-full"></div>
              </div>
              <div className="space-y-3 my-auto">
                <div className="w-full h-8 bg-bg-muted rounded-lg"></div>
                <div className="w-full h-8 bg-bg-muted rounded-lg"></div>
                <div className="w-full h-8 bg-bg-muted rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Row 2: 2 Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-bg-surface border border-border-default rounded-xl p-6 min-h-[260px] flex flex-col justify-between">
              <div className="w-full flex justify-between items-center pb-3 border-b border-border-default">
                <div className="w-32 h-5 bg-bg-muted rounded"></div>
                <div className="w-16 h-4 bg-bg-muted rounded-full"></div>
              </div>
              <div className="flex flex-wrap gap-2.5 my-auto">
                {[...Array(6)].map((_, j) => (
                  <div key={j} className="w-24 h-7 bg-bg-muted rounded-lg"></div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Row 3: Full-width Skeleton Card */}
        <div className="w-full bg-bg-surface border border-border-default rounded-xl p-6 space-y-4">
          <div className="w-48 h-5 bg-bg-muted rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto space-y-8 text-left">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border-default">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
            Welcome back, {data?.userId?.username || "User"} 👋
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Here is your comprehensive AI resume analysis and career roadmap.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted font-medium">Target Role:</span>
          <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold bg-brand-subtle text-brand-primary border border-border-default shadow-subtle">
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