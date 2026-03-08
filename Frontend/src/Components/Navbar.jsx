import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { fetchCategories } from "../api";
import { User, Search, X, Menu } from "lucide-react";
import { useAuth } from "../Context/AuthContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchCategories().then(res => setCategories(res.data.results || res.data));
  }, []);

  return (
    <header className="bg-bg border-b border-border sticky px-10 top-0 z-50">
      {/* 1. Main Top Bar */}
      <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between relative">
        {/* Menu Toggle */}
        <button onClick={() => setIsOpen(true)} className="p-2 -ml-2 focus:outline-none">
          <Menu className="w-6 h-6 text-headline cursor-pointer" />
        </button>

        {/* Centered Logo */}
        <Link to="/" className="absolute left-1/2 -translate-x-1/2 font-serif text-2xl md:text-4xl font-black tracking-tighter text-headline uppercase">
          The Sentinel
        </Link>

        {/* User Profile Shortcut */}
        <Link to={user ? "/profile" : "/login"} className="p-2 -mr-2">
          <User className="w-5 h-5 text-headline" />
        </Link>
      </div>

      {/* 2. Editorial Slogan Row (Visible on Desktop/Tablet) */}
      <div className="hidden md:flex items-center justify-center pb-4 px-4">
        <div className="flex items-center gap-4 w-full max-w-2xl">
          <div className="h-[1px] bg-border flex-grow" />
          <p className="text-[9px] md:text-xs font-serif uppercase tracking-[0.3em] whitespace-nowrap text-gray-500 italic">
            Truth • Reports • Analysis
          </p>
          <div className="h-[1px] bg-border flex-grow" />
        </div>
      </div>

      {/* --- MOBILE/TABLET DRAWER --- */}
      <div className={`fixed inset-0 z-[70] transition-all duration-300 ${isOpen ? 'visible' : 'invisible'}`}>
        {/* Dark Backdrop */}
        <div
          className={`absolute inset-0 bg-headline/90 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsOpen(false)}
        />

        {/* Side Panel */}
        <div className={`absolute top-0 left-0 h-full w-[85vw] md:w-[380px] bg-bg shadow-2xl transition-transform duration-500 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full">

            {/* Drawer Header */}
            <div className="p-6 border-b border-border flex justify-between items-center bg-surface">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Sections</span>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-border rounded-full transition-colors">
                <X className="w-5 h-5 text-headline cursor-pointer" />
              </button>
            </div>

            {/* Scrollable Categories List */}
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

            {/* Drawer Footer (Search & Branding) */}
            <div className="p-8 bg-surface border-t border-border mt-auto">
              <Link
                to="/search"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-3 w-full py-3 bg-headline text-white text-xs font-bold uppercase tracking-widest hover:bg-accent transition-colors mb-6"
              >
                <Search className="w-4 h-4" /> Search Articles
              </Link>
              <div className="text-center">
                <p className="text-[10px] text-gray-400 font-serif italic tracking-widest uppercase">
                  Established 2026
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}