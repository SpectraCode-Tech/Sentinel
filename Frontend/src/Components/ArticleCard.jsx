import React from "react";
import { Link } from "react-router-dom";

export default function ArticleCard({ article }) {
  return (
    <div className="bg-paper border border-gray-300 rounded-lg p-4 shadow hover:shadow-lg transition duration-300">
      <Link to={`/articles/${article.id}`}>
        <h2 className="text-headline font-serif text-2xl mb-2 hover:text-accent transition">
          {article.title}
        </h2>
      </Link>
      <p className="text-main mb-2">{article.excerpt}</p>
      <div className="flex justify-between text-sm text-gray-500 mb-2">
        <span>By {article.author.username}</span>
        <span>{article.view_count} views</span>
      </div>
      <div className="mt-2">
        {article.tags.map(tag => (
          <span
            key={tag.id}
            className="inline-block bg-tag rounded-full px-2 py-1 mr-2 text-xs font-mono text-main"
          >
            {tag.name}
          </span>
        ))}
      </div>
    </div>
  );
}
