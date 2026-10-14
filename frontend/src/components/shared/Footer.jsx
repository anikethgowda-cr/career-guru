export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-auto py-4 px-4 sm:px-8 border-t border-border-default text-left theme-transition">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-white p-0.5 border border-border-default flex items-center justify-center shrink-0">
                        <img src="/careerguru.png" alt="CareerGuru" className="w-full h-full object-contain" />
                    </div>
                    <span className="font-medium text-text-primary text-xs">
                        CareerGuru
                    </span>
                    <span>•</span>
                    <span className="text-[11px]">AI Career Intelligence</span>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-text-muted">
                    <span>
                        © {currentYear} CareerGuru. All rights reserved.
                    </span>
                </div>
            </div>
        </footer>
    );
}
