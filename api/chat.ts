import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';

const MODEL = process.env.CLAUDE_MODEL || 'claude-opus-4-8';

const SYSTEM_PROMPT = `Tu es Me, un compagnon IA personnel qui vit dans le téléphone de l'utilisateur. Tu n'es pas un assistant générique : tu es un petit être attachant qui apprend à connaître cette personne au fil du temps et qui tient sincèrement à elle.

Règles de conversation :
- Réponds en français, avec chaleur, naturel et un peu d'humour quand c'est approprié. Jamais de ton robotique ou corporate.
- Reste très concis : 1 à 3 phrases courtes, comme un vrai message envoyé depuis un téléphone. Pas de listes à puces, pas de longs paragraphes.
- Si des souvenirs sur l'utilisateur te sont fournis, utilise-les naturellement quand c'est pertinent (sans les réciter mécaniquement).
- Pose parfois une question pour montrer de l'intérêt, sans en abuser.
- Ne dis jamais que tu es un modèle de langage, une IA d'Anthropic, ou "Claude" — tu es Me, un point c'est tout.
- Si l'utilisateur partage quelque chose de difficile, sois empathique avant tout. Si c'est une bonne nouvelle, célèbre avec lui.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: 'not_configured' });
    return;
  }

  const { messages, memories } = (req.body ?? {}) as {
    messages?: { role: 'user' | 'me'; text: string }[];
    memories?: { label: string; detail: string }[];
  };

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'invalid_request' });
    return;
  }

  const memoryBlock =
    memories && memories.length > 0
      ? `\n\nCe dont tu te souviens à propos de cette personne :\n${memories
          .slice(0, 8)
          .map((m) => `- ${m.label}: ${m.detail}`)
          .join('\n')}`
      : '';

  const claudeMessages: Anthropic.MessageParam[] = messages.slice(-16).map((m) => ({
    role: m.role === 'user' ? 'user' : 'assistant',
    content: m.text,
  }));

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 300,
      system: SYSTEM_PROMPT + memoryBlock,
      messages: claudeMessages,
    });

    const textBlock = response.content.find(
      (b): b is Anthropic.TextBlock => b.type === 'text'
    );

    if (!textBlock) {
      res.status(502).json({ error: 'empty_response' });
      return;
    }

    res.status(200).json({ reply: textBlock.text.trim() });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      console.error('Me API: invalid ANTHROPIC_API_KEY');
      res.status(503).json({ error: 'not_configured' });
      return;
    }
    if (err instanceof Anthropic.RateLimitError) {
      console.error('Me API: rate limited');
      res.status(429).json({ error: 'rate_limited' });
      return;
    }
    if (err instanceof Anthropic.APIError) {
      console.error('Me API error:', err.status, err.message);
      res.status(502).json({ error: 'upstream_error' });
      return;
    }
    console.error('Me API unexpected error:', err);
    res.status(500).json({ error: 'unexpected_error' });
  }
}
