import { Outlet } from "react-router-dom";
import UserSidebar from "../components/shared/UserSidebar";
import MentorSidebar from "../components/shared/MentorSidebar";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { checkMentorAccess } from "../slices/user/PaymentSlice";

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

    return (
        <>
            {user?.role === "user" ? (
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