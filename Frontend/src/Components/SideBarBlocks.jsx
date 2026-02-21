import React, { useEffect, useState } from "react";
import { fetchSidebarBlocks } from "../api";

export default function SidebarBlocks() {
  const [blocks, setBlocks] = useState([]);

  useEffect(() => {
    fetchSidebarBlocks().then(res => {
      const activeBlocks = res.data
        .filter(block => block.is_active)
        .sort((a, b) => a.order - b.order);
      setBlocks(activeBlocks);
    });
  }, []);

  return (
    <div className="space-y-10">
      {blocks.map(block => (
        <div key={block.id} className="border-t-4 border-headline pt-6">
          <h3 className="font-serif font-bold text-lg mb-2">{block.title}</h3>

          {block.block_type === "ad" && block.ad ? (
            <a href={block.ad.link} target="_blank" rel="noreferrer">
              <img
                src={block.ad.image.url}
                alt={block.ad.title}
                className="w-full border border-border object-cover"
              />
              {block.ad.title && (
                <p className="text-sm mt-2 font-serif text-gray-700 text-center">
                  {block.ad.title}
                </p>
              )}
            </a>
          ) : block.block_type === "trending" ? (
            <p className="text-sm text-gray-600 font-serif">
              {/* Replace with actual trending news */}
              Trending News Block
            </p>
          ) : block.block_type === "html" ? (
            <div
              className="text-sm text-gray-600 font-serif"
              dangerouslySetInnerHTML={{ __html: block.html_content }}
            />
          ) : block.block_type === "category_list" ? (
            <ul className="list-disc list-inside text-sm font-serif">
              {/* Replace with actual categories */}
              <li>Category 1</li>
              <li>Category 2</li>
              <li>Category 3</li>
            </ul>
          ) : null}
        </div>
      ))}
    </div>
  );
}
