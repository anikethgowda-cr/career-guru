import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export default function RoleProtectedRoute({ role }) {
    const { user } = useSelector((state) => state.auth);

    if (user.role !== role) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}