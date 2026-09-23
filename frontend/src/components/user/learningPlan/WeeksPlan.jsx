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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border-default">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                        Personalized Learning Roadmap
                    </h1>
                    <p className="text-xs sm:text-sm text-text-secondary">
                        A step-by-step milestone curriculum generated specifically to close your skill gaps.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-brand-subtle text-brand-primary border border-brand-primary/20">
                        {weeks.length} Weeks
                    </span>
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-bg-muted text-text-secondary border border-border-default">
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
                            className="bg-bg-surface border border-border-default border-t-4 border-t-brand-primary hover:border-brand-primary/60 rounded-xl p-6 shadow-subtle hover:shadow-card transition-all duration-200 flex flex-col justify-between group"
                        >
                            {/* Top Info */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-brand-subtle text-brand-primary border border-brand-primary/20">
                                        WEEK {week.weekNumber < 10 ? `0${week.weekNumber}` : week.weekNumber}
                                    </span>
                                    <span className="text-[11px] font-medium text-text-muted flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {sessionCount} Session{sessionCount === 1 ? "" : "s"}
                                    </span>
                                </div>

                                <div className="space-y-1.5 text-left">
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                                        Weekly Objective
                                    </span>
                                    <h3 className="text-base font-bold text-text-primary group-hover:text-brand-primary transition-colors leading-snug">
                                        {week.overview}
                                    </h3>
                                </div>

                                {/* First Session Preview if available */}
                                {week.sessions && week.sessions.length > 0 && (
                                    <div className="pt-2 border-t border-border-default">
                                        <p className="text-[11px] text-text-secondary line-clamp-1">
                                            <span className="font-semibold text-text-primary">Focus:</span> {week.sessions[0]?.title}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* View Week CTA */}
                            <div className="pt-6 mt-4 border-t border-border-default">
                                <button
                                    type="button"
                                    onClick={() => handleNavigation(week.weekNumber)}
                                    className="w-full py-2.5 px-4 rounded-lg bg-bg-muted hover:bg-brand-primary text-text-primary hover:text-white border border-border-default hover:border-transparent text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                                >
                                    <span>View Curriculum</span>
                                    <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M14 5l7 7m0 0l-7 7m7-7H3" />
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