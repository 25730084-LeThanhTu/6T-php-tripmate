/**
 * DỮ LIỆU GIẢ bổ sung cho nhóm màn "Chia tiền" (19, 20).
 * Chi tiết giao dịch mà người trả đã khai báo khi bấm "Tôi đã chuyển tiền".
 */
export interface MockSettlementDetail {
  settlementId: number;
  method: string;
  /** Nội dung chuyển khoản */
  note: string;
  /** Biên nhận (chứng từ) người trả tải lên */
  proof?: {
    bank: string;
    reference: string;
  };
}

export const MOCK_SETTLEMENT_DETAILS: readonly MockSettlementDetail[] = [
  {
    settlementId: 1,
    method: 'Chuyển khoản',
    note: 'An tra tien Da Lat',
    proof: { bank: 'Vietcombank', reference: 'FT26321845902' },
  },
];

export function findSettlementDetail(settlementId: number): MockSettlementDetail | undefined {
  return MOCK_SETTLEMENT_DETAILS.find((d) => d.settlementId === settlementId);
}
