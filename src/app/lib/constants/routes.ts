// Route constants
export const ROUTES = {
  LOGIN: "/login",
  SUPERADMIN: {
    DASHBOARD: "/superadmin",
    USERS: "/superadmin/users",
    PROPERTIES: "/superadmin/properties",
  },
  RESIDENT: {
    DASHBOARD: "/resident",
    APPROVALS: "/resident/approvals",
    HISTORY: "/resident/history",
    NOTIFICATIONS: "/resident/notifications",
  },
  GUARD: {
    DASHBOARD: "/guard",
    PENDING: "/guard/pending",
    ACTIVE_VISITORS: "/guard/active-visitors",
    MANUAL_ENTRY: "/guard/manual-entry",
    HISTORY: "/guard/history",
  },
  VISITOR: {
    REGISTER: "/visitor/register",
  },
};

export function getRoleHomeRoute(role: string): string {
  switch (role) {
    case "superadmin":
      return ROUTES.SUPERADMIN.DASHBOARD;
    case "resident":
      return ROUTES.RESIDENT.DASHBOARD;
    case "guard":
      return ROUTES.GUARD.DASHBOARD;
    default:
      return ROUTES.LOGIN;
  }
}

// Status labels and colors
export const VISITOR_STATUS_LABELS = {
  pending: "Pending Approval",
  approved: "Approved",
  rejected: "Rejected",
  checked_in: "Checked In",
  checked_out: "Checked Out",
};

export const VISITOR_STATUS_COLORS = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
  checked_in: "info",
  checked_out: "default",
};

// Property types
export const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment Complex" },
  { value: "warehouse", label: "Warehouse" },
  { value: "rwa", label: "RWA/Society" },
];

// User roles
export const USER_ROLES = [
  { value: "resident", label: "Resident" },
  { value: "guard", label: "Security Guard" },
];
