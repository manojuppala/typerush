# TypeRush Usage Guide

## Quick Start

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Or build and run
npm run build
npm start
```

## Game Flow

### 1. Main Menu
When you start TypeRush, you'll see a welcome screen with three difficulty options:
- **Easy** (1): Short, common words
- **Medium** (2): Standard vocabulary
- **Hard** (3): Challenging, longer words

Press the number key for your chosen difficulty.

### 2. Typing Test
Once you select a difficulty:
- A random text appears at the top (30 words)
- Start typing immediately - the timer starts with your first keystroke
- Watch the real-time feedback:
  - **Green text** = Correctly typed
  - **Red background** = Incorrect character
  - **Gray text** = Not yet typed
  - **White background** = Current cursor position
- Your typed input appears below the target text
- Progress bar shows completion percentage and elapsed time

### 3. Results Screen
After completing the text, you'll see:
- **WPM (Words Per Minute)**: Your typing speed
- **Accuracy**: Percentage of correct characters
- **Time**: Total elapsed time
- **Character breakdown**: Correct vs incorrect

Performance ratings:
- 🏆 **Outstanding**: 80+ WPM with 95%+ accuracy
- ⭐ **Great**: 60+ WPM with 90%+ accuracy  
- 👍 **Good**: 40+ WPM
- 💪 **Keep Practicing**: Below 40 WPM

Press **ENTER** to return to menu or **Q** to quit.

## Keyboard Controls

| Key | Action |
|-----|--------|
| **1, 2, 3** | Select difficulty (Easy, Medium, Hard) |
| **Any character** | Type during test |
| **Backspace** | Delete last character |
| **ESC** | Return to menu during game |
| **Q** | Quit application |
| **ENTER** | Play again after results |
| **Ctrl+C** | Force exit |

## Tips for Best Results

1. **Focus on accuracy first** - Speed will come naturally
2. **Use the color coding** - Green is good, avoid red!
3. **Watch your progress** - The percentage helps pace yourself
4. **Start with Easy mode** - Build confidence before harder levels
5. **Take breaks** - Regular practice beats marathon sessions

## Troubleshooting

### Terminal not showing colors?
Make sure your terminal supports ANSI colors. Most modern terminals do.

### Input not registering?
The app uses raw mode for real-time input. If it's not working, try:
1. Press Ctrl+C to exit
2. Restart the application
3. Make sure your terminal window has focus

### Want to practice specific words?
Edit `src/words.ts` to customize the word lists for each difficulty level.

## Customization

### Change word count
In `src/game.ts`, modify:
```typescript
private wordCount: number = 30;  // Change to desired number
```

### Modify difficulty levels
Edit word lists in `src/words.ts`:
```typescript
export const wordLists = {
  easy: [...],    // Your easy words
  medium: [...],  // Your medium words
  hard: [...]     // Your hard words
};
```

### Adjust performance thresholds
In `src/ui.ts`, modify the `displayResults` method to change WPM/accuracy thresholds for ratings.

## Have Fun!

TypeRush is designed to make typing practice enjoyable. Track your improvement over time and challenge yourself to beat your personal best! 🚀
