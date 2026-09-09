import { configureStore } from '@reduxjs/toolkit'

// Shared slices
import authReducer from "./slices/AuthSlice";
import profileReducer from "./slices/ProfileSlice";
import mentorChatReducer from "./slices/MentorChatSlice";

// User slices
import resumeReducer from "./slices/user/ResumeSlice";
import dashboardReducer from "./slices/user/DashboardSlice";
import learningReducer from "./slices/user/LearningPlanSlice";
import interviewQuestionsReducer from "./slices/user/InterviewQuestionsSlice";
import jobsReducer from "./slices/user/JobsSlice";
import mentorsReducer from "./slices/user/MentorSlice";
import paymentReducer from "./slices/user/PaymentSlice";

// Mentor slices
import menteesReducer from "./slices/mentor/MenteesSlice";
import mentorDashboardReducer from "./slices/mentor/MentorDashboardSlice";

const store = configureStore({
    reducer: {
        auth: authReducer,
        profile: profileReducer,
        mentorChat: mentorChatReducer,

        // User
        resume: resumeReducer,
        dashboard: dashboardReducer,
        learningPlan: learningReducer,
        interviewQuestions: interviewQuestionsReducer,
        jobs: jobsReducer,
        mentor: mentorsReducer,
        payment: paymentReducer,

        // Mentor
        mentees: menteesReducer,
        mentorDashboard: mentorDashboardReducer
    }
})

export default store

