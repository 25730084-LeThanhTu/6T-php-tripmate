import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { photosOf } from '../../../core/mock/album.mock';
import { itineraryDays } from '../../../core/mock/itinerary.mock';
import { MOCK_TRIPS, findTrip, formatDateRange } from '../../../core/mock/mock-data';

interface SelectedPhoto {
  id: string;
  name: string;
  src: string;
  /** Ảnh chọn từ thiết bị (object URL, cần thu hồi khi bỏ) */
  objectUrl: boolean;
}

/** 3 ảnh mẫu đã chọn sẵn như Figma: Bình minh Đà Lạt, Cà phê bên đồi, Hội bạn cùng nhau */
const SAMPLE_TITLES = ['Bình minh Đà Lạt', 'Cà phê bên đồi', 'Hội bạn cùng nhau'];

/**
 * Màn 23 · Thêm ảnh
 * Figma: mobile 2:112 · desktop 46:1246
 */
@Component({
  selector: 'app-photo-upload',
  imports: [FormsModule],
  templateUrl: './photo-upload.html',
})
export default class PhotoUpload {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // TODO(API): lấy chuyến đi từ backend
  protected readonly trip = findTrip(this.route.snapshot.paramMap.get('tripId')) ?? MOCK_TRIPS[0];
  protected readonly dateRange = formatDateRange(this.trip.startDate, this.trip.endDate);
  protected readonly days = itineraryDays(this.trip);

  protected readonly selected = signal<SelectedPhoto[]>(
    SAMPLE_TITLES.flatMap((title) => {
      const photo = photosOf('da-lat').find((p) => p.title === title);
      return photo
        ? [{ id: `sample-${photo.id}`, name: photo.title, src: photo.src, objectUrl: false }]
        : [];
    }),
  );
  protected readonly count = computed(() => this.selected().length);

  protected takenDate = this.days[1]?.date ?? this.days[0]?.date ?? '';
  protected message = 'Những ngày thanh xuân ở Đà Lạt 🌿';

  protected readonly dragging = signal(false);
  protected readonly uploading = signal(false);

  private nextId = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.selected().forEach((p) => this.revoke(p)));
  }

  protected onFilesPicked(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.addFiles(input.files);
    input.value = '';
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(true);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    this.addFiles(event.dataTransfer?.files ?? null);
  }

  protected remove(photo: SelectedPhoto): void {
    this.revoke(photo);
    this.selected.update((list) => list.filter((p) => p.id !== photo.id));
  }

  protected upload(): void {
    if (!this.count() || this.uploading()) return;
    // TODO(API): tải ảnh lên kèm ngày chụp (takenDate) và lời nhắn (message)
    this.uploading.set(true);
    this.router.navigate(['/trips', this.trip.id, 'album']);
  }

  private addFiles(files: FileList | null): void {
    if (!files) return;
    const added = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .map((f) => ({
        id: `file-${this.nextId++}`,
        name: f.name,
        src: URL.createObjectURL(f),
        objectUrl: true,
      }));
    if (added.length) this.selected.update((list) => [...list, ...added]);
  }

  private revoke(photo: SelectedPhoto): void {
    if (photo.objectUrl) URL.revokeObjectURL(photo.src);
  }
}
