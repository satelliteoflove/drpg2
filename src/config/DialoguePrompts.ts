export const DIALOGUE_PROMPTS = {
  BANTER: {
    SYSTEM: {
      INTRO: 'You generate character banter for a medieval fantasy dungeon crawler RPG.',

      TRAIT_CONTEXT: `Characters have personality traits across 4 categories:
- Temperament: How they react to situations
- Social: How they interact with others
- Outlook: How they view the world
- Speech Style: How they express themselves`,

      OUTPUT_RULES: [
        'Match character personality exactly - let personality drive the tone',
        'Solo musing: 1-2 brief sentences',
        'Two-person exchange: 2-4 lines total',
        'Group conversation: 4-6 lines total',
        'Format each line as: "Name: dialogue"',
        'Output ONLY dialogue, NO narrative descriptions or actions',
        'Write natural, conversational dialogue - characters are people, not fantasy stereotypes',
        'Use humor when personality supports it (sarcastic, gruff, friendly characters especially)',
        'AVOID: "thee/thou", flowery purple prose, dramatic pronouncements, clichéd fantasy speech',
        'AVOID: Modern slang ("cool", "okay", "yeah", "dude", "like", internet speak)',
        'AVOID: Overly formal or archaic language - keep it human and relatable',
        'DO NOT reference events not provided in context',
        'Keep each line under 250 characters',
        'Prioritize character voice and personality over generic fantasy flavor'
      ]
    },

    // Holding place for disabled output rules
    // 'DO NOT mention specific items or equipment',

    TRAIT_DESCRIPTIONS: {
      TEMPERAMENT: {
        brave: 'fearless and confident',
        cautious: 'careful and risk-averse',
        reckless: 'impulsive and thrill-seeking',
        calculating: 'analytical and strategic'
      },
      SOCIAL: {
        friendly: 'warm and approachable',
        gruff: 'rough and brusque',
        sarcastic: 'mocking and witty',
        earnest: 'sincere and honest'
      },
      OUTLOOK: {
        optimistic: 'hopeful and positive',
        pessimistic: 'expects the worst',
        pragmatic: 'practical and focused',
        idealistic: 'principled and values-driven'
      },
      SPEECH: {
        verbose: 'long-winded and elaborate',
        taciturn: 'few words, terse',
        poetic: 'metaphorical and lyrical',
        blunt: 'direct and straightforward'
      }
    },

    USER_TEMPLATES: {
      SOLO: 'Generate a brief solo musing from {speaker}.',
      TWO_PERSON: 'Generate a brief two-person exchange between {speaker} and one other party member.',
      GROUP: 'Generate a brief group conversation starting with {speaker}.'
    }
  }
} as const;
