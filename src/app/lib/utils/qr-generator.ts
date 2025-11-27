import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import QRCode from 'qrcode';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './public/uploads';

export interface QRCodeResult {
  success: boolean;
  qrCodeUrl?: string;
  qrCodeDataUrl?: string;
  error?: string;
}

/**
 * Generate a QR code image for property visitor registration
 */
export async function generatePropertyQRCode(
  propertyId: string,
  propertyName: string
): Promise<QRCodeResult> {
  try {
    // Generate visitor registration URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const registrationUrl = `${baseUrl}/visitor/register?propertyId=${propertyId}`;

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(registrationUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    // Save QR code as image file
    const qrFolder = path.join(UPLOAD_DIR, 'qr-codes');
    await mkdir(qrFolder, { recursive: true });

    const filename = `${propertyId}-${randomUUID()}.png`;
    const filepath = path.join(qrFolder, filename);

    // Convert data URL to buffer
    const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    await writeFile(filepath, buffer);

    const publicUrl = `/uploads/qr-codes/${filename}`;

    console.log('QR Code generated successfully:', publicUrl);

    return {
      success: true,
      qrCodeUrl: publicUrl,
      qrCodeDataUrl: qrCodeDataUrl,
    };
  } catch (error) {
    console.error('QR code generation error:', error);
    return {
      success: false,
      error: 'Failed to generate QR code',
    };
  }
}