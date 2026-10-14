import { useSelector } from "react-redux";

export default function Suggestion() {
  const { data, serverError } = useSelector(
    (state) => state.dashboard
  );

  const suggestions = data?.roleAnalysis?.suggestions || [];

  return (
    <div className="bg-bg-surface border border-border-default rounded-xl shadow-xs p-6 flex flex-col">
      <div className="flex items-center justify-between pb-4 border-b border-border-default mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary leading-tight">
              Actionable AI Recommendations
            </h3>
            <span className="text-xs text-text-muted">
              Targeted improvements to boost your resume and skills match
            </span>
          </div>
        </div>
        <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-bg-muted text-text-secondary border border-border-default shrink-0">
          {suggestions.length} Suggestions
        </span>
      </div>

      {serverError && (
        <p className="mb-4 p-3 text-xs rounded-md bg-status-danger-subtle text-status-danger">
          {serverError?.status ? `${serverError.status} - ` : ""}{serverError?.message || (typeof serverError === "string" ? serverError : "Failed to load career recommendations")}
        </p>
      )}

      {suggestions.length === 0 ? (
        <p className="text-xs text-text-muted my-auto text-center py-8">
          No suggestions available right now.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="p-3.5 rounded-lg bg-bg-muted/40 border border-border-default flex flex-col justify-between hover:border-border-strong transition-colors"
            >
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md bg-bg-surface border border-border-default text-text-secondary text-xs font-medium flex items-center justify-center shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <p className="text-xs text-text-secondary leading-relaxed">
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