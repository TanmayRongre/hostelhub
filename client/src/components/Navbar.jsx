import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Building2,
  Users,
  Grid,
  ListOrdered,
  BarChart3,
  Mail,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  LayoutDashboard,
  LogIn,
  UserPlus,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [serverStatus, setServerStatus] = useState({ online: null, latency: null });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  // Ping health API
  const checkHealth = async () => {
    try {
      const data = await api.getHealth();
      setServerStatus({ online: true, latency: data._latency });
    } catch {
      setServerStatus({ online: false, latency: null });
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 20000);
    return () => clearInterval(interval);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Track active section for anchor links on home page
  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveSection('');
      return;
    }

    const sectionIds = ['overview', 'roles-section', 'capabilities', 'workflow', 'impact'];
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0;

      // If near the top (first viewport/screen), it is always overview
      if (scrollY < window.innerHeight * 0.5) {
        setActiveSection('overview');
        return;
      }

      // Check remaining sections from bottom to top using bounding client rect
      for (let i = sectionIds.length - 1; i >= 1; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el) {
          const rect = el.getBoundingClientRect();
          // If the element's top is in view or reached header offset
          if (rect.top <= 220 && rect.bottom > 100) {
            setActiveSection(sectionIds[i]);
            return;
          }
        }
      }

      // Fallback to overview if nothing else matched
      setActiveSection('overview');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const handleNavClick = (e, targetHash) => {
    e.preventDefault();
    setMobileOpen(false);

    if (location.pathname === '/') {
      if (targetHash === '#overview') {
        if (window.lenis) {
          window.lenis.scrollTo(0, { duration: 1.1 });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        setActiveSection('overview');
        return;
      }

      const el = document.querySelector(targetHash);
      if (el) {
        if (window.lenis) {
          window.lenis.scrollTo(el, { offset: -64, duration: 1.1 });
        } else {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } else {
      navigate('/' + targetHash);
    }
  };

  const getDashboardPath = () => {
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'warden') return '/warden';
    return '/dashboard';
  };

  const getDashboardLabel = () => {
    if (user?.role === 'admin') return 'Admin Hub';
    if (user?.role === 'warden') return 'Warden Desk';
    return 'Student Portal';
  };

  const getDashboardIcon = () => {
    if (user?.role === 'admin') return <ShieldCheck className="w-3.5 h-3.5" />;
    if (user?.role === 'warden') return <Building2 className="w-3.5 h-3.5" />;
    return <LayoutDashboard className="w-3.5 h-3.5" />;
  };

  const navItems = [
    { type: 'hash', hash: '#overview', label: 'Overview' },
    { type: 'hash', hash: '#roles-section', label: 'Portals' },
    { type: 'hash', hash: '#capabilities', label: 'Capabilities' },
    { type: 'hash', hash: '#workflow', label: 'Workflow' },
    { type: 'hash', hash: '#impact', label: 'Impact' },
    { type: 'link', to: '/contact', label: 'Contact', icon: <Mail className="w-3.5 h-3.5" /> },
  ];

  const drawerNavItems = [
    ...(isAuthenticated
      ? [
          {
            type: 'link',
            to: getDashboardPath(),
            label: getDashboardLabel(),
            icon: getDashboardIcon(),
          },
        ]
      : []),
    ...navItems,
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#090b10]/90 border-b border-white/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.8)] transition-all">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* ── Brand ── */}
        <Link
          to="/"
          onClick={(e) => handleNavClick(e, '#overview')}
          className="flex items-center gap-2.5 sm:gap-3 text-decoration-none group flex-shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-[#121620] border border-[#c5a059]/40 flex items-center justify-center shadow-md group-hover:border-[#dfba73] group-hover:shadow-[0_0_15px_rgba(197,160,89,0.3)] transition-all flex-shrink-0">
            <Building2 className="w-4 h-4 text-[#dfba73]" />
          </div>
          <div>
            <div className="font-serif font-bold text-base sm:text-lg tracking-tight text-white leading-none">
              Hostel<span className="text-[#dfba73]">Hub</span>
            </div>
            <div className="text-[9px] text-[#94a3b8] font-sans font-medium tracking-[0.16em] uppercase mt-0.5 hidden sm:block">
              Campus Residence System
            </div>
          </div>
        </Link>

        {/* ── Desktop Center Navigation Links ── */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 bg-[#121620]/60 p-1 rounded-full border border-white/[0.06] flex-shrink-0">
          {navItems.map((item) => {
            if (item.type === 'hash') {
              const isSectionActive =
                location.pathname === '/' && activeSection === item.hash.replace('#', '');

              return (
                <a
                  key={item.hash}
                  href={'/' + item.hash}
                  onClick={(e) => handleNavClick(e, item.hash)}
                  className={`px-2.5 xl:px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isSectionActive
                      ? 'bg-[#c5a059]/15 text-[#dfba73] border border-[#c5a059]/30 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {item.label}
                </a>
              );
            }

            const isPageActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-1.5 px-2.5 xl:px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isPageActive
                    ? 'bg-[#c5a059]/15 text-[#dfba73] border border-[#c5a059]/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {item.icon && <span className="opacity-80">{item.icon}</span>}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* ── Right Actions (Health, Auth, Mobile Toggle) ── */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Server Health Status */}
          <button
            type="button"
            onClick={checkHealth}
            title={`Server Status: ${
              serverStatus.online === null
                ? 'Checking...'
                : serverStatus.online
                ? `Online (${serverStatus.latency}ms)`
                : 'Offline'
            }`}
            className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#121620] border border-white/[0.08] text-[11px] font-mono hover:border-[#c5a059]/40 transition-all cursor-pointer"
          >
            <span className="relative flex h-2 w-2">
              {serverStatus.online && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  serverStatus.online === null
                    ? 'bg-amber-400'
                    : serverStatus.online
                    ? 'bg-emerald-500'
                    : 'bg-rose-500'
                }`}
              />
            </span>
            <span className="text-slate-400 text-[10px]">
              {serverStatus.online === null
                ? 'Checking…'
                : serverStatus.online
                ? `${serverStatus.latency}ms`
                : 'Offline'}
            </span>
          </button>

          {/* Auth Controls */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to={getDashboardPath()}
                title={`Open ${getDashboardLabel()}`}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#121620] hover:bg-[#182030] border border-[#c5a059]/30 text-slate-200 transition-all"
              >
                <div className="w-5 h-5 rounded-md bg-[#182030] text-[#dfba73] border border-[#c5a059]/40 flex items-center justify-center text-[10px] font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="text-xs font-medium hidden sm:inline truncate max-w-[100px]">
                  {user?.name}
                </span>
                <span
                  className={`text-[9px] font-semibold px-1.5 py-0.5 rounded tracking-wider uppercase ${
                    user?.role === 'admin'
                      ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                      : user?.role === 'warden'
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-[#c5a059]/15 text-[#dfba73] border border-[#c5a059]/30'
                  }`}
                >
                  {user?.role}
                </span>
              </Link>

              <button
                type="button"
                onClick={logout}
                title="Sign Out"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-950/20 hover:bg-rose-900/35 border border-rose-800/30 text-rose-300 text-xs font-medium transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-slate-200 hover:text-white text-xs font-medium transition-all"
              >
                <LogIn className="w-3.5 h-3.5 opacity-70" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#c5a059] hover:bg-[#dfba73] text-[#090b10] text-xs font-semibold shadow-sm transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg bg-[#121620] border border-white/[0.08] text-slate-300 hover:text-white transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#0c0f16]/98 backdrop-blur-2xl border-b border-white/[0.08] px-4 py-4 space-y-1.5 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          {drawerNavItems.map((item) => {
            if (item.type === 'hash') {
              const isSectionActive =
                location.pathname === '/' && activeSection === item.hash.replace('#', '');

              return (
                <a
                  key={item.hash}
                  href={'/' + item.hash}
                  onClick={(e) => handleNavClick(e, item.hash)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    isSectionActive
                      ? 'bg-[#c5a059]/15 text-[#dfba73] border border-[#c5a059]/30'
                      : 'text-slate-300 hover:bg-white/[0.04]'
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{item.hash}</span>
                </a>
              );
            }

            const isPageActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isPageActive
                    ? 'bg-[#c5a059]/15 text-[#dfba73] border border-[#c5a059]/30'
                    : 'text-slate-300 hover:bg-white/[0.04]'
                }`}
              >
                {item.icon && <span className="opacity-80">{item.icon}</span>}
                <span>{item.label}</span>
              </Link>
            );
          })}

          {!isAuthenticated && (
            <div className="pt-3 mt-2 border-t border-white/[0.08] grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-xs font-medium text-slate-200"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#c5a059] text-xs font-semibold text-[#090b10]"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </Link>
            </div>
          )}

          {isAuthenticated && (
            <div className="pt-3 mt-2 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>
                  {user?.name} ({user?.role})
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                }}
                className="text-rose-400 font-medium hover:underline cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
