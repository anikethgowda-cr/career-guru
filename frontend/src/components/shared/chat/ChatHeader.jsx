import { useNavigate } from "react-router-dom";

export default function ChatHeader({ name, initial, subtitle, backPath }) {
    const navigate = useNavigate();

    return (
        <div className="px-5 py-4 flex items-center justify-between border-b border-[#E2E8F0] dark:border-zinc-800 bg-[#FFFFFF] dark:bg-zinc-900 transition-colors duration-300">
            <div className="flex items-center gap-3.5 min-w-0">
                {backPath && (
                    <button
                        type="button"
                        onClick={() => navigate(backPath)}
                        aria-label="Back to conversations"
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700/60 transition-colors cursor-pointer shrink-0"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                )}

                <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 dark:from-indigo-600 dark:to-indigo-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        {initial || name?.charAt(0).toUpperCase() || "M"}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#FFFFFF] dark:border-zinc-900"></span>
                </div>

                <div className="min-w-0 text-left">
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">
                        {name || "Mentor"}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                        {subtitle || "Technical Mentor"}
                    </p>
                </div>
            </div>

            {/* Online Status Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60 shrink-0">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Active Now</span>
            </div>
        </div>
    );
}
