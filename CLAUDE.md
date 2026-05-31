# TypeRush - Comprehensive Technical Documentation

## Project Overview

**TypeRush** is a feature-rich, interactive terminal-based typing speed test application built with TypeScript and Node.js. It provides multiple game modes, real-time performance tracking, persistent high score management, custom word lists, and experimental multiplayer functionality.

**Version**: 1.1.0
**License**: MIT
**Repository**: https://github.com/manojuppala/typerush
**NPM Package**: `typerush`

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Game Modes](#game-modes)
5. [Technical Implementation](#technical-implementation)
6. [Data Storage](#data-storage)
7. [Dependencies](#dependencies)
8. [Build & Deployment](#build--deployment)
9. [API Reference](#api-reference)
10. [Development Guide](#development-guide)

---

## Architecture Overview

TypeRush follows a modular, object-oriented architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                       Entry Point                            │
│                    (src/index.ts)                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   TypeRushGame                               │
│              Main Game Controller                            │
│    • State Management                                        │
│    • Input Handling                                          │
│    • Game Flow Orchestration                                 │
└─┬───────┬───────┬──────┬────────┬──────────┬────────────────┘
  │       │       │      │        │          │
  ▼       ▼       ▼      ▼        ▼          ▼
┌───┐  ┌────┐  ┌───┐  ┌────┐  ┌─────┐  ┌────────────┐
│UI │  │Stats│  │Words│ │High│  │Sound│  │Multiplayer │
│   │  │     │  │     │ │Score│ │     │  │Client/Srv  │
└───┘  └────┘  └───┘  └────┘  └─────┘  └────────────┘
  │                      │        │
  ▼                      ▼        ▼
┌─────────────────────────────────────────┐
│         File System Storage             │
│  ~/.typerush/                           │
│    ├── highscores.json                  │
│    └── wordlists/                       │
│         ├── sample.json                 │
│         └── example.txt                 │
└─────────────────────────────────────────┘
```

### Design Principles

1. **Modularity**: Each component has a single, well-defined responsibility
2. **Type Safety**: Full TypeScript coverage with strict mode enabled
3. **Persistence**: User data saved locally in `~/.typerush/`
4. **Real-time Feedback**: Character-by-character validation with immediate visual feedback
5. **Extensibility**: Easy to add new game modes, word lists, and features

---

## Project Structure

```
typerush/
├── src/                          # TypeScript source files
│   ├── index.ts                  # CLI entry point (#!/usr/bin/env node)
│   ├── game.ts                   # Main game controller & state machine
│   ├── ui.ts                     # Terminal UI rendering & display
│   ├── stats.ts                  # Statistics calculation (WPM, accuracy)
│   ├── words.ts                  # Built-in word lists & text generation
│   ├── highscore.ts              # High score persistence & management
│   ├── sound.ts                  # Terminal beep sound effects
│   ├── customWords.ts            # Custom word list loader
│   ├── server.ts                 # Multiplayer server entry point
│   └── multiplayer/              # Multiplayer components
│       ├── client.ts             # Multiplayer client (TCP)
│       └── server.ts             # Multiplayer server (TCP)
│
├── dist/                         # Compiled JavaScript (target for npm)
├── node_modules/                 # Dependencies
├── package.json                  # NPM package configuration
├── tsconfig.json                 # TypeScript compiler configuration
├── LICENSE                       # MIT License
├── README.md                     # User-facing documentation
├── FEATURES.md                   # Feature checklist
├── USAGE.md                      # Usage guide
├── CLAUDE.md                     # This file (technical documentation)
├── .gitignore                    # Git ignore patterns
└── .npmignore                    # NPM publish exclusions
```

---

## Core Components

### 1. TypeRushGame (`src/game.ts`)

**Primary Controller** - Manages game state, user input, and orchestrates all other components.

**Key Responsibilities**:

- State machine management (menu → playing → results → highscores)
- Keyboard input handling via Node.js `readline`
- Game mode selection and execution
- Real-time typing validation
- Integration with all subsystems

**State Flow**:

```
menu → playing → results → menu
  ↓
customMenu → playing → results → menu
  ↓
multiplayerSetup → multiplayerPlaying → results → menu
  ↓
highscores → menu
```

**Key Properties**:

- `state: GameState` - Current application state
- `difficulty: Difficulty` - Selected difficulty level
- `gameMode: GameMode` - Current game mode (normal/timed/multiplayer)
- `targetText: string` - Text the user must type
- `typedText: string` - What the user has typed so far
- `startTime: number` - Timestamp when typing began

**Game Modes**:

- `normal` - Classic mode with difficulty levels
- `timed` - 60-second challenge
- `multiplayer` - Real-time local network (LAN) competition

### 2. UI (`src/ui.ts`)

**Display Layer** - Handles all terminal rendering, text formatting, and visual feedback.

**Key Features**:

- ANSI escape sequences for cursor control
- Chalk library for color-coded text
- Box drawing with Unicode characters (╔═╗ ║ ╚═╝)
- Color coding: Green (correct), Red (errors), Gray (untyped), White background (cursor)

**Public Methods**:

- `clear()` - Clear terminal screen
- `hideCursor()` / `showCursor()` - Control cursor visibility
- `displayWelcome(topScores?)` - Render main menu with personal bests
- `displayText(target, typed, cursorPos)` - Real-time typing display
- `displayProgress(typed, total, wpm, accuracy)` - Live statistics
- `displayResults(stats, isNewRecord)` - Post-game statistics screen
- `displayHighScores(scoreData)` - High score leaderboard
- `displayMultiplayerProgress(players)` - Multiplayer live rankings

**Color Scheme**:

```typescript
Green (chalk.green)    → Correctly typed characters
Red (chalk.bgRed)      → Incorrectly typed characters
Gray (chalk.gray)      → Characters not yet typed
White BG (chalk.bgWhite.black) → Current cursor position
Cyan (chalk.cyan)      → Borders and headers
Yellow (chalk.yellow)  → Titles and highlights
```

### 3. Stats (`src/stats.ts`)

**Calculation Engine** - Computes typing performance metrics.

**Interface**:

```typescript
interface GameStats {
  wpm: number; // Words per minute
  accuracy: number; // Percentage (0-100)
  correctChars: number; // Count of correct characters
  incorrectChars: number; // Count of incorrect characters
  totalChars: number; // Total characters typed
  timeElapsed: number; // Time in seconds
}
```

**WPM Calculation**:

```typescript
words = correctChars / 5; // Standard: 5 chars = 1 word
wpm = words / timeElapsedMinutes;
```

**Accuracy Calculation**:

```typescript
accuracy = (correctChars / totalChars) * 100;
```

**Function**:

- `calculateStats(targetText, typedText, startTime, endTime)` → `GameStats`

### 4. Words (`src/words.ts`)

**Word Database** - Provides built-in word lists for each difficulty level.

**Word Lists**:

- **Easy** (50 words): Common short words (the, be, to, of, and, a, in...)
- **Medium** (50 words): Standard vocabulary (time, person, year, way...)
- **Hard** (48 words): Challenging words (accommodate, bureaucracy, entrepreneur...)

**Functions**:

- `getRandomWords(difficulty, count)` - Returns random words from specified difficulty
- `generateText(difficulty, wordCount)` - Generates space-separated text

**Usage**:

```typescript
const text = generateText("medium", 30); // 30 random medium words
```

### 5. HighScoreManager (`src/highscore.ts`)

**Persistence Layer** - Manages high score storage and retrieval.

**Storage Location**: `~/.typerush/highscores.json`

**Data Structure**:

```typescript
interface HighScoreData {
  easy: HighScore[]; // Top 10 for easy mode
  medium: HighScore[]; // Top 10 for medium mode
  hard: HighScore[]; // Top 10 for hard mode
  timed: HighScore[]; // Top 10 for timed mode
}

interface HighScore {
  wpm: number;
  accuracy: number;
  difficulty: string;
  date: string; // ISO 8601 timestamp
  time: number; // Elapsed time in seconds
}
```

**Public Methods**:

- `addScore(difficulty, wpm, accuracy, time)` → `boolean` - Returns true if top 10
- `getTopScore(difficulty)` → `HighScore | null` - Get #1 score
- `getTopScores(difficulty, count)` → `HighScore[]` - Get top N scores
- `getAllTopScores()` → Array of best scores across all modes
- `isNewRecord(difficulty, wpm)` → `boolean` - Check if WPM beats current best

**Sorting Logic**:

1. Primary: WPM (descending)
2. Secondary: Accuracy (descending)

### 6. SoundEffects (`src/sound.ts`)

**Audio Feedback** - Terminal bell/beep sounds for user feedback.

**Sound Types**:

- `error()` - Single beep on incorrect character (0x07)
- `success()` - Double beep on test completion
- `newRecord()` - Triple beep for new personal record
- `complete()` - Fast double beep on game finish

**Toggle**: Sound can be enabled/disabled via main menu (S key)

**Implementation**: Uses terminal bell character (`\x07`) via `process.stdout.write()`

### 7. CustomWordManager (`src/customWords.ts`)

**Custom Word Lists** - Loads user-defined word lists from disk.

**Storage Location**: `~/.typerush/wordlists/`

**Supported Formats**:

**1. JSON Format** (`.json`):

```json
{
  "name": "Programming Terms",
  "words": ["function", "variable", "loop", "array"]
}
```

**2. Plain Text** (`.txt`):

```
function
variable
loop
array
```

**Public Methods**:

- `loadCustomList(filename)` → `CustomWordList | null`
- `listAvailableWordLists()` → `string[]` - Returns all .json and .txt files
- `saveCustomList(name, words)` → `boolean`
- `createSampleWordList()` - Creates sample.json and example.txt
- `getCustomListsDirectory()` → `string`

**Auto-generated Samples**:

- `sample.json` - JSON format example
- `example.txt` - Plain text format example

### 8. Multiplayer Components (`src/multiplayer/`)

**Local Network Gaming** - TCP-based multiplayer functionality for LAN play.

#### MultiplayerServer (`src/multiplayer/server.ts`)

**Server Architecture**:

- TCP server using Node.js `net` module
- Room-based system for multiple concurrent games
- Real-time progress broadcasting
- Event-driven design using EventEmitter

**Key Features**:

- Player join/leave management
- Progress synchronization
- Game start coordination
- Winner announcement

**Data Structures**:

```typescript
interface GameRoom {
  id: string;
  players: Map<string, Player>;
  targetText: string;
  started: boolean;
  startTime: number;
}

interface Player {
  id: string;
  name: string;
  socket: net.Socket;
  progress: number;
  wpm: number;
  accuracy: number;
  finished: boolean;
}
```

**Message Protocol** (JSON over TCP):

- `join` - Player joins room
- `progress` - Update typing progress
- `finish` - Player completes test
- `playerJoined` - Broadcast new player
- `playerLeft` - Broadcast player disconnect
- `gameStart` - Signal game start
- `playerFinished` - Broadcast completion

**Usage**:

```bash
npm run server        # Development (ts-node)
npm run server:prod   # Production (compiled)
```

#### MultiplayerClient (`src/multiplayer/client.ts`)

**Client Architecture**:

- TCP client connecting to game server
- Event-driven progress updates
- Local player state management

**Public Methods**:

- `connect(host, port)` → `Promise<void>`
- `joinRoom(roomId, playerName, targetText)` → `void`
- `sendProgress(progress, wpm, accuracy)` → `void`
- `sendFinish(wpm, accuracy)` → `void`
- `disconnect()` → `void`
- `isConnected()` → `boolean`

**Events Emitted**:

- `joined` - Successfully joined room
- `gameStart` - Game started
- `progress` - Another player's progress update
- `playerFinished` - Another player finished

---

## Game Modes

### 1. Classic Mode (Normal)

**Difficulty Levels**:

- **Easy**: 50 common short words
- **Medium**: 50 standard vocabulary words
- **Hard**: 48 challenging words

**Flow**:

1. User selects difficulty (1/2/3)
2. System generates 30 random words from selected list
3. User types the text
4. Statistics calculated and displayed
5. High score updated if top 10

### 2. Timed Mode

**Characteristics**:

- Fixed 60-second duration
- Dynamic text generation (infinite scrolling)
- Real-time countdown timer
- Progress tracking (words typed)

**Implementation**:

```typescript
private timedModeEndTime: number = 0;
private timedModeInterval: NodeJS.Timeout | null = null;

// Timer updates every 100ms
setInterval(() => {
  const remaining = this.timedModeEndTime - Date.now();
  if (remaining <= 0) {
    this.endTimedMode();
  }
}, 100);
```

**Special Features**:

- Auto-generates more text as user types
- Shows remaining time prominently
- Tracks total words typed
- Separate high score leaderboard

### 3. Custom Mode

**Workflow**:

1. System checks `~/.typerush/wordlists/` for files
2. Creates sample files if directory is empty
3. Lists available .json and .txt files
4. User selects file by number
5. Loads words and generates test text

**File Auto-creation**:
On first use, creates:

- `sample.json` - 10-word sample in JSON format
- `example.txt` - Same 10 words in plain text

### 4. Multiplayer Mode (Experimental)

**Requirements**:

- Multiplayer server running (`npm run server`)
- All players on same local network (WiFi/Ethernet)
- Common room name

**Flow**:

1. Player enters server address (default: localhost:3000)
2. Player enters room name
3. Player enters display name
4. Wait for other players or start solo
5. Game starts - same text for all players
6. Real-time leaderboard shows all players' progress
7. Winner announced when someone finishes

**Network Protocol**:

- JSON messages over TCP
- Newline-delimited (`\n`)
- Message types: join, progress, finish, gameStart

---

## Technical Implementation

### Input Handling

**Readline Interface**:

```typescript
this.rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
}
```

**Key Events**:

- Character keys → Append to `typedText`
- Backspace → Remove last character
- Escape → Return to menu
- Enter → Submit/continue (context-dependent)

**Character Validation**:

```typescript
// Real-time validation on each keystroke
if (typedText[i] === targetText[i]) {
  // Correct - display green
} else {
  // Incorrect - display red + optional sound
}
```

### State Machine

**States**:

- `menu` - Main menu selection
- `playing` - Active typing test
- `results` - Post-game statistics
- `highscores` - Leaderboard view
- `customMenu` - Custom word list selection
- `multiplayerSetup` - Multiplayer connection setup
- `multiplayerPlaying` - Active multiplayer game

**Transitions**:

```typescript
setState(newState: GameState) {
  this.state = newState;
  // Trigger appropriate display update
}
```

### Terminal ANSI Sequences

**Cursor Control**:

- `\x1B[?25l` - Hide cursor
- `\x1B[?25h` - Show cursor
- `\x1B[${y};${x}H` - Move cursor to position
- `\x07` - Terminal bell/beep

**Color Codes** (via Chalk):

- Foreground: `chalk.green()`, `chalk.red()`, `chalk.gray()`
- Background: `chalk.bgRed()`, `chalk.bgWhite()`
- Modifiers: `chalk.bold()`, `chalk.cyan()`

---

## Data Storage

### File System Layout

```
~/.typerush/
├── highscores.json           # High score database
└── wordlists/                # Custom word lists
    ├── sample.json           # Auto-generated JSON example
    └── example.txt           # Auto-generated text example
```

### High Scores File Structure

**File**: `~/.typerush/highscores.json`

```json
{
  "easy": [
    {
      "wpm": 85,
      "accuracy": 98.5,
      "difficulty": "easy",
      "date": "2026-05-30T12:34:56.789Z",
      "time": 21.3
    }
  ],
  "medium": [...],
  "hard": [...],
  "timed": [...]
}
```

**Persistence Strategy**:

- Automatic save on score addition
- Top 10 scores per difficulty
- JSON formatted with 2-space indentation
- Sorted by WPM (primary) and accuracy (secondary)

---

## Dependencies

### Production Dependencies

**chalk** (^4.1.2)

- Terminal string styling
- Color-coded text output
- ANSI escape sequence handling

**readline** (^1.3.0)

- Terminal input handling
- Keypress event processing
- Raw mode terminal interface

### Development Dependencies

**typescript** (^5.0.0)

- TypeScript compiler
- Type checking
- ES2020 target compilation

**ts-node** (^10.9.0)

- TypeScript execution for development
- No pre-compilation required for dev mode

**@types/node** (^20.0.0)

- Node.js type definitions
- Full TypeScript IntelliSense support

---

## Build & Deployment

### Build Configuration

**TypeScript Config** (`tsconfig.json`):

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### NPM Scripts

```json
{
  "build": "tsc",
  "start": "node dist/index.js",
  "dev": "ts-node src/index.ts",
  "watch": "tsc --watch",
  "server": "ts-node src/server.ts",
  "server:prod": "node dist/server.js",
  "prepublishOnly": "npm run build"
}
```

### Publishing to NPM

**Package Files**:

```json
{
  "files": ["dist", "README.md", "LICENSE"]
}
```

**Excluded from NPM** (`.npmignore`):

- `src/` - TypeScript source files
- `tsconfig.json` - TypeScript config
- Development files
- Test files
- Documentation files (FEATURES.md, USAGE.md)

**Installation**:

```bash
npm install -g typerush
```

**Execution**:

```bash
typerush  # Runs dist/index.js via bin configuration
```

### Binary Configuration

```json
{
  "bin": {
    "typerush": "dist/index.js"
  }
}
```

**Shebang**: `#!/usr/bin/env node` in `dist/index.js`

---

## API Reference

### TypeRushGame Class

**Main Controller**

```typescript
class TypeRushGame {
  constructor();
  start(): void;
}
```

### UI Class

**Static Display Methods**

```typescript
class UI {
  static clear(): void;
  static hideCursor(): void;
  static showCursor(): void;
  static displayWelcome(topScores?: Array<{ difficulty: string; score: HighScore }>): void;
  static displayText(targetText: string, typedText: string, cursorPos: number): void;
  static displayProgress(typed: number, total: number, wpm: number, accuracy: number): void;
  static displayResults(stats: GameStats, isNewRecord: boolean): void;
  static displayHighScores(scores: HighScoreData): void;
  static displayMultiplayerProgress(players: Map<string, MultiplayerPlayer>): void;
}
```

### Stats Module

**Calculation Functions**

```typescript
function calculateStats(
  targetText: string,
  typedText: string,
  startTime: number,
  endTime: number,
): GameStats;
```

### Words Module

**Word Generation**

```typescript
function getRandomWords(difficulty: "easy" | "medium" | "hard", count: number): string[];

function generateText(difficulty: "easy" | "medium" | "hard", wordCount: number): string;
```

### HighScoreManager Class

**Score Management**

```typescript
class HighScoreManager {
  constructor();
  addScore(
    difficulty: "easy" | "medium" | "hard" | "timed",
    wpm: number,
    accuracy: number,
    time: number,
  ): boolean;
  getTopScore(difficulty: string): HighScore | null;
  getTopScores(difficulty: string, count?: number): HighScore[];
  getAllTopScores(): Array<{ difficulty: string; score: HighScore }>;
  isNewRecord(difficulty: string, wpm: number): boolean;
}
```

### SoundEffects Class

**Audio Feedback**

```typescript
class SoundEffects {
  constructor(enabled?: boolean);
  setEnabled(enabled: boolean): void;
  isEnabled(): boolean;
  error(): void;
  success(): void;
  newRecord(): void;
  complete(): void;
}
```

### CustomWordManager Class

**Custom Word List Management**

```typescript
class CustomWordManager {
  constructor();
  loadCustomList(filename: string): CustomWordList | null;
  listAvailableWordLists(): string[];
  saveCustomList(name: string, words: string[]): boolean;
  createSampleWordList(): void;
  getCustomListsDirectory(): string;
}
```

### MultiplayerClient Class

**Network Client**

```typescript
class MultiplayerClient extends EventEmitter {
  constructor();
  connect(host: string, port: number): Promise<void>;
  joinRoom(roomId: string, playerName: string, targetText: string): void;
  sendProgress(progress: number, wpm: number, accuracy: number): void;
  sendFinish(wpm: number, accuracy: number): void;
  disconnect(): void;
  isConnected(): boolean;
  getPlayerId(): string | null;
}
```

### MultiplayerServer Class

**Network Server**

```typescript
class MultiplayerServer extends EventEmitter {
  constructor(port?: number);
  start(): Promise<void>;
  stop(): void;
}
```

---

## Development Guide

### Setting Up Development Environment

```bash
# Clone repository
git clone https://github.com/manojuppala/typerush.git
cd typerush

# Install dependencies
npm install

# Run in development mode
npm run dev
```

### Making Changes

**1. Modify Source Files** (`src/`)

- Edit TypeScript files
- Changes auto-reload with `npm run dev`

**2. Test Changes**

```bash
npm run dev # Quick iteration
```

**3. Build for Production**

```bash
npm run build
npm start
```

### Adding New Features

**New Game Mode**:

1. Add mode to `GameMode` type in `game.ts`
2. Implement mode logic in `TypeRushGame` class
3. Add UI menu option in `ui.ts`
4. Update high score tracking if needed

**New Word List**:

1. Add list to `wordLists` object in `words.ts`
2. Update difficulty type
3. Add menu option

**New Multiplayer Feature**:

1. Define new message type in protocol
2. Implement handler in `MultiplayerServer`
3. Implement sender in `MultiplayerClient`
4. Update game logic

### Code Style

- **TypeScript strict mode** enabled
- **Explicit types** for function parameters and returns
- **Interface definitions** for complex data structures
- **Error handling** with try/catch
- **Descriptive variable names**

### Testing

**Manual Testing Checklist**:

- [ ] All game modes work (Easy, Medium, Hard, Timed)
- [ ] High scores save and load correctly
- [ ] Custom word lists load from both JSON and TXT
- [ ] Sound effects toggle works
- [ ] Multiplayer connection and gameplay
- [ ] Proper error handling on invalid input
- [ ] Terminal UI renders correctly

### Debugging

**Common Issues**:

1. **Terminal size** - Ensure terminal is at least 80 columns wide
2. **File permissions** - Check `~/.typerush/` directory permissions
3. **Network issues** - Verify server is running and players are on same LAN
4. **Sound not working** - Some terminals don't support beep character

**Debug Mode**:

```typescript
// Add console.log statements
console.error("Debug:", variable);

// Check state
console.log("Current state:", this.state);
```

---

## Performance Considerations

### Efficiency

- **Minimal re-renders**: UI only updates on state change
- **Event-driven**: No polling, pure event handlers
- **Lazy loading**: Word lists loaded on demand
- **Memory efficient**: Top 10 scores only, old scores discarded

### Scalability

**Single Player**:

- No scalability concerns
- Local file I/O is negligible

**Multiplayer**:

- Current: Single-threaded Node.js server
- Bottleneck: ~1000 concurrent connections per server
- Optimization: Load balancer + multiple server instances

---

## Future Enhancements

### Planned Features

1. **Online Leaderboards** - Global high score tracking
2. **More Game Modes** - Practice mode, zen mode, challenge mode
3. **Statistics Dashboard** - Progress tracking over time
4. **Achievement System** - Unlock badges and rewards
5. **Themes** - Customizable color schemes
6. **Language Support** - Multiple language word lists
7. **Replay System** - Watch your typing replays
8. **AI Opponent** - Practice against bot

### Architecture Improvements

1. **Database Backend** - Replace JSON files with SQLite
2. **WebSocket Server** - Better multiplayer protocol
3. **Configuration File** - User preferences (theme, sound, etc.)
4. **Plugin System** - Community-created word lists and themes
5. **Test Suite** - Automated testing with Jest

---

## Contributing

### How to Contribute

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Review Criteria

- TypeScript compilation succeeds
- No runtime errors
- Follows existing code style
- Maintains backward compatibility
- Includes documentation updates

---

## License

MIT License - See LICENSE file for details

---

## Support

- **Issues**: https://github.com/manojuppala/typerush/issues
- **Repository**: https://github.com/manojuppala/typerush
- **NPM**: https://www.npmjs.com/package/typerush

---

**Last Updated**: 2026-05-30
**Version**: 1.1.0
