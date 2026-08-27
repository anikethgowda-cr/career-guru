import { Link } from "react-router-dom"

export default function Sidebar(){

    return (
        <>
        <h1>Sidebar Component</h1>
        <nav>
            <Link to="/DashBoard">DashBoard</Link>{" "}
            <Link to="/learning-plan">LearningPlan</Link>{" "}
            <Link to="/interview-questions">Interview Questions</Link>{" "}
            <Link to="/jobs-board">Jobs Board</Link>{" "}
            <Link to="/mentor">Mentor</Link>{" "}
            <Link to="/profile">Profile</Link>
        </nav>
        </>
    )
}