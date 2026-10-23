import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    let guestName = '';
    let guestId = '';
    let side: 'front' | 'back' = 'front';
    let fileBuffer: Buffer | null = null;
    let fileExt = 'jpg';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      guestName = (formData.get('guestName') as string) || '';
      guestId = (formData.get('guestId') as string) || '';
      side = ((formData.get('side') as string) || 'front') === 'back' ? 'back' : 'front';

      if (!file) {
        return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      fileBuffer = Buffer.from(bytes);

      if (file.name) {
        const ext = path.extname(file.name).toLowerCase().replace('.', '');
        if (['jpg', 'jpeg', 'png', 'webp', 'svg', 'pdf'].includes(ext)) {
          fileExt = ext === 'jpeg' ? 'jpg' : ext;
        }
      }
    } else {
      // JSON body (base64 string or data URL)
      const body = await req.json();
      guestName = body.guestName || '';
      guestId = body.guestId || '';
      side = body.side === 'back' ? 'back' : 'front';
      const base64Data: string = body.base64 || '';

      if (!base64Data) {
        return NextResponse.json({ success: false, error: 'No image data provided' }, { status: 400 });
      }

      if (base64Data.startsWith('data:image/svg+xml')) {
        fileExt = 'svg';
        const rawSvg = decodeURIComponent(base64Data.split(',')[1] || '');
        fileBuffer = Buffer.from(rawSvg, 'utf-8');
      } else if (base64Data.includes(';base64,')) {
        const parts = base64Data.split(';base64,');
        const mime = parts[0].replace('data:', '');
        if (mime.includes('png')) fileExt = 'png';
        else if (mime.includes('webp')) fileExt = 'webp';
        else if (mime.includes('svg')) fileExt = 'svg';
        else fileExt = 'jpg';

        fileBuffer = Buffer.from(parts[1], 'base64');
      } else {
        fileBuffer = Buffer.from(base64Data, 'base64');
      }
    }

    if (!guestName.trim()) {
      guestName = guestId ? `Guest_${guestId}` : 'Guest';
    }

    // Sanitize guest name for clean filesystem folder
    const safeGuestName = guestName
      .trim()
      .replace(/[\\/:*?"<>|]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Directory: public/uploads/guests/<GuestName>
    const targetDir = path.join(process.cwd(), 'public', 'uploads', 'guests', safeGuestName);

    // Create folder if it doesn't exist
    if (!fs.existsSync(targetDir)) {
      await fs.promises.mkdir(targetDir, { recursive: true });
    }

    // File name: front.jpg or back.jpg (or png/svg)
    const fileName = `${side}.${fileExt}`;
    const filePath = path.join(targetDir, fileName);

    // Write file to local disk
    if (fileBuffer) {
      await fs.promises.writeFile(filePath, fileBuffer);
    }

    // Public URL served by Next.js static files
    const publicUrl = `/uploads/guests/${encodeURIComponent(safeGuestName)}/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      folderName: safeGuestName,
      fileName,
      filePath: `public/uploads/guests/${safeGuestName}/${fileName}`,
      fullPath: filePath,
    });
  } catch (error: any) {
    console.error('Error saving guest photo locally:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save photo locally' },
      { status: 500 }
    );
  }
}
