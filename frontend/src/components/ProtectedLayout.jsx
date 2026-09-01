import { Outlet } from "react-router-dom";
import UserSidebar from "./UserSidebar";

export default function ProtectedLayout() {
    return (
        <>
            <UserSidebar />
            <Outlet />
        </>
    );
}