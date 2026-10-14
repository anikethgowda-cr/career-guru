import { useSelector } from "react-redux";

export default function Strengths() {
  const { data, serverError } = useSelector(
    (state) => state.dashboard
  );

  const strengths = data?.roleAnalysis?.strengths || [];

  return (
    <div className="bg-bg-surface border border-border-default rounded-xl shadow-xs p-6 flex flex-col min-h-[300px]">
      <div className="flex items-center justify-between pb-3 border-b border-border-default mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary leading-tight">
              Key Strengths
            </h3>
            <span className="text-[11px] text-text-muted">Validated competencies</span>
          </div>
        </div>
        <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-bg-muted text-text-secondary border border-border-default">
          {strengths.length} Found
        </span>
      </div>

      {serverError && (
        <p className="mb-3 p-2 text-xs rounded-md bg-status-danger-subtle text-status-danger">
          {serverError?.status ? `${serverError.status} - ` : ""}{serverError?.message || (typeof serverError === "string" ? serverError : "Failed to load strengths")}
        </p>
      )}

      {strengths.length === 0 ? (
        <p className="text-xs text-text-muted my-auto text-center py-6">
          No strengths recorded yet.
        </p>
      ) : (
        <ul className="space-y-2 flex-1">
          {strengths.map((strength, index) => (
            <li key={index} className="flex items-start gap-2.5 p-2 rounded-md bg-bg-muted/50 border border-border-default text-xs text-text-secondary leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span>{strength}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}