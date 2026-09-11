import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";

import UserSidebar from "../components/shared/UserSidebar";
import MentorSidebar from "../components/shared/MentorSidebar";
import Chatbot from "../components/shared/Chatbot";
import ErrorBoundary from "../components/shared/ErrorBoundary";
import Footer from "../components/shared/Footer";

import { checkMentorAccess } from "../slices/user/PaymentSlice";
import socket from "../services/socket";

export default function ProtectedLayout() {
    const dispatch = useDispatch();

    const { user } = useSelector((state) => {
        return state.auth;
    });

    useEffect(() => {
        if (user?.role === "user") {
            dispatch(checkMentorAccess());
        }
    }, [user, dispatch]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            socket.auth = { token };
            if (!socket.connected) {
                socket.connect();
            }
        }

        return () => {
            if (socket.connected) {
                socket.disconnect();
            }
        };
    }, [user]);

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex transition-colors duration-300">
            {user?.role === "user" ? (
                <>
                    <UserSidebar />
                    <main className="flex-1 ml-64 min-h-screen w-[calc(100%-16rem)] transition-all flex flex-col justify-between">
                        <div className="flex-1">
                            <ErrorBoundary>
                                <Outlet />
                            </ErrorBoundary>
                        </div>
                        <Footer />
                    </main>
                    <Chatbot />
                </>
            ) : (
                <>
                    <MentorSidebar />
                    <main className="flex-1 ml-64 min-h-screen w-[calc(100%-16rem)] transition-all flex flex-col justify-between">
                        <div className="flex-1">
                            <ErrorBoundary>
                                <Outlet />
                            </ErrorBoundary>
                        </div>
                        <Footer />
                    </main>
                </>
            )}
        </div>
    );
}