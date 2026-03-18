import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchArticleDetail,
  trackArticleView,
  trackReadingHistory
} from "../api";

// Components
import Navbar from "../Components/Navbar";
import AdSlot from "../Components/AdSlot";
import SidebarBlocks from "../Components/SideBarBlocks";
import ArticleAdSlot from "../Components/ArticleAdSlot";
import CommentSection from "../Components/CommentSection";
import RecommendedArticles from "../Components/RecommendedArticles";

export default function ArticleDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  // User session
  const [user] = useState(() => JSON.parse(localStorage.getItem("user_data")) || null);

  // 1. Fetch Article Data
  useEffect(() => {
    setLoading(true);
    fetchArticleDetail(slug)
      .then(res => {
        setArticle(res.data);
        window.scrollTo(0, 0); // Ensure page starts at top on navigation
      })
      .catch(err => console.error("Fetch error:", err))
      .finally(() => setLoading(false));
  }, [slug]);

  // 2. Track Page View - FIXED: Use article.id instead of slug
  useEffect(() => {
    if (article?.id && !loading) {
      trackArticleView({
        article: article.id, // ✅ Correct: Sending the Integer ID
        user: user?.id || null,
        device: navigator.userAgent,
      }).catch(err => console.error("View tracking failed", err));
    }
  }, [article?.id, loading, user?.id]);

  // 3. Track Reading History (Time Spent) - FIXED: Use article.id
  useEffect(() => {
    if (!article?.id || !user || loading) return;

    const startTime = Date.now();

    return () => {
      const endTime = Date.now();
      const secondsSpent = Math.floor((endTime - startTime) / 1000);

      // Only track significant engagement (> 5s)
      if (secondsSpent > 5) {
        trackReadingHistory({
          article: article.id, // ✅ Correct: Sending the Integer ID
          user: user.id,
          time_spent: secondsSpent
        }).catch(err => console.error("Reading history sync failed", err));
      }
    };
  }, [article?.id, user, loading]);

  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="font-serif italic text-headline text-sm uppercase tracking-widest">Retrieving Article</p>
      </div>
    </div>
  );

  if (!article) return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center">
      <p className="font-serif text-2xl mb-4 text-headline">Article Not Found</p>
      <button onClick={() => navigate('/')} className="text-accent underline font-bold uppercase tracking-widest text-xs">
        Return Home
      </button>
    </div>
  );

  return (
    <div className="bg-bg min-h-screen text-text font-sans selection:bg-accent/20">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Left/Main Column: Article Content */}
          <article className="lg:col-span-8 lg:pr-8">
            <button
              onClick={() => navigate(-1)}
              className="group mb-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-accent transition-colors"
            >
              <span className="transition-transform group-hover:-translate-x-1">←</span> Back
            </button>

            <header className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-accent font-bold uppercase tracking-widest text-xs italic bg-accent/5 px-2 py-1 rounded">
                  {article.category_name || "Uncategorized"}
                </span>
                <span className="h-px grow bg-border" />
              </div>

              <h1 className="text-4xl md:text-6xl font-serif font-black text-headline leading-[1.1] mb-6">
                {article.title}
              </h1>

              <div className="flex flex-col md:flex-row md:items-center justify-between py-6 border-y border-border gap-4 mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-headline rounded-full flex items-center justify-center text-white font-serif italic text-xl uppercase">
                    {article.author_name?.charAt(0) || "S"}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-tight text-headline">
                      By {article.author_name || "Staff Reporter"}
                    </p>
                    <p className="text-[10px] text-gray-500 font-serif italic">Sentinel Staff</p>
                  </div>
                </div>

                <div className="md:text-right">
                  <p className="text-[11px] font-mono text-gray-400 uppercase tracking-tighter">
                    {new Date(article.publish_at).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric'
                    })}
                  </p>
                  <p className="text-[11px] font-mono text-accent uppercase tracking-tighter font-bold">
                    {(article.view_count || 0).toLocaleString()} Views
                  </p>
                </div>
              </div>
            </header>

            {article.image && (
              <figure className="mb-10">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full rounded shadow-xl object-cover max-h-125"
                />
              </figure>
            )}

            <div
              className="prose prose-lg max-w-none font-serif leading-relaxed text-text
                prose-headings:text-headline prose-headings:font-black
                prose-p:mb-6 prose-p:leading-[1.8]
                prose-blockquote:border-l-4 prose-blockquote:border-accent prose-blockquote:italic prose-blockquote:text-2xl"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            <div className="my-12">
              <ArticleAdSlot articleId={article.id} />
            </div>

            <div className="mt-12 pt-8 border-t border-border flex flex-wrap gap-2">
              {article.tags?.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-surface border border-border text-[10px] rounded-full uppercase font-bold text-gray-600">
                  {typeof tag === 'object' ? tag.name : tag}
                </span>
              ))}
            </div>

            <div className="mt-16">
              <CommentSection articleId={article.id} currentUser={user} />
            </div>

            {/* Pass article.id to RecommendedArticles to exclude current post */}
            <RecommendedArticles currentArticleId={article.id} />
          </article>

          {/* Right Column: Sidebar */}
          <aside className="lg:col-span-4 space-y-12">
            <div className="sticky top-8 space-y-8">
              <div className="bg-surface border border-border p-6 text-center">
                <span className="text-[9px] uppercase tracking-widest text-gray-400 block mb-4 italic">Advertisement</span>
                <AdSlot placement="sidebar" />
              </div>
              {/* Pass currentArticleId to SidebarBlocks if you have recommendations there */}
              <SidebarBlocks currentArticleId={article.id} />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}