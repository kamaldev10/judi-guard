import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield, Mail } from 'lucide-react';

const FOOTER_NAV = [
  { to: '/', label: 'Beranda' },
  { to: '/about-us', label: 'Tentang Kami' },
  { to: '/dashboard/profile', label: 'Profil' },
];

const FOOTER_HELP = [
  { to: '/#faq', label: 'FAQ' },
  { to: '/#contact-section', label: 'Kontak Kami' },
];

const footerLinkClass =
  'text-slate-500 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors duration-150';

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="glass-surface border-t border-black/5 dark:border-white/[0.06]"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* ── Brand column ── */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              to="/"
              className="inline-flex items-center gap-2 group"
              aria-label="Judi Guard — Beranda"
            >
              <Shield
                size={24}
                className="text-brand-600 dark:text-brand-400 transition-transform duration-200 group-hover:scale-110"
                aria-hidden="true"
              />
              <span className="text-xl font-bold brand-gradient-text tracking-tight">
                JUDI GUARD
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-200 max-w-xs">
              Platform pendeteksi komentar spam judi otomatis dan akurat di ruang digital Anda.
            </p>
            <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
              Say Goodbye to Spam Judi
            </p>
          </div>

          {/* ── Navigasi ── */}
          <nav aria-label="Navigasi footer">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-3">
              Navigasi
            </h2>
            <ul className="space-y-2 text-sm" role="list">
              {FOOTER_NAV.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className={footerLinkClass}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Bantuan ── */}
          <nav aria-label="Bantuan">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-3">
              Bantuan
            </h2>
            <ul className="space-y-2 text-sm" role="list">
              {FOOTER_HELP.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className={footerLinkClass}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Newsletter ── */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-3">
              Berlangganan
            </h2>
            <p className="text-sm mb-3 text-slate-500 dark:text-slate-200 leading-relaxed">
              Dapatkan update dan fitur terbaru langsung ke email Anda.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <label htmlFor="footer-newsletter-email" className="sr-only">
                Email Anda
              </label>
              <div className="relative flex-1">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-200 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="footer-newsletter-email"
                  type="email"
                  placeholder="Email Anda"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-black/10 dark:border-white/[0.1] bg-white/50 dark:bg-white/[0.04] text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus:border-brand-500 transition-colors"
                />
              </div>
              <button type="submit" className="btn-brand px-4 py-2.5 text-sm shrink-0">
                Kirim
              </button>
            </form>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-10 pt-6 border-t border-black/[0.06] dark:border-white/[0.06] text-center">
          <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-200">
            {new Date().getFullYear()} Judi Guard ver {import.meta.env.VITE_APP_VERSION}
            <span className="font-semibold capitalize ms-1"> &copy; All Rights Reserved.</span>
          </p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
