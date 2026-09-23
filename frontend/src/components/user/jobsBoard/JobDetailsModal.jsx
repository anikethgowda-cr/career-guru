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
            className="fixed inset-0 z-50 bg-bg-overlay backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
        >
            <div className="relative w-full max-w-xl bg-bg-surface border border-border-default rounded-xl shadow-dropdown flex flex-col max-h-[90vh] overflow-hidden text-left transition-colors duration-200">
                {/* Header */}
                <div className="p-5 sm:p-6 flex items-start gap-3.5 border-b border-border-default">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                        {getInitials(job.company?.display_name)}
                    </div>

                    <div className="flex-1 min-w-0 pr-2">
                        <h3
                            id="job-modal-title"
                            className="text-base sm:text-lg font-bold text-text-primary truncate"
                        >
                            {job.title}
                        </h3>
                        <p className="text-xs sm:text-sm font-medium text-text-secondary truncate mt-0.5">
                            {job.company?.display_name || "Confidential Employer"}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close modal"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-muted transition-colors cursor-pointer shrink-0"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Scrollable Content Body */}
                <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-left text-xs sm:text-sm">
                    {/* Location & Metadata Chips */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-1.5 text-text-secondary text-xs font-medium">
                            <svg className="w-4 h-4 text-brand-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{job.location?.display_name || "Location not specified"}</span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {job.category?.label && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-brand-subtle text-brand-primary border border-brand-primary/20">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                    <span>{job.category.label}</span>
                                </span>
                            )}
                            {job.contract_time && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-bg-muted text-text-secondary border border-border-default capitalize">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{job.contract_time.replace(/_/g, " ")}</span>
                                </span>
                            )}
                            {job.contract_type && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-bg-muted text-text-secondary border border-border-default capitalize">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span>{job.contract_type.replace(/_/g, " ")}</span>
                                </span>
                            )}
                            {job.created && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-bg-muted text-text-secondary border border-border-default">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>Posted {formatDate(job.created)}</span>
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Salary Highlight Card */}
                    {formattedSalary && (
                        <div className="p-4 rounded-lg bg-bg-muted/50 border border-border-default flex items-center justify-between">
                            <div>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                                    Offered Compensation
                                </span>
                                <div className="text-base sm:text-lg font-bold text-brand-primary mt-0.5">
                                    {formattedSalary}
                                </div>
                            </div>
                            {job.salary_is_predicted === "1" && (
                                <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-brand-subtle text-brand-primary border border-brand-primary/20">
                                    Estimated
                                </span>
                            )}
                        </div>
                    )}

                    {/* Description */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                            Job Description
                        </h4>
                        <div className="p-4 rounded-lg bg-bg-muted/40 border border-border-default max-h-64 overflow-y-auto text-text-secondary text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                            {job.description || "No full job description provided by the posting board."}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 sm:p-5 border-t border-border-default flex items-center justify-end gap-3 bg-bg-muted/30">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-muted border border-border-default transition-colors cursor-pointer"
                    >
                        Close
                    </button>

                    {job.redirect_url && (
                        <a
                            href={job.redirect_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold text-xs sm:text-sm shadow-xs transition-all duration-200 cursor-pointer"
                        >
                            <span>Apply on Adzuna</span>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
