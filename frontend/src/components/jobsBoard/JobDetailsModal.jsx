export default function JobDetailsModal({ job, onClose }) {

    if (!job) return null;

    const formatSalary = () => {
        if (!job.salary_min && !job.salary_max) return null;
        const fmt = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
        if (job.salary_min && job.salary_max) return `${fmt(job.salary_min)} – ${fmt(job.salary_max)}`;
        if (job.salary_min) return `From ${fmt(job.salary_min)}`;
        if (job.salary_max) return `Up to ${fmt(job.salary_max)}`;
        return null;
    };

    const formattedSalary = formatSalary();

    const formatDate = (d) => {
        if (!d) return null;
        try { return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }); }
        catch { return d; }
    };

    const getInitials = (name) => {
        if (!name) return "CG";
        const parts = name.trim().split(/\s+/);
        return parts.length === 1 ? parts[0].slice(0, 2).toUpperCase() : (parts[0][0] + parts[1][0]).toUpperCase();
    };

    /* ── shared tokens (mirrors JobCard) ── */
    const cardBg     = "#E6F4FE";
    const cardBorder = "#BFE2F8";
    const blue       = "#1A5FC4";
    const white      = "#FFFFFF";
    const textDark   = "#181818";
    const textMuted  = "#6B6B68";
    const divider    = "#EEEDE7";
    const overlayBg  = "rgba(15, 23, 42, 0.55)";
    const shadow     = "0 12px 32px rgba(26,95,196,0.12)";
    const btnHoverBg = "#D0E9FB";
    const fontStack  = "'Segoe UI', system-ui, sans-serif";

    return (
        <div
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            autoFocus
            onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            style={{
                position: "fixed", inset: 0,
                backgroundColor: overlayBg,
                backdropFilter: "blur(4px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 1000, padding: 20, boxSizing: "border-box",
                outline: "none",
            }}
        >
            <div
                style={{
                    background: cardBg,
                    border: `1px solid ${cardBorder}`,
                    borderRadius: 12,
                    width: "100%", maxWidth: 560,
                    maxHeight: "90vh",
                    display: "flex", flexDirection: "column",
                    boxShadow: shadow,
                    overflow: "hidden",
                    fontFamily: fontStack,
                }}
            >
                {/* ── Header ── */}
                <div style={{ padding: "20px 22px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                    {/* Initials badge — same as JobCard */}
                    <div
                        style={{
                            width: 44, height: 44, borderRadius: 10,
                            background: white,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: 600, fontSize: 15, color: blue, flexShrink: 0,
                        }}
                    >
                        {getInitials(job.company?.display_name)}
                    </div>

                    {/* Title + Company */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 16, fontWeight: 600, color: textDark, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {job.company?.display_name || "Confidential Company"}
                        </div>
                        <div style={{ fontSize: 14, color: textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {job.title}
                        </div>
                    </div>

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        style={{
                            background: "none", border: "none", cursor: "pointer",
                            fontSize: 18, color: textMuted, lineHeight: 1,
                            padding: "4px 6px", borderRadius: 6, flexShrink: 0,
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = textDark; e.currentTarget.style.background = btnHoverBg; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = textMuted; e.currentTarget.style.background = "none"; }}
                    >
                        ✕
                    </button>
                </div>

                {/* ── Divider ── */}
                <div style={{ height: 1, background: divider, margin: "0 22px" }} />

                {/* ── Body (scrollable) ── */}
                <div style={{ padding: "18px 22px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>

                    {/* Location row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: textMuted }}>
                        📍 {job.location?.display_name || "Location not specified"}
                    </div>

                    {/* Info chips: category, contract, date */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {job.category?.label && (
                            <span style={{ fontSize: 13, fontWeight: 500, color: blue, background: white, border: `1px solid ${cardBorder}`, borderRadius: 8, padding: "4px 12px" }}>
                                🏷️ {job.category.label}
                            </span>
                        )}
                        {job.contract_time && (
                            <span style={{ fontSize: 13, fontWeight: 500, color: textMuted, background: white, border: `1px solid ${cardBorder}`, borderRadius: 8, padding: "4px 12px", textTransform: "capitalize" }}>
                                ⏱️ {job.contract_time.replace(/_/g, " ")}
                            </span>
                        )}
                        {job.contract_type && (
                            <span style={{ fontSize: 13, fontWeight: 500, color: textMuted, background: white, border: `1px solid ${cardBorder}`, borderRadius: 8, padding: "4px 12px", textTransform: "capitalize" }}>
                                📄 {job.contract_type.replace(/_/g, " ")}
                            </span>
                        )}
                        {job.created && (
                            <span style={{ fontSize: 13, fontWeight: 500, color: textMuted, background: white, border: `1px solid ${cardBorder}`, borderRadius: 8, padding: "4px 12px" }}>
                                📅 {formatDate(job.created)}
                            </span>
                        )}
                    </div>

                    {/* Salary */}
                    {formattedSalary && (
                        <div style={{ background: white, border: `1px solid ${cardBorder}`, borderRadius: 10, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 600, color: textMuted, textTransform: "uppercase", letterSpacing: "0.5px" }}>Salary</div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: blue, marginTop: 2 }}>{formattedSalary}</div>
                            </div>
                            {job.salary_is_predicted === "1" && (
                                <span style={{ fontSize: 12, color: textMuted, background: cardBg, border: `1px solid ${cardBorder}`, padding: "3px 8px", borderRadius: 6 }}>
                                    Estimated
                                </span>
                            )}
                        </div>
                    )}

                    {/* Divider before description */}
                    <div style={{ height: 1, background: divider }} />

                    {/* Description */}
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: textMuted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                            Job Description
                        </div>
                        <div
                            style={{
                                fontSize: 14, lineHeight: 1.7, color: textDark,
                                whiteSpace: "pre-line", maxHeight: 260, overflowY: "auto",
                            }}
                        >
                            {job.description || "No description provided."}
                        </div>
                    </div>
                </div>

                {/* ── Footer ── */}
                <div
                    style={{
                        padding: "14px 22px",
                        borderTop: `1px solid ${divider}`,
                        display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10,
                    }}
                >
                    <button
                        onClick={onClose}
                        style={{
                            padding: "8px 18px", borderRadius: 8,
                            border: `1px solid ${cardBorder}`, background: white,
                            color: textMuted, fontSize: 14, fontWeight: 500, cursor: "pointer",
                        }}
                    >
                        Close
                    </button>

                    {job.redirect_url && (
                        <a
                            href={job.redirect_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: "inline-flex", alignItems: "center",
                                padding: "8px 20px", borderRadius: 8,
                                background: blue, color: white,
                                fontSize: 14, fontWeight: 500,
                                textDecoration: "none", cursor: "pointer",
                            }}
                        >
                            Apply ↗
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
