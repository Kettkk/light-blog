import { useState, useEffect } from 'react';
import { ArticleComment } from '../lib/types';
import { StorageService } from '../lib/storage';
import { getUserName } from '../lib/utils';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Send, User, MessageSquare, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CommentSectionProps {
  articleId: string;
  comments?: ArticleComment[];
  onCommentAdded: () => void;
}

export function CommentSection({ articleId, comments = [], onCommentAdded }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [password, setPassword] = useState('');

  useEffect(() => {
    setUsername(getUserName());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    
    const comment: ArticleComment = {
      id: Date.now().toString(),
      author: username,
      content: newComment.trim(),
      createdAt: Date.now(),
    };

    StorageService.getInstance().addComment(articleId, comment);
    setNewComment('');
    setIsSubmitting(false);
    onCommentAdded();
  };

  const handleDelete = (commentId: string) => {
    setDeletingCommentId(commentId);
  };

  const confirmDelete = () => {
    if (password !== '270110') {
      alert('密码错误');
      return;
    }

    if (deletingCommentId) {
      StorageService.getInstance().deleteComment(articleId, deletingCommentId);
      setDeletingCommentId(null);
      setPassword('');
      onCommentAdded();
    }
  };

  return (
    <div className="mt-16 pt-10 border-t border-zinc-200 dark:border-zinc-800">
      <h3 className="text-2xl font-bold mb-8 flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
        <MessageSquare className="w-6 h-6" />
        评论 ({comments.length})
      </h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-12 bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-3 mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <User className="w-4 h-4" />
          </div>
          <span>以 <span className="font-medium text-zinc-900 dark:text-zinc-200">{username}</span> 的身份发表评论</span>
        </div>
        
        <div className="relative">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="写下你的想法..."
            className="w-full p-4 pr-12 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] resize-y transition-all"
            required
          />
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="absolute bottom-3 right-3 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="发送评论"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        <AnimatePresence mode='popLayout'>
          {comments.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-10 text-zinc-500 dark:text-zinc-400"
            >
              还没有评论，来抢沙发吧！
            </motion.div>
          ) : (
            comments.slice().reverse().map((comment) => (
              <motion.div
                layout
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 p-4 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {comment.author.charAt(0)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                      {comment.author}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-zinc-400">
                        {format(comment.createdAt, 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
                      </span>
                      <button 
                        onClick={() => handleDelete(comment.id)}
                        className="text-zinc-400 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                        title="删除评论"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Delete Comment Modal */}
      {deletingCommentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-xl w-full max-w-sm border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-bold mb-2 text-red-600">删除评论</h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-4 text-sm">
              请输入管理员密码以删除此评论。
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="请输入密码"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setDeletingCommentId(null);
                  setPassword('');
                }}
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
    </div>
  );
}
