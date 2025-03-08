// app/api/uploads/[filename]/route.ts
import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, {params}: { params: { filename: string } }) {
  const filename = params.filename; // Correct way to access filename in the context

  // Define the file path for the requested image in the uploads folder
  const filePath = path.resolve('uploads', filename);

  try {
    // Check if the file exists in the /uploads directory
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ message: 'File not found' }, { status: 404 });
    }

    // Read the file from the /uploads folder
    const fileBuffer = fs.readFileSync(filePath);

    // Determine the mime type of the file (based on extension)
    const mimeType = getMimeType(filename);

    // Return the file with the appropriate Content-Type header
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    });
  } catch (err) {
    console.error('Error serving the file:', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to determine the MIME type based on file extension
function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.gif':
      return 'image/gif';
    case '.webp':
      return 'image/webp';
    case '.svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream'; // Default to binary stream for unknown types
  }
}