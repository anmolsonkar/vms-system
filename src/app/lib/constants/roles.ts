export const ROLES = {
  SUPERADMIN: 'superadmin',
  RESIDENT: 'resident',
  GUARD: 'guard',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const ROLE_PERMISSIONS = {
  [ROLES.SUPERADMIN]: [
    'manage_users',
    'manage_properties',
    'view_analytics',
    'view_audit_logs',
    'manage_system',
  ],
  [ROLES.RESIDENT]: [
    'approve_visitors',
    'reject_visitors',
    'view_visitor_history',
    'mark_visitor_exit',
    'view_notifications',
  ],
  [ROLES.GUARD]: [
    'view_approved_visitors',
    'check_in_visitors',
    'view_active_visitors',
    'create_manual_entry',
    'send_approval_request',
    'view_notifications',
  ],
};

export function hasPermission(role: Role, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}