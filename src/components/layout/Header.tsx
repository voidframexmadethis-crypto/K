import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Search, Heart, ShoppingCart, User, Menu, X, Youtube, PlayCircle, ChevronDown, 
  ExternalLink, LayoutDashboard, Music, Plus, BarChart3, ShoppingBag, Video, 
  Settings, LogOut, Target, Globe, Smartphone, Sun, Moon, HelpCircle, Lock, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { useCartStore } from '../../store/useCartStore';

export const MainHeader = () => {
  const { items, toggleCart } = useCartStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [searchCategory, setSearchCategory] = useState('Songs');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [language, setLanguage] = useState('EN');
  const [user, setUser] = useState<FirebaseUser | null>(null);

  const accountRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

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
    { name: 'Beats Catalog', href: '/beats' },
    { name: 'Beat Packs', href: '/packs' },
    { name: 'Free Beats', href: '/free-beats' },
    { name: 'Services & Mixing', href: '/services' },
    { name: 'KRAEZELV Bio', href: '/profile' },
    { name: 'My Purchases', href: '/account' },
  ];

  const accountLinks = [
    { name: 'PRODUCER PROFILE', href: '/profile', icon: User, prominent: true },
    { name: 'My Purchases & Licenses', href: '/account', icon: ShoppingBag },
    { name: 'Saved Beats', href: '/favorites', icon: Heart },
    { name: 'Admin Dashboard', href: '/dashboard', icon: LayoutDashboard },
  ];

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 w-full z-[100] transition-all duration-500",
        isScrolled ? "bg-black/95 backdrop-blur-xl border-b border-white/10 py-3" : "bg-black/80 backdrop-blur-md py-4 border-b border-white/5"
      )}
    >
      {/* Top Banner Ribbon: App Downloads & Global Language & Help */}
      <div className="hidden lg:flex items-center justify-between max-w-[1800px] mx-auto px-6 md:px-12 text-[9px] font-black uppercase tracking-widest text-white/40 pb-2 border-b border-white/5 mb-3">
        <div className="flex items-center gap-6">
          {/* 7. Mobile App Store Redirection Ribbons */}
          <span className="flex items-center gap-2 text-white/60 hover:text-white transition-colors cursor-pointer">
            <Smartphone size={12} /> Get Mobile App: <span className="text-white underline">iOS</span> · <span className="text-white underline">Android</span>
          </span>
          <span className="h-2 w-px bg-white/10" />
          {/* 10. Help & Comprehensive FAQ Repository */}
          <a href="mailto:kraezelv@gmail.com?subject=KRAEZELV%20Support%20%26%20FAQ" className="flex items-center gap-1.5 hover:text-white transition-colors">
            <HelpCircle size={12} /> Help & FAQ
          </a>
        </div>

        <div className="flex items-center gap-6">
          {/* 8. Dark/Light Mode Toggle */}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            {isDarkMode ? <Moon size={12} /> : <Sun size={12} />} {isDarkMode ? 'Dark Mode' : 'Light Mode'}
          </button>

          <span className="h-2 w-px bg-white/10" />

          {/* 9. Global Language Translation Selector */}
          <div className="flex items-center gap-1.5 cursor-pointer hover:text-white">
            <Globe size={12} />
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-[9px] font-black uppercase text-white outline-none cursor-pointer"
            >
              <option value="EN" className="bg-neutral-900">🇺🇸 EN</option>
              <option value="ES" className="bg-neutral-900">🇪🇸 ES</option>
              <option value="DE" className="bg-neutral-900">🇩🇪 DE</option>
              <option value="FR" className="bg-neutral-900">🇫🇷 FR</option>
              <option value="JP" className="bg-neutral-900">🇯🇵 JP</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex items-center justify-between gap-6">
        {/* 1. Master Brand Identity Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          <div className="w-9 h-9 bg-purple-600/20 border border-purple-500/40 flex items-center justify-center rounded-sm group-hover:rotate-90 transition-transform duration-500">
            <div className="w-5 h-1 bg-purple-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg md:text-xl font-black tracking-[0.2em] text-white leading-none">
              KRAEZELV
            </span>
            <span className="text-[8px] font-bold uppercase tracking-[0.35em] text-white/40 mt-1">OFFICIAL STORE</span>
          </div>
        </Link>

        {/* 5. Universal Site Search Bar & 6. Search Filter Dropdown Matrix */}
        <div className="hidden xl:flex items-center flex-1 max-w-lg bg-white/5 border border-white/10 p-1.5">
          <select 
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
            className="bg-black/60 text-white text-[9px] font-black uppercase p-2 border border-white/10 outline-none cursor-pointer shrink-0"
          >
            <option value="Songs" className="bg-neutral-900">Songs</option>
            <option value="Beats" className="bg-neutral-900">Beats</option>
            <option value="Artists" className="bg-neutral-900">Artists</option>
            <option value="Albums" className="bg-neutral-900">Albums</option>
          </select>
          <div className="relative flex-1 flex items-center ml-2">
            <Search size={14} className="text-white/30 mr-2 shrink-0" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH KRAEZELV BEATS, GENRES, BPM, KEYS..."
              className="w-full bg-transparent text-[10px] font-bold text-white uppercase tracking-widest outline-none placeholder:text-white/30"
            />
          </div>
        </div>

        {/* Zone 2: Navigation */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={cn(
                "text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap",
                location.pathname === link.href ? "text-white" : "text-white/40 hover:text-white"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Zone 3: Profile & Cart CTAs */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Producer Profile Link */}
          <Link 
            to="/profile"
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-white text-black text-[9px] font-black uppercase tracking-[0.2em] hover:bg-neutral-200 transition-all shadow-md"
            title="KRAEZELV Producer Profile"
          >
            <User size={13} /> PROFILE
          </Link>

          {/* Dynamic Shopping Cart Icon & Live Badge */}
          <button 
            onClick={() => toggleCart()}
            className="relative p-2.5 border border-white/10 hover:border-white/30 text-white/80 hover:text-white bg-white/5 transition-all flex items-center justify-center shrink-0 cursor-pointer"
            title="Open Shopping Cart"
          >
            <ShoppingBag size={16} />
            {items.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-purple-500 text-white font-mono text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-black">
                {items.length}
              </span>
            )}
          </button>

          {/* Account Dropdown */}
          <div className="relative" ref={accountRef}>
            <button 
              onClick={() => setIsAccountOpen(!isAccountOpen)}
              className={cn(
                "flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 border border-white/10 px-3 py-2 bg-white/5",
                isAccountOpen ? "text-white bg-white/10" : "text-white/60 hover:text-white"
              )}
            >
              <User size={16} />
              <span className="hidden sm:inline">Menu</span>
              <ChevronDown size={12} className={cn("transition-transform duration-300", isAccountOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
              {isAccountOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-4 w-64 bg-black/95 backdrop-blur-2xl border border-white/15 shadow-2xl overflow-hidden z-[110]"
                >
                  <div className="flex flex-col py-2">
                    {accountLinks.map((link) => (
                      <Link
                        key={link.name}
                        to={link.href}
                        className={cn(
                          "flex items-center gap-3 px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                          link.prominent ? "bg-white text-black hover:bg-neutral-200" : 
                          "text-white/50 hover:text-white hover:bg-white/5"
                        )}
                      >
                        <link.icon size={14} />
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-4xl md:text-6xl font-bold uppercase tracking-tighter text-white hover:text-white/40 transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>
            
            <div className="flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/10 pt-12 md:pt-0 md:pl-12">
              <div className="flex flex-col gap-8">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">User Space</span>
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white flex items-center gap-2">
                       <User size={14} /> Account Details
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {accountLinks
                        .filter(link => !link.prominent || user)
                        .map(link => (
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
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6 pt-12">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">
                  © 2026 KRAEZELV
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
