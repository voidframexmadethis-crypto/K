import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navLinks = [
    { name: 'Beats', href: '/beats' },
    { name: 'Collections', href: '/collections' },
    { name: 'Beat Packs', href: '/packs' },
    { name: 'Free Beats', href: '/free-beats' },
    { name: 'Audio Player', href: '/audio-player' },
    { name: 'Merch', href: '/merch' },
  ];

  return (
    <header className="fixed top-0 left-0 w-full bg-black border-b border-white/10 z-50">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        {/* Zone 1: Brand */}
        <Link to="/" className="text-2xl font-bold tracking-tighter text-white uppercase">
          KRAEZELV
        </Link>

        {/* Zone 2: Nav Links */}
        <nav className="hidden lg:flex items-center gap-8 text-xs font-medium uppercase tracking-widest text-white/60">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.href} 
              className="hover:text-white transition-colors duration-200"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-6">
          <button className="text-white/60 hover:text-white transition-colors">
            <Search size={20} />
          </button>
          <Link to="/account" className="text-white/60 hover:text-white transition-colors">
            <User size={20} />
          </Link>
          <button className="relative text-white/60 hover:text-white transition-colors">
            <ShoppingBag size={20} />
          </button>
          <button 
            className="lg:hidden text-white/60 hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-20 left-0 w-full bg-black border-b border-white/10 p-8 flex flex-col gap-6 animate-in slide-in-from-top duration-300">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.href} 
              className="text-lg font-bold uppercase tracking-tighter text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};
