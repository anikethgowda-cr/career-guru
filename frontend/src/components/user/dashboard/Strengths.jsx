import { useSelector } from "react-redux";

export default function Strengths() {
  const { data, serverError } = useSelector(
    (state) => state.dashboard
  );

  const strengths = data?.roleAnalysis?.strengths || [];

  return (
    <div className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 border-t-4 border-t-emerald-500 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col min-h-[320px]">
      <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]/80 dark:border-zinc-800/80 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              Key Strengths
            </h3>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500">Validated competencies</span>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
          {strengths.length} Found
        </span>
      </div>

      {serverError && (
        <p className="mb-3 p-2 text-xs rounded-lg bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
          {serverError?.status ? `${serverError.status} - ` : ""}{serverError?.message || (typeof serverError === "string" ? serverError : "Failed to load strengths")}
        </p>
      )}

      {strengths.length === 0 ? (
        <p className="text-xs text-slate-400 dark:text-zinc-500 my-auto text-center py-6">
          No strengths recorded yet.
        </p>
      ) : (
        <ul className="space-y-2.5 flex-1">
          {strengths.map((strength, index) => (
            <li key={index} className="flex items-start gap-2.5 p-2 rounded-xl bg-indigo-50/60 dark:bg-zinc-800/30 border border-[#E2E8F0]/60 dark:border-zinc-800/60 text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
              <span>{strength}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}