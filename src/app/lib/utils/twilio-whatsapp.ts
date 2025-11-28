const config = {
  accountSid: process.env.TWILIO_ACCOUNT_SID || "",
  authToken: process.env.TWILIO_AUTH_TOKEN || "",
  whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886",
  approvalTemplateSid: process.env.TWILIO_APPROVAL_TEMPLATE_SID || "", // Add this to .env
};

function formatWhatsAppNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("91") && cleaned.length === 12)
    return `whatsapp:+${cleaned}`;
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
      return { success: false, error: "Twilio not configured" };
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`;
    const to = formatWhatsAppNumber(residentPhone);
    const from = config.whatsappNumber;

    // TRY TEMPLATE WITH BUTTONS FIRST
    if (config.approvalTemplateSid) {
      console.log("📤 Sending with BUTTONS template...");

      const formData = new URLSearchParams();
      formData.append("To", to);
      formData.append("From", from);
      formData.append("ContentSid", config.approvalTemplateSid);
      formData.append(
        "ContentVariables",
        JSON.stringify({
          "1": visitorData.visitorName,
          "2": visitorData.visitorPhone,
          "3": visitorData.unitNumber,
          "4": visitorData.purpose,
        })
      );

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(`${config.accountSid}:${config.authToken}`).toString(
              "base64"
            ),
        },
        body: formData.toString(),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Sent with BUTTONS, SID:", data.sid);
        return { success: true };
      }
      console.log("⚠️ Template failed, using plain text...");
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
    formData.append("To", to);
    formData.append("From", from);
    formData.append("Body", messageBody);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(`${config.accountSid}:${config.authToken}`).toString(
            "base64"
          ),
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ Error:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Sent (plain text)");
    return { success: true };
  } catch (error: any) {
    console.error("❌ Exception:", error);
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
    formData.append("To", formatWhatsAppNumber(visitorPhone));
    formData.append("From", config.whatsappNumber);
    formData.append("Body", message);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(`${config.accountSid}:${config.authToken}`).toString(
            "base64"
          ),
      },
      body: formData.toString(),
    });

    return response.ok;
  } catch (error) {
    console.error("❌ Error:", error);
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

${reason ? `Reason: ${reason}` : ""}

Contact resident if needed.`;

    const formData = new URLSearchParams();
    formData.append("To", formatWhatsAppNumber(visitorPhone));
    formData.append("From", config.whatsappNumber);
    formData.append("Body", message);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(`${config.accountSid}:${config.authToken}`).toString(
            "base64"
          ),
      },
      body: formData.toString(),
    });

    return response.ok;
  } catch (error) {
    console.error("❌ Error:", error);
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
    formData.append("To", formatWhatsAppNumber(guardPhone));
    formData.append("From", config.whatsappNumber);
    formData.append("Body", message);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(`${config.accountSid}:${config.authToken}`).toString(
            "base64"
          ),
      },
      body: formData.toString(),
    });

    return response.ok;
  } catch (error) {
    console.error("❌ Error:", error);
    return false;
  }
}
