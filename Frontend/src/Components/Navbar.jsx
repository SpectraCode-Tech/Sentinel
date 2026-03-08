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
    <header className="bg-bg border-b border-border sticky top-0 z-50">
      {/* 1. Main Top Bar */}
      <div className="container mx-auto px-4 h-16 md:h-24 flex items-center justify-between relative">

        {/* Left Side: Menu + Desktop Search */}
        <div className="flex items-center gap-6 flex-1">
          <button onClick={() => setIsOpen(true)} className="p-2 -ml-2 hover:bg-surface rounded-full transition-colors focus:outline-none">
            <Menu className="w-6 h-6 text-headline" />
          </button>

          {/* Improved Desktop Searchbar */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center relative group">
            <Search className="w-4 h-4 absolute left-3 text-gray-400 group-focus-within:text-headline transition-colors" />
            <input
              type="text"
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-surface border border-border py-2 pl-10 pr-4 text-xs font-serif italic w-48 focus:w-64 focus:border-headline transition-all duration-300 outline-none rounded-sm"
            />
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
            <User className="w-5 h-5 text-headline" />
          </Link>
        </div>
      </div>

      {/* 2. Editorial Slogan Row */}
      <div className="hidden md:flex items-center justify-center pb-5 px-4">
        <div className="flex items-center gap-6 w-full max-w-3xl">
          <div className="h-[1px] bg-border flex-grow" />
          <p className="text-[10px] md:text-xs font-serif uppercase tracking-[0.4em] whitespace-nowrap text-gray-500 italic">
            Truth • Reports • Analysis
          </p>
          <div className="h-[1px] bg-border flex-grow" />
        </div>
      </div>

      {/* --- SIDE DRAWER (MOBILE SECTIONS) --- */}
      <div className={`fixed inset-0 z-[70] transition-all duration-300 ${isOpen ? 'visible' : 'invisible'}`}>
        <div
          className={`absolute inset-0 bg-headline/90 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsOpen(false)}
        />

        <div className={`absolute top-0 left-0 h-full w-[85vw] md:w-[400px] bg-bg shadow-2xl transition-transform duration-500 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full">

            <div className="p-6 border-b border-border flex justify-between items-center bg-surface">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Sections</span>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-border rounded-full transition-colors">
                <X className="w-5 h-5 text-headline" />
              </button>
            </div>

            {/* Mobile Search inside Drawer (for small screens only) */}
            <div className="lg:hidden p-6 border-b border-border">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search the archives..."
                  className="w-full bg-surface border border-border p-3 pl-10 text-sm outline-none focus:border-headline"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </form>
            </div>

            <nav className="flex-grow overflow-y-auto py-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="block px-8 py-4 text-sm font-bold uppercase tracking-tight text-headline hover:bg-accent hover:text-white border-b border-border/10 last:border-0 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>

            <div className="p-8 bg-surface border-t border-border text-center">
              <p className="text-[10px] text-gray-400 font-serif italic tracking-widest uppercase">
                The Sentinel Gazette • Established 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}