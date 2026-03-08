import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { fetchCategories } from "../api";
import { User, Search as SearchIcon, X, Menu } from "lucide-react";
import { useAuth } from "../Context/AuthContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchCategories()
      .then(res => {
        const data = res.data.results || res.data;
        setCategories(data);
      })
      .catch(err => console.error("Could not fetch categories:", err));
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
      setSearchOpen(false);
      setIsOpen(false);
    }
  };

  return (
    <header className="bg-bg border-b border-border py-6 md:py-8 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex flex-col items-center">

        {/* Top Row: Menu & Search */}
        <div className="w-full flex justify-between items-center md:justify-center mb-4 md:mb-6">

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsOpen(true)}
            className="md:hidden p-2 text-headline"
            aria-label="Open Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Desktop Links */}
          <nav className="hidden md:flex gap-8 items-center text-xs font-bold uppercase tracking-widest text-gray-400">
            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="hover:text-accent transition-colors"
              >
                {cat.name}
              </Link>
            ))}

            <div className="flex items-center gap-6 border-l border-border pl-6 ml-2">
              {user ? (
                <Link to="/profile" className="flex items-center gap-2 text-headline hover:text-accent transition-colors">
                  <User className="w-4 h-4" />
                  <span className="font-bold text-xs uppercase">{user.username}</span>
                </Link>
              ) : (
                <Link to="/login" className="text-xs font-bold uppercase text-headline hover:text-accent">Sign In</Link>
              )}
            </div>

            <form onSubmit={handleSearchSubmit} className="ml-4 group flex items-center border-b border-border focus-within:border-accent transition-colors pb-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SEARCH ARTICLES..."
                className="bg-transparent text-[10px] tracking-widest focus:outline-none w-28 lg:w-40 placeholder:text-gray-300"
              />
              <button type="submit" className="ml-2 text-gray-400 group-hover:text-accent">
                <SearchIcon className="w-3.5 h-3.5" />
              </button>
            </form>
          </nav>

          {/* Mobile Search Toggle */}
          <div className="md:hidden">
            <button onClick={() => setSearchOpen(!searchOpen)} className="text-headline p-2">
              <SearchIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Search Input Overlay */}
        {searchOpen && (
          <form onSubmit={handleSearchSubmit} className="md:hidden w-full mb-6 px-2">
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to search..."
              className="w-full bg-surface border-b-2 border-accent py-3 px-4 text-lg font-serif italic outline-none"
            />
          </form>
        )}

        {/* --- IMPROVED MOBILE SIDEBAR --- */}
        <div className={`fixed inset-0 bg-headline text-white z-[60] transition-transform duration-500 md:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

          {/* Drawer Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <span className="text-accent text-[10px] font-black tracking-[0.4em] uppercase">The Sentinel</span>
            <button onClick={() => setIsOpen(false)} className="p-2 text-white/70 hover:text-white">
              <X className="w-8 h-8" />
            </button>
          </div>

          {/* Scrollable Nav Area */}
          <div className="flex flex-col h-[calc(100vh-80px)] overflow-y-auto">
            <nav className="flex flex-col items-start px-10 py-12 gap-8">
              <span className="text-white/30 text-[10px] font-bold tracking-[0.3em] uppercase mb-2">Sections</span>

              {categories.map(cat => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="text-3xl sm:text-4xl font-serif font-black uppercase italic hover:text-accent transition-colors leading-tight break-words w-full"
                >
                  {cat.name}
                </Link>
              ))}

              {/* Bottom Actions Section */}
              <div className="mt-12 pt-8 border-t border-white/10 w-full mb-20">
                <Link
                  to={user ? "/profile" : "/login"}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 text-accent text-sm font-bold uppercase tracking-widest"
                >
                  <User className="w-5 h-5" />
                  {user ? `Account: ${user.username}` : "Sign In to Sentinel"}
                </Link>

                <form onSubmit={handleSearchSubmit} className="mt-8 flex items-center border-b border-white/20 pb-2">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search news..."
                    className="bg-transparent text-lg font-serif italic w-full focus:outline-none"
                  />
                  <SearchIcon className="w-5 h-5 text-white/50" />
                </form>
              </div>
            </nav>
          </div>
        </div>
        {/* --- END MOBILE SIDEBAR --- */}

        {/* Logo */}
        <Link to="/" className="font-serif text-3xl sm:text-5xl md:text-7xl tracking-tighter text-headline font-black hover:text-accent transition-colors text-center leading-none">
          THE SENTINEL
        </Link>

        {/* Decorative Slogan */}
        <div className="mt-4 flex items-center gap-4 w-full max-w-lg">
          <div className="h-[1px] bg-border flex-grow" />
          <p className="text-[9px] md:text-xs font-serif uppercase tracking-[0.2em] md:tracking-[0.3em] whitespace-nowrap text-gray-600">
            Truth • Reports • Analysis
          </p>
          <div className="h-[1px] bg-border flex-grow" />
        </div>
      </div>
    </header>
  );
}