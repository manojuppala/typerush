import chalk from "chalk";
import { GameStats } from "./stats";
import { HighScore } from "./highscore";

export class UI {
  static clear() {
    console.clear();
  }

  static hideCursor() {
    process.stdout.write("\x1B[?25l");
  }

  static showCursor() {
    process.stdout.write("\x1B[?25h");
  }

  static moveCursor(x: number, y: number) {
    process.stdout.write(`\x1B[${y};${x}H`);
  }

  static drawBox(title: string, width: number = 80) {
    const topBorder = "╔" + "═".repeat(width - 2) + "╗";
    const bottomBorder = "╚" + "═".repeat(width - 2) + "╝";
    const titlePadding = Math.floor((width - title.length - 2) / 2);
    const titleLine =
      "║" +
      " ".repeat(titlePadding) +
      title +
      " ".repeat(width - titlePadding - title.length - 2) +
      "║";

    console.log(chalk.cyan(topBorder));
    console.log(chalk.cyan(titleLine));
    console.log(chalk.cyan(bottomBorder));
  }

  static displayWelcome(topScores?: { difficulty: string; score: HighScore }[]) {
    this.clear();
    console.log("\n");
    console.log(
      chalk.bold.cyan(
        "╔════════════════════════════════════════════════════════════════════════════╗",
      ),
    );
    console.log(
      chalk.bold.cyan("║") +
        chalk.bold.yellow(
          "                              TYPE RUSH                                     ",
        ) +
        chalk.bold.cyan("║"),
    );
    console.log(
      chalk.bold.cyan(
        "╚════════════════════════════════════════════════════════════════════════════╝",
      ),
    );
    console.log("\n");
    console.log(chalk.white("  Welcome to TypeRush - Test your typing speed!"));
    console.log("\n");
    console.log(chalk.gray("  Select mode:"));
    console.log(chalk.green("    1) Easy   ") + chalk.gray("- Common short words"));
    console.log(chalk.yellow("    2) Medium ") + chalk.gray("- Standard vocabulary"));
    console.log(chalk.red("    3) Hard   ") + chalk.gray("- Challenging words"));
    console.log(chalk.magenta("    4) Timed  ") + chalk.gray("- 60 second challenge"));
    console.log(chalk.cyan("    5) Custom ") + chalk.gray("- Use custom word list"));
    console.log(chalk.blue("    6) Multi  ") + chalk.gray("- Multiplayer mode"));
    console.log("\n");
    console.log(chalk.gray("  Options:"));
    console.log(chalk.white("    H) High Scores  S) Sound Toggle  Q) Quit"));

    if (topScores && topScores.length > 0) {
      console.log("\n");
      console.log(chalk.bold("  🏆 Personal Best:"));
      const best = topScores[0];
      console.log(
        chalk.yellow(
          `    ${best.difficulty.toUpperCase()}: ${best.score.wpm} WPM (${best.score.accuracy}%)`,
        ),
      );
    }
    console.log("\n");
  }

  static displayText(targetText: string, typedText: string, cursorPos: number) {
    console.log("\n");
    console.log(chalk.bold("  Text to type:"));
    console.log(chalk.gray("  " + "─".repeat(78)));
    console.log();

    let displayLine = "  ";

    for (let i = 0; i < targetText.length; i++) {
      if (i < typedText.length) {
        if (typedText[i] === targetText[i]) {
          displayLine += chalk.green(targetText[i]);
        } else {
          displayLine += chalk.bgRed.white(targetText[i]);
        }
      } else if (i === cursorPos) {
        displayLine += chalk.bgWhite.black(targetText[i]);
      } else {
        displayLine += chalk.gray(targetText[i]);
      }
    }

    console.log(displayLine);
    console.log();
    console.log(chalk.gray("  " + "─".repeat(78)));
    console.log(chalk.dim.gray("  Press ESC to exit"));
  }

  static displayProgress(typedText: string, targetText: string, startTime: number) {
    const progress = (typedText.length / targetText.length) * 100;
    const elapsed = startTime === 0 ? "0.0" : ((Date.now() - startTime) / 1000).toFixed(1);

    console.log();
    console.log(
      chalk.cyan(`  Progress: ${progress.toFixed(0)}%`) + chalk.gray(` | Time: ${elapsed}s`),
    );
    if (startTime === 0) {
      console.log(chalk.dim.gray("  Type to start the timer..."));
    }
    console.log();
  }

  static displayResults(stats: GameStats, isNewRecord: boolean = false) {
    this.clear();
    console.log("\n");
    console.log(
      chalk.bold.cyan(
        "╔════════════════════════════════════════════════════════════════════════════╗",
      ),
    );
    console.log(
      chalk.bold.cyan("║") +
        chalk.bold.yellow(
          "                            RESULTS                                         ",
        ) +
        chalk.bold.cyan("║"),
    );
    console.log(
      chalk.bold.cyan(
        "╚════════════════════════════════════════════════════════════════════════════╝",
      ),
    );
    console.log("\n");

    if (isNewRecord) {
      console.log(chalk.bold.yellow("  🎉 NEW PERSONAL RECORD! 🎉"));
      console.log("\n");
    }

    const wpmColor = stats.wpm >= 60 ? chalk.green : stats.wpm >= 40 ? chalk.yellow : chalk.red;
    const accColor =
      stats.accuracy >= 95 ? chalk.green : stats.accuracy >= 80 ? chalk.yellow : chalk.red;

    console.log(wpmColor.bold(`  ⚡ Words Per Minute: ${stats.wpm} WPM`));
    console.log(accColor.bold(`  ✓ Accuracy: ${stats.accuracy}%`));
    console.log(chalk.white(`  ⏱  Time: ${stats.timeElapsed}s`));
    console.log(chalk.white(`  ✎ Correct Characters: ${stats.correctChars}`));
    console.log(chalk.white(`  ✗ Incorrect Characters: ${stats.incorrectChars}`));
    console.log("\n");

    if (stats.wpm >= 80 && stats.accuracy >= 95) {
      console.log(chalk.green.bold("  🏆 Outstanding! You're a typing master!"));
    } else if (stats.wpm >= 60 && stats.accuracy >= 90) {
      console.log(chalk.yellow.bold("  ⭐ Great job! Keep practicing!"));
    } else if (stats.wpm >= 40) {
      console.log(chalk.blue.bold("  👍 Good effort! You're improving!"));
    } else {
      console.log(chalk.gray.bold("  💪 Keep practicing to improve your speed!"));
    }

    console.log("\n");
    console.log(chalk.gray("  Press ENTER to play again, or Q to quit"));
    console.log("\n");
  }

  static displayHighScores(scores: { difficulty: string; topScores: HighScore[] }[]) {
    this.clear();
    console.log("\n");
    console.log(
      chalk.bold.cyan(
        "╔════════════════════════════════════════════════════════════════════════════╗",
      ),
    );
    console.log(
      chalk.bold.cyan("║") +
        chalk.bold.yellow(
          "                         HIGH SCORES                                        ",
        ) +
        chalk.bold.cyan("║"),
    );
    console.log(
      chalk.bold.cyan(
        "╚════════════════════════════════════════════════════════════════════════════╝",
      ),
    );
    console.log("\n");

    for (const { difficulty, topScores } of scores) {
      if (topScores.length === 0) continue;

      console.log(chalk.bold(`  ${difficulty.toUpperCase()}:`));

      topScores.slice(0, 5).forEach((score, index) => {
        const rank = index + 1;
        const date = new Date(score.date).toLocaleDateString();
        const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}.`;
        console.log(chalk.white(`    ${medal} ${score.wpm} WPM (${score.accuracy}%) - ${date}`));
      });

      console.log();
    }

    console.log(chalk.gray("  Press any key to return to menu"));
    console.log("\n");
  }

  static displayTimedModeMenu() {
    this.clear();
    console.log("\n");
    console.log(
      chalk.bold.cyan(
        "╔════════════════════════════════════════════════════════════════════════════╗",
      ),
    );
    console.log(
      chalk.bold.cyan("║") +
        chalk.bold.yellow(
          "                          TIMED MODE                                        ",
        ) +
        chalk.bold.cyan("║"),
    );
    console.log(
      chalk.bold.cyan(
        "╚════════════════════════════════════════════════════════════════════════════╝",
      ),
    );
    console.log("\n");
    console.log(chalk.white("  Select duration:"));
    console.log("\n");
    console.log(chalk.green("    1) 30 seconds  ") + chalk.gray("- Quick sprint"));
    console.log(chalk.yellow("    2) 60 seconds  ") + chalk.gray("- Standard challenge"));
    console.log(chalk.red("    3) 120 seconds ") + chalk.gray("- Endurance test"));
    console.log("\n");
    console.log(chalk.gray("    Q) Back to main menu"));
    console.log("\n");
  }

  static displayTimedMode(
    timeRemaining: number,
    wordsTyped: number,
    currentWPM: number,
    totalDuration: number,
  ) {
    console.log("\n");
    console.log(chalk.bold("  ⏱  TIMED MODE - Type as much as you can!"));
    console.log(chalk.gray("  " + "─".repeat(78)));
    console.log();

    const timeColor =
      timeRemaining <= 10 ? chalk.red : timeRemaining <= 30 ? chalk.yellow : chalk.green;
    const progressPercent = Math.round(((totalDuration - timeRemaining) / totalDuration) * 100);
    console.log(
      timeColor.bold(
        `  ⏰ Time Remaining: ${timeRemaining}s / ${totalDuration}s (${progressPercent}%)`,
      ),
    );
    console.log(chalk.cyan(`  📝 Words Typed: ${wordsTyped}`));
    console.log(chalk.magenta(`  ⚡ Current WPM: ${currentWPM}`));
    console.log();
  }

  static displayMultiplayerLobby(roomId: string, playerCount: number) {
    this.clear();
    console.log("\n");
    console.log(
      chalk.bold.cyan(
        "╔════════════════════════════════════════════════════════════════════════════╗",
      ),
    );
    console.log(
      chalk.bold.cyan("║") +
        chalk.bold.yellow(
          "                        MULTIPLAYER LOBBY                                   ",
        ) +
        chalk.bold.cyan("║"),
    );
    console.log(
      chalk.bold.cyan(
        "╚════════════════════════════════════════════════════════════════════════════╝",
      ),
    );
    console.log("\n");
    console.log(chalk.white(`  Room: ${roomId}`));
    console.log(chalk.cyan(`  Players: ${playerCount}`));
    console.log("\n");
    console.log(chalk.gray("  Waiting for other players..."));
    console.log(chalk.gray("  Press ENTER to start or ESC to leave"));
    console.log("\n");
  }

  static displayMultiplayerProgress(players: Map<string, any>, currentPlayerId: string) {
    console.log("\n");
    console.log(chalk.bold("  👥 Players:"));
    console.log(chalk.gray("  " + "─".repeat(78)));

    const sortedPlayers = Array.from(players.values()).sort((a, b) => b.progress - a.progress);

    sortedPlayers.forEach((player, index) => {
      const isYou = player.id === currentPlayerId;
      const prefix = isYou ? chalk.bold.green("  ➤ YOU: ") : "    ";
      const name = isYou ? chalk.bold.green(player.name) : chalk.white(player.name);
      const progress = chalk.cyan(`${player.progress}%`);
      const wpm = chalk.yellow(`${player.wpm} WPM`);
      const status = player.finished ? chalk.green(" ✓ DONE") : "";

      console.log(`${prefix}${name} - ${progress} - ${wpm}${status}`);
    });

    console.log();
  }

  static displayCustomWordListMenu(lists: string[]) {
    this.clear();
    console.log("\n");
    console.log(
      chalk.bold.cyan(
        "╔════════════════════════════════════════════════════════════════════════════╗",
      ),
    );
    console.log(
      chalk.bold.cyan("║") +
        chalk.bold.yellow(
          "                      CUSTOM WORD LISTS                                     ",
        ) +
        chalk.bold.cyan("║"),
    );
    console.log(
      chalk.bold.cyan(
        "╚════════════════════════════════════════════════════════════════════════════╝",
      ),
    );
    console.log("\n");

    if (lists.length === 0) {
      console.log(chalk.yellow("  No custom word lists found."));
      console.log(chalk.gray("  Add .txt or .json files to ~/.typerush/wordlists/"));
    } else {
      console.log(chalk.white("  Available word lists:"));
      console.log();
      lists.forEach((list, index) => {
        console.log(chalk.green(`    ${index + 1}) ${list}`));
      });
    }

    console.log("\n");
    console.log(chalk.gray("  Press number to select, or ESC to go back"));
    console.log("\n");
  }

  static displayError(message: string) {
    console.log("\n" + chalk.red(`  Error: ${message}`) + "\n");
  }

  static displayInfo(message: string) {
    console.log("\n" + chalk.cyan(`  ${message}`) + "\n");
  }
}
