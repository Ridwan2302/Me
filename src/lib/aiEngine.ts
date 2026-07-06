import { CreatureMood, MemoryCategory, MemoryItem } from '../types';

export interface ExtractedMemory {
  category: MemoryCategory;
  label: string;
  detail: string;
}

export interface AnalysisResult {
  memories: ExtractedMemory[];
  mood: CreatureMood;
}

const PERSON_WORDS: { pattern: RegExp; relationship: string }[] = [
  { pattern: /\bm(?:a|on)\s+m[eè]re\b/i, relationship: 'ta mère' },
  { pattern: /\bm(?:on)\s+p[eè]re\b/i, relationship: 'ton père' },
  { pattern: /\bm(?:a)\s+sœur\b/i, relationship: 'ta sœur' },
  { pattern: /\bm(?:on)\s+fr[eè]re\b/i, relationship: 'ton frère' },
  { pattern: /\bm(?:a)\s+copine\b/i, relationship: 'ta copine' },
  { pattern: /\bm(?:on)\s+copain\b/i, relationship: 'ton copain' },
  { pattern: /\bm(?:a)\s+meilleure amie\b/i, relationship: 'ta meilleure amie' },
  { pattern: /\bm(?:on)\s+meilleur ami\b/i, relationship: 'ton meilleur ami' },
  { pattern: /\bm(?:on)\s+ami\b/i, relationship: 'ton ami' },
  { pattern: /\bm(?:a)\s+amie\b/i, relationship: 'ton amie' },
  { pattern: /\bm(?:on)\s+coll[eè]gue\b/i, relationship: 'ton collègue' },
  { pattern: /\bm(?:on)\s+patron\b/i, relationship: 'ton patron' },
];

const SAD_WORDS = ['triste', 'déprim', 'fatigu', 'anxieux', 'anxieuse', 'stress', 'seul', 'peur', 'inquiet', 'difficile', 'dur'];
const HAPPY_WORDS = ['content', 'heureux', 'heureuse', 'super', 'génial', 'top', 'joie', 'fier', 'fière', 'réussi', 'gagné'];
const QUESTION_HINT = ['?'];

function clip(text: string, max = 90) {
  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
}

export function analyzeMessage(raw: string): AnalysisResult {
  const text = raw.trim();
  const lower = text.toLowerCase();
  const memories: ExtractedMemory[] = [];
  let mood: CreatureMood = 'listening';

  if (/j'aime|j'adore|je kiffe/i.test(text) && !/je n'aime pas|je n'adore pas/i.test(text)) {
    const match = text.match(/j['’](?:aime|adore)\s+(.{2,60})/i);
    memories.push({
      category: 'preference',
      label: match ? `Aime ${clip(match[1], 40)}` : 'Nouvelle préférence',
      detail: text,
    });
    mood = 'happy';
  }
  if (/je n'aime pas|je déteste|j'ai horreur/i.test(text)) {
    const match = text.match(/(?:je n['’]aime pas|je déteste)\s+(.{2,60})/i);
    memories.push({
      category: 'preference',
      label: match ? `N'aime pas ${clip(match[1], 40)}` : 'Nouvelle aversion',
      detail: text,
    });
  }

  for (const { pattern, relationship } of PERSON_WORDS) {
    if (pattern.test(text)) {
      memories.push({
        category: 'person',
        label: `À propos de ${relationship}`,
        detail: text,
      });
      break;
    }
  }

  if (/je veux|j'aimerais|mon objectif|mon but|je souhaite/i.test(text)) {
    const match = text.match(/(?:je veux|j['’]aimerais|je souhaite)\s+(.{2,70})/i);
    memories.push({
      category: 'goal',
      label: match ? clip(match[1], 45) : 'Nouvel objectif évoqué',
      detail: text,
    });
    mood = 'curious';
  }

  if (/chaque jour|tous les jours|habitude|chaque matin|chaque soir/i.test(text)) {
    memories.push({
      category: 'habit',
      label: 'Habitude mentionnée',
      detail: text,
    });
  }

  if (/anniversaire|la semaine dernière|hier|demain|le mois dernier/i.test(text)) {
    memories.push({
      category: 'event',
      label: 'Évènement évoqué',
      detail: text,
    });
  }

  const hasSad = SAD_WORDS.some((w) => lower.includes(w));
  const hasHappy = HAPPY_WORDS.some((w) => lower.includes(w));
  if (hasSad) {
    memories.push({ category: 'emotion', label: 'Moment difficile partagé', detail: text });
    mood = 'empathetic';
  } else if (hasHappy) {
    memories.push({ category: 'emotion', label: 'Moment positif partagé', detail: text });
    mood = 'celebrating';
  } else if (QUESTION_HINT.some((q) => text.includes(q)) && mood === 'listening') {
    mood = 'curious';
  }

  return { memories, mood };
}

const OPENERS_SAD = [
  "Je suis là avec toi. Ça a l'air difficile — tu veux m'en dire plus ?",
  "Merci de me faire confiance avec ça. Comment je peux t'aider à te sentir un peu mieux ?",
  "Je t'entends. Prends le temps qu'il te faut, je ne vais nulle part.",
];
const OPENERS_HAPPY = [
  "Ça me rend heureux de lire ça ! Raconte-moi tout.",
  "J'adore cette énergie. Qu'est-ce qui t'a fait le plus plaisir ?",
  "C'est une super nouvelle, je la garde précieusement.",
];
const OPENERS_GOAL = [
  "J'aime beaucoup cet objectif. Je vais t'aider à le suivre — on ajoute une petite étape pour commencer ?",
  "Notons ça ensemble. Qu'est-ce qui te ferait sentir que tu avances, cette semaine ?",
];
const OPENERS_PERSON = [
  "Merci de me la·le présenter. Je m'en souviendrai.",
  "Ça compte, pour moi aussi, de connaître les gens importants pour toi.",
];
const OPENERS_GENERIC = [
  "Dis-m'en plus, je t'écoute.",
  "Continue, je suis curieux de la suite.",
  "Je note ça précieusement. Autre chose aujourd'hui ?",
  "Merci de partager ça avec moi.",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateReply(
  analysis: AnalysisResult,
  relatedMemories: MemoryItem[]
): string {
  const categories = new Set(analysis.memories.map((m) => m.category));

  if (relatedMemories.length > 0 && Math.random() > 0.4) {
    const mem = relatedMemories[0];
    const bridge = pick([
      `Ça me rappelle que ${mem.detail.toLowerCase()}`,
      `Je me souviens que tu m'avais parlé de ça : "${clip(mem.label, 50)}".`,
    ]);
    return `${bridge} ${pick(OPENERS_GENERIC)}`;
  }

  if (categories.has('emotion') && analysis.mood === 'empathetic') return pick(OPENERS_SAD);
  if (categories.has('emotion') && analysis.mood === 'celebrating') return pick(OPENERS_HAPPY);
  if (categories.has('goal')) return pick(OPENERS_GOAL);
  if (categories.has('person')) return pick(OPENERS_PERSON);

  return pick(OPENERS_GENERIC);
}
