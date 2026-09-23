export default function ChatInput({ value, onChange, onSubmit }) {
    const isReady = value && value.trim().length > 0;

    return (
        <form
            onSubmit={onSubmit}
            className="p-3.5 sm:p-4 border-t border-border-default bg-bg-surface flex items-center gap-2.5 transition-colors duration-200"
        >
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Type a message to your mentor..."
                className="flex-1 px-4 py-2.5 rounded-lg border border-border-default bg-bg-app text-text-primary text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-brand-ring focus:border-brand-primary placeholder:text-text-muted transition-colors"
            />

            <button
                type="submit"
                disabled={!isReady}
                className="h-10 px-4 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold text-xs sm:text-sm shadow-xs transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
                <span>Send</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
            </button>
        </form>
    );
}
