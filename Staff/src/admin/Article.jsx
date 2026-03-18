import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { ArrowLeft, Calendar, User, Loader2, Tag as TagIcon } from "lucide-react"; // Added Navbar for consistency

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
        <div className="flex flex-col items-center justify-center min-h-screen bg-bg">
            <Loader2 className="animate-spin text-headline w-10 h-10 mb-4" />
            <p className="font-serif italic text-gray-500">Opening article...</p>
        </div>
    );

    if (!article) return <div className="p-10 text-center font-serif text-xl">Article not found in archives.</div>;

    return (
        <div className="min-h-screen bg-bg text-text selection:bg-accent selection:text-white">

            <article className="max-w-3xl mx-auto px-6 py-12">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="group mb-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-headline transition-colors"
                >
                    <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
                    Back
                </button>

                {/* Meta Information */}
                <header className="mb-10">
                    {/* CATEGORY KICKER */}
                    {article.category && (
                        <Link
                            to={`/category/${article.category_slug}`}
                            className="inline-block text-accent font-black text-[11px] uppercase tracking-[0.3em] mb-4 hover:underline"
                        >
                            {article.category_name}
                        </Link>
                    )}

                    <h1 className="text-4xl md:text-6xl font-serif font-black text-headline leading-tight mb-8">
                        {article.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-gray-500 text-[11px] border-y border-border py-6 uppercase tracking-widest font-bold">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-accent" />
                            <span>By <span className="text-headline">{article.author_name || "Staff Reporter"}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(article.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                        </div>
                    </div>
                </header>

                {/* Article Image */}
                {article.image && (
                    <div className="mb-12">
                        <img
                            src={article.image}
                            alt={article.title}
                            className="w-full transition-all duration-700 h-auto max-h-125 object-cover border border-border"
                        />
                        <p className="text-[10px] text-gray-400 mt-3 italic font-serif">
                            The Sentinel Press Service • Photo Archives
                        </p>
                    </div>
                )}

                {/* Content Body */}
                <div className="prose prose-slate prose-lg max-w-none mb-16">
                    <div className="text-headline leading-[1.8] font-serif text-lg whitespace-pre-line">
                        {article.content}
                    </div>
                </div>

                {/* TAGS SECTION */}
                {article.tags && article.tags.length > 0 && (
                    <footer className="pt-8 border-t border-border">
                        <div className="flex items-center gap-2 text-gray-400 mb-4">
                            <TagIcon className="w-3 h-3" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Tags</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {article.tags.map(tag => (
                                <Link
                                    key={tag.id}
                                    to={`/tag/${tag.slug}`}
                                    className="px-4 py-2 bg-surface border border-border rounded-full text-[10px] font-bold uppercase tracking-tight text-gray-600 hover:bg-headline hover:text-white transition-all"
                                >
                                    {tag.name}
                                </Link>
                            ))}
                        </div>
                    </footer>
                )}
            </article>
        </div>
    );
}