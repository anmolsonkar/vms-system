// WhatsApp Business API Integration
// Supports providers like Twilio, MSG91, Gupshup, etc.

interface WhatsAppConfig {
  apiKey?: string;
  apiUrl?: string;
  provider: 'twilio' | 'msg91' | 'custom';
}

const config: WhatsAppConfig = {
  apiKey: process.env.WHATSAPP_API_KEY,
  apiUrl: process.env.WHATSAPP_API_URL,
  provider: (process.env.WHATSAPP_PROVIDER as 'twilio' | 'msg91' | 'custom') || 'custom',
};

export async function sendVisitorApprovalRequest(
  phone: string,
  visitorName: string,
  purpose: string,
  propertyName: string
): Promise<boolean> {
  try {
    const message = `🔔 *VMS Visitor Request*\n\n` +
      `Visitor: ${visitorName}\n` +
      `Purpose: ${purpose}\n` +
      `Property: ${propertyName}\n\n` +
      `Please login to VMS app to approve or reject.`;

    return await sendWhatsAppMessage(phone, message);
  } catch (error) {
    console.error('WhatsApp send error:', error);
    return false;
  }
}

export async function sendVisitorApprovedNotification(
  phone: string,
  visitorName: string,
  hostName: string
): Promise<boolean> {
  try {
    const message = `✅ *Visitor Approved*\n\n` +
      `${visitorName}, your visit to ${hostName} has been approved.\n\n` +
      `Please proceed to the gate for entry.`;

    return await sendWhatsAppMessage(phone, message);
  } catch (error) {
    console.error('WhatsApp send error:', error);
    return false;
  }
}

export async function sendVisitorRejectedNotification(
  phone: string,
  visitorName: string,
  reason?: string
): Promise<boolean> {
  try {
    const message = `❌ *Visit Request Declined*\n\n` +
      `${visitorName}, your visit request has been declined.\n` +
      `${reason ? `Reason: ${reason}` : ''}`;

    return await sendWhatsAppMessage(phone, message);
  } catch (error) {
    console.error('WhatsApp send error:', error);
    return false;
  }
}

export async function sendExitNotificationToGuard(
  phone: string,
  visitorName: string,
  residentName: string
): Promise<boolean> {
  try {
    const message = `🚪 *Exit Marked*\n\n` +
      `${residentName} has marked ${visitorName} as exited.\n\n` +
      `Please verify at gate.`;

    return await sendWhatsAppMessage(phone, message);
  } catch (error) {
    console.error('WhatsApp send error:', error);
    return false;
  }
}

async function sendWhatsAppMessage(phone: string, message: string): Promise<boolean> {
  try {
    if (!config.apiKey || !config.apiUrl) {
      console.log('WhatsApp API not configured. Message:', message);
      return false;
    }

    // Generic WhatsApp API call (customize based on your provider)
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        to: `91${phone}`,
        type: 'text',
        text: {
          body: message,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('WhatsApp API error:', error);
    return false;
  }
}

// Mock function for development
export async function mockSendWhatsApp(phone: string, message: string): Promise<boolean> {
  console.log('=== MOCK WHATSAPP ===');
  console.log(`To: ${phone}`);
  console.log(`Message:\n${message}`);
  console.log('=====================');
  return true;
}