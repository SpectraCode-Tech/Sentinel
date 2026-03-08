import React, { useEffect, useState } from "react";
import { fetchSidebarBlocks } from "../api";
import AdSlot from "./AdSlot";

export default function SidebarBlocks() {
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
          {/* Header style for non-ad blocks */}
          {block.block_type !== "ad" && block.title && (
            <h3 className="text-xs font-black uppercase tracking-widest text-headline mb-4">
              {block.title}
            </h3>
          )}

          {/* Logic Switcher - Only one instance of AdSlot per block */}
          {(() => {
            switch (block.block_type) {
              case "ad":
                /** * Check your API response: 
                 * If the field is 'placement', use block.placement.
                 * If the field is 'ad_placement', use block.ad_placement.
                 */
                return <AdSlot placement={block.placement || block.ad_placement || "sidebar"} />;

              case "html":
                return (
                  <div
                    className="prose prose-sm font-serif text-gray-700 leading-relaxed max-w-full overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: block.html_content }}
                  />
                );

              case "category_list":
                return (
                  <nav className="flex flex-wrap gap-2">
                    <span className="text-xs font-bold border border-border px-2 py-1 uppercase">
                      Sample Category
                    </span>
                  </nav>
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