import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { ArrowLeft, Calendar, User, Loader2 } from "lucide-react";

export default function ArticleReader() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get(`articles/${id}/`)
            .then(res => {
                setArticle(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-indigo-600" /></div>
    );

    if (!article) return <div className="p-10 text-center">Article not found.</div>;

    return (
        <div className="min-h-screen bg-white font-sans">
            {/* Navigation Header */}
            <nav className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-10">
                <div className="max-w-3xl mx-auto px-6 h-16 flex items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-semibold text-sm transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                </div>
            </nav>

            <article className="max-w-3xl mx-auto px-6 py-12">
                {/* Meta Information */}
                <header className="mb-10">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-6">
                        {article.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-slate-500 text-sm border-y border-slate-100 py-4">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-indigo-600" />
                            <span className="font-bold text-slate-700">{article.author_name || "Journalist"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(article.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                        </div>
                    </div>
                </header>

                {/* Article Image (Optional) */}
                {article.image && (
                    <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-[400px] object-cover rounded-3xl mb-10 shadow-xl shadow-slate-200"
                    />
                )}

                {/* Content Body */}
                <div className="prose prose-slate prose-lg max-w-none">
                    {/* If content is HTML, use dangerouslySetInnerHTML, otherwise render text */}
                    <div className="text-slate-700 leading-relaxed whitespace-pre-line">
                        {article.content}
                    </div>
                </div>
            </article>
        </div>
    );
}