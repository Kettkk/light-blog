import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../lib/storage';
import { Article } from '../lib/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Save, Bold, Italic, Code, Quote, Image as ImageIcon, X, Upload } from 'lucide-react';
import { clsx } from 'clsx';
import { Modal } from '../components/Modal';

export default function Editor() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [author, setAuthor] = useState('Admin');
  const [tags, setTags] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');

  const handleSave = () => {
    if (!title || !content) {
      alert('标题和内容是必填项');
      return;
    }
    setShowPasswordModal(true);
  };

  const confirmSave = () => {
    if (password !== '270110') {
      alert('密码错误');
      return;
    }

    const newArticle: Article = {
      id: Date.now().toString(),
      title,
      excerpt: excerpt || content.slice(0, 150) + '...',
      content,
      coverImage,
      author,
      createdAt: Date.now(),
      tags: tags.split(/[,，]/).map(t => t.trim()).filter(Boolean)
    };

    try {
      StorageService.getInstance().saveArticle(newArticle);
      navigate('/');
    } catch (error) {
      alert('保存文章失败。');
      console.error(error);
    }
  };

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    const newText = before + prefix + selection + suffix + after;
    setContent(newText);
    
    // Reset focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isCover: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('文件过大。请使用小于 5MB 的图片。');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      const imageUrl = data.url;

      if (isCover) {
        setCoverImage(imageUrl);
      } else {
        insertMarkdown(`![图片](${imageUrl})`);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('图片上传失败');
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">新文章</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-sm font-medium"
          >
            {isPreview ? '编辑' : '预览'}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors text-sm font-medium flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            发布
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Metadata Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
          <input
            type="text"
            placeholder="文章标题"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            placeholder="作者姓名"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          
          <div className="flex gap-2 items-center w-full">
            <input
              type="text"
              placeholder="封面图片 URL (可选)"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <label className="cursor-pointer p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors border border-zinc-200 dark:border-zinc-700" title="上传封面图片">
              <Upload className="w-5 h-5 text-zinc-500" />
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, true)} />
            </label>
          </div>

          <input
            type="text"
            placeholder="标签 (用逗号分隔)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            placeholder="摘要 (可选)"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 md:col-span-2"
          />
        </div>

        {/* Editor Toolbar */}
        {!isPreview && (
          <div className="flex items-center gap-2 p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700 shrink-0 overflow-x-auto">
            <button onClick={() => insertMarkdown('**', '**')} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded" title="加粗">
              <Bold className="w-4 h-4" />
            </button>
            <button onClick={() => insertMarkdown('*', '*')} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded" title="斜体">
              <Italic className="w-4 h-4" />
            </button>
            <button onClick={() => insertMarkdown('> ')} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded" title="引用">
              <Quote className="w-4 h-4" />
            </button>
            <button onClick={() => insertMarkdown('```\n', '\n```')} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded" title="代码块">
              <Code className="w-4 h-4" />
            </button>
            <button onClick={() => insertMarkdown('![图片描述](', ')')} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded" title="图片 URL">
              <ImageIcon className="w-4 h-4" />
            </button>
            <label className="cursor-pointer p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded" title="上传图片">
              <Upload className="w-4 h-4" />
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, false)} />
            </label>
          </div>
        )}

        {/* Editor / Preview Area */}
        <div className="flex-1 relative rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden bg-white dark:bg-zinc-800">
          {isPreview ? (
            <div className="absolute inset-0 p-6 overflow-y-auto prose prose-zinc dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          ) : (
            <textarea
              id="content-editor"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="在这里写下你的故事... (支持 Markdown)"
              className="w-full h-full p-6 bg-transparent resize-none focus:outline-none font-mono text-sm leading-relaxed"
            />
          )}
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-xl w-full max-w-sm border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-bold mb-4">请输入发布密码</h3>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="密码"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmSave}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                确认发布
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
