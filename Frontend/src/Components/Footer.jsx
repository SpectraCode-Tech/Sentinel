import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const sections = ["World", "Politics", "Economy", "Culture", "Search"];
  const legal = ["Privacy Policy", "Terms of Service", "Editorial Guidelines"];

  return (
    <footer className="bg-headline text-white pt-16 pb-8 mt-20 border-t-4 border-accent">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

          {/* Column 1: Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="font-serif text-3xl tracking-tighter hover:text-accent transition-colors">
              THE SENTINEL
            </Link>
            <p className="mt-4 text-xs text-gray-400 leading-relaxed font-serif italic">
              Providing rigorous analysis and field reports since 2024. Independent journalism for a complex world.
            </p>
          </div>

          {/* Column 2: Sections */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-accent mb-6">Sections</h4>
            <ul className="space-y-3 text-xs uppercase tracking-widest font-medium">
              {sections.map(item => (
                <li key={item}>
                  <Link to={item === "Search" ? "/search" : `/category/${item.toLowerCase()}`} className="hover:text-accent transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-accent mb-6">Archives & Info</h4>
            <ul className="space-y-3 text-xs uppercase tracking-widest font-medium text-gray-400">
              {legal.map(item => (
                <li key={item}>
                  <Link to="#" className="hover:text-white transition-colors">{item}</Link>
                </li>
              ))}
              <li className="pt-2 text-white">Contact: info@sentinel.press</li>
            </ul>
          </div>

          {/* Column 4: Newsletter Signup */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-accent mb-6">The Daily Brief</h4>
            <p className="text-xs text-gray-400 mb-4">Get the top dispatches delivered to your inbox.</p>
            <form className="flex border-b border-gray-700 pb-1">
              <input
                type="email"
                placeholder="EMAIL ADDRESS"
                className="bg-transparent text-[10px] w-full focus:outline-none placeholder:text-gray-600"
              />
              <button className="text-[10px] font-bold tracking-widest hover:text-accent">JOIN</button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[9px] text-gray-500 uppercase tracking-[0.5em]">
            © 2026 THE SENTINEL • GLOBAL NEWS NETWORK
          </p>

          {/* Social Icons Placeholder */}
          <div className="flex gap-6 opacity-50">
            {['Twitter', 'Instagram', 'LinkedIn'].map(social => (
              <a key={social} href="#" className="text-[10px] uppercase tracking-widest hover:opacity-100 hover:text-accent transition-all">
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;