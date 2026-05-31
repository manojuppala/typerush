import * as readline from "readline";
import chalk from "chalk";
import { generateText } from "./words";
import { calculateStats } from "./stats";
import { UI } from "./ui";
import { HighScoreManager } from "./highscore";
import { SoundEffects } from "./sound";
import { CustomWordManager } from "./customWords";
import { MultiplayerClient } from "./multiplayer/client";

type Difficulty = "easy" | "medium" | "hard" | "timed";
type GameState =
  | "menu"
  | "playing"
  | "results"
  | "highscores"
  | "customMenu"
  | "multiplayerSetup"
  | "multiplayerPlaying"
  | "timedMenu";
type GameMode = "normal" | "timed" | "multiplayer";
type TimedDuration = 30 | 60 | 120;

export class TypeRushGame {
  private rl: readline.Interface;
  private state: GameState = "menu";
  private difficulty: Difficulty = "easy";
  private targetText: string = "";
  private typedText: string = "";
  private startTime: number = 0;
  private wordCount: number = 30;
  private gameMode: GameMode = "normal";
  private highScoreManager: HighScoreManager;
  private soundEffects: SoundEffects;
  private customWordManager: CustomWordManager;
  private multiplayerClient: MultiplayerClient | null = null;

  // Timed mode
  private timedModeEndTime: number = 0;
  private timedModeInterval: NodeJS.Timeout | null = null;
  private timedModeDuration: TimedDuration = 60;
  private lastTypedChar: string = "";

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    this.highScoreManager = new HighScoreManager();
    this.soundEffects = new SoundEffects();
    this.customWordManager = new CustomWordManager();
    this.customWordManager.createSampleWordList();

    // Set raw mode for character-by-character input
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }

    readline.emitKeypressEvents(process.stdin);
  }

  async start() {
    UI.hideCursor();
    this.showMenu();

    process.stdin.on("keypress", (str, key) => {
      this.handleKeyPress(str, key);
    });

    // Handle cleanup on exit
    process.on("SIGINT", () => this.cleanup());
  }

  private showMenu() {
    this.state = "menu";
    const topScores = this.highScoreManager.getAllTopScores();
    UI.displayWelcome(topScores);
  }

  private startGame(difficulty: Difficulty, customWords?: string[]) {
    this.state = "playing";
    this.difficulty = difficulty;
    this.gameMode = "normal";

    if (customWords && customWords.length > 0) {
      const selectedWords: string[] = [];
      for (let i = 0; i < this.wordCount; i++) {
        selectedWords.push(customWords[Math.floor(Math.random() * customWords.length)]);
      }
      this.targetText = selectedWords.join(" ");
    } else {
      this.targetText = generateText(difficulty as "easy" | "medium" | "hard", this.wordCount);
    }

    this.typedText = "";
    this.startTime = 0; // Timer starts when user begins typing

    this.renderGame();
  }

  private showTimedModeMenu() {
    this.state = "timedMenu";
    UI.displayTimedModeMenu();
  }

  private startTimedMode(duration: TimedDuration) {
    this.state = "playing";
    this.gameMode = "timed";
    this.difficulty = "timed";
    this.timedModeDuration = duration;
    this.typedText = "";
    this.startTime = 0; // Timer starts when user begins typing
    this.timedModeEndTime = 0; // Will be set when user starts typing

    // Generate long text for timed mode
    this.targetText = generateText("medium", 200);

    this.renderGame();
  }

  private endTimedMode() {
    if (this.timedModeInterval) {
      clearInterval(this.timedModeInterval);
      this.timedModeInterval = null;
    }
    this.endGame();
  }

  private renderGame() {
    UI.clear();

    if (this.gameMode === "timed") {
      // Show full duration if timer hasn't started yet
      const timeRemaining =
        this.startTime === 0
          ? this.timedModeDuration
          : Math.max(0, Math.ceil((this.timedModeEndTime - Date.now()) / 1000));
      const wordsTyped = this.typedText.split(" ").filter((w) => w.length > 0).length;
      const currentWPM = this.calculateCurrentWPM();
      UI.displayTimedMode(timeRemaining, wordsTyped, currentWPM, this.timedModeDuration);
    }

    UI.displayText(this.targetText, this.typedText, this.typedText.length);

    if (this.gameMode === "normal") {
      UI.displayProgress(this.typedText, this.targetText, this.startTime);
    }

    if (this.gameMode === "multiplayer" && this.multiplayerClient) {
      UI.displayMultiplayerProgress(
        this.multiplayerClient.players,
        this.multiplayerClient.getPlayerId() || "",
      );
    }
  }

  private calculateCurrentWPM(): number {
    const elapsedMinutes = (Date.now() - this.startTime) / 60000;
    if (elapsedMinutes === 0) return 0;

    let correctChars = 0;
    for (let i = 0; i < this.typedText.length && i < this.targetText.length; i++) {
      if (this.typedText[i] === this.targetText[i]) {
        correctChars++;
      }
    }

    return Math.round(correctChars / 5 / elapsedMinutes);
  }

  private handleKeyPress(str: string, key: any) {
    if (key.ctrl && key.name === "c") {
      this.cleanup();
      return;
    }

    if (this.state === "menu") {
      this.handleMenuInput(str);
    } else if (this.state === "playing") {
      this.handleGameInput(str, key);
    } else if (this.state === "multiplayerPlaying") {
      this.handleGameInput(str, key);
    } else if (this.state === "multiplayerSetup") {
      this.handleMultiplayerLobbyInput(str, key);
    } else if (this.state === "results") {
      this.handleResultsInput(str);
    } else if (this.state === "highscores") {
      this.handleHighScoresInput(str);
    } else if (this.state === "customMenu") {
      this.handleCustomMenuInput(str, key);
    } else if (this.state === "timedMenu") {
      this.handleTimedMenuInput(str);
    }
  }

  private handleMenuInput(str: string) {
    const input = str?.toLowerCase();

    if (input === "1") {
      this.startGame("easy");
    } else if (input === "2") {
      this.startGame("medium");
    } else if (input === "3") {
      this.startGame("hard");
    } else if (input === "4") {
      this.showTimedModeMenu();
    } else if (input === "5") {
      this.showCustomWordListMenu();
    } else if (input === "6") {
      this.setupMultiplayer();
    } else if (input === "h") {
      this.showHighScores();
    } else if (input === "s") {
      this.toggleSound();
    } else if (input === "q") {
      this.cleanup();
    }
  }

  private showHighScores() {
    this.state = "highscores";
    const scores = [
      { difficulty: "easy", topScores: this.highScoreManager.getTopScores("easy", 5) },
      { difficulty: "medium", topScores: this.highScoreManager.getTopScores("medium", 5) },
      { difficulty: "hard", topScores: this.highScoreManager.getTopScores("hard", 5) },
      { difficulty: "timed", topScores: this.highScoreManager.getTopScores("timed", 5) },
    ];
    UI.displayHighScores(scores);
  }

  private handleHighScoresInput(str: string) {
    this.showMenu();
  }

  private handleTimedMenuInput(input: string) {
    if (input === "1") {
      this.startTimedMode(30);
    } else if (input === "2") {
      this.startTimedMode(60);
    } else if (input === "3") {
      this.startTimedMode(120);
    } else if (input === "q" || input === "escape") {
      this.showMenu();
    }
  }

  private toggleSound() {
    const newState = !this.soundEffects.isEnabled();
    this.soundEffects.setEnabled(newState);
    UI.displayInfo(`Sound effects ${newState ? "enabled" : "disabled"}`);
    setTimeout(() => this.showMenu(), 1000);
  }

  private showCustomWordListMenu() {
    this.state = "customMenu";
    const lists = this.customWordManager.listAvailableWordLists();
    UI.displayCustomWordListMenu(lists);
  }

  private handleCustomMenuInput(str: string, key: any) {
    if (key.name === "escape") {
      this.showMenu();
      return;
    }

    const lists = this.customWordManager.listAvailableWordLists();
    const index = parseInt(str) - 1;

    if (index >= 0 && index < lists.length) {
      const wordList = this.customWordManager.loadCustomList(lists[index]);
      if (wordList && wordList.words.length > 0) {
        this.startGame("easy", wordList.words);
      } else {
        UI.displayError("Failed to load word list");
        setTimeout(() => this.showCustomWordListMenu(), 2000);
      }
    }
  }

  private async setupMultiplayer() {
    this.state = "multiplayerSetup";
    UI.clear();

    console.log("\n");
    console.log(chalk.bold.cyan("  🌐 Multiplayer Setup"));
    console.log(chalk.gray("  " + "─".repeat(78)));
    console.log();
    console.log(chalk.dim("  Make sure the server is running: npm run server"));
    console.log();

    // Get server address
    const serverAddress = await this.prompt(
      chalk.cyan("  Enter server address (default: localhost:3000): "),
    );
    const address = serverAddress.trim() || "localhost:3000";
    const [host, portStr] = address.includes(":") ? address.split(":") : [address, "3000"];
    const port = parseInt(portStr) || 3000;

    // Get room name
    const roomName = await this.prompt(chalk.cyan("  Enter room name: "));
    if (!roomName.trim()) {
      UI.displayError("Room name cannot be empty");
      setTimeout(() => this.showMenu(), 2000);
      return;
    }

    // Get player name
    const playerName = await this.prompt(chalk.cyan("  Enter your name: "));
    if (!playerName.trim()) {
      UI.displayError("Player name cannot be empty");
      setTimeout(() => this.showMenu(), 2000);
      return;
    }

    // Connect to server
    UI.displayInfo("Connecting to server...");

    try {
      this.multiplayerClient = new MultiplayerClient();
      await this.multiplayerClient.connect(host, port);

      // Generate target text for the game (use medium difficulty for multiplayer)
      const multiplayerDifficulty: "easy" | "medium" | "hard" =
        this.difficulty === "timed" ? "medium" : this.difficulty;
      this.targetText = generateText(multiplayerDifficulty, this.wordCount);

      // Join room
      this.multiplayerClient.joinRoom(roomName.trim(), playerName.trim(), this.targetText);

      // Set up event listeners
      this.setupMultiplayerListeners();

      // Wait for joined confirmation
      this.multiplayerClient.once("joined", (data: any) => {
        this.showMultiplayerLobby(roomName.trim());
      });
    } catch (error) {
      UI.displayError(
        `Failed to connect: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      if (this.multiplayerClient) {
        this.multiplayerClient.disconnect();
        this.multiplayerClient = null;
      }
      setTimeout(() => this.showMenu(), 2000);
    }
  }

  private setupMultiplayerListeners() {
    if (!this.multiplayerClient) return;

    this.multiplayerClient.on("playerJoined", (data: any) => {
      if (this.state === "multiplayerSetup") {
        this.showMultiplayerLobby(data.roomId || "game");
      }
    });

    this.multiplayerClient.on("playerLeft", (data: any) => {
      if (this.state === "multiplayerSetup") {
        this.showMultiplayerLobby(data.roomId || "game");
      }
    });

    this.multiplayerClient.on("playerFinished", (data: any) => {
      // Show notification about finished player
      if (this.state === "multiplayerPlaying") {
        this.renderGame();
      }
    });
  }

  private showMultiplayerLobby(roomId: string) {
    if (!this.multiplayerClient) return;

    const playerCount = this.multiplayerClient.players.size + 1; // +1 for current player
    UI.displayMultiplayerLobby(roomId, playerCount);
  }

  private prompt(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  }

  private handleMultiplayerLobbyInput(_str: string, key: any) {
    if (key.name === "escape") {
      // Leave multiplayer
      if (this.multiplayerClient) {
        this.multiplayerClient.disconnect();
        this.multiplayerClient = null;
      }
      this.showMenu();
    } else if (key.name === "return" || key.name === "enter") {
      // Start game
      this.startMultiplayerGame();
    }
  }

  private startMultiplayerGame() {
    if (!this.multiplayerClient) return;

    this.state = "multiplayerPlaying";
    this.gameMode = "multiplayer";
    this.typedText = "";
    this.startTime = 0; // Timer starts when user begins typing

    this.renderGame();
  }

  private handleGameInput(str: string, key: any) {
    if (key.name === "escape") {
      if (this.timedModeInterval) {
        clearInterval(this.timedModeInterval);
        this.timedModeInterval = null;
      }
      this.showMenu();
      return;
    }

    const previousLength = this.typedText.length;

    if (key.name === "backspace") {
      if (this.typedText.length > 0) {
        this.typedText = this.typedText.slice(0, -1);
      }
    } else if (str && str.length === 1 && !key.ctrl) {
      // Start timer on first character typed
      if (this.typedText.length === 0 && this.startTime === 0) {
        this.startTime = Date.now();

        // For timed mode, set the end time and start the countdown
        if (this.gameMode === "timed") {
          this.timedModeEndTime = Date.now() + this.timedModeDuration * 1000;

          // Update timer every second
          this.timedModeInterval = setInterval(() => {
            const timeLeft = Math.max(0, Math.ceil((this.timedModeEndTime - Date.now()) / 1000));
            if (timeLeft === 0) {
              this.endTimedMode();
            } else {
              this.renderGame();
            }
          }, 1000);
        }
      }

      this.typedText += str;
      this.lastTypedChar = str;

      // Check if character is incorrect and play error sound
      const charIndex = this.typedText.length - 1;
      if (charIndex < this.targetText.length && str !== this.targetText[charIndex]) {
        this.soundEffects.error();
      }
    }

    this.renderGame();

    // Send progress in multiplayer mode
    if (
      this.gameMode === "multiplayer" &&
      this.multiplayerClient &&
      this.typedText.length !== previousLength
    ) {
      const progress = Math.round((this.typedText.length / this.targetText.length) * 100);
      const currentWPM = this.calculateCurrentWPM();
      const accuracy = this.calculateCurrentAccuracy();
      this.multiplayerClient.sendProgress(progress, currentWPM, accuracy);
    }

    // Check if game is complete
    if (this.typedText.length >= this.targetText.length) {
      if (this.gameMode === "normal" || this.gameMode === "multiplayer") {
        this.endGame();
      }
    }
  }

  private calculateCurrentAccuracy(): number {
    if (this.typedText.length === 0) return 100;

    let correct = 0;
    for (let i = 0; i < this.typedText.length && i < this.targetText.length; i++) {
      if (this.typedText[i] === this.targetText[i]) {
        correct++;
      }
    }

    return Math.round((correct / this.typedText.length) * 100);
  }

  private handleResultsInput(str: string) {
    const input = str?.toLowerCase();

    if (input === "q") {
      this.cleanup();
    } else if (str === "\r" || str === "\n") {
      this.showMenu();
    }
  }

  private endGame() {
    const endTime = Date.now();
    const stats = calculateStats(this.targetText, this.typedText, this.startTime, endTime);

    // Save high score
    const difficultyKey =
      this.difficulty === "timed"
        ? "timed"
        : this.difficulty === "easy"
          ? "easy"
          : this.difficulty === "medium"
            ? "medium"
            : "hard";

    const isNewRecord = this.highScoreManager.isNewRecord(difficultyKey, stats.wpm);
    this.highScoreManager.addScore(difficultyKey, stats.wpm, stats.accuracy, stats.timeElapsed);

    // Play appropriate sound
    if (isNewRecord) {
      this.soundEffects.newRecord();
    } else {
      this.soundEffects.complete();
    }

    // Send finish in multiplayer mode
    if (this.gameMode === "multiplayer" && this.multiplayerClient) {
      this.multiplayerClient.sendFinish(stats.wpm, stats.accuracy);
    }

    this.state = "results";
    UI.displayResults(stats, isNewRecord);
  }

  private cleanup() {
    if (this.timedModeInterval) {
      clearInterval(this.timedModeInterval);
    }

    if (this.multiplayerClient) {
      this.multiplayerClient.disconnect();
    }

    UI.showCursor();
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }
    this.rl.close();
    process.exit(0);
  }
}
