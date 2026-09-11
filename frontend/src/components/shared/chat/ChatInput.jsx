export default function ChatInput({ value, onChange, onSubmit }) {
    const isReady = value && value.trim().length > 0;

    return (
        <form
            onSubmit={onSubmit}
            className="p-3.5 sm:p-4 border-t border-[#E2E8F0] dark:border-zinc-800 bg-[#FFFFFF] dark:bg-zinc-900 flex items-center gap-2.5 transition-colors duration-300"
        >
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Type a message to your mentor..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#E0D8C8] dark:border-zinc-700 bg-white dark:bg-zinc-950/60 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 placeholder:text-slate-400 dark:placeholder:text-zinc-500 transition-colors"
            />

            <button
                type="submit"
                disabled={!isReady}
                className="h-10 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-violet-700 dark:from-indigo-600 dark:to-indigo-700 dark:hover:from-indigo-700 dark:hover:to-indigo-800 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
                <span>Send</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
            </button>
        </form>
    );
}
