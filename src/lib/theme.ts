import { StorageService } from './storage';

export class ThemeService {
  private static instance: ThemeService;
  private storage: StorageService;

  private constructor() {
    this.storage = StorageService.getInstance();
  }

  public static getInstance(): ThemeService {
    if (!ThemeService.instance) {
      ThemeService.instance = new ThemeService();
    }
    return ThemeService.instance;
  }

  public applyTheme(): void {
    const settings = this.storage.getSettings();
    const theme = settings.theme;

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  public toggleTheme(): void {
    const currentSettings = this.storage.getSettings();
    const newTheme = currentSettings.theme === 'dark' ? 'light' : 'dark';

    this.storage.saveSettings({ ...currentSettings, theme: newTheme });
    this.applyTheme();
  }

  public getTheme(): 'light' | 'dark' {
      return this.storage.getSettings().theme as 'light' | 'dark';
  }
}
