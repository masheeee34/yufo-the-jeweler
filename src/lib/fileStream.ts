import fs from 'fs';
import { Readable } from 'stream';
import { NextResponse } from 'next/server';

// Envoie un fichier du disque en flux, en pièce jointe (jamais affiché dans le navigateur).
export function streamFile(filePath: string, downloadName: string, size: number) {
  const stream = Readable.toWeb(fs.createReadStream(filePath)) as ReadableStream;
  const safe = downloadName.replace(/[^\w.\- ()]/g, '_');
  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': String(size),
      'Content-Disposition': `attachment; filename="${safe}"`,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'private, no-store',
    },
  });
}
