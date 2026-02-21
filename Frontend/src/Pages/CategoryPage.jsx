import React, { useEffect, useState } from "react";
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

    const fetchArticles = async (url) => {
        try {
            setLoading(true);
            const res = await axios.get(url);
            setArticles(res.data.results || []);
            setNextPage(res.data.next);
            setPrevPage(res.data.previous);
            window.scrollTo(0, 0); // Scroll to top on page change
        } catch (err) {
            console.error(err);
            setArticles([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (slug) {
            fetchArticles(`http://127.0.0.1:8000/articles/?category=${slug}`);
        }
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-bg flex items-center justify-center">
                <p className="text-xl font-serif italic animate-pulse text-headline">
                    Opening the {slug} archives...
                </p>
            </div>
        );
    }

    return (
        <div className="bg-bg min-h-screen text-text">
            <Navbar />

            <main className="container mx-auto px-4 py-12">
                {/* Back Button */}
                <button
                    onClick={() => navigate("/")}
                    className="group mb-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-accent transition-colors"
                >
                    <span className="transition-transform group-hover:-translate-x-1">←</span> Front Page
                </button>

                <header className="mb-12 border-b-2 border-headline pb-6">
                    <h1 className="text-5xl md:text-7xl font-serif font-black capitalize tracking-tighter text-headline">
                        {slug}
                    </h1>
                    <p className="text-sm font-serif italic text-gray-500 mt-2">
                        Latest dispatches and investigative reports
                    </p>
                </header>

                {articles.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                            {articles.map((article) => (
                                <ArticleCard key={article.id} article={article} />
                            ))}
                        </div>

                        {/* Professional Pagination */}
                        <div className="flex justify-between items-center mt-16 pt-8 border-t border-border">
                            {prevPage ? (
                                <button
                                    onClick={() => fetchArticles(prevPage)}
                                    className="text-[10px] font-bold uppercase tracking-widest border border-border px-8 py-3 hover:bg-headline hover:text-white transition-all"
                                >
                                    Previous
                                </button>
                            ) : <div />}

                            {nextPage && (
                                <button
                                    onClick={() => fetchArticles(nextPage)}
                                    className="text-[10px] font-bold uppercase tracking-widest border border-border px-8 py-3 hover:bg-headline hover:text-white transition-all"
                                >
                                    Next Page
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-xl font-serif italic text-gray-400">
                            No recent dispatches found in this section.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}