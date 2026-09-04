import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

import Dashboard from "./pages/Dashboard";
import LearningPlan from "./pages/LearningPlan";
import InterviewQuestions from "./pages/InterviewQuestions";
import JobsBoard from "./pages/JobsBoard";
import Mentor from "./pages/Mentor";
import MentorChat from "./components/users-mentor/MentorChat";
import Profile from "./pages/Profile";
import WeekPlan from "./components/learningplan/WeekPlan";
import Register from "./pages/Register";
import Login from "./pages/Login";
import UserProfile from "./components/UserProfile";
import MentorProfile from "./components/MentorProfile";
import MentorDashboard from "./pages/mentor-pages/MentorDashboard";
import Mentees from "./pages/mentor-pages/Mentees";
import MentorConversations from "./components/mentor-component/mentees/MentorConversations"
import MentorSideChat from "./components/mentor-component/mentees/MentorSideChat";

import ProtectedRoute from "./routes/ProtectedRoute";
import RoleProtectedRoute from "./routes/RoleProtectedRoute";
import ProtectedLayout from "./routes/ProtectedLayout";
import { checkAuth } from "./slices/AuthSlice";

export default function App() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(checkAuth());
    }, [dispatch]);

    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>

                <Route element={<RoleProtectedRoute role="user" />}>
                    <Route path="/user/create-profile" element={<UserProfile />} />

                    <Route element={<ProtectedLayout />}>
                        <Route path="/user/dashboard" element={<Dashboard />} />
                        <Route path="/user/learning-plan" element={<LearningPlan />} />
                        <Route path="/user/learning-plan/week/:weekNumber" element={<WeekPlan />} />
                        <Route path="/user/interview-questions" element={<InterviewQuestions />} />
                        <Route path="/user/jobs-board" element={<JobsBoard />} />
                        <Route path="/user/mentor" element={<Mentor />} />
                        <Route path="/user/mentor/chat/:mentorId" element={<MentorChat />} />
                        <Route path="/user/profile" element={<Profile />} />
                    </Route>
                </Route>

                <Route element={<RoleProtectedRoute role="mentor" />}>
                    <Route path="/mentor/create-profile" element={<MentorProfile />} />

                    <Route element={<ProtectedLayout />}>
                        <Route path="/mentor/dashboard" element={<MentorDashboard />} />
                        <Route path="/mentor/mentees" element={<Mentees />} />
                        <Route path="/mentor/messages" element={<MentorConversations />} />
                        <Route path="/mentor/chat/:conversationId" element={<MentorSideChat />} />
                        <Route path="/mentor/profile" element={<Profile />} />
                    </Route>
                </Route>

            </Route>
        </Routes>
    );
}