import React, { useEffect, useState } from "react";
import { Users, FileText, Layers, BarChart3, Shield } from "lucide-react";
import API from "../api/axios";
import AdminSidebar from "./Sidebar";

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        API.get("dashboard/admin/")
            .then(res => setStats(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900">
            <AdminSidebar
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
            />

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col min-w-0">
                <div className="h-16 lg:hidden" />

                <div className="p-6 md:p-10 lg:p-12">
                    <header className="mb-10">
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                            System Overview
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">Full platform control & analytics</p>
                    </header>

                    {!stats ? (
                        <div className="flex items-center gap-3 text-slate-400 font-medium py-10">
                            <div className="w-4 h-4 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin" />
                            Synchronizing metrics...
                        </div>
                    ) : (
                        /* Grid updated to 4 columns on large screens */
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                            <StatCard icon={Users} label="Total Users" value={stats.total_users} color="indigo" />
                            {/* New Readers Card */}
                            <StatCard icon={Users} label="Readers" value={stats.readers} color="rose" />
                            <StatCard icon={FileText} label="Total Articles" value={stats.total_articles} color="emerald" />
                            <StatCard icon={Layers} label="Pending Review" value={stats.pending} color="amber" />
                            <StatCard icon={BarChart3} label="Published" value={stats.published} color="blue" />
                            <StatCard icon={Shield} label="Editors" value={stats.editors} color="purple" />
                            <StatCard icon={Users} label="Journalists" value={stats.journalists} color="indigo" />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }) {
    const colors = {
        indigo: "text-indigo-600 bg-indigo-50",
        emerald: "text-emerald-600 bg-emerald-50",
        amber: "text-amber-600 bg-amber-50",
        blue: "text-blue-600 bg-blue-50",
        purple: "text-purple-600 bg-purple-50",
        rose: "text-rose-600 bg-rose-50", // Added rose for visual variety
    };

    return (
        <div className="bg-white p-6 md:p-8 rounded-4xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 ${colors[color] || colors.indigo} rounded-2xl flex items-center justify-center mb-5`}>
                <Icon className="w-6 h-6" />
            </div>
            <p className="text-slate-400 text-xs uppercase tracking-widest font-black">{label}</p>
            <h2 className="text-3xl md:text-4xl font-black mt-2 text-slate-900 leading-none">
                {value?.toLocaleString() || 0}
            </h2>
        </div>
    );
}