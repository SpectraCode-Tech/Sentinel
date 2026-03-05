import React, { useState, useEffect } from "react";
import { fetchArticles, fetchCategories } from "../api"; // 1. Import category fetcher
import ArticleCard from "../Components/ArticleCard";
import Navbar from "../Components/Navbar";
import AdSlot from "../Components/AdSlot";
import SidebarBlocks from "../Components/SideBarBlocks";
import { Link } from "react-router-dom";
import CompactCard from "../Components/CompactCard";

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]); // 2. New state for categories
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 3. Fetch both categories and articles simultaneously
    Promise.all([fetchArticles(), fetchCategories()])
      .then(([articlesRes, categoriesRes]) => {
        setArticles(articlesRes.data.results || articlesRes.data || []);
        setCategories(categoriesRes.data.results || categoriesRes.data || []);
      })
      .catch((err) => console.error("Error loading data:", err))
      .finally(() => setLoading(false));
  }, []);

  // 4. Group articles (Using name for grouping, checking both ID and name for safety)
  const articlesByCategory = categories.reduce((acc, cat) => {
    acc[cat.name] = (articles || []).filter((article) => {
      // Check if category is an object: article.category.id
      // Or check if category is just an ID/Name: article.category
      const articleCatId = article.category?.id || article.category;
      return articleCatId === cat.id || articleCatId === cat.name;
    }).slice(0, 6);
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
              "Dedicated to uncovering the layers of modern society through rigorous reporting."
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
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
              <>
                {/* Latest Articles Feed */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-16 gap-x-10">
                  {articles.slice(0, 6).map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>

                {/* 5. Dynamic Category Sections */}
                {categories.map((cat) => {
                  const categoryArticles = articlesByCategory[cat.name] || [];
                  // Only show the section if it has articles
                  if (categoryArticles.length === 0) return null;

                  return (
                    <section key={cat.id} className="mt-20">
                      <div className="flex items-center justify-between mb-8">
                        <Link
                          to={`/category/${cat.slug || cat.name.toLowerCase()}`}
                          className="font-serif text-2xl font-black uppercase tracking-tighter hover:text-accent transition-colors"
                        >
                          {cat.name}
                        </Link>
                        <div className="h-[1px] flex-grow mx-6 bg-border" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {categoryArticles.map((article) => (
                          <CompactCard key={article.id} article={article} />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </>
            )}
          </div>

          <aside className="lg:col-span-4 space-y-12">
            <div className="sticky top-8">
              <div className="bg-surface border border-border p-6 text-center">
                <span className="text-[9px] uppercase tracking-widest text-gray-400 block mb-4 italic">
                  Advertisement
                </span>
                <AdSlot placement="sidebar" />
                <SidebarBlocks />
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
