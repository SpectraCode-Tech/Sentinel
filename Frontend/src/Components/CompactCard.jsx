import React from "react";
import { Link } from "react-router-dom";

export default function CompactCard({ article }) {
  const formattedDate = article.publish_at 
    ? new Date(article.publish_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
    : "";

  return (
    <div className="group flex flex-col h-full bg-bg border-t border-border pt-4 pb-6 transition-all duration-300">
      {/* Small Category Tag */}
      <span className="text-[9px] uppercase tracking-widest font-bold text-accent italic mb-2">
        {article.category?.name}
      </span>

      {/* Scaled Down Image */}
      <Link to={`/articles/${article.id}`} className="block mb-3 overflow-hidden">
        <div className="relative aspect-video overflow-hidden bg-surface">
          <img
            src={article.image || "https://via.placeholder.com/400x225"}
            alt={article.title}
            className="w-full h-full object-cover grayscale-[20%] transition-transform duration-500 group-hover:scale-105 group-hover:grayscale-0"
          />
        </div>
      </Link>

      {/* Smaller Headline - fixed size to prevent bleeding */}
      <Link to={`/articles/${article.id}`} className="block mb-2">
        <h3 className="text-headline font-serif text-lg font-bold leading-tight group-hover:text-accent transition-colors line-clamp-2">
          {article.title}
        </h3>
      </Link>

      {/* Shortened Excerpt */}
      <p className="text-text font-sans text-xs leading-relaxed mb-4 line-clamp-2 opacity-80">
        {article.excerpt}
      </p>

      {/* Minimal Footer */}
      <div className="mt-auto pt-3 border-t border-border/50 flex justify-between items-center">
        <span className="text-[9px] uppercase font-bold text-headline">
          {article.author?.username}
        </span>
        <span className="text-[9px] font-mono text-gray-400 uppercase">
          {formattedDate}
        </span>
      </div>
    </div>
  );
}