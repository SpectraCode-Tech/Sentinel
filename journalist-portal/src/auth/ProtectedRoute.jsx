import { Navigate } from "react-router-dom";

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