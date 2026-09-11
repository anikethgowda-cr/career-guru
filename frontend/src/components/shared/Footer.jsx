export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-auto py-6 px-4 sm:px-8 border-t border-slate-200/80 dark:border-zinc-800/80 text-left transition-colors duration-300">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-zinc-500">
                <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-[10px] shadow-xs">
                        CG
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-zinc-200">
                        CareerGuru AI
                    </span>
                    <span>•</span>
                    <span>From Resume to Career Success</span>
                </div>

                <div className="flex items-center gap-4 text-[11px]">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200/60 dark:border-zinc-700/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        AI Engine Active
                    </span>
                    <span>
                        © {currentYear}CareerGuru. Built with ❤️ for those who aspire to grow.
                    </span>
                </div>
            </div>
        </footer>
    );
}
