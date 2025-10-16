import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { I18nService, Language } from '../../services/i18n.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  currentLang = computed(() => this.i18n.currentLang());
  isDarkMode = computed(() => this.themeService.isDark());

  constructor(
    public i18n: I18nService,
    private themeService: ThemeService
  ) {}

  switchLanguage(lang: Language) {
    this.i18n.setLanguage(lang);
    // Force component re-render
    window.location.reload();
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
