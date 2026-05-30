export interface GameStats {
  wpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
  timeElapsed: number;
}

export function calculateStats(
  targetText: string,
  typedText: string,
  startTime: number,
  endTime: number
): GameStats {
  const timeElapsedSeconds = (endTime - startTime) / 1000;
  const timeElapsedMinutes = timeElapsedSeconds / 60;
  
  let correctChars = 0;
  let incorrectChars = 0;
  
  for (let i = 0; i < typedText.length; i++) {
    if (i < targetText.length && typedText[i] === targetText[i]) {
      correctChars++;
    } else {
      incorrectChars++;
    }
  }
  
  const totalChars = typedText.length;
  const accuracy = totalChars > 0 ? (correctChars / totalChars) * 100 : 0;
  
  // WPM calculation: (characters typed / 5) / minutes
  const words = correctChars / 5;
  const wpm = timeElapsedMinutes > 0 ? Math.round(words / timeElapsedMinutes) : 0;
  
  return {
    wpm,
    accuracy: Math.round(accuracy * 10) / 10,
    correctChars,
    incorrectChars,
    totalChars,
    timeElapsed: Math.round(timeElapsedSeconds * 10) / 10
  };
}
