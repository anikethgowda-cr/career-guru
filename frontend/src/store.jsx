import { configureStore } from '@reduxjs/toolkit'

// Shared slices
import authReducer from "./slices/AuthSlice";
import profileReducer from "./slices/ProfileSlice";
import mentorChatReducer from "./slices/MentorChatSlice";
import assessmentReportReducer from "./slices/AssessmentReportSlice";

// User slices
import resumeReducer from "./slices/user/ResumeSlice";
import dashboardReducer from "./slices/user/DashboardSlice";
import learningReducer from "./slices/user/LearningPlanSlice";
import interviewQuestionsReducer from "./slices/user/InterviewQuestionsSlice";
import jobsReducer from "./slices/user/JobsSlice";
import mentorsReducer from "./slices/user/MentorSlice";
import paymentReducer from "./slices/user/PaymentSlice";
import userAssessmentReducer from "./slices/user/UserAssessmentSlice"

// Mentor slices
import menteesReducer from "./slices/mentor/MenteesSlice";
import mentorDashboardReducer from "./slices/mentor/MentorDashboardSlice";
import mentorAssessmentReducer from "./slices/mentor/MentorAssessmentSlice"

const store = configureStore({
    reducer: {
        auth: authReducer,
        profile: profileReducer,
        mentorChat: mentorChatReducer,
        assessmentReport: assessmentReportReducer,

        // User
        resume: resumeReducer,
        dashboard: dashboardReducer,
        learningPlan: learningReducer,
        interviewQuestions: interviewQuestionsReducer,
        jobs: jobsReducer,
        mentor: mentorsReducer,
        userAssessment:userAssessmentReducer,
        payment: paymentReducer,

        // Mentor
        mentees: menteesReducer,
        mentorDashboard: mentorDashboardReducer,
        mentorAssessment:mentorAssessmentReducer
    }
})

export default store

