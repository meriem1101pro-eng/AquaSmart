import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Trees, 
  Droplet, 
  Bot, 
  Cpu, 
  CloudSun, 
  Leaf, 
  Coins, 
  FileSpreadsheet, 
  CreditCard, 
  ShieldCheck,
  User,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user, isAdmin } = useAuth();
  const { t, isRtl } = useLanguage();

  const navLinks = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/farms', label: t('nav.farms'), icon: Trees },
    { to: '/irrigation', label: t('nav.irrigation'), icon: Droplet },
    { to: '/ai', label: t('nav.ai'), icon: Bot, badge: 'AI' },
    { to: '/iot', label: t('nav.iot'), icon: Cpu },
    { to: '/weather', label: t('nav.weather'), icon: CloudSun },
    { to: '/impact', label: t('nav.impact'), icon: Leaf },
    { to: '/finance', label: t('nav.finance'), icon: Coins },
    { to: '/reports', label: t('nav.reports'), icon: FileSpreadsheet },
    { to: '/pricing', label: t('nav.pricing'), icon: CreditCard },
  ];

  if (isAdmin) {
    navLinks.push({ to: '/admin', label: t('nav.admin'), icon: ShieldCheck, badge: 'Admin' });
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside 
        className={`fixed top-16 bottom-0 ${isRtl ? 'right-0' : 'left-0'} z-50 w-64 bg-white dark:bg-slate-900 border-r dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : isRtl ? 'translate-x-full' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Mobile close button */}
          <div className="flex items-center justify-between lg:hidden mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Navigation</span>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User info card */}
          <div className="p-3.5 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-950/40 dark:to-slate-900 rounded-2xl border border-emerald-500/20">
            <p className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
              {user?.role === 'admin' ? 'Espace Administrateur' : user?.role === 'manager' ? 'Gestionnaire Domaine' : 'Agriculteur Partenaire'}
            </p>
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate mt-0.5">
              {user?.name || 'Utilisateur'}
            </p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                {user?.plan || 'FREE'}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Souss-Massa, MA
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) => `
                    flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group
                    ${isActive 
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-emerald-600 dark:hover:text-emerald-400'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-900">
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Slogan info */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 text-center">
            AquaSmart Maroc v1.0
          </p>
          <p className="text-[10px] text-emerald-800 dark:text-emerald-400 font-semibold text-center mt-0.5">
            Every Drop Counts 🌱💧
          </p>
        </div>
      </aside>
    </>
  );
}
