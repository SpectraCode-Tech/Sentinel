import React, { useEffect, useState } from "react";
import { FileText, Eye, Trash2, AlertTriangle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import AdminSidebar from "./Sidebar";
import toast, { Toaster } from "react-hot-toast";

export default function AdminArticles() {
    const [articles, setArticles] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    // New state for Modal
    const [deleteModal, setDeleteModal] = useState({ show: false, slug: null, title: "" });

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

    const confirmDelete = async () => {
        const slug = deleteModal.slug;
        setDeleteModal({ show: false, slug: null, title: "" });

        const loading = toast.loading("Deleting article...");
        try {
            await API.delete(`articles/${slug}/`);
            toast.success("Article removed", { id: loading });
            fetchArticles();
        } catch (err) {
            toast.error("Error deleting article", { id: loading });
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900">
            <Toaster position="top-right" />

            {/* DELETE MODAL */}
            {deleteModal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setDeleteModal({ show: false, slug: null, title: "" })}
                    />

                    {/* Modal Content */}
                    <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <button
                                    onClick={() => setDeleteModal({ show: false, slug: null, title: "" })}
                                    className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <h2 className="text-xl font-black text-slate-900 mb-2">Confirm Deletion</h2>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                Are you sure you want to delete <span className="text-slate-900 font-bold">"{deleteModal.title}"</span>? This action cannot be undone.
                            </p>
                        </div>

                        <div className="p-4 bg-slate-50 flex gap-3">
                            <button
                                onClick={() => setDeleteModal({ show: false, slug: null, title: "" })}
                                className="flex-1 px-4 py-3 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-all"
                            >
                                Never mind
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-4 py-3 rounded-2xl text-sm font-bold bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-200 transition-all"
                            >
                                Delete Article
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <AdminSidebar
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
            />

            <main className="flex-1 flex flex-col min-w-0">
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
                                                onClick={() => setDeleteModal({ show: true, slug: article.slug, title: article.title })}
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