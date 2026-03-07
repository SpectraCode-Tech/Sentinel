import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ShieldCheck,
    Layers,
    ClipboardCheck,
    Users,
    TrendingUp,
    AlertCircle,
    ChevronRight,
    ExternalLink,
    LogOut,
} from "lucide-react";
import API from "../api/axios";

export default function EditorDashboard() {
    const [username, setUsername] = useState("Editor");
    const [stats, setStats] = useState(null);
    const navigate = useNavigate();


  const handleLogout = () => {
    // Clear your tokens (adjust the keys to match your login logic)
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    // Redirect to login
    navigate("/");
  };

    useEffect(() => {
        API.get("articles/dashboard/editor/")
            .then(res => {
                setUsername(res.data.username);
                setStats(res.data);
            })
            .catch(err => {
                console.error(err);
            });
    }, []);

  // Mock data for the review queue status
    const queueStats = stats ? [
        {
            label: "Pending Review",
            count: stats.pending_review,
            color: "text-amber-600",
            bg: "bg-amber-50",
            icon: AlertCircle
        },
        {
            label: "Active Journalists",
            count: stats.active_journalists,
            color: "text-blue-600",
            bg: "bg-blue-50",
            icon: Users
        },
        {
            label: "Published Articles",
            count: stats.total_published,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            icon: ClipboardCheck
        }
    ] : [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900">
      {/* Sidebar - Compact Version for Editor */}
      <aside className="w-20 lg:w-64 bg-slate-900 hidden md:flex flex-col p-4 lg:p-6 sticky top-0 h-screen transition-all">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="hidden lg:block font-bold text-white tracking-tight">Editorial Hub</span>
        </div>

        <nav className="flex-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-3 py-3 text-sm font-semibold bg-white/10 text-white rounded-xl">
            <Layers className="w-5 h-5" /> <span className="hidden lg:block">Overview</span>
          </button>
          <Link to="/editor/reviews" className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
            <ClipboardCheck className="w-5 h-5" /> <span className="hidden lg:block">Review Queue</span>
          </Link>
          <Link to="/editor/staff" className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
            <Users className="w-5 h-5" /> <span className="hidden lg:block">Staff Directory</span>
          </Link>
        </nav>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-white/5 space-y-1">

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 text-sm font-bold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all group"
          >
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span className="hidden lg:block">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Editor Dashboard</h1>
            <p className="text-slate-500 font-medium mt-1">System status: <span className="text-emerald-600">Operational</span></p>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
             <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-600">
               {username.charAt(0)}
             </div>
             <div className="pr-4 hidden sm:block">
               <p className="text-xs font-bold text-slate-400 uppercase">Chief Editor</p>
               <p className="text-sm font-bold text-slate-900">{username}</p>
             </div>
          </div>
        </header>

        {/* Top Queue Banner */}
        <Link to="/editor/reviews" className="group block mb-10 relative overflow-hidden bg-white border border-slate-100 rounded-4xl p-8 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <ClipboardCheck className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Access Review Queue</h3>
                              <p className="text-slate-500 font-medium">There are {stats?.pending_review || 0} articles waiting for your final approval.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 font-bold text-indigo-600 bg-indigo-50 px-6 py-3 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
              Open Queue <ChevronRight className="w-5 h-5" />
            </div>
          </div>
          {/* Abstract background design */}
          <div className="absolute top-0 right-0 w-32 h-full bg-slate-50 -skew-x-12 translate-x-16 group-hover:translate-x-12 transition-transform" />
        </Link>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {queueStats.map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-4xl border border-slate-100 shadow-sm">
              <div className={`${stat.bg} ${stat.color} w-12 h-12 rounded-xl flex items-center justify-center mb-6`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-black text-slate-900">{stat.count}</span>
                <span className="text-emerald-500 font-bold text-sm flex items-center gap-1">
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Activity Feed / Placeholder Section */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-4xl p-8 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
              <ExternalLink className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900">External View</h4>
            <p className="text-sm text-slate-500 mb-6">See how the newsroom looks to the public.</p>
            <button className="px-6 py-2 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all">
              Visit Live Site
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}