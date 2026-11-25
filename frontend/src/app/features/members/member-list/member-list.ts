import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';

import {
  MOCK_CURRENT_USER,
  MOCK_MEMBERS,
  MOCK_TRIPS,
  MemberRole,
  ROLE_LABEL,
  findTrip,
  findUser,
  formatDateRange,
} from '../../../core/mock/mock-data';
import { MockInvitation, pendingInvitations } from '../../../core/mock/members.mock';

interface MemberRow {
  memberId: number;
  fullName: string;
  username: string;
  role: MemberRole;
  isMe: boolean;
}

/** Vai trò có thể đổi qua menu "Đổi vai trò" (chuyển trưởng nhóm không làm ở đây) */
const CHANGEABLE_ROLES: readonly MemberRole[] = ['CO_LEADER', 'MEMBER'];

/**
 * Màn 08 · Thành viên
 * Figma: mobile 2:37 · desktop 46:271
 */
@Component({
  selector: 'app-member-list',
  imports: [RouterLink, NgTemplateOutlet],
  templateUrl: './member-list.html',
  host: {
    class: 'flex flex-col',
    '(document:click)': 'closeMenu()',
    '(document:keydown.escape)': 'closeMenu()',
  },
})
export default class MemberList {
  private readonly route = inject(ActivatedRoute);

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

  protected readonly roleLabel = ROLE_LABEL;
  protected readonly changeableRoles = CHANGEABLE_ROLES;

  protected readonly members = signal<MemberRow[]>(
    MOCK_MEMBERS.filter((m) => m.tripId === 'da-lat').map((m) => {
      const user = findUser(m.userId);
      return {
        memberId: m.id,
        fullName: user?.fullName ?? '',
        username: user?.username ?? '',
        role: m.role,
        isMe: m.userId === MOCK_CURRENT_USER.id,
      };
    }),
  );
  protected readonly invitations = signal<MockInvitation[]>(pendingInvitations('da-lat'));

  protected readonly myRole = computed(() => this.members().find((m) => m.isMe)?.role ?? 'MEMBER');
  protected readonly canManage = computed(() => this.myRole() === 'LEADER');
  protected readonly summary = computed(() => {
    const invites = this.invitations().length;
    const base = `${this.members().length} thành viên`;
    return invites ? `${base}  ·  ${invites} lời mời đang chờ` : base;
  });

  /** Menu đổi vai trò đang mở: `${layout}-${memberId}` */
  protected readonly openMenu = signal<string | null>(null);

  protected inviteLink(): string[] {
    return ['/trips', this.tripId() || this.trip().id, 'members', 'invite'];
  }

  protected toggleMenu(key: string, event: Event): void {
    event.stopPropagation();
    this.openMenu.update((current) => (current === key ? null : key));
  }

  protected closeMenu(): void {
    this.openMenu.set(null);
  }

  protected changeRole(memberId: number, role: MemberRole): void {
    this.members.update((rows) => rows.map((r) => (r.memberId === memberId ? { ...r, role } : r)));
    this.closeMenu();
  }

  protected revoke(id: number): void {
    this.invitations.update((list) => list.filter((i) => i.id !== id));
  }
}
