// Zombie Typing Survival - English Word Dictionary
const WORD_DATABASE = {
  // Easy / Fast zombies (3-4 letters)
  easy: [
    "run", "rot", "fog", "gun", "rip", "arm", "gut", "war", "die", "eye", "raw",
    "dead", "bite", "fear", "bone", "dark", "flesh", "tomb", "burn", "prey",
    "hunt", "claw", "cold", "evil", "fall", "howl", "kill", "limp", "lurk",
    "pain", "rage", "ruin", "scar", "weep", "yell", "grim", "hate", "hurt",
    "mist", "mute", "pale", "roar", "rust", "seek", "trap", "vein", "void",
    "wail", "crypt", "dusk", "gore", "haze", "iron", "omen", "sick", "skin",
    "bite", "fire", "shot", "ammo", "safe", "fast", "fury", "fang", "ghoul"
  ],

  // Medium / Walkers (5-6 letters)
  medium: [
    "zombie", "corpse", "scream", "horror", "poison", "shadow", "terror",
    "walker", "hunter", "hungry", "savage", "rotten", "brains", "dagger",
    "coffin", "creepy", "cursed", "danger", "decay", "demon", "fangs",
    "frenzy", "deadly", "ghost", "graves", "ground", "infect", "lethal",
    "lurk", "madness", "plague", "raven", "sever", "sickle", "skulls",
    "stalker", "undead", "venom", "weapon", "wraith", "reaper", "mutant",
    "breath", "panic", "bullet", "shield", "combat", "danger", "victim",
    "bloody", "claws", "chaser", "sentry", "strike", "target", "walker"
  ],

  // Hard / Brutes & Tanks (7-9 letters)
  hard: [
    "infection", "graveyard", "nightmare", "cemetery", "ferocious", "pathogen",
    "parasite", "barricade", "apocalypse", "monstrous", "quarantine", "undeadly",
    "pestilence", "relentless", "scavenger", "screaming", "suffering", "creature",
    "infestation", "carnivore", "hazardous", "paralyze", "slaughter", "bloodshed",
    "darkness", "skeleton", "cannibal", "survival", "survivor", "headshot",
    "evacuate", "fortress", "pandemic", "terminal", "outbreak", "biohazard"
  ],

  // Boss / Colossus (10+ letters or tough combinations)
  boss: [
    "abomination", "resurrection", "annihilation", "contamination",
    "extermination", "devastation", "hallucination", "claustrophobia",
    "uncontainable", "necromancer", "decomposition", "unforgiving",
    "radioactivity", "disintegration", "invulnerable", "bloodcurdling"
  ]
};

// Word generator with repetition protection
class WordManager {
  constructor() {
    this.usedWords = new Set();
  }

  getWord(difficulty = 'easy', activeWordsOnScreen = []) {
    let pool = WORD_DATABASE[difficulty] || WORD_DATABASE.easy;
    
    // Filter out words currently displayed on screen or recently used
    const activeSet = new Set(activeWordsOnScreen.map(w => w.toLowerCase()));
    let available = pool.filter(w => !activeSet.has(w.toLowerCase()) && !this.usedWords.has(w.toLowerCase()));
    
    if (available.length === 0) {
      // Clear recent memory if exhausted
      this.usedWords.clear();
      available = pool.filter(w => !activeSet.has(w.toLowerCase()));
      if (available.length === 0) available = pool;
    }

    // Pick random
    const chosen = available[Math.floor(Math.random() * available.length)];
    this.usedWords.add(chosen.toLowerCase());
    if (this.usedWords.size > 80) {
      const firstEntry = this.usedWords.values().next().value;
      this.usedWords.delete(firstEntry);
    }
    return chosen;
  }
}
