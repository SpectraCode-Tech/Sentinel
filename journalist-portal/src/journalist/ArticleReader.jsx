import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { ArrowLeft, Clock, Calendar, Tag, ChevronRight } from "lucide-react";

export default function ArticleReader() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/articles/articles/${id}/`)
            .then((res) => {
                setArticle(res.data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-500 font-medium">Opening manuscript...</p>
                </div>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
                <h2 className="text-2xl font-bold text-slate-900">Article not found</h2>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 text-indigo-600 font-bold flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" /> Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Top Navigation Bar */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 hover:bg-slate-50 rounded-full transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:text-indigo-600" />
                    </button>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <span>Newsroom</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-indigo-600">{article.category_name || "General"}</span>
                    </div>
                </div>
            </nav>

            <article className="max-w-3xl mx-auto px-6 py-12">
                {/* Header Section */}
                <header className="mb-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-6">
                        {article.title}
                    </h1>

                    <div className="flex flex-wrap items-center justify-center gap-6 text-slate-500 text-sm font-medium">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(article.created_at).toLocaleDateString('en-US', {
                                month: 'long', day: 'numeric', year: 'numeric'
                            })}
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {Math.ceil(article.content.split(' ').length / 200)} min read
                        </div>
                    </div>
                </header>

                {/* Featured Image */}
                {article.image_url && (
                    <div className="mb-12 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200">
                        <img
                            src={article.image_url}
                            alt={article.title}
                            className="w-full h-auto object-cover max-h-[500px]"
                        />
                    </div>
                )}

                {/* Content Section */}
                <div className="prose prose-slate prose-lg max-w-none">
                    {/* Render content - assuming Markdown or plain text with line breaks */}
                    <div className="text-slate-700 leading-relaxed space-y-6 text-lg whitespace-pre-wrap">
                        {article.content}
                    </div>
                </div>

                {/* Footer Section (Tags) */}
                {article.tags && article.tags.length > 0 && (
                    <footer className="mt-16 pt-8 border-t border-slate-100">
                        <div className="flex flex-wrap gap-2">
                            <Tag className="w-4 h-4 text-slate-400 mr-2" />
                            {article.tags.map((tag, idx) => (
                                <span
                                    key={idx}
                                    className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg uppercase"
                                >
                                    #{tag.name || tag}
                                </span>
                            ))}
                        </div>
                    </footer>
                )}
            </article>
        </div>
    );
}