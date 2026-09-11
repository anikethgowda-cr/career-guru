export default function MentorProfileDetails({ data }) {
    const { mentor, profile } = data || {};

    const displayName = profile?.name || mentor?.username || "Mentor";
    const initial = displayName.charAt(0).toUpperCase();

    const expertInList = Array.isArray(profile?.expertIn)
        ? profile.expertIn
        : typeof profile?.expertIn === "string" && profile.expertIn
        ? profile.expertIn.split(",").map((s) => s.trim())
        : [];

    const specializationList = Array.isArray(profile?.specialization)
        ? profile.specialization
        : typeof profile?.specialization === "string" && profile.specialization
        ? profile.specialization.split(",").map((s) => s.trim())
        : [];

    const languagesList = Array.isArray(profile?.languages)
        ? profile.languages
        : typeof profile?.languages === "string" && profile.languages
        ? profile.languages.split(",").map((s) => s.trim())
        : [];

    return (
        <div className="space-y-8 text-left transition-colors duration-300">
            {/* Mentor Executive Hero Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-50/80 via-white to-slate-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950 border border-indigo-100 dark:border-zinc-800 p-6 sm:p-8 shadow-xs">
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="relative shrink-0">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 dark:from-indigo-600 dark:to-indigo-700 text-white flex items-center justify-center font-black text-3xl sm:text-4xl shadow-md shadow-indigo-600/20 dark:shadow-indigo-600/30">
                                {initial}
                            </div>
                            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 ring-4 ring-[#F8FAFC] dark:ring-zinc-950 rounded-full"></span>
                        </div>

                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                    {displayName}
                                </h1>
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-zinc-800 dark:text-zinc-300 border border-indigo-100 dark:border-zinc-700">
                                    Verified Mentor
                                </span>
                            </div>

                            <p className="text-sm font-medium text-slate-600 dark:text-zinc-300">
                                {profile?.designation ? `${profile.designation}` : "Industry Professional"}
                                {profile?.organization ? ` at ${profile.organization}` : ""}
                                {profile?.origin ? ` • ${profile.origin}` : ""}
                            </p>

                            <p className="text-xs text-slate-500 dark:text-zinc-400">
                                {mentor?.email || "No email available"}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
                        <div className="px-3.5 py-2 rounded-2xl bg-[#FFFFFF] dark:bg-zinc-800 border border-[#E2E8F0] dark:border-zinc-700 text-center shadow-2xs">
                            <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-zinc-400 block">
                                Experience
                            </span>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                                {profile?.experience !== undefined && profile?.experience !== null
                                    ? `${profile.experience} Years`
                                    : "0 Years"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal & Account Details */}
                <div className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-[#E2E8F0]/80 dark:border-zinc-800/80">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-zinc-300 flex items-center justify-center shrink-0 text-sm">
                            👤
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            Account Information
                        </h3>
                    </div>

                    <div className="space-y-3 text-xs sm:text-sm">
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-zinc-800/50">
                            <span className="text-slate-500 dark:text-zinc-400 font-medium">Username</span>
                            <span className="font-semibold text-slate-900 dark:text-zinc-100 font-mono">
                                @{mentor?.username || "—"}
                            </span>
                        </div>

                        <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-zinc-800/50">
                            <span className="text-slate-500 dark:text-zinc-400 font-medium">Email</span>
                            <span className="font-semibold text-slate-900 dark:text-zinc-100">
                                {mentor?.email || "—"}
                            </span>
                        </div>

                        <div className="flex justify-between items-center py-1.5">
                            <span className="text-slate-500 dark:text-zinc-400 font-medium">Phone</span>
                            <span className="font-semibold text-slate-900 dark:text-zinc-100">
                                {mentor?.phone || "Not provided"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Professional Work & Education */}
                <div className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-[#E2E8F0]/80 dark:border-zinc-800/80">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-zinc-300 flex items-center justify-center shrink-0 text-sm">
                            💼
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            Work & Education
                        </h3>
                    </div>

                    <div className="space-y-3 text-xs sm:text-sm">
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-zinc-800/50">
                            <span className="text-slate-500 dark:text-zinc-400 font-medium">Work Type</span>
                            <span className="font-semibold text-slate-900 dark:text-zinc-100 capitalize">
                                {profile?.workType || "Professional"}
                            </span>
                        </div>

                        <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-zinc-800/50">
                            <span className="text-slate-500 dark:text-zinc-400 font-medium">Education</span>
                            <span className="font-semibold text-slate-900 dark:text-zinc-100">
                                {profile?.education || "Not specified"}
                            </span>
                        </div>

                        {profile?.organization && (
                            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-zinc-800/50">
                                <span className="text-slate-500 dark:text-zinc-400 font-medium">Organization</span>
                                <span className="font-semibold text-slate-900 dark:text-zinc-100">
                                    {profile.organization}
                                </span>
                            </div>
                        )}

                        {profile?.designation && (
                            <div className="flex justify-between items-center py-1.5">
                                <span className="text-slate-500 dark:text-zinc-400 font-medium">Designation</span>
                                <span className="font-semibold text-slate-900 dark:text-zinc-100">
                                    {profile.designation}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Expertise & Specializations */}
            <div className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-[#E2E8F0]/80 dark:border-zinc-800/80">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-zinc-300 flex items-center justify-center shrink-0 text-sm">
                        ⚡
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Domain Expertise & Specializations
                    </h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-2">
                            Expert Roles
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {expertInList.length > 0 ? (
                                expertInList.map((item, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 text-indigo-900 dark:text-indigo-300 text-xs font-semibold"
                                    >
                                        {item}
                                    </span>
                                ))
                            ) : (
                                <span className="text-xs text-slate-400 italic">No roles listed</span>
                            )}
                        </div>
                    </div>

                    <div>
                        <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-2">
                            Specialized Topics & Skills
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {specializationList.length > 0 ? (
                                specializationList.map((spec, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-medium border border-slate-200/60 dark:border-zinc-700"
                                    >
                                        {spec}
                                    </span>
                                ))
                            ) : (
                                <span className="text-xs text-slate-400 italic">No specializations listed</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bio & Languages */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-3">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-[#E2E8F0]/80 dark:border-zinc-800/80">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-zinc-300 flex items-center justify-center shrink-0 text-sm">
                            📝
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            Mentor Bio
                        </h3>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line pt-1">
                        {profile?.bio || "No biographical information provided yet."}
                    </p>
                </div>

                <div className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-3">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-[#E2E8F0]/80 dark:border-zinc-800/80">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-zinc-300 flex items-center justify-center shrink-0 text-sm">
                            🌐
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            Languages
                        </h3>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                        {languagesList.length > 0 ? (
                            languagesList.map((lang, idx) => (
                                <span
                                    key={idx}
                                    className="px-2.5 py-1 rounded-xl bg-indigo-50/60 dark:bg-zinc-800 border border-indigo-100 dark:border-zinc-700 text-slate-800 dark:text-zinc-300 text-xs font-medium"
                                >
                                    {lang}
                                </span>
                            ))
                        ) : (
                            <span className="text-xs text-slate-400 italic">None specified</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


