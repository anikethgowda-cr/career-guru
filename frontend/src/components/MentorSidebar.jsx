import { Link } from "react-router-dom";

export default function MentorSidebar() {
    return (
        <nav>
            <Link to="/mentor/dashboard">Dashboard</Link>{" "}
            <Link to="/mentor/mentees">Mentees</Link>{" "}
            <Link to="/mentor/messages">Messages</Link>{" "}
            <Link to="/mentor/profile">Profile</Link>{" "}

            <button>LogOut</button>
        </nav>
    );
}