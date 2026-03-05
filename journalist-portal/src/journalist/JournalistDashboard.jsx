import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    FileText,
    BarChart3,
    Clock,
    CheckCircle2,
    BookOpen,
    ChevronRight,
    LogOut,
    UserCircle,
    FileEdit // Added for Drafts icon
} from "lucide-react";
import API from "../api/axios";

export default function JournalistDashboard() {
    const [username, setUsername] = useState("Journalist");
    const [stats, setStats] = useState(null);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/login");
    };

    useEffect(() => {
        API.get("dashboard/journalist/")
            .then(res => {
                setUsername(res.data.username);
                setStats(res.data);
            })
            .catch(err => {
                console.error(err);
            });
    }, []);

    const statCards = stats ? [
        {
            label: "Total Articles",
            value: stats.total_articles,
            icon: FileText,
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            label: "Drafts", // NEW DRAFT SECTION
            value: stats.draft,
            icon: FileEdit,
            color: "text-slate-600",
            bg: "bg-slate-100",
        },
        {
            label: "In Review",
            value: stats.review,
            icon: Clock,
            color: "text-amber-600",
            bg: "bg-amber-50",
        },
        {
            label: "Published",
            value: stats.published,
            icon: CheckCircle2,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
        },
        {
            label: "Total Views",
            value: stats.total_views?.toLocaleString(),
            icon: BarChart3,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
        },
    ] : [];

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto"> {/* Widened container to fit 5 cards better */}

                <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                            <UserCircle className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-1">
                                Writer Workspace
                            </h2>
                            <h1 className="text-3xl font-bold text-slate-900 leading-none">
                                Welcome, {username}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            to="/journalist/articles"
                            className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-bold transition-all hover:bg-slate-50 active:scale-95 shadow-sm"
                        >
                            <BookOpen className="w-5 h-5" />
                            Manage Articles
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center justify-center gap-2 bg-rose-50 text-rose-600 border border-rose-100 px-4 py-3 rounded-2xl font-bold transition-all hover:bg-rose-600 hover:text-white active:scale-95 shadow-sm"
                            title="Sign Out"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </header>

                {/* Updated Grid: grid-cols-1 to grid-cols-5 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
                    {statCards.map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                            <div className={`${stat.bg} ${stat.color} w-10 h-10 rounded-xl flex items-center justify-center mb-4`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                            <p className="text-xl font-black text-slate-900 mt-1">{stat.value}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-indigo-600 rounded-[2.5rem] p-8 md:p-12 text-white overflow-hidden relative shadow-xl shadow-indigo-100">
                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold mb-2">Review your performance</h3>
                        <p className="text-indigo-100 mb-6 max-w-md">Check the status of your submissions, edit drafts, or view detailed engagement metrics for your stories.</p>
                        <Link
                            to="/journalist/articles"
                            className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors"
                        >
                            Go to My Articles
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <FileText className="absolute -bottom-10 -right-10 w-64 h-64 text-indigo-500/20 rotate-12" />
                </div>

            </div>
        </div>
    );
}