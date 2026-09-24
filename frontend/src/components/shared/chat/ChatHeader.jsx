import { useNavigate } from "react-router-dom";

export default function ChatHeader({ name, initial, subtitle, backPath }) {
    const navigate = useNavigate();

    return (
        <div className="px-5 py-4 flex items-center justify-between border-b border-border-default bg-bg-surface transition-colors duration-200">
            <div className="flex items-center gap-3.5 min-w-0">
                {backPath && (
                    <button
                        type="button"
                        onClick={() => navigate(backPath)}
                        aria-label="Back to conversations"
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-muted border border-border-default transition-colors cursor-pointer shrink-0"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                )}

                <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        {initial || name?.charAt(0).toUpperCase() || "M"}
                    </div>
                </div>

                <div className="min-w-0 text-left">
                    <h2 className="text-sm sm:text-base font-bold text-text-primary tracking-tight truncate">
                        {name || "Mentor"}
                    </h2>
                    <p className="text-xs text-text-muted truncate">
                        {subtitle || "Technical Mentor"}
                    </p>
                </div>
            </div>
        </div>
    );
}
