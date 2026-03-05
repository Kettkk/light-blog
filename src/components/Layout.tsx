import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ThemeService } from '../lib/theme';
import { Sun, Moon, PenTool, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Layout() {
  const [isDark, setIsDark] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const themeService = ThemeService.getInstance();
    themeService.applyTheme();
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const themeService = ThemeService.getInstance();
    themeService.toggleTheme();
    setIsDark(document.documentElement.classList.contains('dark'));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 transition-colors duration-300 font-sans">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tighter flex items-center gap-2">
            <span className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 w-8 h-8 flex items-center justify-center rounded-lg">F</span>
            Fantant 博客
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link 
              to="/" 
              className={`text-sm font-medium hover:text-indigo-500 transition-colors ${location.pathname === '/' ? 'text-indigo-500' : 'text-zinc-500 dark:text-zinc-400'}`}
              title="首页"
            >
              <Home className="w-5 h-5" />
            </Link>
            <Link 
              to="/editor" 
              className={`text-sm font-medium hover:text-indigo-500 transition-colors ${location.pathname === '/editor' ? 'text-indigo-500' : 'text-zinc-500 dark:text-zinc-400'}`}
              title="写文章"
            >
              <PenTool className="w-5 h-5" />
            </Link>
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500 dark:text-zinc-400"
              title={isDark ? "切换到亮色模式" : "切换到暗色模式"}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </nav>
        </div>
      </header>

      <main className="pt-24 pb-12 px-4 max-w-4xl mx-auto min-h-[calc(100vh-4rem)]">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
        <p>© {new Date().getFullYear()} Zenith 博客. 用心打造.</p>
      </footer>
    </div>
  );
}
