"use client";

const STORAGE_KEY = "pokert:theme";

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle("dark");
  window.localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
    </svg>
  );
}

export default function ThemeToggle() {
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      className="fixed right-4 top-4 z-50 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-white/80 text-zinc-600 shadow-sm backdrop-blur transition hover:border-indigo-400 hover:text-indigo-600 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:text-indigo-400"
    >
      <SunIcon className="hidden h-5 w-5 dark:block" />
      <MoonIcon className="block h-5 w-5 dark:hidden" />
    </button>
  );
}
