import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../slices/AuthSlice";

export default function MentorSidebar() {
    const dispatch = useDispatch();

    return (
        <nav>
            <Link to="/mentor/dashboard">Dashboard</Link>{" "}
            <Link to="/mentor/mentees">Mentees</Link>{" "}
            <Link to="/mentor/messages">Messages</Link>{" "}
            <Link to="/mentor/profile">Profile</Link>{" "}

            <button onClick={() => dispatch(logout())}>Logout</button>
        </nav>
    );
}