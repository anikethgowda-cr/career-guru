import { useSelector } from "react-redux";

export default function MissingSkills() {
  const { data, serverError } = useSelector(
    (state) => state.dashboard
  );

  const missingSkills = data?.roleAnalysis?.missingSkills || [];

  return (
    <div className="bg-bg-surface border border-border-default border-t-4 border-t-rose-500 dark:border-t-rose-400 rounded-xl shadow-card hover:shadow-elevated transition-all duration-200 p-6 flex flex-col min-h-[260px]">
      <div className="flex items-center justify-between pb-3 border-b border-border-default mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-xs">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.332.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary leading-tight">
              Skill Gaps to Address
            </h3>
            <span className="text-[11px] text-text-muted">Recommended for your target role</span>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60">
          {missingSkills.length} Needed
        </span>
      </div>

      {serverError && (
        <p className="mb-3 p-2 text-xs rounded-lg bg-status-danger-subtle text-status-danger">
          {serverError?.status ? `${serverError.status} - ` : ""}{serverError?.message || (typeof serverError === "string" ? serverError : "Failed to load skill gaps")}
        </p>
      )}

      {missingSkills.length === 0 ? (
        <p className="text-xs text-text-muted my-auto text-center py-6">
          No critical skill gaps identified!
        </p>
      ) : (
        <div className="flex flex-wrap gap-2 flex-1 content-start">
          {missingSkills.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-50/70 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border border-rose-200/70 dark:border-rose-900/50 hover:border-rose-400 dark:hover:border-rose-700 transition-all cursor-default"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}