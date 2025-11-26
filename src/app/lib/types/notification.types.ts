export interface NotificationData {
  userId: string;
  propertyId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedVisitorId?: string;
  actionUrl?: string;
  priority?: 'low' | 'medium' | 'high';
}

export type NotificationType =
  | 'visitor_request'
  | 'visitor_approved'
  | 'visitor_rejected'
  | 'visitor_checked_in'
  | 'visitor_exit_marked'
  | 'visitor_at_gate'
  | 'system';

export interface NotificationFilters {
  userId?: string;
  propertyId?: string;
  isRead?: boolean;
  type?: NotificationType;
  priority?: 'low' | 'medium' | 'high';
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
}