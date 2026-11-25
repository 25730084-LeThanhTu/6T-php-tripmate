/**
 * DỮ LIỆU GIẢ cho nhóm màn "Thành viên" (08 – 10).
 * Khi có API: thay bằng service gọi HttpClient.
 */
import type { MemberRole } from './mock-data';

export type InviteMethod = 'EMAIL' | 'USERNAME' | 'LINK';

export interface MockInvitation {
  id: number;
  tripId: string;
  /** Email hoặc username người được mời */
  target: string;
  role: MemberRole;
  sentLabel: string;
}

export interface MockInviteLink {
  tripId: string;
  url: string;
  expiresAt: string; // YYYY-MM-DD
}

/** Lời mời một người dùng cụ thể nhận được (màn 10) */
export interface MockReceivedInvitation {
  code: string;
  tripId: string;
  inviterUserId: string;
  role: MemberRole;
  message: string;
}

export const MOCK_PENDING_INVITATIONS: readonly MockInvitation[] = [
  {
    id: 1,
    tripId: 'da-lat',
    target: 'linh.nguyen@gmail.com',
    role: 'MEMBER',
    sentLabel: 'Đã gửi hôm nay',
  },
];

export const MOCK_INVITE_LINKS: readonly MockInviteLink[] = [
  { tripId: 'da-lat', url: 'tripmate.app/join/DALAT26', expiresAt: '2026-11-24' },
];

export const MOCK_RECEIVED_INVITATIONS: readonly MockReceivedInvitation[] = [
  {
    code: 'DALAT26',
    tripId: 'da-lat',
    inviterUserId: 'u-minh',
    role: 'MEMBER',
    message: 'Một chuyến đi đáng nhớ, còn thiếu bạn thôi.',
  },
];

export const INVITE_METHOD_LABEL: Record<InviteMethod, string> = {
  EMAIL: 'Email',
  USERNAME: 'Username',
  LINK: 'Liên kết',
};

export function pendingInvitations(tripId: string | null | undefined): MockInvitation[] {
  return MOCK_PENDING_INVITATIONS.filter((i) => i.tripId === tripId);
}

export function inviteLink(tripId: string | null | undefined): MockInviteLink {
  return MOCK_INVITE_LINKS.find((l) => l.tripId === tripId) ?? MOCK_INVITE_LINKS[0];
}

/** Mã không tồn tại -> trả lời mời mẫu để màn demo luôn có nội dung */
export function findReceivedInvitation(code: string | null | undefined): MockReceivedInvitation {
  return (
    MOCK_RECEIVED_INVITATIONS.find((i) => i.code.toLowerCase() === code?.toLowerCase()) ??
    MOCK_RECEIVED_INVITATIONS[0]
  );
}
