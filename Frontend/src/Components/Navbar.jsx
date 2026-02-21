import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const navLinks = ["Politics", "Economy", "Culture"];

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

          {/* Desktop Links & Search */}
          <nav className="hidden md:flex gap-8 items-center text-xs font-bold uppercase tracking-widest text-gray-400">
            {navLinks.map(link => (
              <Link key={link} to={`/category/${link.toLowerCase()}`}
                 className="hover:text-accent transition-colors">
                {link}
              </Link>
            ))}

            {/* Redesigned Desktop Search */}
            <form onSubmit={handleSearchSubmit} className="ml-4 group flex items-center border-b border-border focus-within:border-accent transition-colors pb-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SEARCH DISPATCHES..."
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

        {/* Mobile Search Overlay Input */}
        {searchOpen && (
          <form onSubmit={handleSearchSubmit} className="md:hidden w-full mb-6 animate-in slide-in-from-top duration-300">
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

        {/* Mobile Sidebar Menu with "X" Close */}
        <div className={`fixed inset-0 bg-headline text-white z-[60] transition-transform duration-500 md:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {/* Close Button "X" */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-8 right-8 p-2 text-white/70 hover:text-white transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex flex-col items-start justify-center h-full px-12 gap-8">
            <span className="text-accent text-xs font-bold tracking-[0.4em] uppercase">Sections</span>
            {navLinks.map(link => (
              <Link
                key={link}
                to={`/category/${link.toLowerCase()}`}
                onClick={() => setIsOpen(false)}
                className="text-4xl font-serif font-black uppercase italic hover:text-accent transition-colors"
              >
                {link}
              </Link>
            ))}
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