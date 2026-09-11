import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMentors } from "../../slices/user/MentorSlice";
import MentorsCard from "../../components/user/exploreMentors/MentorsCard";

export default function ExploreMentors() {
    const dispatch = useDispatch();
    const { mentors, loading, serverError } = useSelector((state) => state.mentor);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        dispatch(fetchMentors());
    }, [dispatch]);

    const filteredMentors = useMemo(() => {
        if (!Array.isArray(mentors)) return [];
        if (!searchTerm.trim()) return mentors;

        const term = searchTerm.toLowerCase();
        return mentors.filter((m) => {
            const nameMatch = m.name?.toLowerCase().includes(term);
            const orgMatch = (m.organization || m.origin)?.toLowerCase().includes(term);
            const desigMatch = m.designation?.toLowerCase().includes(term);
            const specMatch = m.specialization?.some((s) => s.toLowerCase().includes(term));
            const expMatch = m.expertIn?.some((e) => e.toLowerCase().includes(term));

            return nameMatch || orgMatch || desigMatch || specMatch || expMatch;
        });
    }, [mentors, searchTerm]);

    // Shimmer Skeleton Loader
    if (loading) {
        return (
            <div className="p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto space-y-8 text-left animate-pulse">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]/80 dark:border-zinc-800">
                    <div className="space-y-2">
                        <div className="w-56 h-8 bg-slate-200 dark:bg-zinc-800 rounded-xl"></div>
                        <div className="w-80 h-4 bg-slate-200/60 dark:bg-zinc-800/60 rounded-lg"></div>
                    </div>
                    <div className="w-32 h-8 bg-slate-200/80 dark:bg-zinc-800/80 rounded-full"></div>
                </div>

                <div className="h-12 bg-slate-200/50 dark:bg-zinc-800/50 rounded-2xl max-w-md"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div
                            key={n}
                            className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-2xl p-6 h-64 flex flex-col justify-between"
                        >
                            <div className="flex items-start gap-3.5">
                                <div className="w-12 h-12 bg-slate-200 dark:bg-zinc-800 rounded-2xl"></div>
                                <div className="space-y-2 flex-1">
                                    <div className="w-3/4 h-4 bg-slate-200 dark:bg-zinc-800 rounded"></div>
                                    <div className="w-1/2 h-3 bg-slate-200/70 dark:bg-zinc-800/70 rounded"></div>
                                </div>
                            </div>
                            <div className="h-12 bg-slate-200/50 dark:bg-zinc-800/50 rounded-xl"></div>
                            <div className="w-2/3 h-4 bg-slate-200/60 dark:bg-zinc-800/60 rounded"></div>
                            <div className="flex justify-between items-center pt-3 border-t border-slate-200/50 dark:border-zinc-800/60">
                                <div className="w-20 h-4 bg-slate-200 dark:bg-zinc-800 rounded"></div>
                                <div className="w-24 h-7 bg-slate-200 dark:bg-zinc-800 rounded-lg"></div>
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
                        Explore Verified Mentors
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
                        Connect with seasoned industry engineers and technical leads for 1-on-1 guidance.
                    </p>
                </div>

                {Array.isArray(mentors) && (
                    <div className="flex items-center gap-2">
                        <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/60 shadow-2xs">
                            {filteredMentors.length} {filteredMentors.length === 1 ? "Mentor" : "Mentors"} Available
                        </span>
                    </div>
                )}
            </div>

            {/* Error Alert */}
            {serverError && (
                <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div className="flex-1 text-left">
                        <h4 className="text-sm font-semibold text-red-900 dark:text-red-200">
                            Failed to load mentors directory
                        </h4>
                        <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">
                            {serverError?.status ? `Status ${serverError.status}: ` : ""}{serverError?.message || "Please check your network and try again."}
                        </p>
                        <button
                            type="button"
                            onClick={() => dispatch(fetchMentors())}
                            className="mt-3 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            )}

            {/* Search Filter Toolbar */}
            {!serverError && Array.isArray(mentors) && mentors.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="relative flex-1 w-full max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by mentor name, company, or specialization..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E0D8C8] dark:border-zinc-700 bg-white dark:bg-zinc-950/60 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 placeholder:text-slate-400 dark:placeholder:text-zinc-500 transition-colors"
                        />
                    </div>

                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => setSearchTerm("")}
                            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
                        >
                            Clear Search
                        </button>
                    )}
                </div>
            )}

            {/* Empty State */}
            {!serverError && filteredMentors.length === 0 && (
                <div className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-2xl p-10 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        No Mentors Found
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-sm mx-auto">
                        {searchTerm
                            ? `No mentors matched "${searchTerm}". Try searching for another skill or company.`
                            : "Currently no mentors are listed. Please check back shortly."}
                    </p>
                </div>
            )}

            {/* Mentors Card Grid */}
            {!serverError && filteredMentors.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMentors.map((mentor) => (
                        <MentorsCard key={mentor._id} mentor={mentor} />
                    ))}
                </div>
            )}
        </div>
    );
}
