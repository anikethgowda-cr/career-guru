import { useState } from "react";
import { useSelector } from "react-redux";
import JobDetailsModal from "./JobDetailsModal";

export default function JobCard({ jobs: propJobs }) {
    const [selectedJob, setSelectedJob] = useState(null);
    const storeJobs = useSelector((state) => state.jobs?.data);

    const jobs = propJobs !== undefined ? propJobs : storeJobs;

    const getInitials = (name) => {
        if (!name) return "CG";
        const parts = name.trim().split(/\s+/);
        return parts.length === 1
            ? parts[0].slice(0, 2).toUpperCase()
            : (parts[0][0] + parts[1][0]).toUpperCase();
    };

    const formatSalary = (job) => {
        if (!job.salary_min && !job.salary_max) return null;
        const fmt = (n) =>
            new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0
            }).format(n);

        if (job.salary_min && job.salary_max) return `${fmt(job.salary_min)} - ${fmt(job.salary_max)}`;
        if (job.salary_min) return `From ${fmt(job.salary_min)}`;
        if (job.salary_max) return `Up to ${fmt(job.salary_max)}`;
        return null;
    };

    if (!jobs || jobs.length === 0) {
        return (
            <div className="p-10 rounded-xl bg-bg-surface border border-border-default text-center space-y-3 shadow-subtle">
                <div className="w-12 h-12 rounded-xl bg-brand-subtle text-brand-primary mx-auto flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <h3 className="text-base font-semibold text-text-primary">
                    No matching positions found
                </h3>
                <p className="text-xs text-text-secondary max-w-sm mx-auto">
                    Try adjusting your search keywords or location filters to discover active opportunities.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                {jobs.map((job) => {
                    const salaryText = formatSalary(job);
                    return (
                        <div
                            key={job.id}
                            className="bg-bg-surface border border-border-default hover:border-brand-primary/50 rounded-xl p-5 sm:p-6 shadow-subtle hover:shadow-card transition-all duration-200 flex flex-col justify-between group"
                        >
                            <div className="space-y-4">
                                {/* Header: Logo + Titles */}
                                <div className="flex items-start gap-3.5">
                                    <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0 group-hover:scale-105 transition-transform duration-200">
                                        {getInitials(job.company?.display_name)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3
                                            title={job.title}
                                            className="text-base font-semibold text-text-primary tracking-tight truncate group-hover:text-brand-primary transition-colors"
                                        >
                                            {job.title}
                                        </h3>
                                        <p
                                            title={job.company?.display_name}
                                            className="text-xs sm:text-sm font-medium text-text-secondary truncate mt-0.5"
                                        >
                                            {job.company?.display_name || "Confidential Employer"}
                                        </p>
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                                    <svg className="w-4 h-4 text-brand-primary/80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="truncate">{job.location?.display_name || "India (Remote / On-site)"}</span>
                                </div>

                                {/* Tags / Compensation preview */}
                                <div className="flex flex-wrap items-center gap-2 pt-1">
                                    {salaryText ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-status-success-subtle text-status-success border border-status-success/20 truncate max-w-full">
                                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {salaryText}
                                        </span>
                                    ) : job.contract_time ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-bg-muted text-text-secondary border border-border-default capitalize">
                                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {job.contract_time.replace(/_/g, " ")}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-brand-subtle text-brand-primary border border-brand-primary/20">
                                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Verified Tech Role
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Footer Buttons */}
                            <div className="pt-4 mt-4 border-t border-border-default flex items-center justify-between gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedJob(job)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-bg-muted transition-colors cursor-pointer"
                                >
                                    View details
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        job.redirect_url &&
                                        window.open(job.redirect_url, "_blank", "noopener,noreferrer")
                                    }
                                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold shadow-xs transition-all duration-200 cursor-pointer"
                                >
                                    <span>Apply</span>
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedJob && (
                <JobDetailsModal
                    job={selectedJob}
                    onClose={() => setSelectedJob(null)}
                />
            )}
        </>
    );
}