import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchTrendingArticles } from "../api";

export default function TrendingSidebar() {
    const [trending, setTrending] = useState([]);

    useEffect(() => {
        fetchTrendingArticles()
            .then(res => setTrending(res.data))
            .catch(err => console.error("Trending fetch error:", err));
    }, []);

    if (trending.length === 0) return null;

    return (
        <div className="bg-surface border border-border p-6 rounded">
            <h3 className="font-serif text-xl font-black mb-6 italic border-b border-border pb-2">
                Trending Now
            </h3>
            <div className="space-y-6">
                {trending.map((article, index) => (
                    <Link key={article.slug} to={`/articles/${article.slug}`} className="group flex text-left gap-4">
                        <span className="text-3xl font-serif font-black text-accent/20 group-hover:text-accent transition-colors">
                            0{index + 1}
                        </span>
                        <div>
                            <span className="text-[9px] uppercase font-bold text-accent tracking-widest mb-1 block">
                                {article.category_name}
                            </span>
                            <h4 className="font-serif font-bold text-sm leading-tight text-headline group-hover:underline">
                                {article.title}
                            </h4>
                            <p className="text-[10px] text-gray-400 mt-1 font-mono">
                                {parseInt(article.view_count).toLocaleString()} VIEWS
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}