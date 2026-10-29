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
  Home,
  LayoutGrid,
  Settings,
  GitBranch,
  TrendingUp,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [serverStatus, setServerStatus] = useState({ online: null, latency: null });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [navVisible, setNavVisible] = useState(true);

  // Smart navbar: reveal immediately on scroll-up anywhere, hide on scroll-down
  useEffect(() => {
    let lastY = window.scrollY || 0;
    const threshold = 6;

    const handleScrollVisibility = () => {
      const currentY = window.scrollY || 0;

      // Always show if mobile menu is open
      if (mobileOpen) {
        setNavVisible(true);
        lastY = currentY;
        return;
      }

      // Always show when near the very top of the page
      if (currentY <= 60) {
        setNavVisible(true);
        lastY = currentY;
        return;
      }

      const diff = currentY - lastY;

      // Scrolling down past threshold -> hide
      if (diff > threshold) {
        setNavVisible(false);
      }
      // Scrolling up anywhere -> immediately show
      else if (diff < -threshold) {
        setNavVisible(true);
      }

      lastY = currentY;
    };

    window.addEventListener('scroll', handleScrollVisibility, { passive: true });
    if (window.lenis) {
      window.lenis.on('scroll', handleScrollVisibility);
    }
    return () => {
      window.removeEventListener('scroll', handleScrollVisibility);
      if (window.lenis) {
        window.lenis.off('scroll', handleScrollVisibility);
      }
    };
  }, [mobileOpen]);

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

  const isStudentDashboard = location.pathname === '/dashboard' || location.pathname === '/student-dashboard';

  const navItems = [
    { type: 'hash', hash: '#overview', label: 'Overview', icon: <Home className="w-3.5 h-3.5" /> },
    { type: 'hash', hash: '#roles-section', label: 'Portals', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
    { type: 'hash', hash: '#capabilities', label: 'Capabilities', icon: <Settings className="w-3.5 h-3.5" /> },
    { type: 'hash', hash: '#workflow', label: 'Workflow', icon: <GitBranch className="w-3.5 h-3.5" /> },
    { type: 'hash', hash: '#impact', label: 'Impact', icon: <TrendingUp className="w-3.5 h-3.5" /> },
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
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${
        navVisible
          ? 'translate-y-0 opacity-100'
          : '-translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="w-full backdrop-blur-xl bg-[#ffffffea] border-b border-[#d6e0d7] shadow-[0_4px_20px_rgba(21,35,42,0.04)]">
        <div className="w-full max-w-[1520px] mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* ── Brand ── */}
        <Link
          to="/"
          onClick={(e) => handleNavClick(e, '#overview')}
          className="flex items-center gap-2.5 sm:gap-3 text-decoration-none group flex-shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-[#e8f1f5] border border-[#bce4f6] text-[#128bc0] flex items-center justify-center shadow-xs transition-all flex-shrink-0 group-hover:bg-[#d8effa]">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-base sm:text-lg tracking-tight leading-none text-[#15232a] font-sans">
              Hostel<span className="text-[#128bc0]">Hub</span>
            </div>
            <div className="text-[9px] text-[#586d65] font-sans font-medium tracking-[0.16em] uppercase mt-0.5 hidden sm:block">
              Campus Residence System
            </div>
          </div>
        </Link>

        {/* ── Desktop Center Navigation Links ── */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#ffffff] p-1 rounded-full border border-[#d6e0d7] shadow-[0_2px_8px_rgba(21,35,42,0.04)] flex-shrink-0">
          {navItems.map((item) => {
            const isSectionActive =
              location.pathname === '/'
                ? activeSection === item.hash?.replace('#', '')
                : location.pathname === item.to || (location.pathname === '/dashboard' && item.label === 'Overview');

            if (item.type === 'hash') {
              return (
                <a
                  key={item.label}
                  href={'/' + item.hash}
                  onClick={(e) => handleNavClick(e, item.hash)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                    isSectionActive
                      ? 'bg-[#d8effa] text-[#128bc0] font-semibold shadow-xs'
                      : 'text-[#586d65] hover:text-[#15232a] hover:bg-[#f5f6f0]'
                  }`}
                >
                  {item.icon && <span className="opacity-80">{item.icon}</span>}
                  <span>{item.label}</span>
                </a>
              );
            }

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isSectionActive
                    ? 'bg-[#d8effa] text-[#128bc0] font-semibold shadow-xs'
                    : 'text-[#586d65] hover:text-[#15232a] hover:bg-[#f5f6f0]'
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
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ffffff] border border-[#d6e0d7] text-[#586d65] text-[11px] font-mono shadow-xs transition-all cursor-pointer hover:border-[#128bc0]"
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
            <span className="text-[#586d65] text-[11px]">
              {serverStatus.online === null
                ? '2.56ms'
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
                className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#ffffff] hover:bg-[#f5f6f0] border border-[#d6e0d7] text-[#15232a] shadow-xs transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-[#e8f1f5] text-[#128bc0] font-bold flex items-center justify-center text-xs">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="text-xs font-semibold text-[#15232a] hidden sm:inline truncate max-w-[110px]">
                  {user?.name}
                </span>
                <span
                  className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-[#e8f1f5] text-[#128bc0] border border-[#bce4f6] tracking-wider uppercase"
                >
                  {user?.role}
                </span>
              </Link>

              <button
                type="button"
                onClick={logout}
                title="Sign Out"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#ffffff] hover:bg-rose-50 border border-[#d6e0d7] hover:border-rose-200 text-[#586d65] hover:text-rose-600 text-xs font-medium shadow-xs transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 rounded-full bg-[#ffffff] hover:bg-[#f5f6f0] border border-[#d6e0d7] text-[#15232a] text-xs font-medium shadow-xs transition-all"
              >
                <LogIn className="w-3.5 h-3.5 opacity-70" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#152c36] hover:bg-[#128bc0] text-[#ffffff] text-xs font-semibold shadow-xs transition-all"
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
            className="lg:hidden p-2 rounded-lg bg-[#ffffff] border border-[#d6e0d7] text-[#15232a] hover:bg-[#f5f6f0] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#ffffff]/98 backdrop-blur-2xl border-b border-[#d6e0d7] px-4 py-4 space-y-1.5 shadow-xl animate-in slide-in-from-top-2 duration-200">
          {drawerNavItems.map((item) => {
            if (item.type === 'hash') {
              const isSectionActive =
                location.pathname === '/' && activeSection === item.hash.replace('#', '');

              return (
                <a
                  key={item.hash}
                  href={'/' + item.hash}
                  onClick={(e) => handleNavClick(e, item.hash)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    isSectionActive
                      ? 'bg-[#d8effa] text-[#128bc0] font-semibold border border-[#bce4f6]'
                      : 'text-[#15232a] hover:bg-[#f5f6f0]'
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="text-[10px] text-[#586d65] font-mono">{item.hash}</span>
                </a>
              );
            }

            const isPageActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  isPageActive
                    ? 'bg-[#d8effa] text-[#128bc0] font-semibold border border-[#bce4f6]'
                    : 'text-[#15232a] hover:bg-[#f5f6f0]'
                }`}
              >
                {item.icon && <span className="opacity-80">{item.icon}</span>}
                <span>{item.label}</span>
              </Link>
            );
          })}

          {!isAuthenticated && (
            <div className="pt-3 mt-2 border-t border-[#d6e0d7] grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#ffffff] border border-[#d6e0d7] text-xs font-medium text-[#15232a] shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#152c36] text-xs font-semibold text-[#ffffff] shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </Link>
            </div>
          )}

          {isAuthenticated && (
            <div className="pt-3 mt-2 border-t border-[#d6e0d7] flex items-center justify-between text-xs text-[#586d65]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="font-medium text-[#15232a]">
                  {user?.name} ({user?.role})
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                }}
                className="text-rose-600 font-medium hover:underline cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
      </div>
    </header>
  );
}
