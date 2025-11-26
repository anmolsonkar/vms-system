import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './public/uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880'); // 5MB default

export interface UploadResult {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
}

export async function uploadFile(
  file: File,
  folder: 'photos' | 'id-cards' | 'documents'
): Promise<UploadResult> {
  try {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: 'File size exceeds maximum limit of 5MB',
      };
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed',
      };
    }

    // Create upload directory if it doesn't exist
    const uploadPath = path.join(UPLOAD_DIR, folder);
    await mkdir(uploadPath, { recursive: true });

    // Generate unique filename
    const ext = path.extname(file.name);
    const filename = `${uuidv4()}${ext}`;
    const filepath = path.join(uploadPath, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Return public URL
    const publicUrl = `/uploads/${folder}/${filename}`;

    return {
      success: true,
      url: publicUrl,
      filename: filename,
    };
  } catch (error) {
    console.error('File upload error:', error);
    return {
      success: false,
      error: 'Failed to upload file',
    };
  }
}

export async function uploadBase64Image(
  base64Data: string,
  folder: 'photos' | 'id-cards' | 'documents'
): Promise<UploadResult> {
  try {
    // Extract base64 data and mime type
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    
    if (!matches || matches.length !== 3) {
      return {
        success: false,
        error: 'Invalid base64 data',
      };
    }

    const mimeType = matches[1];
    const base64String = matches[2];

    // Validate mime type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(mimeType)) {
      return {
        success: false,
        error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed',
      };
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(base64String, 'base64');

    // Check file size
    if (buffer.length > MAX_FILE_SIZE) {
      return {
        success: false,
        error: 'File size exceeds maximum limit of 5MB',
      };
    }

    // Create upload directory
    const uploadPath = path.join(UPLOAD_DIR, folder);
    await mkdir(uploadPath, { recursive: true });

    // Generate filename
    const ext = mimeType.split('/')[1];
    const filename = `${uuidv4()}.${ext}`;
    const filepath = path.join(uploadPath, filename);

    // Save file
    await writeFile(filepath, buffer);

    // Return public URL
    const publicUrl = `/uploads/${folder}/${filename}`;

    return {
      success: true,
      url: publicUrl,
      filename: filename,
    };
  } catch (error) {
    console.error('Base64 upload error:', error);
    return {
      success: false,
      error: 'Failed to upload image',
    };
  }
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed',
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'File size exceeds maximum limit of 5MB',
    };
  }

  return { valid: true };
}