import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import ArticleCard from "../Components/ArticleCard";
import Navbar from "../Components/Navbar"; // Ensure Navbar is imported

export default function SearchResults() {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get("q") || "";

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
        } catch (err) {
            console.error(err);
            setArticles([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (searchQuery.trim()) {
            fetchArticles(`http://127.0.0.1:8000/articles/?search=${encodeURIComponent(searchQuery)}`);
        } else {
            setArticles([]);
            setLoading(false);
        }
    }, [searchQuery]);

    // Reusable Back Button Component
    const BackButton = () => (
        <button
            onClick={() => navigate("/")}
            className="group mb-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-accent transition-colors"
        >
            <span className="transition-transform group-hover:-translate-x-1">←</span> Return to Front Page
        </button>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-bg flex items-center justify-center">
                <p className="text-xl font-serif italic animate-pulse text-headline">Consulting the archives...</p>
            </div>
        );
    }

    return (
        <div className="bg-bg min-h-screen">
            <Navbar />

            <main className="container mx-auto px-4 py-12">
                <BackButton />

                {articles.length > 0 ? (
                    <>
                        <header className="mb-12 border-b border-border pb-8">
                            <h1 className="text-4xl md:text-5xl font-serif font-black text-headline tracking-tighter">
                                Search results for: <span className="italic text-accent">"{searchQuery}"</span>
                            </h1>
                            <p className="text-sm text-gray-500 mt-2 font-serif uppercase tracking-widest">
                                Found {articles.length} matching dispatches
                            </p>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                            {articles.map((article) => (
                                <ArticleCard key={article.id} article={article} />
                            ))}
                        </div>

                        {/* Pagination - Styled to match your theme */}
                        <div className="flex justify-between items-center mt-16 pt-8 border-t border-border">
                            {prevPage ? (
                                <button
                                    onClick={() => fetchArticles(prevPage)}
                                    className="text-[10px] font-bold uppercase tracking-widest border border-border px-6 py-2 hover:bg-headline hover:text-white transition-all"
                                >
                                    Previous Page
                                </button>
                            ) : <div />}

                            {nextPage && (
                                <button
                                    onClick={() => fetchArticles(nextPage)}
                                    className="text-[10px] font-bold uppercase tracking-widest border border-border px-6 py-2 hover:bg-headline hover:text-white transition-all"
                                >
                                    Next Page
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="py-20 text-center">
                        <p className="text-2xl font-serif text-headline mb-4">No results found for "{searchQuery}"</p>
                        <p className="text-gray-500 mb-8 italic">Please try a different keyword or check your spelling.</p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-headline text-white px-8 py-3 text-xs font-bold uppercase tracking-[0.2em]"
                        >
                            View Latest News
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}