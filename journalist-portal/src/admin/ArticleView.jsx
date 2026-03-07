import React, { useEffect, useState } from "react";
import { FileText, Eye, Trash2, Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import AdminSidebar from "./sidebar";
import toast, { Toaster } from "react-hot-toast";

export default function AdminArticles() {
    const [articles, setArticles] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const fetchArticles = () => {
        API.get("articles/")
            .then(res => setArticles(res.data))
            .catch(() => toast.error("Failed to load articles"));
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    // Logic to filter articles based on search and status
    const filteredArticles = articles.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || article.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleDelete = (id) => {
        toast((t) => (
            <div className="flex flex-col gap-3">
                <p className="font-medium text-slate-800">Delete this article permanently?</p>
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            const loading = toast.loading("Deleting...");
                            try {
                                await API.delete(`articles/${id}/`);
                                toast.success("Deleted", { id: loading });
                                fetchArticles();
                            } catch (err) {
                                toast.error("Error", { id: loading });
                            }
                        }}
                        className="bg-rose-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                    >
                        Confirm
                    </button>
                    <button onClick={() => toast.dismiss(t.id)} className="bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold">
                        Cancel
                    </button>
                </div>
            </div>
        ), { position: 'top-center' });
    };

    return (
        <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900">
            <Toaster position="top-right" />
            <AdminSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} handleLogout={() => navigate("/")} />

            <main className="flex-1 flex flex-col min-w-0">
                <div className="h-16 lg:hidden" />

                <div className="p-6 md:p-10 lg:p-12 overflow-y-auto">
                    <header className="mb-10 flex flex-col xl:flex-row xl:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Global Content</h1>
                            <p className="text-slate-500 mt-1 font-medium">Monitor and manage all platform publications</p>
                        </div>

                        {/* Search and Filter Controls */}
                        <div className="flex flex-col md:flex-row gap-4 items-center w-full xl:w-auto">
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search by title..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                />
                            </div>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full md:w-48 px-4 py-3 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-bold text-slate-600 appearance-none"
                            >
                                <option value="all">All Status</option>
                                <option value="published">Published</option>
                                <option value="draft">Drafts</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>
                    </header>

                    <div className="grid gap-4">
                        {filteredArticles.length > 0 ? (
                            filteredArticles.map(article => (
                                <div key={article.id} className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-wrap items-center justify-between hover:shadow-md transition-all group">
                                    <div className="flex items-center gap-4 flex-1 min-w-[250px]">
                                        <div className="p-3 bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 rounded-xl transition-colors">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 leading-tight mb-1">{article.title}</h3>
                                            <p className="text-sm text-slate-400 font-medium">
                                                {article.author_name} • {new Date(article.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 mt-4 sm:mt-0">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] tracking-widest font-black uppercase ${article.status === 'published' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                            }`}>
                                            {article.status}
                                        </span>

                                        <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                                            <button onClick={() => navigate(`/articles/${article.id}`)} className="p-2 hover:bg-white hover:text-indigo-600 rounded-lg text-slate-400 transition-all"><Eye className="w-5 h-5" /></button>
                                            <button onClick={() => handleDelete(article.id)} className="p-2 hover:bg-white hover:text-rose-600 rounded-lg text-slate-400 transition-all"><Trash2 className="w-5 h-5" /></button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                                <p className="text-slate-400 font-medium">No articles match your search criteria.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}