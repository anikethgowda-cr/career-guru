import { useSelector } from "react-redux";

export default function Suggestion() {
  const { data, serverError } = useSelector(
    (state) => state.dashboard
  );

  const suggestions = data?.roleAnalysis?.suggestions || [];

  return (
    <div className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 border-t-4 border-t-sky-500 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col">
      <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]/80 dark:border-zinc-800/80 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-xs">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
              Actionable AI Career Recommendations
            </h3>
            <span className="text-xs text-slate-500 dark:text-zinc-500">
              Targeted optimizations tailored to improve your resume match score
            </span>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 border border-sky-200/60 dark:border-sky-800/60 shrink-0">
          {suggestions.length} Suggestions
        </span>
      </div>

      {serverError && (
        <p className="mb-4 p-3 text-xs rounded-lg bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
          {serverError?.status ? `${serverError.status} - ` : ""}{serverError?.message || (typeof serverError === "string" ? serverError : "Failed to load career recommendations")}
        </p>
      )}

      {suggestions.length === 0 ? (
        <p className="text-xs text-slate-400 dark:text-zinc-500 my-auto text-center py-8">
          No suggestions available right now.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="p-4 rounded-xl bg-indigo-50/60/30 dark:bg-zinc-800/40 border border-[#E2E8F0]/80 dark:border-zinc-800 flex flex-col justify-between hover:border-sky-300 dark:hover:border-sky-800 transition-all duration-150 shadow-2xs"
            >
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                  {suggestion}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}