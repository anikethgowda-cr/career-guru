import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../slices/AuthSlice";

export default function UserSidebar() {
    const dispatch = useDispatch();

    return (
        <>
            <h1>CareerGuru</h1>
            <p>AI-Powered Guidance for Your IT Career</p>

            <nav>
                <Link to="/user/dashboard">Dashboard</Link>{" "}
                <Link to="/user/learning-plan">Learning Plan</Link>{" "}
                <Link to="/user/interview-questions">Interview Questions</Link>{" "}
                <Link to="/user/explore-mentors">Explore Mentors</Link>{" "}
                <Link to="/user/my-mentors">My Mentors</Link>{" "}
                <Link to="/user/profile">Profile</Link>

                <button onClick={() => dispatch(logout())}>
                    Logout
                </button>
            </nav>
        </>
    );
}
