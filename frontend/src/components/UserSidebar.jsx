import { Link } from "react-router-dom";
import { useContext } from "react";
import {AuthContext} from "../context/AuthContext"

export default function UserSidebar() {
  const {handleLogout} =useContext(AuthContext)
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
        <button onClick={()=>handleLogout()}>Logout</button>
      </nav>
    </>
  );
}