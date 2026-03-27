import React, { useEffect, useState } from "react";
import { fetchAdvertisements } from "../api";

export default function ArticleAdSlot({ articleId }) {
  const [ad, setAd] = useState(null);

  useEffect(() => {
    fetchAdvertisements().then(res => {
      const now = new Date();
      const validAds = res.data.filter(a =>
        a.is_active &&
        a.placement === "article" &&
        (a.target_page === "all" || (articleId && a.target_page === articleId.toString())) &&
        new Date(a.start_date) <= now &&
        new Date(a.end_date) >= now
      );

      if (validAds.length > 0) {
        setAd(validAds[Math.floor(Math.random() * validAds.length)]);
      }
    });
  }, [articleId]);

  if (!ad) return null;

  return (
    <div className="my-16 w-full">
      {/* Editorial Label */}
      <div className="flex items-center gap-4 mb-3">
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400">
          Sponsored
        </span>
        <div className="h-px flex-1 bg-border/40" />
      </div>

      <a
        href={ad.link}
        target="_blank"
        rel="noreferrer"
        className="group relative flex flex-col md:flex-row items-center overflow-hidden border border-border bg-surface hover:border-accent/40 transition-all duration-500"
      >
        {/* Left/Top: Image Section (Banner Style) */}
        <div className="w-full md:w-1/3 lg:w-1/4 h-48 md:h-32 overflow-hidden shrink-0">
          <img
            src={ad.image}
            alt={ad.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        {/* Right/Bottom: Content Section */}
        <div className="flex-1 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-xl">
            <h5 className="font-serif text-xl md:text-2xl font-bold text-headline leading-tight group-hover:text-accent transition-colors">
              {ad.title}
            </h5>
            <p className="mt-1 text-sm text-gray-500 line-clamp-1">
              {ad.description || "Discover more from our partners"}
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex items-center gap-2 px-4 py-2 bg-headline text-white text-[10px] font-bold uppercase tracking-widest transition-all duration-300 group-hover:bg-accent shrink-0">
            Learn More
            <span className="text-lg leading-none transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </div>
        </div>
      </a>
    </div>
  );
}