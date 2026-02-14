import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchArticleDetail } from "../api";

export default function ArticleDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticleDetail(id)
      .then(res => setArticle(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading article...</p>;
  if (!article) return <p>Article not found.</p>;

  return (
<div className="container mx-auto px-4 py-6 bg-newspaper-bg text-newspaper-text font-sans">
  <button 
    onClick={() => window.history.back()} 
    className="mb-4 text-newspaper-accent hover:underline"
  >
    ← Back
  </button>

  <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 border-b border-gray-300 pb-2 text-newspaper-headline">
    {article.title}
  </h1>

  <div className="flex flex-col md:flex-row justify-between text-sm text-gray-600 mb-6">
    <span className="italic">By {article.author.username}</span>
    <span>{article.view_count} views</span>
    <span>Published: {new Date(article.publish_at).toLocaleDateString()}</span>
  </div>

  <div className="mb-6">
    {article.tags.map(tag => (
      <span
        key={tag.id}
        className="inline-block rounded-full px-3 py-1 mr-2 text-xs font-semibold text-newspaper-tag"
      >
        {tag.name}
      </span>
    ))}
  </div>

  <div className="prose prose-lg max-w-full text-newspaper-text">
    <p className="first-letter:text-5xl first-letter:font-serif first-letter:float-left first-letter:mr-3 first-letter:text-newspaper-headline">
      <span dangerouslySetInnerHTML={{ __html: article.content }} />
    </p>
  </div>
</div>

  );
}
