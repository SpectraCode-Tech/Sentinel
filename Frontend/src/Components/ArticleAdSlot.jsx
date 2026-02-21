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
    <div className="my-16 flex flex-col items-center">
      {/* Editorial Ad Label */}
      <div className="w-full flex items-center gap-4 mb-4">
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">
          Sponsored Content
        </span>
        <div className="h-[1px] w-full bg-border/50" />
      </div>

      <a 
        href={ad.link} 
        target="_blank" 
        rel="noreferrer" 
        className="group relative block w-full overflow-hidden border border-border bg-surface p-2 transition-all duration-500 hover:border-gray-400"
      >
        <div className="relative overflow-hidden">
          <img
            src={ad.image}
            alt={ad.title}
            className="w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
          {/* Subtle Overlay on Hover */}
          <div className="absolute inset-0 bg-headline/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {ad.title && (
          <div className="mt-4 px-2 pb-2">
            <h5 className="font-serif text-xl font-bold text-headline leading-tight group-hover:text-accent transition-colors">
              {ad.title}
            </h5>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-gray-500">
                Learn More
              </span>
              <span className="text-xl transition-transform duration-300 group-hover:translate-x-1 text-accent">
                →
              </span>
            </div>
          </div>
        )}
      </a>
      
      {/* Bottom Border to close the section */}
      <div className="w-full h-[1px] bg-border/50 mt-8" />
    </div>
  );
}