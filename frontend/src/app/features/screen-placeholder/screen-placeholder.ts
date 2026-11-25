import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

import { FigmaScreen, figmaNodeUrl } from '../../core/figma/figma-screens';

/**
 * Trang tạm cho các màn chưa được dựng.
 * Hiển thị tên màn và liên kết tới đúng frame trong Figma để đối chiếu khi code.
 */
@Component({
  selector: 'app-screen-placeholder',
  template: `
    @if (screen(); as s) {
      <section class="flex flex-col gap-5 rounded-card bg-surface p-[18px] lg:p-6">
        <span
          class="self-start rounded-card bg-primary-soft px-2.5 py-1.5 text-[11px] font-bold text-primary lg:text-[13px]"
        >
          MÀN {{ s.no }} · ĐANG XÂY DỰNG
        </span>
        <h1 class="text-[28px] font-bold text-ink lg:text-[32px]">{{ s.title }}</h1>
        <p class="text-[13px] text-muted lg:text-[15px]">
          Giao diện màn này sẽ được dựng theo thiết kế Figma. Mở frame để đối chiếu:
        </p>
        <div class="flex flex-wrap gap-3">
          <a
            [href]="links().mobile"
            target="_blank"
            rel="noopener"
            class="rounded-button bg-primary px-[18px] py-[15px] text-[15px] font-bold text-white"
          >
            Figma · Mobile ({{ s.figma.mobile }})
          </a>
          <a
            [href]="links().desktop"
            target="_blank"
            rel="noopener"
            class="rounded-button bg-primary-soft px-[18px] py-[15px] text-[15px] font-bold text-primary"
          >
            Figma · Desktop ({{ s.figma.desktop }})
          </a>
        </div>
      </section>
    }
  `,
})
export class ScreenPlaceholder {
  private readonly route = inject(ActivatedRoute);

  protected readonly screen = toSignal(
    this.route.data.pipe(map((data) => data['screen'] as FigmaScreen | undefined)),
  );

  protected readonly links = computed(() => {
    const s = this.screen();
    return {
      mobile: s ? figmaNodeUrl(s.figma.mobile) : '',
      desktop: s ? figmaNodeUrl(s.figma.desktop) : '',
    };
  });
}
