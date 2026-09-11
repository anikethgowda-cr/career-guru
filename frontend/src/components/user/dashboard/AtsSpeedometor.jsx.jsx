import { useSelector } from "react-redux";

export default function AtsSpeedometer() {
  const { data } = useSelector((state) => {
    return state.dashboard;
  });

  const score = data?.roleAnalysis?.atsScore;

  const validatedScore = Math.min(
    Math.max(Math.round(Number(score) || 0), 0),
    100
  );

  const needleRotation = (validatedScore / 100) * 180 - 90;

  let themeColor;
  let badgeText;

  if (validatedScore >= 75) {
    themeColor = "#10b981";
    badgeText = "Strong Fit";
  } else if (validatedScore >= 45) {
    themeColor = "#f59e0b";
    badgeText = "Moderate Fit";
  } else {
    themeColor = "#ef4444";
    badgeText = "Weak Fit";
  }

  const radius = 90;
  const circumference = Math.PI * radius;
  const filledLength = (validatedScore / 100) * circumference;

  return (
    <div className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 border-t-4 border-t-indigo-500 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col items-center justify-between text-center min-h-[320px]">
      <div className="w-full flex items-center justify-between pb-3 border-b border-[#E2E8F0]/80 dark:border-zinc-800/80 mb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
          ATS Match Score
        </h3>
        <span
          className="text-xs font-bold px-2.5 py-0.5 rounded-full text-white shadow-xs"
          style={{ backgroundColor: themeColor }}
        >
          {badgeText}
        </span>
      </div>

      <div className="relative w-[220px] h-[140px] my-auto flex justify-center">
        <svg className="w-[220px] h-[110px] overflow-visible" viewBox="0 0 220 110">
          <path
            d="M 20 100 A 90 90 0 0 1 200 100"
            fill="none"
            className="stroke-[#E2E8F0] dark:stroke-zinc-800"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M 20 100 A 90 90 0 0 1 200 100"
            fill="none"
            stroke={themeColor}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${filledLength} ${circumference}`}
            style={{
              transition: "stroke-dasharray 1s ease, stroke 0.5s ease",
            }}
          />
        </svg>

        {/* Needle */}
        <div
          className="absolute bottom-[40px] left-1/2 w-[3px] h-[72px] bg-slate-800 dark:bg-white rounded-full origin-bottom z-10 transition-transform duration-1000 ease-out"
          style={{
            transform: `translateX(-50%) rotate(${needleRotation}deg)`,
          }}
        />
        {/* Center Hub */}
        <div className="absolute bottom-[32px] left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-slate-900 dark:bg-white border-2 border-[#FFFFFF] dark:border-zinc-900 shadow-sm z-20" />

        {/* Readout */}
        <div className="absolute bottom-0 left-0 right-0 flex items-baseline justify-center">
          <span className="text-3xl font-extrabold tracking-tight" style={{ color: themeColor }}>
            {validatedScore}
          </span>
          <span className="text-lg font-bold ml-0.5" style={{ color: themeColor }}>
            %
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-zinc-500 mt-2">
        Based on keyword density & role benchmarks
      </p>
    </div>
  );
}