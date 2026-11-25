import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { VI_TRANSLATIONS } from './vi';
import { EN_TRANSLATIONS } from './en';

export type LanguageCode = 'vi' | 'en';

type TranslationRecord = Record<string, unknown>;

@Injectable({
  providedIn: 'root',
})
export class I18nService {
  private readonly http = inject(HttpClient);

  readonly currentLang = signal<LanguageCode>('vi');

  private readonly translations = signal<Record<LanguageCode, TranslationRecord>>({
    vi: VI_TRANSLATIONS,
    en: EN_TRANSLATIONS,
  });

  readonly activeTranslations = computed(() => {
    const lang = this.currentLang();
    return this.translations()[lang] ?? this.translations()['vi'];
  });

  setLanguage(lang: LanguageCode): void {
    if (this.currentLang() === lang) return;
    this.currentLang.set(lang);
    localStorage.setItem('tripmate_lang', lang);
  }

  t(key: string, params?: Record<string, string | number>): string {
    return this.translate(key, params);
  }

  translate(key: string, params?: Record<string, string | number>): string {
    const dict = this.activeTranslations();
    const val = this.getNestedValue(dict, key);

    if (typeof val !== 'string') {
      // Fallback sang tiếng Việt nếu ngôn ngữ hiện tại thiếu key
      const fallbackVal = this.getNestedValue(this.translations()['vi'], key);
      if (typeof fallbackVal === 'string') {
        return this.interpolate(fallbackVal, params);
      }
      return key;
    }

    return this.interpolate(val, params);
  }

  private getNestedValue(obj: unknown, path: string): unknown {
    if (!obj || typeof obj !== 'object') return undefined;
    const parts = path.split('.');
    let curr: any = obj;
    for (const part of parts) {
      if (curr == null || typeof curr !== 'object') return undefined;
      curr = curr[part];
    }
    return curr;
  }

  private interpolate(template: string, params?: Record<string, string | number>): string {
    if (!params) return template;
    return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
      return params[key] != null ? String(params[key]) : `{{${key}}}`;
    });
  }
}
