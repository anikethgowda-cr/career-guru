import { useSelector } from "react-redux";

export default function Skills() {
  const { data, serverError } = useSelector(
    (state) => state.dashboard
  );

  const skills = data?.roleAnalysis?.valueAddingSkills || [];

  return (
    <div className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 border-t-4 border-t-indigo-500 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col min-h-[260px]">
      <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]/80 dark:border-zinc-800/80 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              Acquired & Matched Skills
            </h3>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500">Skills found on your resume</span>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
          {skills.length} Matches
        </span>
      </div>

      {serverError && (
        <p className="mb-3 p-2 text-xs rounded-lg bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
          {serverError?.status ? `${serverError.status} - ` : ""}{serverError?.message || (typeof serverError === "string" ? serverError : "Failed to load skills")}
        </p>
      )}

      {skills.length === 0 ? (
        <p className="text-xs text-slate-400 dark:text-zinc-500 my-auto text-center py-6">
          No matching skills detected.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2 flex-1 content-start">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-indigo-50/60 dark:bg-zinc-800/80 text-slate-800 dark:text-zinc-200 border border-indigo-100 dark:border-zinc-700/60 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all cursor-default"
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