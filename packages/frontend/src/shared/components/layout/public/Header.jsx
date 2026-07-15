import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Home, Info, BarChart3, IdCard, LayoutDashboard, Lightbulb } from 'lucide-react';
import { toast } from 'react-toastify';
import { Logo } from '@images';
import Swal from 'sweetalert2';
import { useAuthUiStore } from '@/modules/auth';
import LogoutButton from '@/shared/components/ui/LogoutButton';
import LoginButton from '@/shared/components/ui/LoginButton';
import ThemeToggle from '@/shared/components/ui/ThemeToggle';

const NAV_ITEMS = [
  { path: '/', label: 'Beranda', icon: Home },
  { path: '/about-us', label: 'Tentang Kami', icon: Info },
  { path: '/facts', label: 'Fakta Menarik', icon: Lightbulb },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

const mobileMenuVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.98,
    transition: { duration: 0.12, ease: 'easeIn' },
  },
};

const Header = () => {
  const currentUser = useAuthUiStore((s) => s.currentUser);
  const isAuthenticated = useAuthUiStore((s) => s.isAuthenticated);
  const logout = useAuthUiStore((s) => s.logout);

  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null);
  const toggleRef = useRef(null);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const handleLogout = () => {
    Swal.fire({
      title: 'Ingin Keluar dari Aplikasi?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#545454',
      confirmButtonText: 'Logout',
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        closeMobile();
        toast.error('Anda berhasil logout');
        setTimeout(() => navigate('/login'), 0);
      }
    });
  };

  // Close on route change
  useEffect(() => closeMobile(), [pathname, closeMobile]);

  // Click-outside to close mobile menu
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e) => {
      if (menuRef.current?.contains(e.target) || toggleRef.current?.contains(e.target)) return;
      closeMobile();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [mobileOpen, closeMobile]);

  // Escape key closes menu
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') {
        closeMobile();
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [mobileOpen, closeMobile]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const isActive = (path) => pathname === path;

  const displayName = currentUser?.username || currentUser?.name || 'Pengguna';

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="glass-surface sticky top-0 z-50 border-b border-black/5 dark:border-white/[0.06]"
    >
      {/* Skip link */}
      <Link
        to="/#connect-section"
        className="sr-only focus:not-sr-only focus:absolute focus:top-20 focus:left-1/2 focus:-translate-x-1/2 focus:z-[60] bg-brand-600 text-white rounded-md px-4 py-2 text-sm font-medium"
      >
        Skip to content
      </Link>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* ── Logo ── */}
          <Link
            to="/about-us"
            className="flex shrink-0 group"
            aria-label="Judi Guard — Tentang Kami"
          >
            <img
              src={Logo}
              alt="Logo Judi Guard"
              className="w-24 sm:w-28 md:w-30 transition-transform duration-200 group-hover:scale-[1.03]"
              width={120}
              height={40}
            />
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2" aria-label="Navigasi utama">
            {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`
                  relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
                  transition-all duration-150
                  ${
                    isActive(path)
                      ? 'text-brand-700 dark:text-brand-400 bg-brand-50/60 dark:bg-white/[0.06]'
                      : 'text-slate-600 dark:text-slate-300 hover:text-brand-700 dark:hover:text-brand-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                  }
                `}
                aria-current={isActive(path) ? 'page' : undefined}
              >
                <Icon size={16} aria-hidden="true" className="shrink-0 opacity-70" />
                {label}
                {/* Active indicator bar */}
                {isActive(path) && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute -bottom-[1px] inset-x-3 h-0.5 rounded-full bg-brand-500 dark:bg-brand-400"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            ))}

            {/* User greeting + actions */}
            <div className="flex items-center gap-2 ml-2 pl-3 border-l border-black/10 dark:border-white/[0.08]">
              {isAuthenticated && currentUser && (
                <span
                  data-cy="user-profile-name"
                  className="mr-2 text-sm text-brand-700 dark:text-brand-400 font-semibold truncate max-w-[140px]"
                  title={displayName}
                >
                  {displayName}
                </span>
              )}
              {isAuthenticated ? (
                <LogoutButton onClick={handleLogout} />
              ) : (
                <LoginButton data-cy="login-button" onClick={() => navigate('/login')} />
              )}
              <ThemeToggle />
            </div>
          </nav>

          {/* ── Mobile controls ── */}
          <div className="md:hidden flex items-center gap-1.5">
            <ThemeToggle />
            <button
              ref={toggleRef}
              id="mobile-menu-button"
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="inline-flex items-center justify-center size-10 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 transition-colors"
              aria-controls="mobile-menu"
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu utama'}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X size={22} aria-hidden="true" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu size={22} aria-hidden="true" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu Panel ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 top-16 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40 md:hidden"
              onClick={closeMobile}
              aria-hidden="true"
            />
            <motion.nav
              ref={menuRef}
              id="mobile-menu"
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="glass-surface md:hidden absolute top-16 inset-x-0 z-50 border-t border-black/5 dark:border-white/[0.06] shadow-xl dark:shadow-black/40 max-h-[calc(100dvh-4rem)] overflow-y-auto"
              aria-label="Menu navigasi mobile"
            >
              {/* User bar */}
              {isAuthenticated && currentUser && (
                <div className="flex items-center justify-between px-5 py-3 border-b border-black/[0.06] dark:border-white/[0.06]">
                  <span className="text-sm text-brand-700 dark:text-brand-400 font-semibold truncate">
                    {displayName}
                  </span>
                  <LogoutButton onClick={handleLogout} />
                </div>
              )}

              {/* Nav items */}
              <div className="px-3 py-2 space-y-0.5">
                {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    onClick={closeMobile}
                    className={`
                      flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-medium
                      transition-all duration-150
                      ${
                        isActive(path)
                          ? 'text-brand-700 dark:text-brand-400 bg-brand-50/70 dark:bg-white/[0.06]'
                          : 'text-slate-600 dark:text-slate-300 hover:text-brand-700 dark:hover:text-brand-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                      }
                    `}
                    aria-current={isActive(path) ? 'page' : undefined}
                  >
                    <Icon size={18} aria-hidden="true" className="shrink-0 opacity-70" />
                    {label}
                  </Link>
                ))}
              </div>

              {/* Bottom action bar (login only when unauthenticated) */}
              {!isAuthenticated && (
                <div className="px-5 py-3 border-t border-black/[0.06] dark:border-white/[0.06]">
                  <LoginButton
                    data-cy="login-button"
                    onClick={() => {
                      navigate('/login');
                      closeMobile();
                    }}
                  />
                </div>
              )}
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
