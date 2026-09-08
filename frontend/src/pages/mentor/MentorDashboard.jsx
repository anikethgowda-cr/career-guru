import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMentorDashboardData, clearMentorDashboardState } from "../../slices/mentor/MentorDashboardSlice";

import TotalMentees from "../../components/mentor/dashboard/TotalMentees";
import TotalConversations from "../../components/mentor/dashboard/TotalConversations";
import Time from "../../components/mentor/dashboard/Time";
import MyMentees from "../../components/mentor/dashboard/MyMentees";
import PauseMentorship from "../../components/mentor/dashboard/PauseMentorship";
import QuickAccess from "../../components/mentor/dashboard/QuickAccess";

import "../../components/mentor/dashboard/MentorDashboard.css";

export default function MentorDashboard() {
    const dispatch = useDispatch();

    const { user } = useSelector((state) => state.auth);
    const { recentMentees, loading, serverError } = useSelector((state) => state.mentorDashboard);

    useEffect(() => {
        dispatch(fetchMentorDashboardData());
        return () => {
            dispatch(clearMentorDashboardState());
        };
    }, [dispatch]);

    if (loading) {
        return (
            <div className="mentor-dashboard">
                <p>Loading dashboard...</p>
            </div>
        );
    }

    if (serverError) {
        return (
            <div className="mentor-dashboard">
                <p style={{ color: "red" }}>{serverError.message || "Failed to load dashboard data"}</p>
            </div>
        );
    }

    return (
        <div className="mentor-dashboard">
            {/* Welcome Board */}
            <div className="welcome-board">
                <h1>Mentor Dashboard</h1>
                <h2>Welcome back, {user?.username}!</h2>
                <p>Help your mentees achieve their career goals.</p>
            </div>

            {/* Second Row: Total Conversations, Total Mentees, Time & Date */}
            <div className="dashboard-stats-row" style={{ display: "flex", gap: "20px", margin: "20px 0" }}>
                <TotalConversations />
                <TotalMentees />
                <Time />
            </div>

            {/* Third Row: My Mentees (left) & Mentorship Pause (right) */}
            <div className="dashboard-row-3">
                <MyMentees mentees={recentMentees} />
                <PauseMentorship />
            </div>

            {/* Fourth Row: Quick Access */}
            <QuickAccess />
        </div>
    );
}