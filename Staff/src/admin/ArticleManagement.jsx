import React, { useEffect, useState } from "react";
import { FileText, Eye, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import AdminSidebar from "./Sidebar";
import toast, { Toaster } from "react-hot-toast";

export default function AdminArticles() {
    const [articles, setArticles] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const fetchArticles = () => {
        API.get("articles/")
            .then(res => setArticles(res.data))
            .catch(err => {
                console.error(err);
                toast.error("Failed to load articles");
            });
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    const handleDelete = (slug) => {
        toast((t) => (
            <div className="flex flex-col gap-3">
                <p className="font-medium text-slate-800">Delete this article permanently?</p>
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            const loading = toast.loading("Deleting article...");
                            try {
                                await API.delete(`articles/${slug}/`);
                                toast.success("Article removed", { slug: loading });
                                fetchArticles();
                            } catch (err) {
                                toast.error("Error deleting article", { slug: loading });
                            }
                        }}
                        className="bg-rose-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-rose-600"
                    >
                        Confirm
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-300"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ), { position: 'top-center', duration: 5000 });
    };

    return (
        <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900">
            <Toaster position="top-right" />

            <AdminSidebar
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
            />

            <main className="flex-1 flex flex-col min-w-0">
                {/* Mobile spacer for the fixed top nav */}
                <div className="h-16 lg:hidden" />

                <div className="p-6 md:p-10 lg:p-12 overflow-y-auto">
                    <header className="mb-10">
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                            Global Content
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">Monitor and manage all platform publications</p>
                    </header>

                    <div className="grid gap-4">
                        {articles.length > 0 ? (
                            articles.map(article => (
                                <div key={article.id} className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-wrap items-center justify-between hover:shadow-md transition-all group">
                                    <div className="flex items-center gap-4 flex-1 min-w-62.5">
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
                                        <span className={`px-3 py-1 rounded-lg text-[10px] tracking-widest font-black uppercase ${article.status === 'published'
                                            ? 'bg-emerald-50 text-emerald-600'
                                            : 'bg-amber-50 text-amber-600'
                                            }`}>
                                            {article.status}
                                        </span>

                                        <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                                            <button
                                                onClick={() => navigate(`/admin/articles/${article.slug}`)}
                                                className="p-2 hover:bg-white hover:text-indigo-600 rounded-lg text-slate-400 transition-all shadow-sm hover:shadow"
                                                title="View Article"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(article.id)}
                                                className="p-2 hover:bg-white hover:text-rose-600 rounded-lg text-slate-400 transition-all shadow-sm hover:shadow"
                                                title="Delete Article"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                                <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-400 font-medium">No articles found in the system.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}