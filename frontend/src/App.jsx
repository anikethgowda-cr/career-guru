import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import LearningPlan from "./pages/LearningPlan";
import InterviewQuestions from "./pages/InterviewQuestions";
import JobsBoard from "./pages/JobsBoard";
import Mentor from "./pages/Mentor";
import Profile from "./pages/Profile";
import WeekPlan from "./components/learningplan/WeekPlan";
import Register from "./pages/Register";
import Login from "./pages/Login";
import UserProfile from "./components/UserProfile";
import MentorProfile from "./components/MentorProfile"


import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedLayout from "./components/ProtectedLayout";


export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/user/create-profile" element={<UserProfile />} />
            <Route path="/mentor/create-profile" element={<MentorProfile/>} /> 
            <Route element={<ProtectedRoute />}>
                <Route element={<ProtectedLayout />}>
                    
                    <Route path="/user/dashboard" element={<Dashboard />} />
                    <Route path="/user/learning-plan" element={<LearningPlan />} />
                    <Route path="/user/learning-plan/week/:weekNumber" element={<WeekPlan />} />
                    <Route path="/user/interview-questions" element={<InterviewQuestions />} />
                    <Route path="/user/jobs-board" element={<JobsBoard />} />
                    <Route path="/user/mentor" element={<Mentor />} />
                    <Route path="/user/profile" element={<Profile />} /> 
                   {/* ------------------------------------------------------------------ */}
                        
                </Route>
            </Route>
        </Routes>
    );
}