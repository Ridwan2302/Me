import { Platform } from 'react-native';
import { ChatMessage, MemoryItem } from '../types';

// On web this resolves to a same-origin relative call (works once deployed on
// Vercel, where /api/chat.ts runs as a serverless function next to the static
// build). Native builds have no co-located server, so point them at the
// deployed backend via EXPO_PUBLIC_API_BASE_URL, e.g. https://me-yourname.vercel.app
const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';

const TIMEOUT_MS = 12000;

export async function sendToClaude(
  messages: ChatMessage[],
  memories: MemoryItem[]
): Promise<string | null> {
  if (Platform.OS !== 'web' && !process.env.EXPO_PUBLIC_API_BASE_URL) {
    // no backend reachable from a native build without an explicit base URL
    return null;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messages.map((m) => ({ role: m.role, text: m.text })),
        memories: memories.slice(0, 8).map((m) => ({ label: m.label, detail: m.detail })),
      }),
      signal: controller.signal,
    });

    if (!res.ok) return null;
    const data = (await res.json()) as { reply?: string };
    return data.reply?.trim() || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
