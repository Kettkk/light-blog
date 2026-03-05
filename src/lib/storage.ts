import { Article, Settings, ArticleComment } from './types';

const STORAGE_KEY_ARTICLES = 'zenith_articles';
const STORAGE_KEY_SETTINGS = 'zenith_settings';

export class StorageService {
  private static instance: StorageService;

  private constructor() {}

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  public getArticles(): Article[] {
    const data = localStorage.getItem(STORAGE_KEY_ARTICLES);
    const articles: Article[] = data ? JSON.parse(data) : [];
    
    // Sort pinned articles first, then by date
    return articles.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.createdAt - a.createdAt;
    });
  }

  public getArticle(id: string): Article | undefined {
    const articles = this.getArticles();
    return articles.find((a) => a.id === id);
  }

  public saveArticle(article: Article): void {
    const articles = this.getArticles();
    const index = articles.findIndex((a) => a.id === article.id);
    if (index >= 0) {
      // Preserve existing properties like isPinned if not provided in the update
      articles[index] = { ...articles[index], ...article };
    } else {
      articles.unshift(article);
    }
    localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(articles));
  }

  public togglePin(id: string): void {
    const articles = this.getArticles();
    const index = articles.findIndex((a) => a.id === id);
    if (index >= 0) {
      articles[index].isPinned = !articles[index].isPinned;
      localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(articles));
    }
  }

  public deleteArticle(id: string): void {
    const articles = this.getArticles().filter((a) => a.id !== id);
    localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(articles));
  }

  public addComment(articleId: string, comment: ArticleComment): void {
    const articles = this.getArticles();
    const articleIndex = articles.findIndex((a) => a.id === articleId);
    
    if (articleIndex >= 0) {
      const article = articles[articleIndex];
      if (!article.comments) {
        article.comments = [];
      }
      article.comments.push(comment);
      articles[articleIndex] = article;
      localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(articles));
    }
  }

  public deleteComment(articleId: string, commentId: string): void {
    const articles = this.getArticles();
    const articleIndex = articles.findIndex((a) => a.id === articleId);

    if (articleIndex >= 0) {
      const article = articles[articleIndex];
      if (article.comments) {
        article.comments = article.comments.filter((c) => c.id !== commentId);
        articles[articleIndex] = article;
        localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(articles));
      }
    }
  }

  public getSettings(): Settings {
    const data = localStorage.getItem(STORAGE_KEY_SETTINGS);
    return data ? JSON.parse(data) : { theme: 'light' };
  }

  public saveSettings(settings: Settings): void {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }
}
