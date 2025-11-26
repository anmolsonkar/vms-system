import connectDB from '../db/mongoose';
import Notification from '../db/models/Notification';
import { NotificationData } from '../types/notification.types';
import { sendVisitorApprovalRequest, sendExitNotificationToGuard } from './whatsapp';

export async function createNotification(data: NotificationData): Promise<boolean> {
  try {
    await connectDB();

    const notification = await Notification.create(data);

    return !!notification;
  } catch (error) {
    console.error('Create notification error:', error);
    return false;
  }
}

export async function notifyResidentOfVisitor(
  residentUserId: string,
  propertyId: string,
  visitorId: string,
  visitorName: string,
  purpose: string
): Promise<void> {
  try {
    await createNotification({
      userId: residentUserId,
      propertyId: propertyId,
      type: 'visitor_request',
      title: 'New Visitor Request',
      message: `${visitorName} wants to visit you. Purpose: ${purpose}`,
      relatedVisitorId: visitorId,
      priority: 'high',
      actionUrl: `/resident/approvals`,
    });

    // Send WhatsApp notification (optional)
    // You can fetch resident phone and send WhatsApp here
  } catch (error) {
    console.error('Notify resident error:', error);
  }
}

export async function notifyGuardOfApproval(
  guardUserId: string,
  propertyId: string,
  visitorId: string,
  visitorName: string,
  residentName: string
): Promise<void> {
  try {
    await createNotification({
      userId: guardUserId,
      propertyId: propertyId,
      type: 'visitor_approved',
      title: 'Visitor Approved',
      message: `${visitorName} has been approved by ${residentName}. Allow entry.`,
      relatedVisitorId: visitorId,
      priority: 'high',
      actionUrl: `/guard/pending`,
    });
  } catch (error) {
    console.error('Notify guard error:', error);
  }
}

export async function notifyGuardOfExit(
  guardUserId: string,
  propertyId: string,
  visitorId: string,
  visitorName: string,
  residentName: string
): Promise<void> {
  try {
    await createNotification({
      userId: guardUserId,
      propertyId: propertyId,
      type: 'visitor_exit_marked',
      title: 'Visitor Exit Marked',
      message: `${residentName} marked ${visitorName} as exited. Verify at gate.`,
      relatedVisitorId: visitorId,
      priority: 'medium',
    });
  } catch (error) {
    console.error('Notify guard exit error:', error);
  }
}

export async function notifyVisitorOfApproval(
  propertyId: string,
  visitorId: string,
  visitorName: string,
  residentName: string
): Promise<void> {
  try {
    // This is informational - visitor doesn't have a user account
    // Send SMS/WhatsApp notification instead
    console.log(`Visitor ${visitorName} approved by ${residentName}`);
  } catch (error) {
    console.error('Notify visitor error:', error);
  }
}

export async function notifyVisitorOfRejection(
  propertyId: string,
  visitorId: string,
  visitorName: string,
  reason?: string
): Promise<void> {
  try {
    // Send SMS/WhatsApp to visitor about rejection
    console.log(`Visitor ${visitorName} rejected. Reason: ${reason}`);
  } catch (error) {
    console.error('Notify visitor rejection error:', error);
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    await connectDB();

    const result = await Notification.findByIdAndUpdate(
      notificationId,
      {
        isRead: true,
        readAt: new Date(),
      },
      { new: true }
    );

    return !!result;
  } catch (error) {
    console.error('Mark notification read error:', error);
    return false;
  }
}

export async function getUnreadCount(userId: string): Promise<number> {
  try {
    await connectDB();

    const count = await Notification.countDocuments({
      userId: userId,
      isRead: false,
    });

    return count;
  } catch (error) {
    console.error('Get unread count error:', error);
    return 0;
  }
}