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

import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedLayout from "./components/ProtectedLayout";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
                <Route element={<ProtectedLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/learning-plan" element={<LearningPlan />} />
                    <Route path="/learning-plan/week/:weekNumber" element={<WeekPlan />} />
                    <Route path="/interview-questions" element={<InterviewQuestions />} />
                    <Route path="/jobs-board" element={<JobsBoard />} />
                    <Route path="/mentor" element={<Mentor />} />
                    <Route path="/profile" element={<Profile />} />
                </Route>
            </Route>
        </Routes>
    );
}