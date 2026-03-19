import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom"; // Add this import
import {
    CheckCircle,
    XCircle,
    Clock,
    User,
    Tag as TagIcon,
    ChevronRight,
    AlertCircle,
    ArrowLeft
} from "lucide-react";

export default function ReviewQueue() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    useEffect(() => {
        api.get("/articles/?status=review")
            .then((res) => {
                // FIX: Handle both paginated and non-paginated responses
                const data = res.data.results || res.data;
                setArticles(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => {
                setArticles([]);
                setLoading(false);
            });
    }, []);

    const handleAction = async (slug, newStatus) => {
        try {
            await api.patch(`/articles/${slug}/`, { status: newStatus });
            // FIX: Smoothly remove the article from UI instead of reloading the page
            setArticles(articles.filter(art => art.slug !== slug));
        } catch (err) {
            alert("Action failed. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10 font-sans">
            <div className="max-w-5xl mx-auto">

                {/* Back Navigation */}
                <button
                    onClick={() => navigate("/editor")} // Update this path to your actual dashboard route
                    className="group flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors mb-6 font-medium text-sm"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Editor Dashboard
                </button>

                {/* Header Area */}
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <Clock className="w-5 h-5 text-amber-600" />
                        </div>
                        <h2 className="text-sm font-black text-amber-600 uppercase tracking-[0.2em]">Editorial Oversight</h2>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Review Queue</h1>
                    <p className="text-slate-500 font-medium mt-1">Verify and approve content for public release.</p>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-slate-400 animate-pulse font-bold uppercase tracking-widest">
                        Fetching Queue...
                    </div>
                ) : articles.length === 0 ? (
                    <div className="bg-white rounded-4xl p-20 text-center border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">All caught up!</h3>
                        <p className="text-slate-500">There are no articles waiting for review.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {articles.map((a) => (
                            <div key={a.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6">

                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase rounded-full tracking-wider">
                                            {a.category_details?.name || 'General'}
                                        </span>
                                        <span className="text-xs text-slate-400 font-medium">
                                            Submitted {new Date(a.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-indigo-600">
                                        {a.title}
                                    </h3>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <div className="w-6 h-6 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-[10px] font-bold">
                                                {a.author_name?.charAt(0) || 'U'}
                                            </div>
                                            <span className="text-sm font-semibold">{a.author_name}</span>
                                        </div>
                                        <Link
                                            to={`/editor/articles/${a.slug}`}
                                            className="text-indigo-600 text-sm font-bold flex items-center gap-1 hover:underline group-hover:translate-x-1 transition-transform"
                                        >
                                            Review & Edit <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-50 pt-6 md:pt-0 md:pl-8">
                                    <button
                                        onClick={() => handleAction(a.slug, 'rejected')}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-rose-100 text-rose-600 font-bold rounded-2xl hover:bg-rose-50 transition-all active:scale-95"
                                    >
                                        <XCircle className="w-5 h-5" /> Reject
                                    </button>
                                    <button
                                        onClick={() => handleAction(a.slug, 'published')}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                                    >
                                        <CheckCircle className="w-5 h-5" /> Approve
                                    </button>
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}