import React from "react";
import { Link } from "react-router-dom";

export default function ArticleCard({ article }) {
  // Format the date to look clean (e.g., "OCT 24, 2024")
  const publishDate = article.publish_at 
    ? new Date(article.publish_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).toUpperCase()
    : "RECENTLY";

  return (
    <div className="group flex flex-col h-full bg-bg border-t border-border pt-6 pb-8 transition-all duration-300">
      {/* Category/Tag Meta */}
      <div className="flex gap-2 mb-3">
        {article.tags.slice(0, 1).map((tag) => (
          <span
            key={tag.id}
            className="text-[10px] uppercase tracking-[0.2em] font-bold text-accent italic"
          >
            {tag.name}
          </span>
        ))}
      </div>

      {/* Article Image Wrapper */}
      <Link to={`/articles/${article.id}`} className="block mb-4 overflow-hidden">
        <div className="relative aspect-[16/9] overflow-hidden bg-surface">
          <img
            src={article.image || "https://via.placeholder.com/800x450?text=The+Sentinel"} 
            alt={article.title}
            className="w-full h-full object-cover grayscale-[20%] transition-transform duration-700 group-hover:scale-105 group-hover:grayscale-0"
          />
          <div className="absolute inset-0 ring-1 ring-inset ring-black/10" />
        </div>
      </Link>

      <Link to={`/articles/${article.id}`} className="block">
        <h2 className="text-headline font-serif text-2xl md:text-3xl font-black leading-tight mb-3 group-hover:text-accent transition-colors decoration-accent/20 underline-offset-4 group-hover:underline">
          {article.title}
        </h2>
      </Link>

      <p className="text-text font-sans text-sm leading-relaxed mb-6 line-clamp-2 opacity-90">
        {article.excerpt}
      </p>

      {/* Footer: Author and Stats */}
      <div className="mt-auto pt-4 border-t border-border/50">
        <div className="flex items-end justify-between">
          {/* Left Side: Author */}
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-widest font-bold text-headline">
              {article.author?.username || "Staff"}
            </span>
            <span className="text-[10px] text-gray-400 font-serif italic">
              Staff Reporter
            </span>
          </div>
          
          {/* Right Side: Date & Reads */}
          <div className="flex flex-col items-end gap-1">
            <span className="text-[9px] font-bold text-headline tracking-tighter uppercase opacity-60">
              {publishDate}
            </span>
            <div className="text-[10px] font-mono text-gray-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-border rounded-full inline-block" />
              {(article.view_count || 0).toLocaleString()} READS
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}