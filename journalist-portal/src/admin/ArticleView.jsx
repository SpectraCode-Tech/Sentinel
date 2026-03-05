import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { ArrowLeft, Calendar, User, Loader2 } from "lucide-react";

export default function ArticleView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const res = await API.get(`articles/articles/${id}/`);
                setArticle(res.data);
            } catch (err) {
                console.error("Could not load article", err);
            } finally {
                setLoading(false);
            }
        };
        fetchArticle();
    }, [id]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
    );

    if (!article) return <div className="text-center p-10">Article not found.</div>;

    return (
        <div className="min-h-screen bg-white">
            {/* Top Navigation */}
            <nav className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-10">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-semibold transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" /> Back
                    </button>
                </div>
            </nav>

            <article className="max-w-3xl mx-auto px-4 py-10">
                {/* Category/Badge */}
                <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full uppercase tracking-wider mb-4">
                    {article.category_name || "Journalism"}
                </span>

                <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-6">
                    {article.title}
                </h1>

                {/* Author Info */}
                <div className="flex items-center gap-4 mb-10 pb-10 border-b border-slate-100">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                        <p className="text-slate-900 font-bold capitalize">{article.author || "Unknown Author"}</p>
                        <div className="flex items-center gap-3 text-slate-500 text-sm">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(article.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Article Image */}
                {article.image && (
                    <div className="mb-10">
                        <img
                            src={article.image}
                            alt={article.title}
                            className="w-full h-auto rounded-3xl object-cover shadow-2xl shadow-slate-200"
                        />
                        {article.image_caption && (
                            <p className="mt-4 text-center text-sm text-slate-400 italic">
                                {article.image_caption}
                            </p>
                        )}
                    </div>
                )}

                {/* Article Content */}
                <div className="prose prose-indigo prose-lg max-w-none text-slate-700 leading-relaxed">
                    {/* Using dangerouslySetInnerHTML if your backend sends HTML (Common for editors) */}
                    <div dangerouslySetInnerHTML={{ __html: article.content }} />

                    {/* If your backend sends plain text, use this instead: */}
                    {/* <p className="whitespace-pre-wrap">{article.content}</p> */}
                </div>
            </article>
        </div>
    );
}