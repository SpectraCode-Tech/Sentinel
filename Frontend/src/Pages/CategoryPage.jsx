import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ArticleCard from "../Components/ArticleCard";
import Navbar from "../Components/Navbar";

export default function CategoryPage() {
    const { slug } = useParams();
    const navigate = useNavigate();

    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nextPage, setNextPage] = useState(null);
    const [prevPage, setPrevPage] = useState(null);
    const [categoryName, setCategoryName] = useState("");

    const fetchArticles = useCallback(async (url = null) => {
        try {
            setLoading(true);
            const res = url
                ? await axios.get(url)
                : await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}articles/`,
                    {
                        params: {
                            category__slug: slug,
                            status: "published",
                        },
                    }
                );

            const results = res.data.results || res.data;
            setArticles(results);
            setNextPage(res.data.next || null);
            setPrevPage(res.data.previous || null);

            // Update Name from Data
            if (results.length > 0 && results[0].category) {
                setCategoryName(results[0].category.name);
            } else {
                setCategoryName(slug.replace(/-/g, ' '));
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            console.error("ERROR:", err.response || err);
            setArticles([]);
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        if (slug) {
            // Reset name so we don't show the old title while loading new data
            setCategoryName("");
            fetchArticles();
        }
    }, [slug, fetchArticles]);

    // Better Loading State (matches the newspaper aesthetic)
    if (loading && articles.length === 0) {
        return (
            <div className="min-h-screen bg-bg flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-headline border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-sm font-serif italic text-headline tracking-widest uppercase">
                    Retrieving {slug.replace(/-/g, ' ')}...
                </p>
            </div>
        );
    }

    return (
        <div className="bg-bg min-h-screen text-text transition-colors duration-500">
            <Navbar />

            <main className="container mx-auto px-4 py-12">
                {/* Back Button */}
                <button
                    onClick={() => navigate("/")}
                    className="group mb-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-headline transition-colors"
                >
                    <span className="transition-transform group-hover:-translate-x-1">←</span>
                    Return to Front Page
                </button>

                {/* Header */}
                <header className="mb-12 border-b border-headline pb-8">
                    <h1 className="text-5xl md:text-8xl font-serif font-black capitalize tracking-tighter text-headline mb-4">
                        {categoryName || slug.replace(/-/g, ' ')}
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="h-px bg-border w-12" />
                        <p className="text-xs font-serif italic text-gray-500 uppercase tracking-widest">
                            Archive Records • {articles.length} Articles
                        </p>
                    </div>
                </header>

                {articles.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                            {articles.map((article) => (
                                <ArticleCard key={article.slug} article={article} />
                            ))}
                        </div>

                        {/* Pagination Section */}
                        {(prevPage || nextPage) && (
                            <div className="flex justify-between items-center mt-20 pt-10 border-t border-border">
                                {prevPage ? (
                                    <button
                                        onClick={() => fetchArticles(prevPage)}
                                        className="text-[10px] font-black uppercase tracking-[0.2em] border-2 border-headline px-10 py-4 hover:bg-headline hover:text-white transition-all"
                                    >
                                        ← Previous Records
                                    </button>
                                ) : <div />}

                                {nextPage && (
                                    <button
                                        onClick={() => fetchArticles(nextPage)}
                                        className="text-[10px] font-black uppercase tracking-[0.2em] border-2 border-headline px-10 py-4 hover:bg-headline hover:text-white transition-all"
                                    >
                                        Next Articles →
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-32 border border-dashed border-border rounded-lg">
                        <p className="text-2xl font-serif italic text-gray-300">
                            The {categoryName} archives are currently empty.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}