import { useEffect } from "react";

export default function JobDetailsModal({ job, onClose }) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    if (!job) return null;

    const formatSalary = () => {
        if (!job.salary_min && !job.salary_max) return null;
        const fmt = (n) =>
            new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0
            }).format(n);

        if (job.salary_min && job.salary_max) return `${fmt(job.salary_min)} – ${fmt(job.salary_max)}`;
        if (job.salary_min) return `From ${fmt(job.salary_min)}`;
        if (job.salary_max) return `Up to ${fmt(job.salary_max)}`;
        return null;
    };

    const formattedSalary = formatSalary();

    const formatDate = (d) => {
        if (!d) return null;
        try {
            return new Date(d).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric"
            });
        } catch {
            return d;
        }
    };

    const getInitials = (name) => {
        if (!name) return "CG";
        const parts = name.trim().split(/\s+/);
        return parts.length === 1
            ? parts[0].slice(0, 2).toUpperCase()
            : (parts[0][0] + parts[1][0]).toUpperCase();
    };

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="job-modal-title"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
            className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
        >
            <div className="relative w-full max-w-xl bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-left transition-colors duration-300">
                {/* Header */}
                <div className="p-5 sm:p-6 flex items-start gap-3.5 border-b border-[#E2E8F0]/80 dark:border-zinc-800">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 dark:from-indigo-600 dark:to-indigo-700 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                        {getInitials(job.company?.display_name)}
                    </div>

                    <div className="flex-1 min-w-0 pr-2">
                        <h3
                            id="job-modal-title"
                            className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate"
                        >
                            {job.title}
                        </h3>
                        <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-zinc-400 truncate mt-0.5">
                            {job.company?.display_name || "Confidential Employer"}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close modal"
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-slate-200/50 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Scrollable Content Body */}
                <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-left text-xs sm:text-sm">
                    {/* Location & Metadata Chips */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-400 text-xs font-medium">
                            <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{job.location?.display_name || "Location not specified"}</span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {job.category?.label && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-zinc-800 text-indigo-900 dark:text-zinc-300 border border-indigo-100 dark:border-zinc-700">
                                    <span>🏷️</span>
                                    <span>{job.category.label}</span>
                                </span>
                            )}
                            {job.contract_time && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 capitalize">
                                    <span>⏱️</span>
                                    <span>{job.contract_time.replace(/_/g, " ")}</span>
                                </span>
                            )}
                            {job.contract_type && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 capitalize">
                                    <span>📄</span>
                                    <span>{job.contract_type.replace(/_/g, " ")}</span>
                                </span>
                            )}
                            {job.created && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                                    <span>📅</span>
                                    <span>Posted {formatDate(job.created)}</span>
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Salary Highlight Card */}
                    {formattedSalary && (
                        <div className="p-4 rounded-xl bg-white dark:bg-zinc-950/60 border border-[#E2E8F0] dark:border-zinc-800 flex items-center justify-between">
                            <div>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500">
                                    Offered Compensation
                                </span>
                                <div className="text-base sm:text-lg font-extrabold text-indigo-700 dark:text-indigo-400 mt-0.5">
                                    {formattedSalary}
                                </div>
                            </div>
                            {job.salary_is_predicted === "1" && (
                                <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-indigo-50/60 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/60">
                                    Estimated
                                </span>
                            )}
                        </div>
                    )}

                    {/* Description */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                            Job Description
                        </h4>
                        <div className="p-4 rounded-xl bg-white/70 dark:bg-zinc-950/40 border border-[#E2E8F0]/80 dark:border-zinc-800/80 max-h-64 overflow-y-auto text-slate-700 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                            {job.description || "No full job description provided by the posting board."}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 sm:p-5 border-t border-[#E2E8F0]/80 dark:border-zinc-800 flex items-center justify-end gap-3 bg-[#F8FAFC]/50 dark:bg-zinc-900/50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-200/60 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700 transition-colors cursor-pointer"
                    >
                        Close
                    </button>

                    {job.redirect_url && (
                        <a
                            href={job.redirect_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-violet-700 dark:from-indigo-600 dark:to-indigo-700 dark:hover:from-indigo-700 dark:hover:to-indigo-800 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 dark:shadow-indigo-600/30 transition-all duration-200 cursor-pointer"
                        >
                            <span>Apply on Adzuna</span>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
