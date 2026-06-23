import { Injectable } from '@angular/core';

export interface StoppablePlayer {
  stop: () => void;
}

/**
 * Ensures that only a single sound can be played across the whole website.
 * When a new player becomes active, the previously active one is stopped.
 */
@Injectable({ providedIn: 'root' })
export class PlaySoundService {
  private active: StoppablePlayer | null = null;

  setActive(player: StoppablePlayer): void {
    if (this.active && this.active !== player) {
      this.active.stop();
    }

    this.active = player;
  }

  clear(player: StoppablePlayer): void {
    if (this.active === player) {
      this.active = null;
    }
  }
}
