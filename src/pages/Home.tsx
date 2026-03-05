import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StorageService } from '../lib/storage';
import { Article } from '../lib/types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { Sparkles, ArrowRight, Tag, ChevronRight, ChevronLeft, Search, Image as ImageIcon, Pin } from 'lucide-react';
import { stripMarkdown } from '../lib/utils';

const ITEMS_PER_PAGE = 6;

export default function Home() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [filteredTags, setFilteredTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [tagSearch, setTagSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);

  useEffect(() => {
    const storage = StorageService.getInstance();
    const allArticles = storage.getArticles();
    setArticles(allArticles);
    
    // Extract unique tags
    const allTags = Array.from(new Set(allArticles.flatMap(article => article.tags)));
    setTags(allTags);
    setFilteredTags(allTags);
  }, []);

  // Filter articles based on tag
  useEffect(() => {
    let result = articles;
    if (selectedTag) {
      result = articles.filter(article => article.tags.includes(selectedTag));
    }
    setFilteredArticles(result);
    setCurrentPage(1); // Reset to first page on filter change
  }, [selectedTag, articles]);

  // Filter tags based on search
  useEffect(() => {
    if (!tagSearch.trim()) {
      setFilteredTags(tags);
    } else {
      setFilteredTags(tags.filter(tag => 
        tag.toLowerCase().includes(tagSearch.toLowerCase())
      ));
    }
  }, [tagSearch, tags]);

  // Pagination logic
  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Check scroll buttons visibility
  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowLeftScroll(scrollLeft > 0);
        setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };

    checkScroll();
    window.addEventListener('resize', checkScroll);
    // Add listener to scroll event on the element itself
    const el = scrollContainerRef.current;
    if (el) el.addEventListener('scroll', checkScroll);
    
    return () => {
      window.removeEventListener('resize', checkScroll);
      if (el) el.removeEventListener('scroll', checkScroll);
    };
  }, [filteredTags]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const getPreviewText = (article: Article) => {
    // If explicit excerpt exists, use it (but still strip markdown just in case)
    if (article.excerpt && article.excerpt.length > 0) {
      return stripMarkdown(article.excerpt);
    }
    // Otherwise strip markdown from content and take first 150 chars
    return stripMarkdown(article.content).slice(0, 150) + '...';
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Section */}
      <section className="relative py-16 md:py-20 overflow-hidden rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/50 via-transparent to-transparent dark:from-indigo-900/20 dark:via-transparent dark:to-transparent pointer-events-none" />
        
        <div className="relative z-10 text-center space-y-6 px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-600 dark:text-zinc-300 mb-6 shadow-sm">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              探索创意的世界
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6">
              思想与<span className="text-indigo-600 dark:text-indigo-400">创意</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              收集故事、教程和见解。在这里发现新的视角，激发你的灵感。
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tag Search & Filter */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 max-w-md mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
          <Search className="w-4 h-4 text-zinc-400" />
          <input 
            type="text"
            placeholder="搜索标签..."
            value={tagSearch}
            onChange={(e) => setTagSearch(e.target.value)}
            className="flex-1 bg-transparent border-none focus:outline-none text-sm text-zinc-700 dark:text-zinc-200 placeholder-zinc-400"
          />
        </div>

        {tags.length > 0 && (
          <div className="relative group max-w-4xl mx-auto">
            {showLeftScroll && (
              <button 
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2 bg-white dark:bg-zinc-900 shadow-lg rounded-full border border-zinc-100 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            
            <div 
              ref={scrollContainerRef}
              className="flex overflow-x-auto gap-2 pb-2 px-1 no-scrollbar scroll-smooth mask-linear-fade items-center"
            >
              <button
                onClick={() => setSelectedTag(null)}
                className={clsx(
                  "whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border flex-shrink-0",
                  selectedTag === null
                    ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white shadow-md"
                    : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
                )}
              >
                全部
              </button>
              {filteredTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  className={clsx(
                    "whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border flex items-center gap-1.5 flex-shrink-0",
                    selectedTag === tag
                      ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white shadow-md"
                      : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
                  )}
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </button>
              ))}
              {filteredTags.length === 0 && (
                <span className="text-xs text-zinc-400 px-2">没有找到相关标签</span>
              )}
            </div>

            {showRightScroll && (
              <button 
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2 bg-white dark:bg-zinc-900 shadow-lg rounded-full border border-zinc-100 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Articles Grid (Masonry-ish with columns) */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-32 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
          <div className="max-w-md mx-auto space-y-6">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
              {articles.length === 0 ? "还没有文章" : "没有找到相关文章"}
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400">
              {articles.length === 0 ? "开始你的创作之旅，分享你的第一个故事。" : "尝试选择其他标签或查看全部文章。"}
            </p>
            {articles.length === 0 && (
              <Link to="/editor" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium transition-all hover:shadow-lg hover:shadow-indigo-500/20">
                创建第一篇文章
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="columns-1 md:columns-2 gap-6 space-y-6">
            <AnimatePresence mode='popLayout'>
              {paginatedArticles.map((article, index) => (
                <motion.div
                  layout
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="break-inside-avoid"
                >
                  <article 
                    onClick={() => navigate(`/article/${article.id}`)}
                    className={clsx(
                    "group flex flex-col bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-zinc-900/50 cursor-pointer",
                    article.isPinned 
                      ? "border-indigo-500 dark:border-indigo-500 ring-4 ring-indigo-500/10 dark:ring-indigo-500/20 shadow-lg shadow-indigo-500/10" 
                      : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700",
                    !article.coverImage && "relative overflow-hidden" 
                  )}>
                    {article.coverImage ? (
                      <div className="block relative aspect-[16/10] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                        <img 
                          src={article.coverImage} 
                          alt={article.title} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {article.isPinned && (
                          <div className="absolute top-3 right-3 bg-indigo-600 text-white px-2.5 py-1 rounded-full shadow-lg z-10 flex items-center gap-1.5">
                            <Pin className="w-3 h-3 fill-current" />
                            <span className="text-[10px] font-bold tracking-wide">置顶</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <Sparkles className="w-24 h-24 text-indigo-500 transform rotate-12" />
                        </div>
                        {article.isPinned && (
                          <div className="absolute top-4 right-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full z-10 flex items-center gap-1.5 border border-indigo-100 dark:border-indigo-800">
                            <Pin className="w-3 h-3 fill-current" />
                            <span className="text-[10px] font-bold tracking-wide">置顶</span>
                          </div>
                        )}
                      </>
                    )}
                    
                    <div className={clsx("flex flex-col flex-1 relative z-10", article.coverImage ? "p-6" : "p-8")}>
                      <div className="flex items-center gap-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-4">
                        <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
                          {format(article.createdAt, 'yyyy-MM-dd', { locale: zhCN })}
                        </span>
                        <span>•</span>
                        <span>{Math.ceil(article.content.length / 400)} 分钟阅读</span>
                      </div>
                      
                      <h2 className={clsx(
                        "font-bold mb-4 text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2",
                        article.coverImage ? "text-xl" : "text-2xl tracking-tight"
                      )}>
                        {article.title}
                      </h2>
                      
                      <p className={clsx(
                        "text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6 flex-1",
                        article.coverImage ? "text-sm line-clamp-3" : "text-base line-clamp-4 font-serif italic text-zinc-500 dark:text-zinc-400"
                      )}>
                        {getPreviewText(article)}
                      </p>
                      
                      <div className="flex items-center justify-between mt-auto pt-6 border-t border-zinc-100 dark:border-zinc-800">
                        <div className="flex flex-wrap gap-2">
                          {article.tags.slice(0, 2).map(tag => (
                            <span 
                              key={tag}
                              className="text-[10px] px-2 py-1 rounded-full bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-800"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                        
                        <div 
                          className="flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors group/link"
                        >
                          阅读
                          <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                        </div>
                      </div>
                    </div>
                  </article>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                第 {currentPage} 页 / 共 {totalPages} 页
              </span>
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
