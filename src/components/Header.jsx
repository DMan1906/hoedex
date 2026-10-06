import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function Header() {
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Hoedex Logo" className="w-10 h-10 object-contain dark:invert dark:mix-blend-screen" />
          <h1 className="text-2xl font-extrabold text-brand-600 dark:text-brand-500 tracking-tight">Hoedex</h1>
        </Link>
        
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
          aria-label="Toggle Dark Mode"
        >
          {isDark ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </div>
    </header>
  );
}
