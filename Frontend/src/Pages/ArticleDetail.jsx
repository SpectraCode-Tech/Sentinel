import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchArticleDetail } from "../api";
import Navbar from "../Components/Navbar";
import AdSlot from "../Components/AdSlot";
import SidebarBlocks from "../Components/SideBarBlocks";
import ArticleAdSlot from "../Components/ArticleAdSlot";
import Footer from "../Components/Footer";

export default function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticleDetail(id)
      .then(res => setArticle(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <p className="font-serif italic animate-pulse text-headline">Retrieving Dispatch...</p>
    </div>
  );

  if (!article) return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center">
      <p className="font-serif text-2xl mb-4">Article Not Found</p>
      <button onClick={() => navigate('/')} className="text-accent underline">Return Home</button>
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
              <span className="transition-transform group-hover:-translate-x-1">←</span> Back to Front Page
            </button>

            <header className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                {article.tags.slice(0, 1).map(tag => (
                  <span key={tag.id} className="text-accent font-bold uppercase tracking-widest text-xs italic">
                    {tag.name}
                  </span>
                ))}
                <span className="h-[1px] flex-grow bg-border" />
              </div>

              <h1 className="text-4xl md:text-6xl font-serif font-black text-headline leading-[1.1] mb-6">
                {article.title}
              </h1>

              {/* Author & Timestamp */}
              <div className="flex flex-col md:flex-row md:items-center justify-between py-6 border-y border-border gap-4 mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-headline rounded-full flex items-center justify-center text-white font-serif italic text-xl">
                    {article.author?.username?.charAt(0) || "S"}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-tight text-headline">
                      By {article.author?.username || "Staff Reporter"}
                    </p>
                    <p className="text-[10px] text-gray-500 font-serif italic">Sentinel Staff Reporter</p>
                  </div>
                </div>

                <div className="md:text-right">
                  <p className="text-[11px] font-mono text-gray-400 uppercase tracking-tighter">
                    Published {new Date(article.publish_at).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric'
                    })}
                  </p>
                  <p className="text-[11px] font-mono text-accent uppercase tracking-tighter">
                    {(article.view_count || 0).toLocaleString()} Views
                  </p>
                </div>
              </div>
            </header>

            {/* Article Image(s) Displayed Above Text */}
            {article.image && (
              <img
                src={article.image}
                alt={article.title}
                className="w-full rounded shadow-xl mb-8 object-cover"
              />
            )}


            {/* Article Body */}
            <div
              className="prose prose-lg max-w-none font-serif leading-relaxed text-text
                prose-headings:text-headline prose-headings:font-black
                prose-p:mb-6 prose-p:leading-[1.8]
                prose-img:rounded-sm prose-img:shadow-xl prose-img:my-12
                prose-blockquote:border-l-4 prose-blockquote:border-accent prose-blockquote:italic prose-blockquote:text-2xl"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            <ArticleAdSlot articleId={article.id} />

            {/* Tags Bottom */}
            <div className="mt-12 pt-8 border-t border-border flex flex-wrap gap-2">
              {article.tags.map(tag => (
                <span key={tag.id} className="px-3 py-1 border border-border text-[10px] rounded-full uppercase font-bold text-gray-500">
                  {tag.name}
                </span>
              ))}
            </div>
          </article>

          {/* Right Column: Sidebar */}
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
      </main>

      {/* Footer */}
    </div>
  );
}
