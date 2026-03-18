import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    User,
    BookOpen,
    Mail,
    ChevronRight,
    ChevronLeft,
    Search,
    Loader2
} from "lucide-react";
import API from "../api/axios";

export default function StaffDirectory() {
    const [staff, setStaff] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [showDetails, setShowDetails] = useState(false); // Mobile toggle
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        API.get("articles/staff-directory/")
            .then(res => {
                setStaff(res.data);
                if (res.data.length > 0 && window.innerWidth >= 768) {
                    setSelectedStaff(res.data[0]);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const filteredStaff = staff.filter(s =>
        s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectStaff = (person) => {
        setSelectedStaff(person);
        setShowDetails(true); // Switch to detail view on mobile
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
    );

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden">

            {/* Left Sidebar: Staff List */}
            <div className={`
                ${showDetails ? 'hidden' : 'flex'} 
                md:flex w-full md:w-80 lg:w-96 border-r border-slate-200 bg-white flex-col shadow-sm
            `}>
                <div className="p-4 md:p-6 border-b border-slate-100">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-4 group text-sm font-semibold"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Dashboard
                    </button>

                    <h1 className="text-xl font-bold text-slate-900 mb-4">Staff Directory</h1>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search staff..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredStaff.map((person) => (
                        <button
                            key={person.id}
                            onClick={() => handleSelectStaff(person)}
                            className={`w-full flex items-center gap-4 p-4 transition-all border-b border-slate-50 ${selectedStaff?.id === person.id
                                    ? "bg-indigo-50 border-r-4 border-r-indigo-600"
                                    : "hover:bg-slate-50"
                                }`}
                        >
                            <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold transition-colors ${selectedStaff?.id === person.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
                                }`}>
                                {person.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="text-left flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 truncate">{person.username}</p>
                                <p className="text-xs text-slate-500">{person.article_count} Articles</p>
                            </div>
                            <ChevronRight className={`w-4 h-4 shrink-0 transition-colors ${selectedStaff?.id === person.id ? "text-indigo-600" : "text-slate-300"}`} />
                        </button>
                    ))}
                </div>
            </div>

            {/* Right Side: Staff Details & Articles */}
            <div className={`
                ${showDetails ? 'flex' : 'hidden'} 
                md:flex flex-1 flex-col overflow-y-auto bg-[#F8FAFC]
            `}>
                {selectedStaff ? (
                    <div className="max-w-4xl mx-auto w-full p-4 md:p-10">
                        {/* MOBILE BACK BUTTON (Visible only on small screens) */}
                        <button
                            onClick={() => setShowDetails(false)}
                            className="md:hidden flex items-center gap-2 text-indigo-600 font-bold mb-6"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            Back to List
                        </button>

                        <header className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10 text-center sm:text-left">
                            <div className="w-24 h-24 bg-indigo-600 rounded-3xl shrink-0 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-indigo-100">
                                {selectedStaff.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                                    {selectedStaff.first_name} {selectedStaff.last_name}
                                </h2>
                                <p className="text-indigo-600 font-bold uppercase tracking-widest text-xs mt-1">Journalist @ The Sentinel</p>
                                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 mt-4 text-slate-500 text-sm">
                                    <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {selectedStaff.email}</span>
                                    <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> {selectedStaff.article_count} Published</span>
                                </div>
                            </div>
                        </header>

                        <h3 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-200 pb-2">Published Work</h3>

                        <div className="grid grid-cols-1 gap-4">
                            {selectedStaff.articles?.length > 0 ? (
                                selectedStaff.articles.map((article) => (
                                    <div key={article.id} className="group bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 md:line-clamp-none">
                                                    {article.title}
                                                </h4>
                                                <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                                                    {article.excerpt || article.content?.substring(0, 100)}...
                                                </p>
                                                <div className="mt-4 flex items-center gap-3 text-xs font-medium text-slate-400">
                                                    <span>{new Date(article.created_at).toLocaleDateString()}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                    <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md">Published</span>
                                                </div>
                                            </div>
                                            <button className="shrink-0 p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
                                    No published articles yet.
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center">
                        <User className="w-16 h-16 mb-4 opacity-20" />
                        <p className="font-medium">Select a staff member from the list to view their profile and published work.</p>
                    </div>
                )}
            </div>
        </div>
    );
}