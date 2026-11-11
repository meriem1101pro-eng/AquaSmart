import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Droplets, 
  Sun, 
  Moon, 
  Languages, 
  Bell, 
  User, 
  LogOut, 
  CheckCircle2, 
  AlertTriangle,
  Menu,
  X,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';

export default function Navbar({ onToggleSidebar }) {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage, isRtl, t } = useLanguage();
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/alerts')
        .then((res) => {
          const list = res.data || res;
          setAlerts(Array.isArray(list) ? list : []);
          setUnreadCount(Array.isArray(list) ? list.filter(a => !a.is_read).length : 0);
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const markAllRead = async () => {
    try {
      await api.post('/alerts/mark-all-read');
      setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Mobile hamburger & Logo */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition">
              <Droplets className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-700 via-teal-600 to-sky-600 dark:from-emerald-400 dark:to-sky-400 bg-clip-text text-transparent">
                AquaSmart
              </span>
              <p className="text-[10px] font-medium text-emerald-800 dark:text-emerald-400 uppercase tracking-widest hidden sm:block">
                Every Drop Counts
              </p>
            </div>
          </Link>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Language Switcher */}
          <div className="relative group">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <button
                onClick={() => setLanguage('fr')}
                className={`px-2.5 py-1 rounded-lg transition ${language === 'fr' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'hover:text-emerald-600'}`}
              >
                FR
              </button>
              <button
                onClick={() => setLanguage('ar')}
                className={`px-2.5 py-1 rounded-lg transition ${language === 'ar' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'hover:text-emerald-600'}`}
              >
                عربي
              </button>
              <button
                onClick={() => setLanguage('dar')}
                className={`px-2.5 py-1 rounded-lg transition ${language === 'dar' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'hover:text-emerald-600'}`}
              >
                الدارجة
              </button>
            </div>
          </div>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={isDark ? "Mode clair" : "Mode sombre"}
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications / Alerts Popover */}
          {isAuthenticated && (
            <div className="relative">
              <button
                onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
                className="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showAlertsDropdown && (
                <div className={`absolute top-full mt-2 ${isRtl ? 'left-0' : 'right-0'} w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50`}>
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">Alertes d'irrigation</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllRead}
                        className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        Tout marquer comme lu
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {alerts.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        Aucune alerte active pour le moment.
                      </div>
                    ) : (
                      alerts.map((alert) => (
                        <div 
                          key={alert.id}
                          className={`p-3 text-xs transition ${!alert.is_read ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : ''}`}
                        >
                          <div className="flex items-start gap-2">
                            {alert.severity === 'critical' ? (
                              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                            ) : (
                              <Droplets className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className="font-semibold text-slate-800 dark:text-slate-200">{alert.title}</p>
                              <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{alert.message}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile / Auth buttons */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1.5 pl-2 sm:pl-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="hidden sm:block text-left">
                  <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[100px]">
                    {user?.name}
                  </span>
                  <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                    {user?.plan} Plan
                  </span>
                </div>
              </button>

              {showUserDropdown && (
                <div className={`absolute top-full mt-2 ${isRtl ? 'left-0' : 'right-0'} w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50`}>
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 rounded-full">
                      {user?.role === 'admin' ? 'Administrateur' : user?.role === 'manager' ? 'Gestionnaire' : 'Agriculteur'}
                    </span>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>{t('nav.profile')}</span>
                  </Link>

                  <Link
                    to="/pricing"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Changer de formule</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>{t('nav.admin')}</span>
                    </Link>
                  )}

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('nav.logout')}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 transition"
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25 transition"
              >
                {t('nav.register')}
              </Link>
            </div>
          )}

        </div>

      </div>
    </header>
  );
}
