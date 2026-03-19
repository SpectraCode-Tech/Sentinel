import { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import {
    FileText, Search, Filter, MoreVertical,
    Eye, Edit3, Trash2, BookOpen, X, ArrowLeft // Added ArrowLeft
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

export default function MyArticles() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openMenuId, setOpenMenuId] = useState(null);

    // Search and Filter States
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const navigate = useNavigate();

    useEffect(() => {
        const closeMenu = () => setOpenMenuId(null);
        window.addEventListener("click", closeMenu);
        return () => window.removeEventListener("click", closeMenu);
    }, []);

    useEffect(() => {
        api.get("articles/")
            .then((res) => {
                const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
                // Sort by newest first immediately on load
                const sorted = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setArticles(sorted);
                setLoading(false);
            })
            .catch(() => {
                setArticles([]);
                setLoading(false);
            });
    }, []);

    // Memoized Filtering Logic
    const filteredArticles = useMemo(() => {
        return articles.filter(art => {
            const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "all" || art.status.toLowerCase() === statusFilter.toLowerCase();
            return matchesSearch && matchesStatus;
        });
    }, [articles, searchQuery, statusFilter]);

    const handleDelete = async (id) => {
        if (!window.confirm("Permanently delete this article?")) return;
        const loadToast = toast.loading("Deleting...");
        try {
            await api.delete(`/articles/${id}/`);
            setArticles(prev => prev.filter(a => a.id !== id));
            toast.success("Deleted", { id: loadToast });
        } catch (err) {
            toast.error("Error deleting", { id: loadToast });
        }
    };

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'published': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'review': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'draft': return 'bg-slate-50 text-slate-600 border-slate-100';
            default: return 'bg-gray-50 text-gray-600';
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10 font-sans">
            <Toaster />
            <div className="max-w-6xl mx-auto">

                {/* Header Area */}
                {/* Header Area */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate("/journalist")} // Change "/dashboard" to your actual dashboard route
                        className="group flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors mb-4 font-medium text-sm"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </button>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">My Articles</h2>
                            <p className="text-slate-500 font-medium">Manage your editorial contributions</p>
                        </div>
                        <Link
                            to="/journalist/new"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 flex items-center gap-2 w-fit"
                        >
                            <FileText className="w-4 h-4" /> New Article
                        </Link>
                    </div>
                </div>

                {/* Search and Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by title..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm text-sm"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full">
                                <X className="w-3 h-3 text-slate-400" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm">
                        {['all', 'published', 'review', 'draft'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${statusFilter === status
                                        ? "bg-slate-900 text-white shadow-md"
                                        : "text-slate-500 hover:bg-slate-50"
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-4xl border border-slate-100 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-20 text-center text-slate-400 font-medium">Loading newsroom...</div>
                    ) : filteredArticles.length === 0 ? (
                        <div className="p-20 text-center text-slate-400 font-medium">No articles found matching your criteria.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-50">
                                        <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Article Title</th>
                                        <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                        <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Date</th>
                                        <th className="px-8 py-5 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredArticles.map((a) => (
                                        <tr key={a.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-5">
                                                <div
                                                    className="flex flex-col cursor-pointer"
                                                    onClick={() => navigate(`/journalist/articles/edit/${a.slug}`)}
                                                >
                                                    <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                                                        {a.title}
                                                    </span>
                                                    <span className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                                        <Eye className="w-3 h-3" /> {a.view_count || 0} views
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(a.status)}`}>
                                                    {a.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-sm text-slate-500 font-medium whitespace-nowrap">
                                                {new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="relative inline-block text-left">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setOpenMenuId(openMenuId === a.id ? null : a.id);
                                                        }}
                                                        className={`p-2 rounded-lg transition-all border ${openMenuId === a.id ? 'bg-slate-100 border-slate-200 text-slate-900' : 'text-slate-400 hover:text-slate-600 border-transparent hover:border-slate-100'}`}
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>

                                                    {openMenuId === a.id && (
                                                        <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-100 shadow-2xl rounded-xl z-100 py-2 animate-in fade-in zoom-in duration-150">
                                                            <button
                                                                onClick={() => navigate(`/journalist/articles/edit/${a.slug}`)}
                                                                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                                            >
                                                                <Edit3 className="w-4 h-4 text-slate-400" /> Edit Draft
                                                            </button>
                                                            <div className="border-t border-slate-50 my-1"></div>
                                                            <button
                                                                onClick={() => handleDelete(a.slug)}
                                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                            >
                                                                <Trash2 className="w-4 h-4" /> Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}