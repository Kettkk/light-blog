import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { StorageService } from '../lib/storage';
import { Article } from '../lib/types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, ArrowRight, Calendar, User, Trash2, Tag, Clock, Pin } from 'lucide-react';
import { clsx } from 'clsx';
import { CommentSection } from '../components/CommentSection';

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [prevArticle, setPrevArticle] = useState<Article | null>(null);
  const [nextArticle, setNextArticle] = useState<Article | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [password, setPassword] = useState('');

  const loadArticle = () => {
    if (!id) return;
    const storage = StorageService.getInstance();
    const current = storage.getArticle(id);
    
    if (!current) {
      navigate('/');
      return;
    }

    setArticle(current);

    const allArticles = storage.getArticles();
    const currentIndex = allArticles.findIndex(a => a.id === id);
    
    if (currentIndex > 0) {
      setNextArticle(allArticles[currentIndex - 1]);
    } else {
      setNextArticle(null);
    }

    if (currentIndex < allArticles.length - 1) {
      setPrevArticle(allArticles[currentIndex + 1]);
    } else {
      setPrevArticle(null);
    }
  };

  useEffect(() => {
    loadArticle();
    window.scrollTo(0, 0);
  }, [id, navigate]);

  const confirmDelete = () => {
    if (password !== '270110') {
      alert('密码错误');
      return;
    }

    if (article) {
      StorageService.getInstance().deleteArticle(article.id);
      navigate('/');
    }
  };

  const confirmPin = () => {
    if (password !== '270110') {
      alert('密码错误');
      return;
    }

    if (article) {
      StorageService.getInstance().togglePin(article.id);
      loadArticle();
      setShowPinModal(false);
      setPassword('');
    }
  };

  if (!article) return null;

  // Calculate reading time (approx 200 words per minute)
  const readingTime = Math.ceil(article.content.length / 400);

  return (
    <article className="max-w-3xl mx-auto pb-20">
      <header className="mb-12 text-center space-y-6">
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
          {article.isPinned && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 font-medium">
              <Pin className="w-4 h-4 fill-current" />
              已置顶
            </span>
          )}
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/50">
            <Calendar className="w-4 h-4" />
            {format(article.createdAt, 'yyyy年MM月dd日', { locale: zhCN })}
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/50">
            <User className="w-4 h-4" />
            {article.author}
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/50">
            <Clock className="w-4 h-4" />
            {readingTime} 分钟阅读
          </span>
        </div>

        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight">
          {article.title}
        </h1>

        {article.tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {article.tags.map(tag => (
              <span key={tag} className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {article.coverImage && (
          <div className="rounded-2xl overflow-hidden shadow-2xl shadow-zinc-200 dark:shadow-zinc-900 mt-8 aspect-video ring-1 ring-zinc-900/5 dark:ring-white/10">
            <img 
              src={article.coverImage} 
              alt={article.title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
      </header>

      <div className="prose prose-zinc dark:prose-invert max-w-none prose-lg prose-headings:font-bold prose-headings:tracking-tight prose-a:text-indigo-600 dark:prose-a:text-indigo-400 hover:prose-a:text-indigo-500 prose-img:rounded-xl prose-img:shadow-lg">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown>
      </div>

      <div className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex justify-between items-center mb-12">
           <div className="flex gap-4">
             <button 
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              删除文章
            </button>
            <button 
              onClick={() => setShowPinModal(true)}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium",
                article.isPinned 
                  ? "text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30" 
                  : "text-zinc-500 hover:text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              )}
            >
              <Pin className={clsx("w-4 h-4", article.isPinned && "fill-current")} />
              {article.isPinned ? "取消置顶" : "置顶文章"}
            </button>
           </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
          {prevArticle ? (
            <Link 
              to={`/article/${prevArticle.id}`}
              className="group flex flex-col items-start gap-3 p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/50 transition-all duration-300"
            >
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1 group-hover:text-indigo-500 transition-colors">
                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                上一篇
              </span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2 text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {prevArticle.title}
              </span>
            </Link>
          ) : <div />}

          {nextArticle ? (
            <Link 
              to={`/article/${nextArticle.id}`}
              className="group flex flex-col items-end gap-3 p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/50 transition-all duration-300 text-right"
            >
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1 group-hover:text-indigo-500 transition-colors">
                下一篇
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2 text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {nextArticle.title}
              </span>
            </Link>
          ) : <div />}
        </div>
      </div>

      <CommentSection 
        articleId={article.id} 
        comments={article.comments || []} 
        onCommentAdded={loadArticle} 
      />

      {/* Pin Confirmation Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-xl w-full max-w-sm border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-bold mb-2 text-indigo-600">
              {article.isPinned ? "取消置顶" : "置顶文章"}
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-4 text-sm">
              请输入管理员密码以继续操作。
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="请输入密码"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowPinModal(false);
                  setPassword('');
                }}
                className="px-4 py-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmPin}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-xl w-full max-w-sm border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-bold mb-2 text-red-600">删除文章</h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-4 text-sm">
              确定要删除这篇文章吗？此操作无法撤销。
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="请输入删除密码"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
