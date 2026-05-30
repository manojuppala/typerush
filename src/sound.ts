export class SoundEffects {
  private enabled: boolean = true;

  constructor(enabled: boolean = true) {
    this.enabled = enabled;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  // Terminal bell/beep
  private beep(): void {
    if (this.enabled) {
      process.stdout.write('\x07');
    }
  }

  // Single beep for errors
  error(): void {
    this.beep();
  }

  // Double beep for success
  success(): void {
    if (this.enabled) {
      this.beep();
      setTimeout(() => this.beep(), 100);
    }
  }

  // Triple beep for new record
  newRecord(): void {
    if (this.enabled) {
      this.beep();
      setTimeout(() => this.beep(), 100);
      setTimeout(() => this.beep(), 200);
    }
  }

  // Fast sequence for game complete
  complete(): void {
    if (this.enabled) {
      this.beep();
      setTimeout(() => this.beep(), 50);
    }
  }
}
