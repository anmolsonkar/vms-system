import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db/mongoose";
import Visitor from "@/app/lib/db/models/Visitor";
import User from "@/app/lib/db/models/User";
import Property from "@/app/lib/db/models/Property";
import { authMiddleware } from "@/app/lib/auth/middleware";
import { notifyGuardOfApproval } from "@/app/lib/utils/notification";
import {
  sendVisitorApprovedWhatsApp,
  notifyGuardWhatsApp,
} from "@/app/lib/utils/twilio-whatsapp";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { user, error } = await authMiddleware(request, "resident");
    if (error) return error;

    await connectDB();

    const body = await request.json();
    const { visitorId } = body;

    if (!visitorId) {
      return NextResponse.json(
        { success: false, error: "Visitor ID is required" },
        { status: 400 }
      );
    }

    const userId = user!.id;
    console.log("🔍 Resident approving visitor:", { userId, visitorId });

    // Get visitor
    const visitor = await Visitor.findById(visitorId);
    if (!visitor) {
      return NextResponse.json(
        { success: false, error: "Visitor not found" },
        { status: 404 }
      );
    }

    // Verify visitor belongs to this resident (compare with user ID directly)
    if (visitor.hostResidentId.toString() !== userId) {
      console.log("❌ Unauthorized:", {
        visitorHostId: visitor.hostResidentId.toString(),
        currentUserId: userId,
      });
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized - This visitor is not assigned to you",
        },
        { status: 403 }
      );
    }

    // Check if already processed
    if (visitor.status !== "pending") {
      return NextResponse.json(
        { success: false, error: `Visitor already ${visitor.status}` },
        { status: 400 }
      );
    }

    // Get resident details from User collection
    const residentUser = await User.findOne({
      _id: userId,
      role: "resident",
      isActive: true,
    });

    if (!residentUser) {
      return NextResponse.json(
        { success: false, error: "Resident user not found" },
        { status: 404 }
      );
    }

    // Update visitor status
    visitor.status = "approved";
    visitor.approvedBy = userId as any;
    visitor.approvedAt = new Date();
    await visitor.save();

    console.log("✅ Visitor approved successfully:", visitorId);

    // ========================================================================
    // SEND WHATSAPP NOTIFICATION TO VISITOR
    // ========================================================================
    if (visitor.phone) {
      try {
        // Get property name for WhatsApp message
        let propertyName = "Your Property";
        try {
          const property = await Property.findById(user!.propertyId);
          if (property) {
            propertyName = property.name;
          }
        } catch (propError) {
          console.error("⚠️ Property fetch failed:", propError);
        }

        // Send WhatsApp to visitor
        const whatsappResult = await sendVisitorApprovedWhatsApp(
          visitor.phone,
          visitor.name,
          residentUser.fullName || residentUser.email,
          residentUser.unitNumber || "N/A",
          propertyName
        );

        if (whatsappResult) {
          console.log("✅ WhatsApp approval sent to visitor:", visitor.phone);
        } else {
          console.log("⚠️ WhatsApp send failed (non-critical)");
        }
      } catch (whatsappError) {
        console.error("⚠️ WhatsApp send error (non-critical):", whatsappError);
        // Don't fail the entire request if WhatsApp fails
      }
    }

    // ========================================================================
    // NOTIFY GUARDS (IN-APP + WHATSAPP)
    // ========================================================================
    try {
      // Get all guards at this property
      const guards = await User.find({
        role: "guard",
        propertyId: user!.propertyId,
        isActive: true,
      });

      console.log(`📢 Notifying ${guards.length} guards`);

      // Notify all guards
      for (const guard of guards) {
        try {
          // In-app notification
          await notifyGuardOfApproval(
            guard._id.toString(),
            user!.propertyId!,
            visitor._id.toString(),
            visitor.name,
            residentUser.fullName || residentUser.email
          );

          // WhatsApp notification (if guard has phone)
          if (guard.phoneNumber) {
            try {
              await notifyGuardWhatsApp(
                guard.phoneNumber,
                visitor.name,
                residentUser.fullName || residentUser.email,
                residentUser.unitNumber || "N/A"
              );
              console.log("✅ WhatsApp sent to guard:", guard.phoneNumber);
            } catch (guardWhatsAppError) {
              console.error(
                "⚠️ Guard WhatsApp failed (non-critical):",
                guardWhatsAppError
              );
            }
          }
        } catch (notificationError) {
          console.error("Guard notification error:", notificationError);
        }
      }
    } catch (guardsError) {
      console.error("⚠️ Guards notification failed:", guardsError);
      // Don't fail the request if guard notifications fail
    }

    return NextResponse.json(
      {
        success: true,
        message: "Visitor approved successfully",
        data: {
          visitorId: visitor._id.toString(),
          status: visitor.status,
          visitorName: visitor.name,
          approvedBy: residentUser.fullName || residentUser.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Approve visitor error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
