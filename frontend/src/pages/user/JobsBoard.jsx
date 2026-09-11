import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchJobs } from "../../slices/user/JobsSlice";
import { fetchProfileDetails } from "../../slices/ProfileSlice";
import JobCard from "../../components/user/jobsBoard/JobCard";

export default function JobsBoard() {
    const dispatch = useDispatch();

    const { loading, serverError, data } = useSelector((state) => state.jobs);
    const { user } = useSelector((state) => state.auth);
    const profile = useSelector((state) => state.profile?.data?.profile || state.profile?.data);

    const [searchTerm, setSearchTerm] = useState("");
    const [locationFilter, setLocationFilter] = useState("");

    useEffect(() => {
        dispatch(fetchJobs());
        if (!profile) {
            dispatch(fetchProfileDetails(user?.role || "user"));
        }
    }, [dispatch, profile, user?.role]);

    const jobRole = profile?.preferredJobRole || "Software Developer";

    // Filter jobs by title, company, and location
    const filteredJobs = useMemo(() => {
        if (!Array.isArray(data)) return [];
        return data.filter((job) => {
            const matchesSearch =
                !searchTerm.trim() ||
                job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.company?.display_name?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesLocation =
                !locationFilter.trim() ||
                job.location?.display_name?.toLowerCase().includes(locationFilter.toLowerCase());

            return matchesSearch && matchesLocation;
        });
    }, [data, searchTerm, locationFilter]);

    // Shimmering Skeleton Loader
    if (loading) {
        return (
            <div className="p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto space-y-8 text-left animate-pulse">
                {/* Header Skeleton */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]/80 dark:border-zinc-800">
                    <div className="space-y-2">
                        <div className="w-56 h-8 bg-slate-200 dark:bg-zinc-800 rounded-xl"></div>
                        <div className="w-80 h-4 bg-slate-200/60 dark:bg-zinc-800/60 rounded-lg"></div>
                    </div>
                    <div className="w-32 h-8 bg-slate-200/80 dark:bg-zinc-800/80 rounded-full"></div>
                </div>

                {/* Filter Bar Skeleton */}
                <div className="h-14 bg-slate-200/50 dark:bg-zinc-800/50 rounded-2xl"></div>

                {/* 6 Grid Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div
                            key={n}
                            className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-2xl p-6 h-56 flex flex-col justify-between"
                        >
                            <div className="flex items-start gap-3.5">
                                <div className="w-11 h-11 bg-slate-200 dark:bg-zinc-800 rounded-xl"></div>
                                <div className="space-y-2 flex-1">
                                    <div className="w-3/4 h-4 bg-slate-200 dark:bg-zinc-800 rounded"></div>
                                    <div className="w-1/2 h-3 bg-slate-200/70 dark:bg-zinc-800/70 rounded"></div>
                                </div>
                            </div>
                            <div className="w-2/3 h-3.5 bg-slate-200/60 dark:bg-zinc-800/60 rounded"></div>
                            <div className="flex justify-between items-center pt-3 border-t border-slate-200/50 dark:border-zinc-800/60">
                                <div className="w-20 h-4 bg-slate-200 dark:bg-zinc-800 rounded"></div>
                                <div className="w-16 h-7 bg-slate-200 dark:bg-zinc-800 rounded-lg"></div>
                            </div>
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
                        Live Jobs Board
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
                        Explore open positions and tech openings curated for your target career role.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    {jobRole && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Matched Role:</span>
                            <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/60 shadow-2xs">
                                {jobRole}
                            </span>
                        </div>
                    )}
                    {Array.isArray(data) && data.length > 0 && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-200/60 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-300/60 dark:border-zinc-700">
                            {filteredJobs.length} {filteredJobs.length === 1 ? "Job" : "Jobs"} Available
                        </span>
                    )}
                </div>
            </div>

            {/* Server Error Alert */}
            {serverError && (
                <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div className="flex-1 text-left">
                        <h4 className="text-sm font-semibold text-red-900 dark:text-red-200">
                            Unable to retrieve jobs feed
                        </h4>
                        <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">
                            {serverError?.status ? `Status ${serverError.status}: ` : ""}{serverError?.message || "Failed to load live job postings."}
                        </p>
                        <button
                            type="button"
                            onClick={() => dispatch(fetchJobs())}
                            className="mt-3 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                        >
                            Retry Now
                        </button>
                    </div>
                </div>
            )}

            {/* Filter & Search Toolbar */}
            {!serverError && Array.isArray(data) && data.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
                    {/* Keyword / Company Search */}
                    <div className="relative flex-1 w-full">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Filter by job title or company..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E0D8C8] dark:border-zinc-700 bg-white dark:bg-zinc-950/60 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 placeholder:text-slate-400 dark:placeholder:text-zinc-500 transition-colors"
                        />
                    </div>

                    {/* Location Filter */}
                    <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                            placeholder="Filter by city/location..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E0D8C8] dark:border-zinc-700 bg-white dark:bg-zinc-950/60 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 placeholder:text-slate-400 dark:placeholder:text-zinc-500 transition-colors"
                        />
                    </div>

                    {/* Reset Filters */}
                    {(searchTerm || locationFilter) && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchTerm("");
                                setLocationFilter("");
                            }}
                            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
                        >
                            Clear
                        </button>
                    )}
                </div>
            )}

            {/* Empty State: No Jobs from API */}
            {!serverError && Array.isArray(data) && data.length === 0 && (
                <div className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-2xl p-10 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        No Openings Available
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-md mx-auto">
                        No listings were returned for your preferred role. Update your target career role in your profile or check back later.
                    </p>
                </div>
            )}

            {/* Jobs Grid Card Component */}
            {!serverError && Array.isArray(data) && data.length > 0 && (
                <JobCard jobs={filteredJobs} />
            )}
        </div>
    );
}