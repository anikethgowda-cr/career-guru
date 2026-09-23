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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-default">
                    <div className="space-y-2">
                        <div className="w-56 h-8 bg-bg-muted rounded-lg"></div>
                        <div className="w-80 h-4 bg-bg-muted rounded-lg"></div>
                    </div>
                    <div className="w-32 h-8 bg-bg-muted rounded-full"></div>
                </div>
                <div className="h-12 bg-bg-muted rounded-xl max-w-md"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div key={n} className="bg-bg-surface border border-border-default rounded-xl p-6 h-64 flex flex-col justify-between">
                            <div className="flex items-start gap-3.5">
                                <div className="w-12 h-12 bg-bg-muted rounded-xl"></div>
                                <div className="space-y-2 flex-1">
                                    <div className="w-3/4 h-4 bg-bg-muted rounded"></div>
                                    <div className="w-1/2 h-3 bg-bg-muted rounded"></div>
                                </div>
                            </div>
                            <div className="h-12 bg-bg-muted rounded-lg"></div>
                            <div className="w-2/3 h-4 bg-bg-muted rounded"></div>
                            <div className="flex justify-between items-center pt-3 border-t border-border-default">
                                <div className="w-20 h-4 bg-bg-muted rounded"></div>
                                <div className="w-24 h-7 bg-bg-muted rounded-lg"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto space-y-8 text-left theme-transition">
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border-default">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                        Explore Verified Mentors
                    </h1>
                    <p className="text-xs sm:text-sm text-text-secondary">
                        Connect with seasoned industry engineers and technical leads for 1-on-1 guidance.
                    </p>
                </div>

                {Array.isArray(mentors) && (
                    <div className="flex items-center gap-2">
                        <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-brand-subtle text-brand-primary border border-border-default shadow-subtle">
                            {filteredMentors.length} {filteredMentors.length === 1 ? "Mentor" : "Mentors"} Available
                        </span>
                    </div>
                )}
            </div>

            {/* Error Alert */}
            {serverError && (
                <div className="p-5 rounded-xl bg-status-danger-subtle border border-red-200 dark:border-red-900/60 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-status-danger shrink-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div className="flex-1 text-left">
                        <h4 className="text-sm font-semibold text-red-900 dark:text-red-200">Failed to load mentors directory</h4>
                        <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">
                            {serverError?.status ? `Status ${serverError.status}: ` : ""}{serverError?.message || "Please check your network and try again."}
                        </p>
                        <button type="button" onClick={() => dispatch(fetchMentors())} className="mt-3 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors cursor-pointer">
                            Try Again
                        </button>
                    </div>
                </div>
            )}

            {/* Search Filter Toolbar */}
            {!serverError && Array.isArray(mentors) && mentors.length > 0 && (
                <div className="p-4 rounded-xl bg-bg-surface border border-border-default shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="relative flex-1 w-full max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by mentor name, company, or specialization..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border-default bg-bg-surface text-text-primary text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-ring focus:border-brand-primary placeholder:text-text-muted transition-colors"
                        />
                    </div>

                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => setSearchTerm("")}
                            className="px-3.5 py-2 rounded-lg text-xs font-semibold text-text-secondary hover:bg-bg-muted transition-colors cursor-pointer shrink-0"
                        >
                            Clear Search
                        </button>
                    )}
                </div>
            )}

            {/* Empty State */}
            {!serverError && filteredMentors.length === 0 && (
                <div className="bg-bg-surface border border-border-default rounded-xl p-10 text-center space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-brand-subtle text-brand-primary mx-auto flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-text-primary">No Mentors Found</h3>
                    <p className="text-xs sm:text-sm text-text-secondary max-w-sm mx-auto">
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
