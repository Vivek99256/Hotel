import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const guestName = (body.guestName || body.fullName || '').trim();
    const guestId = body.guestId || '';
    const frontImage: string | undefined = body.frontImage;
    const backImage: string | undefined = body.backImage;

    const safeGuestName =
      (guestName || (guestId ? `Guest_${guestId}` : 'Guest'))
        .replace(/[\\/:*?"<>|]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    const folderPath = path.join(process.cwd(), 'public', 'uploads', 'guests', safeGuestName);

    // Ensure folder exists on disk
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Helper to auto-save image if provided and files not yet present on disk
    const saveIfProvided = (imgData: string | undefined, fileNameBase: 'front' | 'back') => {
      if (!imgData) return;
      try {
        // Check if an existing file already exists
        const existing = fs
          .readdirSync(folderPath)
          .find((f) => f.startsWith(`${fileNameBase}.`));
        if (existing) return;

        let ext = 'jpg';
        let buffer: Buffer | null = null;

        if (imgData.startsWith('data:image/svg+xml')) {
          ext = 'svg';
          const commaIdx = imgData.indexOf(',');
          const raw = commaIdx !== -1 ? decodeURIComponent(imgData.slice(commaIdx + 1)) : '';
          buffer = Buffer.from(raw, 'utf-8');
        } else if (imgData.includes(';base64,')) {
          const parts = imgData.split(';base64,');
          const mime = parts[0].toLowerCase();
          if (mime.includes('png')) ext = 'png';
          else if (mime.includes('webp')) ext = 'webp';
          else if (mime.includes('svg')) ext = 'svg';
          else ext = 'jpg';
          buffer = Buffer.from(parts[1], 'base64');
        } else if (imgData.startsWith('data:')) {
          const commaIdx = imgData.indexOf(',');
          if (commaIdx !== -1) {
            buffer = Buffer.from(imgData.slice(commaIdx + 1), 'base64');
          }
        }

        if (buffer) {
          const targetFile = path.join(folderPath, `${fileNameBase}.${ext}`);
          fs.writeFileSync(targetFile, buffer);
        }
      } catch (e) {
        console.warn('Could not auto-write image to disk:', e);
      }
    };

    saveIfProvided(frontImage, 'front');
    saveIfProvided(backImage, 'back');

    // Launch File Explorer / OS folder manager
    if (process.platform === 'win32') {
      spawn('explorer.exe', [folderPath], {
        detached: true,
        stdio: 'ignore',
      }).unref();
    } else if (process.platform === 'darwin') {
      spawn('open', [folderPath], {
        detached: true,
        stdio: 'ignore',
      }).unref();
    } else {
      spawn('xdg-open', [folderPath], {
        detached: true,
        stdio: 'ignore',
      }).unref();
    }

    return NextResponse.json({
      success: true,
      message: 'Folder opened successfully',
      folderPath,
      folderName: safeGuestName,
    });
  } catch (error: any) {
    console.error('Error opening folder:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to open local folder' },
      { status: 500 }
    );
  }
}
