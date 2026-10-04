import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Music, ShoppingCart, BarChart3, Video, Settings, Plus, Award, LogOut, ExternalLink, User as UserIcon, ChevronDown, Target, Sparkles, Glasses } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const menuItems = [
  { name: 'Overview', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'Music Library', icon: Music, href: '/dashboard/music' },
  { name: 'Sales & Ledger', icon: ShoppingCart, href: '/dashboard/sales' },
  { name: 'Analytics Engine', icon: BarChart3, href: '/dashboard/analytics' },
  { name: 'VR Headset Reviews', icon: Glasses, href: '/dashboard/vr-reviews' },
  { name: 'Marketing', icon: Target, href: '/dashboard/marketing' },
  { name: 'Content Lab', icon: Video, href: '/dashboard/content' },
  { name: 'Achievements', icon: Award, href: '/dashboard/achievements' },
  { name: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const profileMenuItems = [
    { name: 'Profile Settings', icon: UserIcon, href: '/dashboard/settings' },
    { name: 'View Store', icon: ExternalLink, href: '/' },
    { name: 'Sign Out', icon: LogOut, href: '/logout', danger: true },
  ];

  return (
    <div className="flex min-h-screen bg-black pt-20">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 hidden md:flex flex-col sticky top-20 h-[calc(100vh-80px)]">
        <div className="p-6">
           <Link 
             to="/dashboard/upload"
             className="w-full py-4 bg-white text-black flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-[10px] hover:bg-neutral-200 transition-all"
           >
             <Plus size={16} /> Upload Beat
           </Link>
        </div>

        <nav className="flex-1 px-4 flex flex-col gap-1">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-[10px] uppercase tracking-widest font-bold transition-all duration-200",
                location.pathname === item.href 
                  ? "bg-white text-black" 
                  : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-white/10 relative">
           <button 
             onClick={() => setIsProfileOpen(!isProfileOpen)}
             className={cn(
               "w-full flex items-center justify-between p-3 transition-all duration-300",
               isProfileOpen ? "bg-white text-black" : "bg-white/[0.02] border border-white/5 text-white hover:bg-white/5"
             )}
           >
              <div className="flex items-center gap-3 min-w-0">
                 <div className={cn("w-8 h-8 rounded-full transition-colors", isProfileOpen ? "bg-black/10" : "bg-white/10")} />
                 <div className="flex flex-col items-start min-w-0 text-left">
                    <span className="text-[10px] font-bold truncate">KRAEZELV</span>
                    <span className={cn("text-[8px] uppercase tracking-widest", isProfileOpen ? "text-black/40" : "text-white/40")}>Master Admin</span>
                 </div>
              </div>
              <ChevronDown size={14} className={cn("transition-transform duration-300", isProfileOpen && "rotate-180")} />
           </button>

           <AnimatePresence>
             {isProfileOpen && (
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: 10 }}
                 className="absolute bottom-[calc(100%-1.5rem)] left-6 right-6 mb-2 bg-neutral-900 border border-white/10 shadow-2xl overflow-hidden z-50"
               >
                 <div className="flex flex-col">
                   {profileMenuItems.map((item) => (
                     <Link
                       key={item.name}
                       to={item.href}
                       onClick={() => setIsProfileOpen(false)}
                       className={cn(
                         "flex items-center gap-3 px-4 py-3 text-[9px] uppercase tracking-widest font-black transition-colors",
                         item.danger ? "text-red-500 hover:bg-red-500/10" : "text-white/60 hover:text-white hover:bg-white/5"
                       )}
                     >
                       <item.icon size={14} />
                       {item.name}
                     </Link>
                   ))}
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-12 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};
