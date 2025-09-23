import { NextRequest, NextResponse } from "next/server";
import { put } from '@vercel/blob';
import path from "path";
import crypto from "crypto";

// Security configurations
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];

// Sanitize filename to prevent path traversal attacks
function sanitizeFilename(filename) {
  // Remove path separators and null bytes
  const sanitized = filename
    .replace(/[\/\\\.\.]/g, '')
    .replace(/\0/g, '')
    .replace(/[<>:"|?*]/g, '') // Remove invalid Windows filename characters
    .trim();
  
  // Ensure filename is not empty after sanitization
  if (!sanitized) {
    return 'file';
  }
  
  return sanitized;
}

// Generate secure random filename
function generateSecureFilename(originalName) {
  const timestamp = Date.now();
  const randomBytes = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalName);
  const baseName = sanitizeFilename(path.basename(originalName, extension));
  
  return `${timestamp}_${randomBytes}_${baseName}${extension}`;
}

// Validate file content type by checking file signature (magic bytes)
async function validateFileSignature(buffer, mimeType) {
  const fileSignatures = {
    'image/jpeg': [
      [0xFF, 0xD8, 0xFF],
    ],
    'image/png': [
      [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
    ],
    'image/gif': [
      [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
      [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
    ],
    'image/webp': [
      [0x52, 0x49, 0x46, 0x46, null, null, null, null, 0x57, 0x45, 0x42, 0x50],
    ],
    'application/pdf': [
      [0x25, 0x50, 0x44, 0x46],
    ],
    'text/plain': [], // Text files don't have reliable signatures
    'application/msword': [
      [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1],
    ],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
      [0x50, 0x4B, 0x03, 0x04], // ZIP signature for modern Office docs
    ],
    'application/vnd.ms-excel': [
      [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1],
    ],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
      [0x50, 0x4B, 0x03, 0x04],
    ],
  };

  const signatures = fileSignatures[mimeType];
  if (!signatures || signatures.length === 0) {
    return true; // Skip validation for types without reliable signatures
  }

  return signatures.some(signature => {
    return signature.every((byte, index) => {
      return byte === null || buffer[index] === byte;
    });
  });
}

export async function POST(request) {
  try {
    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'No file uploaded or invalid file' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed. Supported types: images (JPEG, PNG, GIF, WebP) and documents (PDF, TXT, DOC, DOCX, XLS, XLSX)' },
        { status: 400 }
      );
    }

    // Convert file to buffer for validation
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate file signature to prevent MIME type spoofing
    const isValidSignature = await validateFileSignature(buffer, file.type);
    if (!isValidSignature) {
      return NextResponse.json(
        { error: 'File signature does not match declared type' },
        { status: 400 }
      );
    }

    // Generate secure filename for blob storage
    const secureFilename = generateSecureFilename(file.name);

    // Upload file to Vercel Blob storage
    const blob = await put(secureFilename, buffer, {
      access: 'public',
      contentType: file.type,
    });

    // Return file information
    const fileInfo = {
      filename: secureFilename,
      originalName: file.name,
      size: file.size,
      type: file.type,
      url: blob.url,
      uploadedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      file: fileInfo
    }, { status: 200 });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
