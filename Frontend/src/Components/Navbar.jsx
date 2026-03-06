import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { fetchCategories } from "../api";
import { User } from "lucide-react"; // <--- ADDED THIS IMPORT
import { useAuth } from "../Context/AuthContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const { user} = useAuth();

  // Parse user data safely

  useEffect(() => {
    fetchCategories()
      .then(res => {
        const data = res.data.results || res.data;
        setCategories(data);
      })
      .catch(err => console.error("Could not fetch categories:", err));
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
      setSearchOpen(false);
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
            <div className="h-0.5 w-6 bg-current mb-1.5" />
            <div className="h-0.5 w-6 bg-current mb-1.5" />
            <div className="h-0.5 w-4 bg-current" />
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

            {/* User Logic Wrapper */}
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

            {/* Desktop Search */}
            <form onSubmit={handleSearchSubmit} className="ml-4 group flex items-center border-b border-border focus-within:border-accent transition-colors pb-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SEARCH ARTICLES..."
                className="bg-transparent text-[10px] tracking-widest focus:outline-none w-28 lg:w-40 placeholder:text-gray-300"
              />
              <button type="submit" className="ml-2 text-gray-400 group-hover:text-accent">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>
            </form>
          </nav>

          {/* Mobile Search Toggle */}
          <div className="md:hidden">
            <button onClick={() => setSearchOpen(!searchOpen)} className="text-headline p-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        {searchOpen && (
          <form onSubmit={handleSearchSubmit} className="md:hidden w-full mb-6">
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

        {/* Mobile Sidebar */}
        <div className={`fixed inset-0 bg-headline text-white z-[60] transition-transform duration-500 md:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-8 right-8 p-2 text-white/70 hover:text-white"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex flex-col items-start justify-center h-full px-12 gap-8">
            <span className="text-accent text-xs font-bold tracking-[0.4em] uppercase">Sections</span>
            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                onClick={() => setIsOpen(false)}
                className="text-4xl font-serif font-black uppercase italic hover:text-accent transition-colors"
              >
                {cat.name}
              </Link>
            ))}
            {/* Mobile User Link */}
            <Link
              to={user ? "/profile" : "/login"}
              onClick={() => setIsOpen(false)}
              className="mt-4 text-accent text-sm font-bold uppercase tracking-widest border-t border-white/10 pt-4 w-full"
            >
              {user ? `Account: ${user.username}` : "Sign In"}
            </Link>
          </div>
        </div>

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