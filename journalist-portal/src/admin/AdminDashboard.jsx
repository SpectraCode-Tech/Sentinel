import React, { useEffect, useState } from "react";
import {
    Shield,
    Users,
    FileText,
    Layers,
    BarChart3,
    LogOut,
    Menu,
    X
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import API from "../api/axios";

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/login");
    };

    useEffect(() => {
        API.get("articles/dashboard/admin/")
            .then(res => setStats(res.data))
            .catch(err => console.error(err));
    }, []);

    // Helper to highlight active link
    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900 relative">

            {/* MOBILE OVERLAY */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 text-white p-6 flex flex-col transform transition-transform duration-300 ease-in-out
                lg:relative lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}>
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                            <Shield className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">Admin Panel</span>
                    </div>
                    {/* Close button for mobile */}
                    <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                <nav className="space-y-1.5 flex-1">
                    {[
                        { name: "Dashboard", path: "/admin", icon: BarChart3 },
                        { name: "Users", path: "/admin/users/", icon: Users },
                        { name: "Articles", path: "/admin/articles", icon: FileText },
                        { name: "Categories", path: "/admin/categories", icon: Layers },
                    ].map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive(item.path)
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20"
                                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <button
                    onClick={handleLogout}
                    className="mt-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all group"
                >
                    <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    <span className="font-semibold">Logout</span>
                </button>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col min-w-0">

                {/* TOP MOBILE NAV */}
                <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200">
                    <div className="flex items-center gap-2">
                        <Shield className="w-6 h-6 text-indigo-600" />
                        <span className="font-bold">Admin</span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 md:p-10 lg:p-12 overflow-y-auto">
                    <header className="mb-10">
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                            System Overview
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">Full platform control & analytics</p>
                    </header>

                    {!stats ? (
                        <div className="flex items-center gap-3 text-slate-400 font-medium">
                            <div className="w-4 h-4 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin" />
                            Loading system metrics...
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">

                            <StatCard
                                icon={Users}
                                label="Total Users"
                                value={stats.total_users}
                                color="indigo"
                            />
                            <StatCard
                                icon={FileText}
                                label="Total Articles"
                                value={stats.total_articles}
                                color="emerald"
                            />
                            <StatCard
                                icon={Layers}
                                label="Pending Review"
                                value={stats.pending}
                                color="amber"
                            />
                            <StatCard
                                icon={BarChart3}
                                label="Published"
                                value={stats.published}
                                color="blue"
                            />
                            <StatCard
                                icon={Shield}
                                label="Editors"
                                value={stats.editors}
                                color="purple"
                            />
                            <StatCard
                                icon={Users}
                                label="Journalists"
                                value={stats.journalists}
                                color="indigo"
                            />

                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

// Sub-component for clean organization
function StatCard({ icon: Icon, label, value, color }) {
    const colors = {
        indigo: "text-indigo-600 bg-indigo-50",
        emerald: "text-emerald-600 bg-emerald-50",
        amber: "text-amber-600 bg-amber-50",
        blue: "text-blue-600 bg-blue-50",
        purple: "text-purple-600 bg-purple-50",
    };

    return (
        <div className="bg-white p-6 md:p-8 rounded-4xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 ${colors[color]} rounded-2xl flex items-center justify-center mb-5`}>
                <Icon className="w-6 h-6" />
            </div>
            <p className="text-slate-400 text-xs uppercase tracking-widest font-black">{label}</p>
            <h2 className="text-3xl md:text-4xl font-black mt-2 text-slate-900 leading-none">
                {value?.toLocaleString() || 0}
            </h2>
        </div>
    );
}