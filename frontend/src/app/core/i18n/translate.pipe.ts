import { Pipe, PipeTransform, inject } from '@angular/core';
import { I18nService } from './i18n.service';

/**
 * Pipe dịch đa ngôn ngữ i18n
 * Sử dụng:
 *   {{ 'brand.tagline' | translate }}
 *   {{ 'trips.spent' | translate: { amount: formatVnd(100000) } }}
 */
@Pipe({
  name: 'translate',
  standalone: true,
  pure: false, // Để tự động cập nhật khi đổi ngôn ngữ qua Signal
})
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(I18nService);

  transform(key: string, params?: Record<string, string | number>): string {
    if (!key) return '';
    return this.i18n.translate(key, params);
  }
}
