import React, { useState, useEffect } from "react";
import { fetchArticles } from "../api";
import ArticleCard from "../Components/ArticleCard";
import Navbar from "../Components/Navbar";
import AdSlot from "../Components/AdSlot";
import SidebarBlocks from "../Components/SideBarBlocks";
import Footer from "../Components/Footer";
import { Link } from "react-router-dom";
import CompactCard from "../Components/CompactCard";

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles()
      .then((res) => setArticles(res.data.results))
      .finally(() => setLoading(false));
  }, []);

  // Group articles by category
  const categories = [
    "Politics",
    "Technology and Communication",
    "Sports",
    "Business",
    "Lifestyle",
    "International Affairs",
    "Medicine and Healthcare",
  ];
  const articlesByCategory = categories.reduce((acc, cat) => {
    acc[cat] = articles
      .filter(article => article.category?.name === cat)
      .slice(0, 6); // max 6 articles per category
    return acc;
  }, {});

  return (
    <div className="bg-bg min-h-screen text-text font-sans">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        {/* Editorial Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-b-2 border-headline pb-8 mb-12">
          <div className="lg:col-span-8">
            <span className="text-accent font-bold uppercase tracking-[0.3em] text-[10px] italic block mb-2">
              ESTABLISHED 2024 • INDEPENDENT JOURNALISM
            </span>
            <h1 className="text-headline font-serif text-5xl md:text-7xl font-black tracking-tighter leading-none">
              Latest Dispatch
            </h1>
          </div>

          <div className="lg:col-span-4 lg:border-l lg:border-border lg:pl-8 flex flex-col justify-end">
            <p className="font-serif italic text-lg text-gray-600 leading-snug">
              "Dedicated to uncovering the layers of modern society through rigorous reporting and the pursuit of objective truth."
            </p>
          </div>
        </div>

        {/* MAIN CONTENT + SIDEBAR GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Left Column: Latest Articles */}
          <div className="lg:col-span-8">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse space-y-4 pt-6 border-t border-border">
                    <div className="h-8 bg-gray-200 w-full" />
                    <div className="h-20 bg-gray-100 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-16 gap-x-10">
                {articles.slice(0, 6).map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}

            {/* Category Sections */}
            {!loading && categories.map(cat => (
              <section key={cat} className="mt-20">
                <div className="flex items-center justify-between mb-8">
                  <Link to={`/category/${cat.toLowerCase()}`} className="font-serif text-2xl font-black uppercase tracking-tighter hover:text-accent transition-colors">
                    {cat}
                  </Link>
                  <div className="h-[1px] flex-grow mx-6 bg-border" />
                </div>

                {/* //Import the new card at the top rt CompactCard from "../Components/CompactCard";

                // ... inside your Home component category section: */}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8"> {/* Gap 8 is better for smaller cards */}
                  {articlesByCategory[cat].length > 0 ? (
                    articlesByCategory[cat].map(article => (
                      // 2. Use CompactCard here
                      <CompactCard key={article.id} article={article} />
                    ))
                  ) : (
                    <p className="text-gray-500 font-serif italic col-span-full">
                      No articles in {cat} yet.
                    </p>
                  )}
                </div>
              </section>
            ))}

          </div>

          {/* Right Column: Sidebar Ads & Info */}
          <aside className="lg:col-span-4 space-y-12">
            <div className="sticky top-8">
              <div className="bg-surface border border-border p-6 text-center">
                <span className="text-[9px] uppercase tracking-widest text-gray-400 block mb-4 italic">Advertisement</span>
                <AdSlot placement="sidebar" />
                <SidebarBlocks />
              </div>
            </div>
          </aside>
        </div>

        {/* BOTTOM AD SLOT (Leaderboard) */}
        {/* BOTTOM AD SLOT (Leaderboard) */}
        <section className="mt-24 py-8 border-t border-border bg-surface/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto flex flex-col items-center">
              <span className="text-[9px] uppercase tracking-[0.3em] text-gray-400 block mb-4 italic text-center">
                Advertisement
              </span>

              {/* Container for the Ad */}
              <div className="w-full flex justify-center overflow-hidden">
                <AdSlot placement="footer" />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
