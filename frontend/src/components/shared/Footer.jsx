export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-auto py-6 px-4 sm:px-8 border-t border-border-default text-left theme-transition">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
                <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-[10px] shadow-xs">
                        CG
                    </div>
                    <span className="font-semibold text-text-primary">
                        CareerGuru AI
                    </span>
                    <span>•</span>
                    <span>From Resume to Career Success</span>
                </div>

                <div className="flex items-center gap-4 text-[11px]">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-bg-muted text-text-secondary border border-border-default">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        AI Engine Active
                    </span>
                    <span>
                        © {currentYear} CareerGuru. Built with ❤️ for those who <b>Aspire</b> to grow.
                    </span>
                </div>
            </div>
        </footer>
    );
}
