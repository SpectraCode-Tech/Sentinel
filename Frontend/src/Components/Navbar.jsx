import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { fetchCategories } from "../api";
import { User, Search, X, Menu } from "lucide-react";
import { useAuth } from "../Context/AuthContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories().then(res => setCategories(res.data.results || res.data));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
      setIsOpen(false);
    }
  };

  return (
    <header className="bg-bg border-b border-border sticky top-0 z-50 px-5">
      {/* 1. Main Top Bar */}
      <div className="container mx-auto px-4 h-20 md:h-28 flex flex-col justify-center relative">

        <div className="flex items-center justify-between w-full">
          {/* Left Side: Menu + Desktop Search */}
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => setIsOpen(true)} className="p-2 -ml-2 hover:bg-surface rounded-full transition-colors focus:outline-none">
              <Menu className="w-6 h-6 text-headline" />
            </button>

            {/* Redesigned Searchbar - Underlined Minimalist Style */}
            <form onSubmit={handleSearch} className="hidden lg:flex items-center relative">
              <input
                type="text"
                placeholder="SEARCH..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-b border-accent py-1 pr-8 text-[10px] font-black tracking-widest w-32 focus:w-48 transition-all duration-500 outline-none uppercase"
              />
              <Search className="w-3.5 h-3.5 absolute right-0 text-gray-400" />
            </form>
          </div>

          {/* Centered Logo */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2 font-serif text-2xl md:text-5xl font-black tracking-tighter text-headline uppercase">
            The Sentinel
          </Link>

          {/* Right Side: Account/User */}
          <div className="flex items-center justify-end gap-2 flex-1">
            <Link to={user ? "/profile" : "/login"} className="flex items-center gap-2 group p-2">
              <span className="hidden md:block text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-headline transition-colors">
                {user ? "Member" : "Sign In"}
              </span>
              <div className="p-1.5 border border-transparent group-hover:border-border rounded-full transition-all">
                <User className="w-5 h-5 text-headline" />
              </div>
            </Link>
          </div>
        </div>

        {/* 2. Slogan Row - Now visible on Mobile & Desktop */}
        <div className="flex items-center justify-center mt-2 md:mt-4">
          <div className="flex items-center gap-3 md:gap-6 w-full max-w-lg md:max-w-3xl">
            <div className="h-[1px] bg-border flex-grow" />
            <p className="text-[8px] md:text-xs font-serif uppercase tracking-[0.3em] md:tracking-[0.4em] whitespace-nowrap text-gray-500 italic">
              Truth • Reports • Analysis
            </p>
            <div className="h-[1px] bg-border flex-grow" />
          </div>
        </div>
      </div>

      {/* --- SIDE DRAWER --- */}
      <div className={`fixed inset-0 z-[70] transition-all duration-300 ${isOpen ? 'visible' : 'invisible'}`}>
        <div
          className={`absolute inset-0 bg-headline/40 backdrop-blur-md transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsOpen(false)}
        />

        {/* Fixed: inset-y-0 + h-[100dvh] solves the mobile gap/glitch */}
        <div className={`absolute inset-y-0 left-0 h-[100dvh] w-[85vw] md:w-[380px] bg-bg shadow-2xl transition-transform duration-500 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

          <div className="p-6 border-b border-border flex justify-between items-center bg-surface">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Sections</span>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-border rounded-full transition-colors">
              <X className="w-5 h-5 text-headline" />
            </button>
          </div>

          {/* Mobile Search inside Drawer */}
          <div className="lg:hidden p-6">
            <form onSubmit={handleSearch} className="relative group">
              <input
                type="text"
                placeholder="SEARCH ARCHIVES..."
                className="w-full bg-surface border-b border-accent p-3 pl-0 text-[10px] font-black tracking-widest outline-none transition-colors uppercase"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="w-4 h-4 absolute right-0 top-1/2 -translate-y-1/2 text-gray-400" />
            </form>
          </div>

          <nav className="flex-grow overflow-y-auto px-6 py-2">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                onClick={() => setIsOpen(false)}
                className="block py-4 text-sm font-bold uppercase tracking-widest text-headline hover:text-accent border-b border-border/10 last:border-0 transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          <div className="p-8 bg-surface border-t border-border text-center">
            <p className="text-[9px] text-gray-400 font-serif italic tracking-widest uppercase">
              The Sentinel Gazette • Est. 2026
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}