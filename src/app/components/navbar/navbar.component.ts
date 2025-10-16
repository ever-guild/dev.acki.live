import { Component, OnInit } from '@angular/core';
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
export class NavbarComponent implements OnInit {
  currentLang: Language = 'en';
  isDarkMode = true;

  constructor(
    public i18n: I18nService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.currentLang = this.i18n.getLanguage();
    this.isDarkMode = this.themeService.isDarkMode();
  }

  switchLanguage(lang: Language) {
    this.currentLang = lang;
    this.i18n.setLanguage(lang);
    // Force component re-render
    window.location.reload();
  }

  toggleTheme() {
    this.themeService.toggleTheme();
    this.isDarkMode = this.themeService.isDarkMode();
  }
}
