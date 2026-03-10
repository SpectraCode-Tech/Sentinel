import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    AlertCircle,
    ArrowLeft,
    FileQuestion,
    LayoutDashboard,
    Lock
} from "lucide-react";

export default function NotFound() {
    const navigate = useNavigate();

    const getDashboardLink = () => {
        // Match keys from your Login component
        const role = localStorage.getItem("role");
        const token = localStorage.getItem("access");

        // Handle missing data or corrupted "undefined" strings
        if (!token || !role || role === "undefined") {
            return { path: "/", label: "Back to Login", icon: Lock };
        }

        // Role-based routing logic
        if (role === "ADMIN") {
            return { path: "/admin", label: "Admin Dashboard", icon: LayoutDashboard };
        }
        if (role === "EDITOR") {
            return { path: "/editor", label: "Editor Panel", icon: LayoutDashboard };
        }
        if (role === "JOURNALIST") {
            return { path: "/journalist", label: "Writer Workspace", icon: LayoutDashboard };
        }

        // Fallback for unknown roles
        return { path: "/", label: "Back to Login", icon: Lock };
    };



    const destination = getDashboardLink();

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10 font-sans flex items-center justify-center">
            <div className="max-w-3xl w-full">
                <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-rose-600 shadow-sm">
                            <AlertCircle className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-rose-600 uppercase tracking-widest mb-1">System Error</h2>
                            <h1 className="text-3xl font-bold text-slate-900 leading-none">Page Not Found</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-bold transition-all hover:bg-slate-50 active:scale-95 shadow-sm"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Go Back
                        </button>
                    </div>
                </header>

                <div className="bg-indigo-600 rounded-[2.5rem] p-8 md:p-12 text-white overflow-hidden relative shadow-xl shadow-indigo-100 mb-8">
                    <div className="relative z-10">
                        <span className="inline-block px-3 py-1 bg-indigo-500/50 rounded-lg text-[10px] font-bold uppercase tracking-widest mb-4">
                            Status Code: 404
                        </span>
                        <h3 className="text-3xl font-bold mb-4">Lost in the Archives?</h3>
                        <p className="text-indigo-100 mb-8 max-w-md text-lg leading-relaxed">
                            The dispatch or workspace you are trying to access doesn't exist or has been moved to a restricted sector.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Link
                                to={destination.path}
                                className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold hover:bg-indigo-50 transition-colors shadow-lg shadow-indigo-900/20"
                            >
                                <destination.icon className="w-5 h-5" />
                                {destination.label}
                            </Link>
                        </div>
                    </div>
                    <FileQuestion className="absolute -bottom-10 -right-10 w-64 h-64 text-indigo-500/20 rotate-12" />
                </div>

                <div className="px-6 text-slate-400 text-[11px] font-bold uppercase tracking-widest text-center md:text-left">
                    © 2026 The Sentinel Terminal
                </div>
            </div>
        </div>
    );
}