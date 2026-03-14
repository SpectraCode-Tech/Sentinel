import React, { useEffect, useState } from "react";
import { fetchSidebarBlocks } from "../api";
import AdSlot from "./AdSlot";
import TrendingArticles from "./TrendingArticles"; // Import your new component
import RecommendedArticles from "./RecommendedArticles"; // Import your new component

export default function SidebarBlocks({ currentArticleId }) {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSidebarBlocks()
      .then(res => {
        const rawData = res.data.results || res.data;
        const activeBlocks = rawData
          .filter(block => block.is_active)
          .sort((a, b) => a.order - b.order);
        setBlocks(activeBlocks);
      })
      .catch(err => console.error("Sidebar fetch failed:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4 animate-pulse bg-gray-50 h-64" />;

  return (
    <aside className="flex flex-col gap-y-12">
      {blocks.map(block => (
        <section key={block.id} className="border-t border-headline pt-6">
          {/* Hide header if it's an Ad or a Feature that has its own header */}
          {block.block_type !== "ad" &&
            block.block_type !== "trending" &&
            block.block_type !== "recommended" &&
            block.title && (
              <h3 className="text-xs font-black uppercase tracking-widest text-headline mb-4">
                {block.title}
              </h3>
            )}

          {(() => {
            switch (block.block_type) {
              case "ad":
                return <AdSlot placement={block.placement || block.ad_placement || "sidebar"} />;

              case "trending":
                return <TrendingArticles />;

              case "recommended":
                return <RecommendedArticles currentArticleId={currentArticleId} />;

              case "html":
                return (
                  <div
                    className="prose prose-sm font-serif text-gray-700 leading-relaxed max-w-full overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: block.html_content }}
                  />
                );

              default:
                return null;
            }
          })()}
        </section>
      ))}
    </aside>
  );
}