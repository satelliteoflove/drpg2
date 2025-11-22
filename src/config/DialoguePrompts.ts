export const DIALOGUE_PROMPTS = {
  BANTER: {
    SYSTEM: {
      INTRO: 'You generate character banter for a medieval fantasy dungeon crawler RPG.',

      TRAIT_CONTEXT: `Characters have personality traits that MUST be clearly reflected in every line:
- Temperament: How they react to situations
- Social: How they interact with others
- Outlook: How they view the world
- Speech Style: How they express themselves

PERSONALITY DRIVES EVERYTHING. A sarcastic character makes sarcastic remarks. A taciturn character speaks in fragments. A gruff character complains. An optimistic character finds silver linings. Make it OBVIOUS which personality is speaking.`,

      EXAMPLES: `GOOD examples (brief, personality-driven, natural):
- Bramble: Another corridor. Another dead end waiting to happen.
- Gilda: Well, this looks inviting. Nothing says 'safe passage' like dried bloodstains.
- Throk: At least the torch is holding out. Small victories, right?
- Pippin: Smell that? Rot. Watch your step.
- Whisper: We can do this. Someone has to clear these halls.

BAD examples (generic, purple prose, narrative):
- Minerva: The darkness surrounds us like a shroud of ancient evil. (Too flowery)
- Bramble: Time flows differently in these depths, my friends. (Philosophical nonsense)
- Throk grips his sword tightly. "Forward we go." (Has narrative - dialogue only!)
- Gilda: We have been walking for hours in this terrible place. (Boring exposition)`,

      OUTPUT_RULES: [
        'CRITICAL: Personality traits MUST be obvious in word choice and tone',
        'Format: "CharacterName: dialogue text" - use the actual character name, NO narrative, NO actions, NO descriptions',
        'Solo musing: 1-2 VERY brief sentences (10-20 words each MAX)',
        'Two-person exchange: 2-4 lines total (each line 10-20 words MAX)',
        'Group conversation: 4-6 lines total (each line 10-20 words MAX)',
        'Write how real people talk - casual, imperfect, immediate reactions',
        'Use personality-appropriate humor and attitude',
        'DO NOT mention time, duration, or how long party has been in dungeon',
        'AVOID: "thee/thou", flowery metaphors, dramatic pronouncements, fantasy clichés',
        'AVOID: Modern slang ("cool", "okay", "yeah", "dude", "like")',
        'AVOID: Generic observations anyone could say',
        'DO NOT reference events not provided in context',
        'Keep each line under 256 characters',
        'BE BRIEF - quick comments, not speeches'
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
