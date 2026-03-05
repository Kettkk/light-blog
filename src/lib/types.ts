export interface ArticleComment {
  id: string;
  author: string;
  content: string;
  createdAt: number;
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  author: string;
  createdAt: number;
  tags: string[];
  comments?: ArticleComment[];
  isPinned?: boolean;
}

export interface Settings {
  theme: 'light' | 'dark';
}
