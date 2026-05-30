import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface HighScore {
  wpm: number;
  accuracy: number;
  difficulty: string;
  date: string;
  time: number;
}

export interface HighScoreData {
  easy: HighScore[];
  medium: HighScore[];
  hard: HighScore[];
  timed: HighScore[];
}

export class HighScoreManager {
  private scoreFile: string;
  private scores: HighScoreData;

  constructor() {
    const homeDir = os.homedir();
    const appDir = path.join(homeDir, '.typerush');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(appDir)) {
      fs.mkdirSync(appDir, { recursive: true });
    }
    
    this.scoreFile = path.join(appDir, 'highscores.json');
    this.scores = this.loadScores();
  }

  private loadScores(): HighScoreData {
    if (fs.existsSync(this.scoreFile)) {
      try {
        const data = fs.readFileSync(this.scoreFile, 'utf-8');
        return JSON.parse(data);
      } catch (error) {
        console.error('Error loading scores:', error);
      }
    }
    
    return {
      easy: [],
      medium: [],
      hard: [],
      timed: []
    };
  }

  private saveScores(): void {
    try {
      fs.writeFileSync(this.scoreFile, JSON.stringify(this.scores, null, 2));
    } catch (error) {
      console.error('Error saving scores:', error);
    }
  }

  addScore(difficulty: 'easy' | 'medium' | 'hard' | 'timed', wpm: number, accuracy: number, time: number): boolean {
    const newScore: HighScore = {
      wpm,
      accuracy,
      difficulty,
      date: new Date().toISOString(),
      time
    };

    this.scores[difficulty].push(newScore);
    
    // Sort by WPM descending, then by accuracy
    this.scores[difficulty].sort((a, b) => {
      if (b.wpm !== a.wpm) return b.wpm - a.wpm;
      return b.accuracy - a.accuracy;
    });
    
    // Keep only top 10 scores
    this.scores[difficulty] = this.scores[difficulty].slice(0, 10);
    
    this.saveScores();
    
    // Return true if it's in top 10
    return this.scores[difficulty].some(s => s.date === newScore.date);
  }

  getTopScore(difficulty: 'easy' | 'medium' | 'hard' | 'timed'): HighScore | null {
    return this.scores[difficulty][0] || null;
  }

  getTopScores(difficulty: 'easy' | 'medium' | 'hard' | 'timed', count: number = 5): HighScore[] {
    return this.scores[difficulty].slice(0, count);
  }

  getAllTopScores(): { difficulty: string; score: HighScore }[] {
    const result: { difficulty: string; score: HighScore }[] = [];
    
    for (const [difficulty, scores] of Object.entries(this.scores)) {
      if (scores.length > 0) {
        result.push({ difficulty, score: scores[0] });
      }
    }
    
    return result.sort((a, b) => {
      if (b.score.wpm !== a.score.wpm) return b.score.wpm - a.score.wpm;
      return b.score.accuracy - a.score.accuracy;
    });
  }

  isNewRecord(difficulty: 'easy' | 'medium' | 'hard' | 'timed', wpm: number): boolean {
    const topScore = this.getTopScore(difficulty);
    return !topScore || wpm > topScore.wpm;
  }
}
