import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    Shield,
    Users,
    FileText,
    Layers,
    BarChart3,
    LogOut,
    X,
    Menu,
    Layout // Added Layout icon for Sidebar Blocks
} from "lucide-react";

export default function AdminSidebar({ isSidebarOpen, setIsSidebarOpen }) {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;
    const navigate = useNavigate();

    const navItems = [
        { name: "Dashboard", path: "/admin", icon: BarChart3 },
        { name: "Users", path: "/admin/users", icon: Users },
        { name: "Articles", path: "/admin/articles", icon: FileText },
        { name: "Categories", path: "/admin/categories", icon: Layers },
        { name: "Advertisements", path: "/admin/advertisements", icon: Layers },
        // Added Sidebar Blocks Management Link
        { name: "Sidebar Blocks", path: "/admin/sidebar-blocks", icon: Layout },
    ];

    const handleLogout = () => {
        localStorage.clear();
        window.dispatchEvent(new Event("storage_updated"));
        navigate("/");

    };

    return (
        <>
            {/* 1. TOP MOBILE NAV */}
            <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 fixed top-0 left-0 right-0 z-30">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-slate-900">Admin</span>
                </div>
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-100 rounded-lg">
                    <Menu className="w-6 h-6 text-slate-600" />
                </button>
            </div>

            {/* 2. MOBILE OVERLAY */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* 3. FIXED SIDEBAR PANEL */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 text-white p-6 flex flex-col transform transition-transform duration-300 ease-in-out
                lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}>
                {/* Sidebar Header */}
                <div className="flex items-center justify-between mb-10 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Shield className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">Admin Panel</span>
                    </div>
                    <button className="lg:hidden p-1 hover:bg-white/10 rounded-md" onClick={() => setIsSidebarOpen(false)}>
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="space-y-1.5 flex-1 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            onClick={() => setIsSidebarOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive(item.path)
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40"
                                : "text-slate-400 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive(item.path) ? "text-white" : "text-slate-500"}`} />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                {/* Logout Button */}
                <div className="pt-6 mt-6 border-t border-white/10 shrink-0">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all group"
                    >
                        <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        <span className="font-semibold">Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}