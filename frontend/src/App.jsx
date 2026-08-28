import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Sidebar from "./components/Sidebar";
import LearningPlan from "./pages/LearningPlan";
import InterviewQuestions from "./pages/InterviewQuestions";
import JobsBoard from "./pages/JobsBoard";
import Mentor from "./pages/Mentor";
import Profile from "./pages/Profile";
import WeekPlan from "./components/learningplan/WeekPlan";

export default function App() {
  return (
    <>
      <Sidebar />
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/learning-plan" element={<LearningPlan />} />
        <Route path="/learning-plan/week/:weekNumber" element={<WeekPlan />} />
        <Route path="/interview-questions" element={<InterviewQuestions />} />
        <Route path="/jobs-board" element={<JobsBoard />} />
        <Route path="/mentor" element={<Mentor />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </>
  );
}