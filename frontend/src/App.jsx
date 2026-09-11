import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

// Auth
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";

// User pages
import Dashboard from "./pages/user/Dashboard";
import LearningPlan from "./pages/user/LearningPlan";
import InterviewQuestions from "./pages/user/InterviewQuestions";
import JobsBoard from "./pages/user/JobsBoard";
import MentorPayment from "./pages/user/MentorPayment";
import ExploreMentors from "./pages/user/ExploreMentors";
import MyMentors from "./pages/user/MyMentors";
import UserChat from "./pages/user/UserChat";
import Profile from "./pages/user/Profile";
import WeekPlan from "./components/user/learningPlan/WeekPlan";

// Mentor pages
import MentorDashboard from "./pages/mentor/MentorDashboard";
import Mentees from "./pages/mentor/Mentees";
import MenteesReport from "./pages/mentor/MenteesReport";
import MentorMessages from "./pages/mentor/MentorMessages";
import MentorChat from "./pages/mentor/MentorChat";

// Shared
import UserProfile from "./components/shared/UserProfile";
import MentorProfile from "./components/shared/MentorProfile";

// Routes
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleProtectedRoute from "./routes/RoleProtectedRoute";
import ProtectedLayout from "./routes/ProtectedLayout";
import MentorAccessRoute from "./routes/MentorAccessRoute";
import { CallProvider } from "./context/CallContext.jsx";

import { checkAuth } from "./slices/AuthSlice";

export default function App() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(checkAuth());
    }, [dispatch]);

    return (
        <CallProvider>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>

                {/* Student Routes */}
                <Route element={<RoleProtectedRoute role="user" />}>
                    <Route path="/user/create-profile" element={<UserProfile />} />

                    <Route element={<ProtectedLayout />}>
                        <Route path="/user/dashboard" element={<Dashboard />} />
                        <Route path="/user/learning-plan" element={<LearningPlan />} />
                        <Route path="/user/learning-plan/week/:weekNumber" element={<WeekPlan />} />
                        <Route path="/user/interview-questions" element={<InterviewQuestions />} />
                        <Route path="/user/jobs-board" element={<JobsBoard />} />
                        <Route path="/user/mentor-payment" element={<MentorPayment />} />
                        <Route element={<MentorAccessRoute />}>
                            <Route path="/user/explore-mentors" element={<ExploreMentors />} />
                            <Route path="/user/my-mentors" element={<MyMentors />} />
                        </Route>
                        {/* Legacy redirect for old /user/mentor route */}
                        <Route path="/user/mentor" element={<Navigate to="/user/explore-mentors" replace />} />
                        
                        <Route path="/user/mentor/chat/:mentorId" element={<UserChat />} />
                        <Route path="/user/profile" element={<Profile />} />
                    </Route>
                </Route>

                {/* Mentor Routes */}
                <Route element={<RoleProtectedRoute role="mentor" />}>
                    <Route path="/mentor/create-profile" element={<MentorProfile />} />

                    <Route element={<ProtectedLayout />}>
                        <Route path="/mentor/dashboard" element={<MentorDashboard />} />
                        <Route path="/mentor/mentees" element={<Mentees />} />
                        <Route path="/mentor/mentees/report/:studentId" element={<MenteesReport />}/>
                        <Route path="/mentor/messages" element={<MentorMessages />} />
                        <Route path="/mentor/chat/:conversationId" element={<MentorChat />} />
                        <Route path="/mentor/profile" element={<Profile />} />
                    </Route>
                </Route>

            </Route>
        </Routes>
    </CallProvider>
    );
}