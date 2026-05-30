# TypeRush 🚀

An interactive terminal-based typing speed application built with TypeScript.

## Features

### Core Features

- **Three Difficulty Levels**: Easy, Medium, and Hard
- **Real-time Feedback**: See your progress as you type with color-coded feedback
- **Accurate Statistics**: Track your WPM (Words Per Minute), accuracy, and time
- **Beautiful Terminal UI**: Clean and colorful interface using chalk
- **Instant Results**: Get detailed performance metrics after each test

### Advanced Features

- **🏆 High Score Tracking**: Automatically saves your best scores to disk
- **⏱️ Timed Mode**: 60-second challenge - type as much as you can!
- **📝 Custom Word Lists**: Load your own word lists from files
- **🔊 Sound Effects**: Audio feedback for mistakes and achievements (can be toggled)
- **👥 Multiplayer Mode**: Compete with others over the network (experimental)

## Installation

### Install from npm (Recommended)

```bash
# Install globally
npm install -g typerush

# Run the game
typerush
```

### Install from source

```bash
# Clone the repository
git clone https://github.com/manojuppala/typerush.git
cd typerush

# Install dependencies
npm install

# Build and run
npm run build
npm start
```

## Usage

### Quick Start

After installing globally, simply run:

```bash
typerush
```

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

## How to Play

### Game Modes

1. **Classic Mode** (1-3): Choose Easy, Medium, or Hard difficulty
2. **Timed Mode** (4): Type as many words as possible in 60 seconds
3. **Custom Mode** (5): Use your own word lists
4. **Multiplayer** (6): Compete with others in real-time (requires server)

### Playing

1. **Select Mode**: Press the number for your chosen mode
2. **Start Typing**: Type the displayed text as accurately and quickly as possible
3. **See Results**: When finished, view your WPM, accuracy, and other stats
4. **Check High Scores**: Press H to view your personal bests
5. **Play Again**: Press ENTER to return to the menu

## Controls

### Main Menu

- **1, 2, 3**: Select difficulty level (Easy, Medium, Hard)
- **4**: Timed mode
- **5**: Custom word lists
- **6**: Multiplayer mode
- **H**: View high scores
- **S**: Toggle sound effects
- **Q**: Quit the game

### During Game

- **ESC**: Return to menu
- **Backspace**: Delete last character
- **Ctrl+C**: Exit application

### After Results

- **ENTER**: Play again
- **Q**: Quit

## Color Coding

- **Green**: Correctly typed characters
- **Red**: Incorrectly typed characters
- **Gray**: Characters not yet typed
- **White Background**: Current cursor position

## Statistics

- **WPM**: Words per minute (calculated as characters / 5 / minutes)
- **Accuracy**: Percentage of correctly typed characters
- **Time**: Total time elapsed in seconds
- **Correct/Incorrect Characters**: Detailed breakdown of your typing

## Performance Ratings

- **🏆 Outstanding**: 80+ WPM with 95%+ accuracy
- **⭐ Great**: 60+ WPM with 90%+ accuracy
- **👍 Good**: 40+ WPM
- **💪 Keep Practicing**: Below 40 WPM

## Advanced Features

### High Score Tracking

Your best scores are automatically saved to `~/.typerush/highscores.json`. The top 10 scores for each difficulty are preserved, and you'll see a "NEW PERSONAL RECORD!" message when you beat your best.

- Press **H** from the main menu to view all high scores
- Scores are tracked separately for each difficulty and timed mode
- Your personal best is displayed on the main menu

### Timed Mode

Challenge yourself to type as many words as possible in 60 seconds!

- Press **4** from the main menu
- A timer counts down from 60 seconds
- Type continuously - the text auto-generates as needed
- See your words typed, current WPM, and time remaining
- Great for building speed and endurance!

### Custom Word Lists

Create your own practice sessions with custom vocabulary!

**Location**: `~/.typerush/wordlists/`

**Supported Formats**:

1. **JSON Format** (`.json`):

```json
{
  "name": "Programming Terms",
  "words": ["function", "variable", "loop", "array", "object"]
}
```

2. **Plain Text** (`.txt`):

```
function
variable
loop
array
object
```

**Usage**:

1. Press **5** from the main menu
2. Select your custom word list
3. Start typing!

Sample word lists are automatically created on first run.

### Sound Effects

Audio feedback enhances your typing experience:

- **Error beep**: When you type an incorrect character
- **Success sound**: When you complete a test
- **New record fanfare**: When you beat your personal best

Toggle sound on/off by pressing **S** from the main menu.

### Multiplayer Mode (Experimental)

Compete with friends in real-time typing races!

**Setup**:

1. **Start the server** (on one computer):

   ```bash
   npm run server
   ```

2. **Players connect** (from the main menu):
   - Press **6** for multiplayer mode
   - Enter server address and room name
   - Wait for other players

**Features**:

- See other players' progress in real-time
- Live WPM and accuracy updates
- Race to finish first!

**Note**: Currently requires manual server setup. Local network or port forwarding needed for internet play.

## Project Structure

```
typerush/
├── src/
│   ├── index.ts      # Entry point
│   ├── game.ts       # Main game logic
│   ├── ui.ts         # Terminal UI components
│   ├── stats.ts      # Statistics calculation
│   └── words.ts      # Word database
├── dist/             # Compiled JavaScript
├── package.json
└── tsconfig.json
```

## Technologies

- **TypeScript**: Type-safe JavaScript
- **Node.js**: Runtime environment
- **Chalk**: Terminal string styling
- **Readline**: Terminal input handling

## License

MIT
