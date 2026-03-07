import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import { Mail, Calendar, LogOut, Settings, Award, ShieldCheck, Zap, ArrowLeft } from "lucide-react"; // Add ArrowLeft here
import { useAuth } from "../Context/AuthContext";
import toast from "react-hot-toast";

export default function Profile() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    useEffect(() => {
        if (!user) navigate("/");
    }, [user, navigate]);

    const handleLogout = () => {
        logout();
        toast.success("Session terminated safely.");
        navigate("/");
    };

    if (!user) return null;

    return (
        <div className="bg-[#fdfcf9] min-h-screen text-slate-900 selection:bg-accent selection:text-white">
            <Navbar />

            {/* Hero Header Section */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[15vw] font-serif font-black text-slate-100/50 select-none -z-10 leading-none">
                    DASHBOARD
                </div>

                <div className="container mx-auto px-6">
                    <button
                        onClick={() => navigate("/Home")}
                        className="group mb-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-accent transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Return to Dispatch
                    </button>

                    <div className="flex flex-col md:flex-row items-end gap-6 border-b border-slate-200 pb-12">
                        <div className="relative">
                            <div className="w-32 h-32 md:w-44 md:h-44 bg-headline rounded-2xl rotate-3 flex items-center justify-center text-white text-6xl font-serif italic shadow-2xl transition-transform hover:rotate-0 duration-500">
                                {user.username?.charAt(0).toUpperCase()}
                            </div>
                            <div className="absolute -bottom-4 -right-4 bg-accent text-white p-3 rounded-full shadow-lg">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                        </div>

                        <div className="flex-grow">
                            <span className="text-accent font-bold uppercase tracking-[0.3em] text-xs">Identity Verified</span>
                            <h1 className="text-5xl md:text-7xl font-serif font-black tracking-tighter text-headline mt-2">
                                {user.username}
                            </h1>
                        </div>

                        <div className="flex gap-3 pb-2">
                            <button onClick={handleLogout} className="flex items-center gap-2 px-6 py-3 border border-slate-200 rounded-full hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all text-xs font-bold uppercase tracking-widest">
                                <LogOut className="w-4 h-4" /> Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <main className="container mx-auto px-6 -mt-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Main Content Area */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-100">
                            <h3 className="text-2xl font-serif font-bold mb-8">Account Overview</h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Email Address</p>
                                    <p className="font-medium text-slate-700">{user.email || "Confidential"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Member Since</p>
                                    <p className="font-medium text-slate-700">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Clearance Level</p>
                                    <p className="font-medium text-accent">Level 1 (Reader)</p>
                                </div>
                            </div>

                            <div className="mt-12 p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <div className="flex items-start gap-4">
                                    <Zap className="w-6 h-6 text-accent shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-slate-800">The Editorial Upgrade</h4>
                                        <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                                            You currently have a Reader account. Want to contribute to the Sentinel?
                                            Apply for a Press Pass to start submitting reports.
                                        </p>
                                        <button className="mt-4 text-xs font-bold uppercase tracking-widest text-headline hover:text-accent transition-colors">
                                            Learn More &rarr;
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <aside className="lg:col-span-4 space-y-6">
                        <div className="bg-headline text-white rounded-3xl p-8 overflow-hidden relative shadow-xl">
                            <div className="relative z-10">
                                <Award className="w-10 h-10 text-accent mb-4" />
                                <h3 className="text-xl font-serif font-bold italic">Sentinel Prime</h3>
                                <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                                    Your subscription is active. You have full access to all classified reports and archives.
                                </p>
                            </div>
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
                        </div>

                        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="font-bold uppercase tracking-tighter text-sm text-slate-400">Security Log</h4>
                                <Settings className="w-4 h-4 text-slate-300" />
                            </div>
                            <div className="space-y-4">
                                {[1, 2].map((_, i) => (
                                    <div key={i} className="flex items-center gap-3 pb-4 border-b border-slate-50 last:border-0">
                                        <div className="w-2 h-2 rounded-full bg-green-400" />
                                        <div>
                                            <p className="text-xs font-bold text-slate-700 uppercase">Successful Login</p>
                                            <p className="text-[10px] text-slate-400">Lagos, Nigeria • 2h ago</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>

                </div>
            </main>

            <footer className="py-20 text-center opacity-20">
                <p className="font-serif italic text-sm">Finis Coronat Opus</p>
            </footer>
        </div>
    );
}