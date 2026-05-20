'use client';

import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 20);
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <motion.nav
      className={`fixed left-0 right-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? 'glass shadow-sm' : 'bg-transparent'
      }`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="container-page flex h-16 items-center justify-between md:h-[72px]">
        <a href="#" className="flex items-center gap-2.5 no-underline">
          <div className="flex h-[38px] w-[38px] items-center justify-center rounded-md bg-brand-light text-xl dark:bg-[#2A1513]">
            🍔
          </div>
          <span className="font-heading text-[22px] font-extrabold tracking-tight text-brand">
            Foome
          </span>
        </a>

        <div className="flex items-center gap-3">
          {mounted && (
            <button
              type="button"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-surface-border transition-colors hover:border-brand dark:border-[#2A2A3A]"
              aria-label="Alternar tema"
              aria-pressed={resolvedTheme === 'dark'}
            >
              <svg
                className="hidden h-5 w-5 text-accent-amber dark:block"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364-.707-.707M6.343 6.343l-.707-.707m12.728 0-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"
                />
              </svg>
              <svg
                className="block h-5 w-5 text-ink-3 dark:hidden"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.354 15.354A9 9 0 0 1 8.646 3.646 9.003 9.003 0 0 0 12 21a9.003 9.003 0 0 0 8.354-5.646z"
                />
              </svg>
            </button>
          )}

          <a href="#download" className="btn-primary hidden !px-5 !py-2.5 !text-sm sm:inline-flex">
            Baixar App
          </a>
        </div>
      </div>
    </motion.nav>
  );
}
