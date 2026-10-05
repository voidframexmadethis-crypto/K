import React from 'react';
import { Link } from 'react-router-dom';
import { Youtube, Instagram, Twitter, MessageCircle, ArrowUp, Mail, MapPin, Phone } from 'lucide-react';

export const MassiveFooter = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="bg-black border-t border-white/5 pt-40 pb-20 relative overflow-hidden">
      {/* Background oversized wordmark */}
      <div className="absolute -bottom-20 left-0 w-full text-[25vw] font-black text-white/[0.02] uppercase tracking-[-0.1em] select-none pointer-events-none whitespace-nowrap">
        KRAEZELV
      </div>

      <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-24 mb-40">
          
          {/* Brand Col */}
          <div className="lg:col-span-4 flex flex-col gap-10">
            <Link to="/" className="text-3xl font-black tracking-[0.2em] text-white uppercase leading-none">
              KRAEZELV
            </Link>
            <p className="text-lg text-white/40 uppercase tracking-tight leading-relaxed max-w-sm">
              The definitive standalone producer ecosystem for modern artists and industry professionals. Redefining the standard of music technology platforms.
            </p>
            <div className="flex gap-8">
              {[
                { icon: Youtube, href: 'https://youtube.com/@kraezelvbeatz', label: 'YouTube' },
                { icon: Instagram, href: 'https://instagram.com/kraezelvbeatz', label: 'Instagram' },
                { icon: Twitter, href: 'https://x.com/kraezelvbeatz', label: 'X (Twitter)' },
                { icon: MessageCircle, href: 'https://discord.gg/kraezelv', label: 'Discord' }
              ].map((item, i) => (
                <a 
                  key={i} 
                  href={item.href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label={item.label}
                  className="text-white/20 hover:text-white transition-colors transform hover:-translate-y-1 transition-all duration-300"
                >
                  <item.icon size={24} strokeWidth={2} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-12">
            {[
              { 
                title: 'Ecosystem', 
                links: [
                  { name: 'Beats Catalog', href: '/beats' },
                  { name: 'Collections', href: '/collections' },
                  { name: 'Beat Packs', href: '/packs' },
                  { name: 'Free Downloads', href: '/free-beats' },
                  { name: 'Exclusive Inquiry', href: 'mailto:kraezelv@gmail.com' }
                ] 
              },
              { 
                title: 'Department', 
                links: [
                  { name: 'Apparel & Merch', href: '/merch' },
                  { name: 'Sound Kits', href: '/packs' },
                  { name: 'Mixing Services', href: '/services' },
                  { name: 'Studio Rental', href: 'mailto:kraezelv@gmail.com' },
                  { name: 'UGC Content Lab', href: '/dashboard/content' }
                ] 
              },
              { 
                title: 'User Space', 
                links: [
                  { name: 'Customer Account', href: '/account' },
                  { name: 'Download Library', href: '/account' },
                  { name: 'Saved Favorites', href: '/favorites' },
                  { name: 'Shopping Cart', href: '/cart' },
                  { name: 'Support Tickets', href: 'mailto:kraezelv@gmail.com' }
                ] 
              },
              { 
                title: 'Contact', 
                links: [
                  { name: 'kraezelv@gmail.com', href: 'mailto:kraezelv@gmail.com' },
                  { name: '+1 (555) 000-000', href: 'tel:+1555000000' },
                  { name: 'Discord Server', href: 'https://discord.gg/kraezelv' },
                  { name: 'Support Tickets', href: 'mailto:kraezelv@gmail.com' }
                ] 
              }
            ].map((section) => (
              <div key={section.title} className="flex flex-col gap-10">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">{section.title}</span>
                <ul className="flex flex-col gap-4">
                  {section.links.map(link => {
                    const isExternal = link.href.startsWith('http') || link.href.startsWith('mailto:') || link.href.startsWith('tel:');
                    return (
                      <li key={link.name}>
                        {isExternal ? (
                          <a 
                            href={link.href}
                            {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                            className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 hover:text-white transition-colors"
                          >
                            {link.name}
                          </a>
                        ) : (
                          <Link 
                            to={link.href} 
                            className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 hover:text-white transition-colors"
                          >
                            {link.name}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex flex-col md:flex-row items-center gap-12 text-[8px] font-bold uppercase tracking-[0.4em] text-white/20">
              <span>© 2026 KRAEZELV PLATFORM</span>
              <div className="flex gap-8">
                 <Link to="/services" className="hover:text-white transition-colors">Privacy Architecture</Link>
                 <Link to="/services" className="hover:text-white transition-colors">Terms of Service</Link>
                 <Link to="/beats" className="hover:text-white transition-colors">Licensing Agreement</Link>
              </div>
           </div>
           
           <button 
             onClick={scrollToTop}
             className="flex items-center gap-4 text-[8px] font-bold uppercase tracking-[0.5em] text-white/40 hover:text-white transition-all group"
           >
             Return to Top <ArrowUp size={14} className="group-hover:-translate-y-1 transition-transform" />
           </button>
        </div>
      </div>
    </footer>
  );
};
