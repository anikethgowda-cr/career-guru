import { Outlet } from "react-router-dom";
import UserSidebar from "../components/shared/UserSidebar";
import MentorSidebar from "../components/shared/MentorSidebar";
import { useSelector } from "react-redux";

export default function ProtectedLayout() {
    const { user } = useSelector((state) => {
        return state.auth;
    });

    return (
        <>
            {user.role === "user" ? (
                <>
                    <UserSidebar />
                    <Outlet />
                </>
            ) : (
                <>
                    <MentorSidebar />
                    <Outlet />
                </>
            )}
        </>
    );
}