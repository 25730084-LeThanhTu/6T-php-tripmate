import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';

import {
  MOCK_TRIPS,
  MemberRole,
  ROLE_LABEL,
  findTrip,
  formatDate,
  formatDateRange,
} from '../../../core/mock/mock-data';
import {
  INVITE_METHOD_LABEL,
  InviteMethod,
  MockInvitation,
  inviteLink,
  pendingInvitations,
} from '../../../core/mock/members.mock';

type DialogKind = 'sent' | 'link';

/**
 * Màn 09 · Mời thành viên
 * Figma: mobile 2:42 · desktop 46:336
 * Prototype: Gửi lời mời 67:1955 / 67:2084 · Liên kết mời 67:1962 / 67:2091
 */
@Component({
  selector: 'app-member-invite',
  imports: [ReactiveFormsModule],
  templateUrl: './member-invite.html',
  host: {
    class: 'flex flex-col',
    '(document:keydown.escape)': 'closeDialog()',
  },
})
export default class MemberInvite {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly tripId = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('tripId') ?? '')),
    {
      initialValue: this.route.snapshot.paramMap.get('tripId') ?? '',
    },
  );
  protected readonly trip = computed(() => findTrip(this.tripId()) ?? MOCK_TRIPS[0]);
  protected readonly tripSubtitle = computed(() => {
    const t = this.trip();
    return `${t.title}  ·  ${formatDateRange(t.startDate, t.endDate)}`;
  });

  protected readonly link = computed(() => inviteLink(this.trip().id));
  protected readonly linkExpires = computed(() => formatDate(this.link().expiresAt));

  protected readonly methods: readonly InviteMethod[] = ['EMAIL', 'USERNAME', 'LINK'];
  protected readonly methodLabel = INVITE_METHOD_LABEL;
  protected readonly method = signal<InviteMethod>('EMAIL');

  protected readonly roles: readonly MemberRole[] = ['MEMBER', 'CO_LEADER'];
  protected readonly roleLabel = ROLE_LABEL;

  protected readonly email = new FormControl('linh.nguyen@gmail.com', {
    nonNullable: true,
    validators: [Validators.required, Validators.email],
  });
  protected readonly username = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(/^@?[a-z0-9._]{3,}$/i)],
  });
  protected readonly role = new FormControl<MemberRole>('MEMBER', { nonNullable: true });

  protected readonly showErrors = signal(false);
  protected readonly invitations = signal<MockInvitation[]>(pendingInvitations('da-lat'));
  protected readonly dialog = signal<DialogKind | null>(null);
  protected readonly lastTarget = signal('');
  protected readonly copied = signal(false);

  protected selectMethod(method: InviteMethod): void {
    this.method.set(method);
    this.showErrors.set(false);
  }

  protected send(): void {
    if (this.method() === 'LINK') {
      void this.copyLink();
      return;
    }
    const control = this.method() === 'EMAIL' ? this.email : this.username;
    if (control.invalid) {
      this.showErrors.set(true);
      control.markAsTouched();
      return;
    }
    const raw = control.value.trim();
    const target = this.method() === 'USERNAME' ? `@${raw.replace(/^@/, '')}` : raw;
    this.invitations.update((list) =>
      list.some((i) => i.target === target)
        ? list
        : [
            ...list,
            {
              id: Date.now(),
              tripId: this.trip().id,
              target,
              role: this.role.value,
              sentLabel: 'Đã gửi hôm nay',
            },
          ],
    );
    this.lastTarget.set(target);
    this.showErrors.set(false);
    this.dialog.set('sent');
  }

  protected async copyLink(): Promise<void> {
    try {
      await navigator.clipboard?.writeText(`https://${this.link().url}`);
      this.copied.set(true);
    } catch {
      this.copied.set(false);
    }
    this.dialog.set('link');
  }

  protected revoke(id: number): void {
    this.invitations.update((list) => list.filter((i) => i.id !== id));
  }

  protected closeDialog(): void {
    this.dialog.set(null);
  }

  protected backToMembers(): void {
    this.closeDialog();
    void this.router.navigate(['/trips', this.tripId() || this.trip().id, 'members']);
  }
}
