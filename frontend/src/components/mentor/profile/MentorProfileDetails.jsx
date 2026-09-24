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
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-subtle via-bg-surface to-bg-app border border-border-default p-6 sm:p-8 shadow-xs">
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="relative shrink-0">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-brand-primary to-indigo-700 text-white flex items-center justify-center font-black text-3xl sm:text-4xl shadow-md shadow-brand-primary/20">
                                {initial}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                                    {displayName}
                                </h1>
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-subtle text-brand-primary border border-brand-primary/20">
                                    Verified Mentor
                                </span>
                            </div>

                            <p className="text-sm font-medium text-text-secondary">
                                {profile?.designation ? `${profile.designation}` : "Industry Professional"}
                                {profile?.organization ? ` at ${profile.organization}` : ""}
                                {profile?.origin ? ` • ${profile.origin}` : ""}
                            </p>

                            <p className="text-xs text-text-muted">
                                {mentor?.email || "No email available"}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
                        <div className="px-3.5 py-2 rounded-xl bg-bg-surface border border-border-default text-center shadow-2xs">
                            <span className="text-[10px] uppercase font-semibold text-text-muted block">
                                Experience
                            </span>
                            <span className="text-sm font-bold text-text-primary">
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
                <div className="bg-bg-surface border border-border-default rounded-2xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-border-default">
                        <div className="w-8 h-8 rounded-xl bg-brand-subtle text-brand-primary flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h3 className="text-base font-bold text-text-primary">
                            Account Information
                        </h3>
                    </div>

                    <div className="space-y-3 text-xs sm:text-sm">
                        <div className="flex justify-between items-center py-1.5 border-b border-border-default/60">
                            <span className="text-text-muted font-medium">Username</span>
                            <span className="font-semibold text-text-primary font-mono">
                                @{mentor?.username || "—"}
                            </span>
                        </div>

                        <div className="flex justify-between items-center py-1.5 border-b border-border-default/60">
                            <span className="text-text-muted font-medium">Email</span>
                            <span className="font-semibold text-text-primary">
                                {mentor?.email || "—"}
                            </span>
                        </div>

                        <div className="flex justify-between items-center py-1.5">
                            <span className="text-text-muted font-medium">Phone</span>
                            <span className="font-semibold text-text-primary">
                                {mentor?.phone || "Not provided"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Professional Work & Education */}
                <div className="bg-bg-surface border border-border-default rounded-2xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-border-default">
                        <div className="w-8 h-8 rounded-xl bg-brand-subtle text-brand-primary flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-base font-bold text-text-primary">
                            Work & Education
                        </h3>
                    </div>

                    <div className="space-y-3 text-xs sm:text-sm">
                        <div className="flex justify-between items-center py-1.5 border-b border-border-default/60">
                            <span className="text-text-muted font-medium">Work Type</span>
                            <span className="font-semibold text-text-primary capitalize">
                                {profile?.workType || "Professional"}
                            </span>
                        </div>

                        <div className="flex justify-between items-center py-1.5 border-b border-border-default/60">
                            <span className="text-text-muted font-medium">Education</span>
                            <span className="font-semibold text-text-primary">
                                {profile?.education || "Not specified"}
                            </span>
                        </div>

                        {profile?.organization && (
                            <div className="flex justify-between items-center py-1.5 border-b border-border-default/60">
                                <span className="text-text-muted font-medium">Organization</span>
                                <span className="font-semibold text-text-primary">
                                    {profile.organization}
                                </span>
                            </div>
                        )}

                        {profile?.designation && (
                            <div className="flex justify-between items-center py-1.5">
                                <span className="text-text-muted font-medium">Designation</span>
                                <span className="font-semibold text-text-primary">
                                    {profile.designation}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Expertise & Specializations */}
            <div className="bg-bg-surface border border-border-default rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-border-default">
                    <div className="w-8 h-8 rounded-xl bg-brand-subtle text-brand-primary flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h3 className="text-base font-bold text-text-primary">
                        Domain Expertise & Specializations
                    </h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">
                            Expert Roles
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {expertInList.length > 0 ? (
                                expertInList.map((item, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1.5 rounded-xl bg-brand-subtle border border-brand-primary/20 text-brand-primary text-xs font-semibold"
                                    >
                                        {item}
                                    </span>
                                ))
                            ) : (
                                <span className="text-xs text-text-muted italic">No roles listed</span>
                            )}
                        </div>
                    </div>

                    <div>
                        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">
                            Specialized Topics & Skills
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {specializationList.length > 0 ? (
                                specializationList.map((spec, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 rounded-xl bg-bg-muted text-text-secondary text-xs font-medium border border-border-default"
                                    >
                                        {spec}
                                    </span>
                                ))
                            ) : (
                                <span className="text-xs text-text-muted italic">No specializations listed</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bio & Languages */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-bg-surface border border-border-default rounded-2xl p-6 shadow-xs space-y-3">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-border-default">
                        <div className="w-8 h-8 rounded-xl bg-brand-subtle text-brand-primary flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-base font-bold text-text-primary">
                            Mentor Bio
                        </h3>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line pt-1">
                        {profile?.bio || "No biographical information provided yet."}
                    </p>
                </div>

                <div className="bg-bg-surface border border-border-default rounded-2xl p-6 shadow-xs space-y-3">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-border-default">
                        <div className="w-8 h-8 rounded-xl bg-brand-subtle text-brand-primary flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-base font-bold text-text-primary">
                            Languages
                        </h3>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                        {languagesList.length > 0 ? (
                            languagesList.map((lang, idx) => (
                                <span
                                    key={idx}
                                    className="px-2.5 py-1 rounded-xl bg-bg-muted border border-border-default text-text-secondary text-xs font-medium"
                                >
                                    {lang}
                                </span>
                            ))
                        ) : (
                            <span className="text-xs text-text-muted italic">None specified</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


