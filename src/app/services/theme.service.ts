import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  isDark = signal<boolean>(true);

  constructor() {
    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isDark.set(savedTheme === 'dark');
    }
    
    // Apply theme whenever it changes
    effect(() => {
      this.applyTheme(this.isDark());
    });
  }

  initTheme() {
    // Theme is now initialized in constructor
    this.applyTheme(this.isDark());
  }

  toggleTheme() {
    const newValue = !this.isDark();
    this.isDark.set(newValue);
    localStorage.setItem('theme', newValue ? 'dark' : 'light');
  }

  private applyTheme(isDarkMode: boolean) {
    if (isDarkMode) {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    }
  }

  isDarkMode(): boolean {
    return this.isDark();
  }
}
