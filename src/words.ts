export const wordLists = {
  easy: [
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "I",
    "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
    "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
    "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
    "so", "up", "out", "if", "about", "who", "get", "which", "go", "me"
  ],
  medium: [
    "time", "person", "year", "way", "day", "thing", "man", "world", "life", "hand",
    "part", "child", "eye", "woman", "place", "work", "week", "case", "point", "government",
    "company", "number", "group", "problem", "fact", "good", "new", "first", "last", "long",
    "great", "little", "own", "other", "old", "right", "big", "high", "different", "small",
    "large", "next", "early", "young", "important", "few", "public", "bad", "same", "able"
  ],
  hard: [
    "accommodate", "acknowledge", "acquaintance", "bureaucracy", "cemetery", "conscientious",
    "consensus", "definitely", "embarrass", "entrepreneur", "environment", "exaggerate",
    "fahrenheit", "government", "harassment", "immediately", "intelligence", "maintenance",
    "millennium", "necessary", "occurrence", "parliament", "perseverance", "privilege",
    "pronunciation", "questionnaire", "recommend", "restaurant", "rhythm", "schedule",
    "separate", "surveillance", "temperature", "thorough", "vacuum", "Wednesday",
    "anonymous", "belligerent", "curious", "diligent", "eloquent", "ferocious",
    "gregarious", "humorous", "ingenious", "jealous", "knowledge", "language"
  ]
};

export function getRandomWords(difficulty: keyof typeof wordLists, count: number): string[] {
  const words = wordLists[difficulty];
  const result: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * words.length);
    result.push(words[randomIndex]);
  }
  
  return result;
}

export function generateText(difficulty: keyof typeof wordLists, wordCount: number = 30): string {
  return getRandomWords(difficulty, wordCount).join(' ');
}
