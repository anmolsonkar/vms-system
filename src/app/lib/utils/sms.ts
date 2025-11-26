// SMS Service using Twilio or MSG91

interface SMSConfig {
  provider: 'twilio' | 'msg91';
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioPhoneNumber?: string;
  msg91AuthKey?: string;
  msg91SenderId?: string;
}

const config: SMSConfig = {
  provider: (process.env.SMS_PROVIDER as 'twilio' | 'msg91') || 'msg91',
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,
  msg91AuthKey: process.env.MSG91_AUTH_KEY,
  msg91SenderId: process.env.MSG91_SENDER_ID,
};

export async function sendOTPSMS(phone: string, otp: string): Promise<boolean> {
  try {
    const message = `Your VMS OTP is: ${otp}. Valid for 10 minutes. Do not share with anyone.`;

    if (config.provider === 'twilio') {
      return await sendTwilioSMS(phone, message);
    } else {
      return await sendMSG91SMS(phone, message);
    }
  } catch (error) {
    console.error('SMS sending error:', error);
    return false;
  }
}

export async function sendApprovalSMS(
  phone: string,
  visitorName: string,
  hostName: string
): Promise<boolean> {
  try {
    const message = `VMS Alert: ${visitorName} has been approved to visit ${hostName}. Entry granted.`;

    if (config.provider === 'twilio') {
      return await sendTwilioSMS(phone, message);
    } else {
      return await sendMSG91SMS(phone, message);
    }
  } catch (error) {
    console.error('SMS sending error:', error);
    return false;
  }
}

export async function sendRejectionSMS(
  phone: string,
  visitorName: string,
  reason?: string
): Promise<boolean> {
  try {
    const message = `VMS Alert: Your visit request has been declined. ${
      reason ? `Reason: ${reason}` : ''
    }`;

    if (config.provider === 'twilio') {
      return await sendTwilioSMS(phone, message);
    } else {
      return await sendMSG91SMS(phone, message);
    }
  } catch (error) {
    console.error('SMS sending error:', error);
    return false;
  }
}

async function sendTwilioSMS(phone: string, message: string): Promise<boolean> {
  try {
    if (!config.twilioAccountSid || !config.twilioAuthToken || !config.twilioPhoneNumber) {
      console.error('Twilio credentials not configured');
      return false;
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${config.twilioAccountSid}/Messages.json`;
    
    const formData = new URLSearchParams();
    formData.append('To', `+91${phone}`);
    formData.append('From', config.twilioPhoneNumber);
    formData.append('Body', message);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization:
          'Basic ' +
          Buffer.from(`${config.twilioAccountSid}:${config.twilioAuthToken}`).toString('base64'),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Twilio API error: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Twilio SMS error:', error);
    return false;
  }
}

async function sendMSG91SMS(phone: string, message: string): Promise<boolean> {
  try {
    if (!config.msg91AuthKey) {
      console.error('MSG91 credentials not configured');
      return false;
    }

    const url = 'https://control.msg91.com/api/v5/flow/';
    
    const payload = {
      sender: config.msg91SenderId || 'VMSSYS',
      mobiles: `91${phone}`,
      message: message,
      authkey: config.msg91AuthKey,
      route: '4',
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authkey: config.msg91AuthKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`MSG91 API error: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('MSG91 SMS error:', error);
    return false;
  }
}

// For development/testing - log SMS instead of sending
export async function mockSendSMS(phone: string, message: string): Promise<boolean> {
  console.log('=== MOCK SMS ===');
  console.log(`To: ${phone}`);
  console.log(`Message: ${message}`);
  console.log('================');
  return true;
}