import { useSelector } from "react-redux";

export default function TotalMentees() {
    const { stats, loading } = useSelector((state) => state.mentorDashboard);

    return (
        <div className="flex-1 bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-3xl p-5 sm:p-6 transition-all duration-300 shadow-xs flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-xs">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            </div>
            <div>
                <span className="text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                    Total Mentees
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                    {loading ? "..." : (stats?.totalMentees ?? 0)}
                </span>
            </div>
        </div>
    );
}
