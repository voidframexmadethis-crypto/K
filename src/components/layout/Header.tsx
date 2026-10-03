import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingCart, User, Menu, X, Youtube, PlayCircle, ChevronDown, ExternalLink, LayoutDashboard, Music, Plus, BarChart3, ShoppingBag, Video, Settings, LogOut, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export const MainHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setIsAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsAccountOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Beats', href: '/beats' },
    { name: 'Collections', href: '/collections' },
    { name: 'Beat Packs', href: '/packs' },
    { name: 'Free Beats', href: '/free-beats' },
    { name: 'Audio Player', href: '/audio-player' },
    { name: 'Merch', href: '/merch' },
    { name: 'Videos', href: '/videos' },
    { name: 'YouTube', href: 'https://youtube.com', external: true },
  ];

  const accountLinks = [
    { name: 'DASHBOARD', href: '/dashboard', icon: LayoutDashboard, prominent: true },
    { name: 'My Beats', href: '/dashboard/music', icon: Music },
    { name: 'Upload Beat', href: '/dashboard/upload', icon: Plus },
    { name: 'Beat Packs', href: '/packs', icon: ShoppingBag },
    { name: 'Collections', href: '/collections', icon: PlayCircle },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Marketing', href: '/dashboard/marketing', icon: Target },
    { name: 'Sales & Orders', href: '/dashboard/sales', icon: ShoppingBag },
    { name: 'Content Lab', href: '/dashboard/content', icon: Video },
    { name: 'YouTube', href: 'https://youtube.com', icon: Youtube, external: true },
    { name: 'Merch Manager', href: '/merch', icon: ShoppingBag },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    { name: 'Log Out', href: '/logout', icon: LogOut, danger: true },
  ];

  const utilities = [
    { icon: Search, label: 'Search', action: () => {} },
    { icon: Heart, label: 'Favorites', href: '/favorites' },
    { icon: ShoppingCart, label: 'Cart', href: '/cart', count: 0 },
  ];

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 w-full z-[100] transition-all duration-500",
        isScrolled ? "bg-black/95 backdrop-blur-xl border-b border-white/5 py-4" : "bg-transparent py-8"
      )}
    >
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Zone 1: Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-white flex items-center justify-center rounded-sm group-hover:rotate-90 transition-transform duration-500">
            <div className="w-6 h-1 bg-black" />
          </div>
          <span className="text-2xl font-black tracking-[0.2em] text-white uppercase leading-none">
            KRAEZELV<span className="text-white/40">BEATZ</span>
          </span>
        </Link>

        {/* Zone 2: Navigation */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-10">
          {navLinks.map((link) => (
            link.external ? (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold uppercase tracking-[0.2em] xl:tracking-[0.3em] text-white/40 hover:text-white transition-all duration-300 whitespace-nowrap"
              >
                {link.name}
              </a>
            ) : (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  "text-[10px] font-bold uppercase tracking-[0.2em] xl:tracking-[0.3em] transition-all duration-300 whitespace-nowrap",
                  location.pathname === link.href ? "text-white" : "text-white/40 hover:text-white"
                )}
              >
                {link.name}
              </Link>
            )
          ))}
        </nav>

        {/* Zone 3: Utilities */}
        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-6 border-r border-white/10 pr-8 mr-2">
            {utilities.map((item) => (
              <Link
                key={item.label}
                to={item.href || '#'}
                className="relative text-white/40 hover:text-white transition-colors group"
              >
                <item.icon size={18} strokeWidth={2.5} />
                {item.count !== undefined && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-white text-black text-[8px] font-black rounded-full flex items-center justify-center">
                    {item.count}
                  </span>
                )}
              </Link>
            ))}

            {/* Account Dropdown Control */}
            <div className="relative" ref={accountRef}>
              <button 
                onClick={() => setIsAccountOpen(!isAccountOpen)}
                className={cn(
                  "flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300",
                  isAccountOpen ? "text-white" : "text-white/40 hover:text-white"
                )}
                aria-expanded={isAccountOpen}
                aria-haspopup="true"
              >
                <User size={18} strokeWidth={2.5} />
                <span>Account</span>
                <ChevronDown size={14} className={cn("transition-transform duration-300", isAccountOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {isAccountOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute right-0 mt-6 w-64 bg-black/95 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden z-[110]"
                  >
                    <div className="flex flex-col py-2">
                      {accountLinks.map((link) => (
                        link.external ? (
                          <a
                            key={link.name}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white hover:bg-white/5 transition-all"
                          >
                            <span className="flex items-center gap-3">
                              <link.icon size={14} />
                              {link.name}
                            </span>
                            <ExternalLink size={12} />
                          </a>
                        ) : (
                          <Link
                            key={link.name}
                            to={link.href}
                            className={cn(
                              "flex items-center gap-3 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                              link.prominent ? "bg-white text-black hover:bg-neutral-200" : 
                              link.danger ? "text-red-500 hover:bg-red-500/10" :
                              "text-white/40 hover:text-white hover:bg-white/5"
                            )}
                          >
                            <link.icon size={14} />
                            {link.name}
                          </Link>
                        )
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <button 
            className="lg:hidden text-white p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile/iPad Navigation Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black z-[90] xl:hidden transition-all duration-700 ease-expo",
          isMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        )}
      >
        <div className="h-full flex flex-col pt-32 px-12 pb-12 overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-12 flex-1">
            <div className="flex flex-col gap-8">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Navigation</span>
              <nav className="flex flex-col gap-6">
                {navLinks.map((link) => (
                  link.external ? (
                    <a
                      key={link.name}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-4xl md:text-6xl font-bold uppercase tracking-tighter text-white hover:text-white/40 transition-colors"
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      key={link.name}
                      to={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="text-4xl md:text-6xl font-bold uppercase tracking-tighter text-white hover:text-white/40 transition-colors"
                    >
                      {link.name}
                    </Link>
                  )
                ))}
              </nav>
            </div>
            
            <div className="flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/10 pt-12 md:pt-0 md:pl-12">
              <div className="flex flex-col gap-8">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">User Space</span>
                <div className="flex flex-col gap-6">
                  {/* Account Dropdown in Mobile */}
                  <div className="flex flex-col gap-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white flex items-center gap-2">
                       <User size={14} /> Account Details
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {accountLinks.map(link => (
                        link.external ? (
                          <a
                            key={link.name}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-4 bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/60"
                          >
                            <link.icon size={16} /> {link.name}
                          </a>
                        ) : (
                          <Link
                            key={link.name}
                            to={link.href}
                            onClick={() => setIsMenuOpen(false)}
                            className={cn(
                              "flex items-center gap-3 p-4 text-[10px] font-black uppercase tracking-widest transition-all",
                              link.prominent ? "bg-white text-black" : "bg-white/5 text-white/60"
                            )}
                          >
                            <link.icon size={16} /> {link.name}
                          </Link>
                        )
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 mt-8">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">Quick Access</span>
                    <div className="flex flex-col gap-4">
                      {utilities.map(u => (
                        <Link key={u.label} to={u.href || '#'} onClick={() => setIsMenuOpen(false)} className="text-xl font-bold uppercase text-white/60 hover:text-white flex items-center gap-4">
                          <u.icon size={20} /> {u.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6 pt-12">
                <div className="flex gap-6">
                  <Youtube className="text-white/40" />
                  <PlayCircle className="text-white/40" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">
                  © 2026 KRAEZELVBEATZ
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
