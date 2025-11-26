// Visitor status constants
export const VISITOR_STATUS_LABELS = {
  pending: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  checked_in: 'Checked In',
  checked_out: 'Checked Out',
};

export const VISITOR_STATUS_COLORS = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  checked_in: 'info',
  checked_out: 'default',
} as const;