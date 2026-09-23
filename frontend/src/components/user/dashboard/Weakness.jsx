import { useSelector } from "react-redux";

export default function Weakness() {
  const { data, serverError } = useSelector(
    (state) => state.dashboard
  );

  const weaknesses = data?.roleAnalysis?.weaknesses || [];

  return (
    <div className="bg-bg-surface border border-border-default border-t-4 border-t-amber-500 dark:border-t-amber-400 rounded-xl shadow-card hover:shadow-elevated transition-all duration-200 p-6 flex flex-col min-h-[320px]">
      <div className="flex items-center justify-between pb-3 border-b border-border-default mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary leading-tight">
              Areas for Improvement
            </h3>
            <span className="text-[11px] text-text-muted">Growth opportunities</span>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60">
          {weaknesses.length} Points
        </span>
      </div>

      {serverError && (
        <p className="mb-3 p-2 text-xs rounded-lg bg-status-danger-subtle text-status-danger">
          {serverError?.status ? `${serverError.status} - ` : ""}{serverError?.message || (typeof serverError === "string" ? serverError : "Failed to load growth areas")}
        </p>
      )}

      {weaknesses.length === 0 ? (
        <p className="text-xs text-text-muted my-auto text-center py-6">
          No improvement areas identified.
        </p>
      ) : (
        <ul className="space-y-2.5 flex-1">
          {weaknesses.map((weakness, index) => (
            <li key={index} className="flex items-start gap-2.5 p-2 rounded-lg bg-bg-muted border border-border-default text-xs text-text-secondary leading-relaxed">
              <span className="w-2 h-2 rounded-full bg-amber-500 mt-1 shrink-0" />
              <span>{weakness}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}