export function getUserName(): string {
  const STORAGE_KEY_USERNAME = 'zenith_username';
  let username = localStorage.getItem(STORAGE_KEY_USERNAME);
  
  if (!username) {
    const adjectives = ['快乐', '聪明', '勇敢', '神秘', '友善', '好奇', '安静', '活泼'];
    const animals = ['熊猫', '老虎', '兔子', '狐狸', '考拉', '企鹅', '海豚', '猫咪'];
    
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
    const randomNumber = Math.floor(Math.random() * 1000);
    
    username = `${randomAdjective}的${randomAnimal}#${randomNumber}`;
    localStorage.setItem(STORAGE_KEY_USERNAME, username);
  }
  
  return username;
}

export function stripMarkdown(markdown: string): string {
  if (!markdown) return '';
  
  // Replace images with [图片]
  let text = markdown.replace(/!\[.*?\]\(.*?\)/g, '[图片]');
  
  // Remove headers
  text = text.replace(/^#+\s+/gm, '');
  
  // Remove bold/italic
  text = text.replace(/(\*\*|__)(.*?)\1/g, '$2');
  text = text.replace(/(\*|_)(.*?)\1/g, '$2');
  
  // Remove links but keep text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  
  // Remove code blocks
  text = text.replace(/```[\s\S]*?```/g, '[代码]');
  text = text.replace(/`([^`]+)`/g, '$1');
  
  // Remove blockquotes
  text = text.replace(/^>\s+/gm, '');
  
  // Remove lists
  text = text.replace(/^[\*\-\+]\s+/gm, '');
  text = text.replace(/^\d+\.\s+/gm, '');
  
  return text.trim();
}
