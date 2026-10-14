import { useSelector } from "react-redux";

export default function Skills() {
  const { data, serverError } = useSelector(
    (state) => state.dashboard
  );

  const skills = data?.roleAnalysis?.valueAddingSkills || [];

  return (
    <div className="bg-bg-surface border border-border-default rounded-xl shadow-xs p-6 flex flex-col min-h-[240px]">
      <div className="flex items-center justify-between pb-3 border-b border-border-default mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary leading-tight">
              Acquired & Matched Skills
            </h3>
            <span className="text-[11px] text-text-muted">Skills found on your resume</span>
          </div>
        </div>
        <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-bg-muted text-text-secondary border border-border-default">
          {skills.length} Matches
        </span>
      </div>

      {serverError && (
        <p className="mb-3 p-2 text-xs rounded-md bg-status-danger-subtle text-status-danger">
          {serverError?.status ? `${serverError.status} - ` : ""}{serverError?.message || (typeof serverError === "string" ? serverError : "Failed to load skills")}
        </p>
      )}

      {skills.length === 0 ? (
        <p className="text-xs text-text-muted my-auto text-center py-6">
          No matching skills detected.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2 flex-1 content-start">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-bg-muted/50 text-text-primary border border-border-default hover:bg-bg-muted transition-colors cursor-default"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}