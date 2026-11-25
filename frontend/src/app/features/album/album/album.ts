import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { MockPhoto, photoCaption, photosOf } from '../../../core/mock/album.mock';
import { itineraryDays } from '../../../core/mock/itinerary.mock';
import { MOCK_TRIPS, findTrip, formatDateRange } from '../../../core/mock/mock-data';

interface PhotoGroup {
  date: string;
  /** "Ngày 1" */
  label: string;
  /** "Ngày 1 · 16/11" */
  heading: string;
  photos: MockPhoto[];
}

/**
 * Màn 22 · Album chuyến đi
 * Figma: mobile 2:107 · desktop 46:1181
 * Bộ lọc ngày: "Filter · Mobile · album" (67:2608) / "Filter · Desktop · album" (67:3244)
 * Xem ảnh: prototype 67:3490/67:3498/67:3506 (mobile) · 67:3529/67:3537/67:3545/67:3571 (desktop)
 */
@Component({
  selector: 'app-album',
  imports: [RouterLink],
  templateUrl: './album.html',
  host: { '(document:keydown.escape)': 'closeViewer()' },
})
export default class Album {
  private readonly route = inject(ActivatedRoute);

  // TODO(API): lấy chuyến đi + ảnh từ backend
  protected readonly trip = findTrip(this.route.snapshot.paramMap.get('tripId')) ?? MOCK_TRIPS[0];
  protected readonly dateRange = formatDateRange(this.trip.startDate, this.trip.endDate);
  protected readonly caption = photoCaption;

  /** Ảnh nhóm theo ngày chụp (chỉ các ngày có ảnh) */
  protected readonly groups: PhotoGroup[] = (() => {
    const photos = photosOf(this.trip.id);
    return itineraryDays(this.trip)
      .map((day) => ({
        date: day.date,
        label: `Ngày ${day.index}`,
        heading: `Ngày ${day.index} · ${day.chipLabel.split(' · ')[0]}`,
        photos: photos.filter((p) => p.takenDate === day.date),
      }))
      .filter((g) => g.photos.length > 0);
  })();

  /** Bộ lọc: null = Tất cả, hoặc ngày YYYY-MM-DD */
  protected readonly filter = signal<string | null>(null);

  protected readonly visibleGroups = computed(() => {
    const f = this.filter();
    return f ? this.groups.filter((g) => g.date === f) : this.groups;
  });

  protected readonly totalPhotos = this.groups.reduce((n, g) => n + g.photos.length, 0);

  /** Ảnh đang xem trong lớp phủ */
  protected readonly viewing = signal<MockPhoto | null>(null);

  protected openViewer(photo: MockPhoto): void {
    this.viewing.set(photo);
  }

  protected closeViewer(): void {
    this.viewing.set(null);
  }
}
