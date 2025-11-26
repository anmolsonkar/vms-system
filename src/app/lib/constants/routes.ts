export const AUTH_ROUTES = {
  LOGIN: '/login',
  LOGOUT: '/api/auth/logout',
} as const;

export const DASHBOARD_ROUTES = {
  SUPERADMIN: {
    HOME: '/superadmin',
    USERS: '/superadmin/users',
    PROPERTIES: '/superadmin/properties',
    ANALYTICS: '/superadmin/analytics',
    AUDIT_LOGS: '/superadmin/audit-logs',
  },
  RESIDENT: {
    HOME: '/resident',
    APPROVALS: '/resident/approvals',
    HISTORY: '/resident/history',
    NOTIFICATIONS: '/resident/notifications',
  },
  GUARD: {
    HOME: '/guard',
    PENDING: '/guard/pending',
    ACTIVE_VISITORS: '/guard/active-visitors',
    MANUAL_ENTRY: '/guard/manual-entry',
    HISTORY: '/guard/history',
  },
} as const;

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    VERIFY: '/api/auth/verify',
  },
  VISITOR: {
    REGISTER: '/api/visitor/register',
    SEND_OTP: '/api/visitor/send-otp',
    VERIFY_OTP: '/api/visitor/verify-otp',
    UPLOAD_PHOTO: '/api/visitor/upload/photo',
    UPLOAD_ID: '/api/visitor/upload/id-card',
  },
  RESIDENT: {
    PENDING_VISITORS: '/api/resident/visitors/pending',
    APPROVE: '/api/resident/visitors/approve',
    REJECT: '/api/resident/visitors/reject',
    MARK_EXIT: '/api/resident/visitors/mark-exit',
    HISTORY: '/api/resident/visitors/history',
    NOTIFICATIONS: '/api/resident/notifications/list',
    UNREAD_COUNT: '/api/resident/notifications/unread-count',
    MARK_READ: '/api/resident/notifications/mark-read',
  },
  GUARD: {
    PENDING_APPROVAL: '/api/guard/visitors/pending-approval',
    APPROVED: '/api/guard/visitors/approved',
    CHECK_IN: '/api/guard/visitors/check-in',
    ACTIVE: '/api/guard/visitors/active',
    HISTORY: '/api/guard/visitors/history',
    MANUAL_ENTRY: '/api/guard/manual-entry',
  },
  SUPERADMIN: {
    CREATE_USER: '/api/superadmin/users/create',
    LIST_USERS: '/api/superadmin/users/list',
    UPDATE_USER: '/api/superadmin/users/update',
    DELETE_USER: '/api/superadmin/users/delete',
    CREATE_PROPERTY: '/api/superadmin/properties/create',
    LIST_PROPERTIES: '/api/superadmin/properties/list',
    ANALYTICS: '/api/superadmin/analytics',
    AUDIT_LOGS: '/api/superadmin/audit-logs',
  },
  NOTIFICATIONS: {
    POLL: '/api/notifications/poll',
  },
  QR: {
    GENERATE: '/api/qr/generate',
  },
} as const;

export function getRoleHomeRoute(role: string): string {
  switch (role) {
    case 'superadmin':
      return DASHBOARD_ROUTES.SUPERADMIN.HOME;
    case 'resident':
      return DASHBOARD_ROUTES.RESIDENT.HOME;
    case 'guard':
      return DASHBOARD_ROUTES.GUARD.HOME;
    default:
      return AUTH_ROUTES.LOGIN;
  }
}