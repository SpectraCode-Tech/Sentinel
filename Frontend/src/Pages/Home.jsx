import React, { useState, useEffect } from "react";
import { fetchArticles } from "../api";
import ArticleCard from "../Components/ArticleCard";

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles()
      .then(res => setArticles(res.data.results)) // paginated results
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-main font-serif">Loading articles...</p>;

  return (
    <div className="bg-paper min-h-screen text-main font-sans">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-headline font-serif text-4xl mb-6 border-b border-gray-300 pb-2">
          Latest Articles
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </div>
  );
}
