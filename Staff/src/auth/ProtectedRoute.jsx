import { Navigate } from "react-router-dom";

export function useAuth() {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("access");
    return {
        user: token ? { role } : null
    };
}

export default function ProtectedRoute({ children, role }) {
    const userRole = localStorage.getItem("role");

    if (!localStorage.getItem("access")) {
        return <Navigate to="/" />;
    }

    if (role && userRole !== role && userRole !== "ADMIN") {
        return <Navigate to="/" />;
    }

    return children;
}