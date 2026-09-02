import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../slices/AuthSlice";

export default function UserSidebar() {

    const dispatch = useDispatch();

    return (
        <>
            <h1>Sidebar Component</h1>

            <nav>
                <Link to="/user/dashboard">Dashboard</Link>{" "}
                <Link to="/user/learning-plan">Learning Plan</Link>{" "}
                <Link to="/user/interview-questions">Interview Questions</Link>{" "}
                <Link to="/user/jobs-board">Jobs Board</Link>{" "}
                <Link to="/user/mentor">Mentor</Link>{" "}
                <Link to="/user/profile">Profile</Link>

                <button onClick={() => dispatch(logout())}>
                    Logout
                </button>
            </nav>
        </>
    );
}

