export const RESEND_COOLDOWN_SECONDS = 60;

/**
 * Counts down before another code may be requested. Cognito throttles code
 * emails, so letting the user hammer the button only ends in
 * LimitExceededException.
 */
export class ResendCooldown {
  public seconds = 0;

  private timer: ReturnType<typeof setInterval> | undefined;

  start(seconds = RESEND_COOLDOWN_SECONDS) {
    this.stop();
    this.seconds = seconds;
    this.timer = setInterval(() => {
      this.seconds -= 1;

      if (this.seconds <= 0) {
        this.stop();
      }
    }, 1000);
  }

  stop() {
    if (this.timer !== undefined) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }
}
