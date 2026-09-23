import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export default function TotalMentees() {
    const { stats, loading } = useSelector((state) => state.mentorDashboard);

    return (
        <div className="bg-bg-surface border border-border-default rounded-xl p-6 transition-all duration-200 shadow-subtle text-left flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-subtle text-brand-primary flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                </div>
                <div>
                    <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
                        Total Mentees
                    </span>
                    <span className="text-2xl sm:text-3xl font-bold text-text-primary">
                        {loading ? "..." : (stats?.totalMentees ?? 0)}
                    </span>
                </div>
            </div>
            <Link
                to="/mentor/mentees"
                className="text-xs font-semibold text-brand-primary hover:text-brand-primary-hover flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg bg-brand-subtle hover:bg-brand-primary/20"
            >
                View Mentees
                <span>&rarr;</span>
            </Link>
        </div>
    );
}