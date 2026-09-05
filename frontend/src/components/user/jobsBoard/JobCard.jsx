import { useState } from "react";
import { useSelector } from "react-redux";
import JobDetailsModal from "./JobDetailsModal";
import "./JobCard.css";

export default function JobCard() {

    const [selectedJob, setSelectedJob] = useState(null);

    const { data } = useSelector((state) => state.jobs);

    return (
        <>
            <div className="job-grid">
                {(data || []).map((job) => (
                    <div className="job-card" key={job.id}>
                        <div className="job-header">
                            <div className="company-logo">
                                CG
                            </div>
                            <div className="job-heading">
                                <h3> {job.company?.display_name} </h3>
                                <p> {job.title} </p>
                            </div>
                        </div>
                        <div className="job-location">
                            <span>📍</span>
                            <span> {job.location?.display_name}  </span>
                        </div>
                        <div className="job-footer">
                            <button  className="details-btn" onClick={() => setSelectedJob(job)} > View details </button>
                            <button
                                className="apply-btn"
                                onClick={() =>
                                    job.redirect_url &&
                                    window.open(
                                        job.redirect_url,
                                        "_blank",
                                        "noopener,noreferrer"
                                    )
                                }
                            > Apply </button>
                        </div>
                    </div>
                ))}
            </div>
            {selectedJob && ( <JobDetailsModal  job={selectedJob}  onClose={() => setSelectedJob(null)}  /> )}
        </>
    );
}