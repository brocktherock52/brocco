import { vsOgImage, ogSize } from '@/lib/vs-og';

export const runtime = 'edge';
export const alt = 'brocco vs n8n';
export const size = ogSize;
export const contentType = 'image/png';

export default function Og() {
  return vsOgImage('n8n');
}
