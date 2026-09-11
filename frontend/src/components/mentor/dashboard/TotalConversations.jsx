import { useSelector } from "react-redux";

export default function TotalConversations() {
    const { stats, loading } = useSelector((state) => state.mentorDashboard);

    return (
        <div className="flex-1 bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-3xl p-5 sm:p-6 transition-all duration-300 shadow-xs flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-xs">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            </div>
            <div>
                <span className="text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                    Total Conversations
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                    {loading ? "..." : (stats?.totalConversations ?? 0)}
                </span>
            </div>
        </div>
    );
}
