import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function WeeksPlan() {
    const navigate = useNavigate();

    const { data } = useSelector((state) => {
        return state.learningPlan;
    });

    const weeks = data?.weeks || [];
    const totalSessions = weeks.reduce((acc, w) => acc + (w.sessions?.length || 0), 0);

    function handleNavigation(weekNumber) {
        navigate(`/user/learning-plan/week/${weekNumber}`);
    }

    return (
        <div className="space-y-8 text-left">
            {/* Page Header & Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E2E8F0]/80 dark:border-zinc-800">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Personalized Learning Roadmap
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
                        A step-by-step milestone curriculum generated specifically to close your skill gaps.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/60">
                        {weeks.length} Weeks
                    </span>
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                        {totalSessions} Sessions
                    </span>
                </div>
            </div>

            {/* Weeks Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {weeks.map((week) => {
                    const sessionCount = week.sessions?.length || 0;

                    return (
                        <div
                            key={week.weekNumber}
                            className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 border-t-4 border-t-indigo-500 dark:border-t-indigo-500 hover:border-indigo-400 dark:hover:border-indigo-400 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                        >
                            {/* Top Info */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50">
                                        WEEK {week.weekNumber < 10 ? `0${week.weekNumber}` : week.weekNumber}
                                    </span>
                                    <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {sessionCount} Session{sessionCount === 1 ? "" : "s"}
                                    </span>
                                </div>

                                <div className="space-y-1.5 text-left">
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                                        Weekly Objective
                                    </span>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                                        {week.overview}
                                    </h3>
                                </div>

                                {/* First Session Preview if available */}
                                {week.sessions && week.sessions.length > 0 && (
                                    <div className="pt-2 border-t border-[#E2E8F0]/60 dark:border-zinc-800/80">
                                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-1">
                                            <span className="font-semibold text-slate-700 dark:text-zinc-300">Focus:</span> {week.sessions[0]?.title}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* View Week CTA */}
                            <div className="pt-6 mt-4 border-t border-[#E2E8F0]/80 dark:border-zinc-800/80">
                                <button
                                    type="button"
                                    onClick={() => handleNavigation(week.weekNumber)}
                                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-50/60 dark:bg-zinc-800/80 hover:bg-indigo-50 dark:hover:bg-zinc-700 text-indigo-900 dark:text-zinc-200 border border-indigo-100 dark:border-zinc-700/80 text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-violet-600 dark:group-hover:from-indigo-600 dark:group-hover:to-indigo-700 group-hover:text-white group-hover:border-transparent shadow-xs"
                                >
                                    <span>View Curriculum</span>
                                    <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}