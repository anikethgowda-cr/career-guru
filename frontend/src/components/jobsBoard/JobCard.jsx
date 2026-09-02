import { useState } from "react"
import { useSelector } from "react-redux"
import JobDetailsModal from "./JobDetailsModal"

export default function JobCard() {
    const [selectedJob, setSelectedJob] = useState(null)

    const { data } = useSelector((state) => {
        return state.jobs
    })

    return (
        <>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 20,
                    padding: 20,
                }}
            >
                {data.map((job) => {
                    return <div
                        key={job.id}
                        style={{
                            background: "#E6F4FE",
                            border: "1px solid #BFE2F8",
                            borderRadius: 12,
                            padding: "20px 22px",
                            fontFamily: "'Segoe UI', system-ui, sans-serif",
                            boxSizing: "border-box",
                        }}
                    >
                        {/* Top row: initials badge + company/title */}
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                            <div
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 10,
                                    background: "#FFFFFF",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 600,
                                    fontSize: 15,
                                    color: "#1A5FC4",
                                    flexShrink: 0,
                                }}
                            >
                                CG
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <div
                                    style={{
                                        fontSize: 16,
                                        fontWeight: 600,
                                        color: "#181818",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                >
                                    {job.company?.display_name}
                                </div>
                                <div
                                    style={{
                                        fontSize: 14,
                                        color: "#6B6B68",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                >
                                    {job.title}
                                </div>
                            </div>
                        </div>

                        {/* Location row */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                fontSize: 13,
                                color: "#6B6B68",
                                marginBottom: 18,
                            }}
                        >
                            📍 {job.location?.display_name}
                        </div>

                        {/* Bottom row: description link + apply button */}
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                borderTop: "1px solid #EEEDE7",
                                paddingTop: 14,
                            }}
                        >
                            <button 
                                onClick={() => setSelectedJob(job)}
                                style={{
                                    border: "none",
                                    background: "none",
                                    color: "#6B6B68",
                                    fontSize: 14,
                                    fontWeight: 500,
                                    cursor: "pointer",
                                    padding: 0,
                                }}
                            >
                                View details
                            </button>

                            <button
                                onClick={() => job.redirect_url && window.open(job.redirect_url, "_blank")}
                                style={{
                                    border: "none",
                                    background: "#1A5FC4",
                                    color: "#FFFFFF",
                                    fontSize: 14,
                                    fontWeight: 500,
                                    padding: "8px 18px",
                                    borderRadius: 8,
                                    cursor: "pointer",
                                }}
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                })}
            </div>

            {selectedJob && (
                <JobDetailsModal
                    job={selectedJob}
                    onClose={() => setSelectedJob(null)}
                />
            )}
        </>
    )
}