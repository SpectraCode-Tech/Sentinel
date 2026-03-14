import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchRecommendations } from "../api";

export default function RecommendedArticles({ currentArticleId }) {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Get token in the component scope so the dependency array can see it
    const userData = JSON.parse(localStorage.getItem("user_data"));
    const token = userData?.access || null;

    useEffect(() => {
        setLoading(true);

        fetchRecommendations(token, currentArticleId)
            .then((res) => {
                setSuggestions(res.data);
            })
            .catch((err) => {
                console.error("Could not load recommendations:", err);
            })
            .finally(() => {
                setLoading(false);
            });

    }, [currentArticleId, token]); // Now 'token' is defined in the outer scope

    if (loading || suggestions.length === 0) return null;

    return (
        <div className="mt-16 pt-10 border-t border-border">
            <h3 className="font-serif text-2xl font-black mb-8 italic text-headline">
                Recommended For You
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {suggestions.map((item) => (
                    <Link key={item.id} to={`/articles/${item.id}`} className="group">
                        <div className="aspect-video overflow-hidden rounded mb-3 bg-surface border border-border shadow-sm">
                            {item.image ? (
                                <img
                                    src={item.image}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    alt={item.title}
                                    loading="lazy"
                                />
                            ) : (
                                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300 font-serif italic text-xs">
                                    Sentinel
                                </div>
                            )}
                        </div>
                        <h4 className="font-serif font-bold text-sm leading-tight group-hover:text-accent transition-colors line-clamp-2 text-headline">
                            {item.title}
                        </h4>
                    </Link>
                ))}
            </div>
        </div>
    );
}