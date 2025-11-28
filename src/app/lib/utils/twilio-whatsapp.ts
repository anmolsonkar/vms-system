// // =============================================================================
// // TWILIO WHATSAPP INTEGRATION - WITH INTERACTIVE BUTTONS
// // File: src/app/lib/utils/twilio-whatsapp.ts
// // =============================================================================

// interface TwilioWhatsAppConfig {
//   accountSid: string;
//   authToken: string;
//   whatsappNumber: string; // whatsapp:+14155238886 (Twilio Sandbox)
// }

// const config: TwilioWhatsAppConfig = {
//   accountSid: process.env.TWILIO_ACCOUNT_SID || "",
//   authToken: process.env.TWILIO_AUTH_TOKEN || "",
//   whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886",
// };

// // =============================================================================
// // HELPER: Format phone number for WhatsApp
// // =============================================================================
// function formatWhatsAppNumber(phone: string): string {
//   // Remove all non-numeric characters
//   const cleaned = phone.replace(/\D/g, "");

//   // If already has country code (starts with 91 and is 12 digits)
//   if (cleaned.startsWith("91") && cleaned.length === 12) {
//     return `whatsapp:+${cleaned}`;
//   }

//   // If 10 digits, assume India and add 91
//   if (cleaned.length === 10) {
//     return `whatsapp:+91${cleaned}`;
//   }

//   // If 11+ digits, assume it already has country code
//   if (cleaned.length >= 11) {
//     return `whatsapp:+${cleaned}`;
//   }

//   // Default: assume India
//   return `whatsapp:+91${cleaned}`;
// }

// // =============================================================================
// // 1. SEND VISITOR APPROVAL REQUEST WITH INTERACTIVE BUTTONS
// // =============================================================================

// export async function sendVisitorApprovalWhatsApp(
//   residentPhone: string,
//   visitorData: {
//     visitorId: string;
//     visitorName: string;
//     visitorPhone: string;
//     purpose: string;
//     unitNumber: string;
//     propertyName: string;
//   }
// ): Promise<{ success: boolean; error?: string; messageSid?: string }> {
//   try {
//     if (!config.accountSid || !config.authToken) {
//       console.error("❌ Twilio credentials not configured");
//       return { success: false, error: "WhatsApp not configured" };
//     }

//     const url = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`;

//     // Format phone numbers
//     const to = formatWhatsAppNumber(residentPhone);
//     const from = config.whatsappNumber;

//     // ✅ UPDATED: Removed property name, added structured buttons
//     const messageBody = `🔔 *VMS - Visitor Approval Request*

// 👤 *Visitor:* ${visitorData.visitorName}
// 📱 *Phone:* ${visitorData.visitorPhone}
// 📍 *Unit:* ${visitorData.unitNumber}
// 🎯 *Purpose:* ${visitorData.purpose}

// ━━━━━━━━━━━━━━━━━━━
// *Quick Actions:*

// ✅ Reply: APPROVE
// ❌ Reply: REJECT

// ━━━━━━━━━━━━━━━━━━━

// 💡 _Tip: Just type and send one of the options above, or use the VMS app._`;

//     const formData = new URLSearchParams();
//     formData.append("To", to);
//     formData.append("From", from);
//     formData.append("Body", messageBody);

//     console.log("📤 Sending WhatsApp approval request");
//     console.log("  To:", to);
//     console.log("  From:", from);
//     console.log("  Resident:", residentPhone);

//     const response = await fetch(url, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded",
//         Authorization:
//           "Basic " +
//           Buffer.from(`${config.accountSid}:${config.authToken}`).toString(
//             "base64"
//           ),
//       },
//       body: formData.toString(),
//     });

//     const responseData = await response.json();

//     if (!response.ok) {
//       console.error("❌ Twilio WhatsApp error:", {
//         status: response.status,
//         code: responseData.code,
//         message: responseData.message,
//         moreInfo: responseData.more_info,
//         details: responseData,
//       });
//       return {
//         success: false,
//         error: `Twilio Error ${responseData.code}: ${responseData.message}`,
//       };
//     }

//     console.log("✅ WhatsApp sent successfully");
//     console.log("  SID:", responseData.sid);
//     console.log("  Status:", responseData.status);

//     return {
//       success: true,
//       messageSid: responseData.sid,
//     };
//   } catch (error: any) {
//     console.error("❌ WhatsApp send exception:", error);
//     return {
//       success: false,
//       error: error.message || "Unknown error",
//     };
//   }
// }

// // =============================================================================
// // 2. SEND APPROVAL CONFIRMATION TO VISITOR
// // =============================================================================

// export async function sendVisitorApprovedWhatsApp(
//   visitorPhone: string,
//   visitorName: string,
//   residentName: string,
//   unitNumber: string,
//   propertyName: string
// ): Promise<boolean> {
//   try {
//     if (!config.accountSid || !config.authToken) {
//       console.error("❌ Twilio credentials not configured");
//       return false;
//     }

//     const url = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`;

//     const to = formatWhatsAppNumber(visitorPhone);
//     const from = config.whatsappNumber;

//     // ✅ UPDATED: Removed property name
//     const message = `✅ *VMS - Visit Approved*

// Dear *${visitorName}*,

// Your visit request has been *APPROVED*! ✨

// 👤 *Host:* ${residentName}
// 📍 *Unit:* ${unitNumber}

// ━━━━━━━━━━━━━━━━━━━
// 📌 *Next Steps:*
// Please proceed to the security gate and show this message to the guard for entry.
// ⏰ Valid until exit is marked

// ━━━━━━━━━━━━━━━━━━━

// Thank you! 🙏`;

//     const formData = new URLSearchParams();
//     formData.append("To", to);
//     formData.append("From", from);
//     formData.append("Body", message);

//     console.log("📤 Sending approval WhatsApp to visitor:", visitorPhone);

//     const response = await fetch(url, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded",
//         Authorization:
//           "Basic " +
//           Buffer.from(`${config.accountSid}:${config.authToken}`).toString(
//             "base64"
//           ),
//       },
//       body: formData.toString(),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       console.error("❌ Twilio error:", errorData);
//       return false;
//     }

//     const result = await response.json();
//     console.log("✅ Approval WhatsApp sent, SID:", result.sid);
//     return true;
//   } catch (error) {
//     console.error("❌ WhatsApp send error:", error);
//     return false;
//   }
// }

// // =============================================================================
// // 3. SEND REJECTION NOTIFICATION TO VISITOR
// // =============================================================================

// export async function sendVisitorRejectedWhatsApp(
//   visitorPhone: string,
//   visitorName: string,
//   reason?: string
// ): Promise<boolean> {
//   try {
//     if (!config.accountSid || !config.authToken) {
//       console.error("❌ Twilio credentials not configured");
//       return false;
//     }

//     const url = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`;

//     const to = formatWhatsAppNumber(visitorPhone);
//     const from = config.whatsappNumber;

//     const message = `❌ *VMS - Visit Request Declined*

// Dear *${visitorName}*,

// We regret to inform you that your visit request has been *DECLINED*.

// ${reason ? `📝 *Reason:* ${reason}` : ""}

// ━━━━━━━━━━━━━━━━━━━
// If you believe this is an error, please contact the resident directly.
// ━━━━━━━━━━━━━━━━━━━

// Thank you for your understanding. 🙏`;

//     const formData = new URLSearchParams();
//     formData.append("To", to);
//     formData.append("From", from);
//     formData.append("Body", message);

//     console.log("📤 Sending rejection WhatsApp to visitor:", visitorPhone);

//     const response = await fetch(url, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded",
//         Authorization:
//           "Basic " +
//           Buffer.from(`${config.accountSid}:${config.authToken}`).toString(
//             "base64"
//           ),
//       },
//       body: formData.toString(),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       console.error("❌ Twilio error:", errorData);
//       return false;
//     }

//     const result = await response.json();
//     console.log("✅ Rejection WhatsApp sent, SID:", result.sid);
//     return true;
//   } catch (error) {
//     console.error("❌ WhatsApp send error:", error);
//     return false;
//   }
// }

// // =============================================================================
// // 4. NOTIFY GUARD OF APPROVAL
// // =============================================================================

// export async function notifyGuardWhatsApp(
//   guardPhone: string,
//   visitorName: string,
//   residentName: string,
//   unitNumber: string
// ): Promise<boolean> {
//   try {
//     if (!config.accountSid || !config.authToken) {
//       console.error("❌ Twilio credentials not configured");
//       return false;
//     }

//     const url = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`;

//     const to = formatWhatsAppNumber(guardPhone);
//     const from = config.whatsappNumber;

//     const message = `🚨 *VMS - Visitor Approved*

// *Visitor:* ${visitorName}
// *Approved by:* ${residentName}
// *Unit:* ${unitNumber}

// ━━━━━━━━━━━━━━━━━━━
// ✅ *Action Required:* Allow entry when visitor arrives at gate.
// ━━━━━━━━━━━━━━━━━━━

// Check VMS app for more details.`;

//     const formData = new URLSearchParams();
//     formData.append("To", to);
//     formData.append("From", from);
//     formData.append("Body", message);

//     console.log("📤 Sending guard notification WhatsApp:", guardPhone);

//     const response = await fetch(url, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded",
//         Authorization:
//           "Basic " +
//           Buffer.from(`${config.accountSid}:${config.authToken}`).toString(
//             "base64"
//           ),
//       },
//       body: formData.toString(),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       console.error("❌ Twilio error:", errorData);
//       return false;
//     }

//     const result = await response.json();
//     console.log("✅ Guard WhatsApp notification sent, SID:", result.sid);
//     return true;
//   } catch (error) {
//     console.error("❌ WhatsApp send error:", error);
//     return false;
//   }
// }



// src/app/lib/utils/twilio-whatsapp.ts

const config = {
  accountSid: process.env.TWILIO_ACCOUNT_SID || '',
  authToken: process.env.TWILIO_AUTH_TOKEN || '',
  whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886',
  approvalTemplateSid: process.env.TWILIO_APPROVAL_TEMPLATE_SID || '', // Add this to .env
};

function formatWhatsAppNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('91') && cleaned.length === 12) return `whatsapp:+${cleaned}`;
  if (cleaned.length === 10) return `whatsapp:+91${cleaned}`;
  return `whatsapp:+91${cleaned}`;
}

export async function sendVisitorApprovalWhatsApp(
  residentPhone: string,
  visitorData: {
    visitorName: string;
    visitorPhone: string;
    purpose: string;
    unitNumber: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!config.accountSid || !config.authToken) {
      return { success: false, error: 'Twilio not configured' };
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`;
    const to = formatWhatsAppNumber(residentPhone);
    const from = config.whatsappNumber;

    // TRY TEMPLATE WITH BUTTONS FIRST
    if (config.approvalTemplateSid) {
      console.log('📤 Sending with BUTTONS template...');
      
      const formData = new URLSearchParams();
      formData.append('To', to);
      formData.append('From', from);
      formData.append('ContentSid', config.approvalTemplateSid);
      formData.append('ContentVariables', JSON.stringify({
        "1": visitorData.visitorName,
        "2": visitorData.visitorPhone,
        "3": visitorData.unitNumber,
        "4": visitorData.purpose
      }));

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Basic ' + Buffer.from(`${config.accountSid}:${config.authToken}`).toString('base64'),
        },
        body: formData.toString(),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Sent with BUTTONS, SID:', data.sid);
        return { success: true };
      }
      console.log('⚠️ Template failed, using plain text...');
    }

    // FALLBACK: Plain text
    const messageBody = `🔔 *VMS - Visitor Approval*

👤 Visitor: ${visitorData.visitorName}
📱 Phone: ${visitorData.visitorPhone}
📍 Unit: ${visitorData.unitNumber}
🎯 Purpose: ${visitorData.purpose}

Do you approve?

Reply: APPROVE or REJECT`;

    const formData = new URLSearchParams();
    formData.append('To', to);
    formData.append('From', from);
    formData.append('Body', messageBody);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + Buffer.from(`${config.accountSid}:${config.authToken}`).toString('base64'),
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Error:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Sent (plain text)');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Exception:', error);
    return { success: false, error: error.message };
  }
}

export async function sendVisitorApprovedWhatsApp(
  visitorPhone: string,
  visitorName: string,
  residentName: string,
  unitNumber: string
): Promise<boolean> {
  try {
    if (!config.accountSid || !config.authToken) return false;

    const url = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`;
    const message = `✅ *Visit Approved*

Dear ${visitorName},

Your visit has been APPROVED! ✨

Host: ${residentName}
Unit: ${unitNumber}

Show this to the guard at gate.`;

    const formData = new URLSearchParams();
    formData.append('To', formatWhatsAppNumber(visitorPhone));
    formData.append('From', config.whatsappNumber);
    formData.append('Body', message);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + Buffer.from(`${config.accountSid}:${config.authToken}`).toString('base64'),
      },
      body: formData.toString(),
    });

    return response.ok;
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
}

export async function sendVisitorRejectedWhatsApp(
  visitorPhone: string,
  visitorName: string,
  reason?: string
): Promise<boolean> {
  try {
    if (!config.accountSid || !config.authToken) return false;

    const url = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`;
    const message = `❌ *Visit Declined*

Dear ${visitorName},

Your visit request has been DECLINED.

${reason ? `Reason: ${reason}` : ''}

Contact resident if needed.`;

    const formData = new URLSearchParams();
    formData.append('To', formatWhatsAppNumber(visitorPhone));
    formData.append('From', config.whatsappNumber);
    formData.append('Body', message);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + Buffer.from(`${config.accountSid}:${config.authToken}`).toString('base64'),
      },
      body: formData.toString(),
    });

    return response.ok;
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
}

export async function notifyGuardWhatsApp(
  guardPhone: string,
  visitorName: string,
  residentName: string,
  unitNumber: string
): Promise<boolean> {
  try {
    if (!config.accountSid || !config.authToken) return false;

    const url = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`;
    const message = `🚨 *Visitor Approved*

Visitor: ${visitorName}
By: ${residentName}
Unit: ${unitNumber}

✅ Allow entry at gate`;

    const formData = new URLSearchParams();
    formData.append('To', formatWhatsAppNumber(guardPhone));
    formData.append('From', config.whatsappNumber);
    formData.append('Body', message);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + Buffer.from(`${config.accountSid}:${config.authToken}`).toString('base64'),
      },
      body: formData.toString(),
    });

    return response.ok;
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
}