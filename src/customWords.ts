import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface CustomWordList {
  name: string;
  words: string[];
}

export class CustomWordManager {
  private customListsDir: string;

  constructor() {
    const homeDir = os.homedir();
    const appDir = path.join(homeDir, '.typerush');
    this.customListsDir = path.join(appDir, 'wordlists');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(this.customListsDir)) {
      fs.mkdirSync(this.customListsDir, { recursive: true });
    }
  }

  loadCustomList(filename: string): CustomWordList | null {
    try {
      const filePath = path.join(this.customListsDir, filename);
      
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Support both JSON and plain text formats
      if (filename.endsWith('.json')) {
        const data = JSON.parse(content);
        return {
          name: data.name || path.basename(filename, '.json'),
          words: data.words || []
        };
      } else {
        // Plain text: one word per line
        const words = content
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
        
        return {
          name: path.basename(filename, '.txt'),
          words
        };
      }
    } catch (error) {
      console.error(`Error loading custom word list: ${error}`);
      return null;
    }
  }

  listAvailableWordLists(): string[] {
    try {
      if (!fs.existsSync(this.customListsDir)) {
        return [];
      }

      return fs.readdirSync(this.customListsDir)
        .filter(file => file.endsWith('.json') || file.endsWith('.txt'))
        .sort();
    } catch (error) {
      console.error(`Error listing word lists: ${error}`);
      return [];
    }
  }

  saveCustomList(name: string, words: string[]): boolean {
    try {
      const filename = `${name}.json`;
      const filePath = path.join(this.customListsDir, filename);
      
      const data = {
        name,
        words
      };

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Error saving custom word list: ${error}`);
      return false;
    }
  }

  createSampleWordList(): void {
    const sampleWords = [
      'sample', 'custom', 'words', 'list', 'example',
      'typescript', 'coding', 'practice', 'speed', 'typing'
    ];

    const samplePath = path.join(this.customListsDir, 'sample.json');
    
    if (!fs.existsSync(samplePath)) {
      this.saveCustomList('sample', sampleWords);
    }

    // Also create a plain text example
    const textSamplePath = path.join(this.customListsDir, 'example.txt');
    if (!fs.existsSync(textSamplePath)) {
      const textContent = sampleWords.join('\n');
      fs.writeFileSync(textSamplePath, textContent);
    }
  }

  getCustomListsDirectory(): string {
    return this.customListsDir;
  }
}
