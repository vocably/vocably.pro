import { Component, Input, OnDestroy } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { tts } from '@vocably/api';
import { GoogleLanguage, isError, isGoogleTTSLanguage } from '@vocably/model';
import { environment } from '../../../environments/environment';
import { PlaySoundService, StoppablePlayer } from './play-sound.service';

type Status = 'idle' | 'loading' | 'playing' | 'error';

@Component({
  selector: 'app-play-sound',
  templateUrl: './play-sound.component.html',
  styleUrls: ['./play-sound.component.scss'],
  imports: [MatIcon],
})
export class PlaySoundComponent implements OnDestroy, StoppablePlayer {
  @Input({ required: true }) text!: string;
  @Input({ required: true }) language!: string;

  status: Status = 'idle';

  private abortController: AbortController | null = null;
  private audio: HTMLAudioElement | null = null;

  constructor(private playSoundService: PlaySoundService) {}

  get icon(): string {
    switch (this.status) {
      case 'error':
        return 'error';
      case 'loading':
      case 'playing':
        return 'volume_up';
      default:
        return 'play_circle';
    }
  }

  async toggle(): Promise<void> {
    if (this.status === 'loading' || this.status === 'playing') {
      this.stop();
      return;
    } else {
      await this.play();
    }
  }

  async play(): Promise<void> {
    if (!isGoogleTTSLanguage(this.language)) {
      return;
    }

    if (this.status === 'loading' || this.status === 'playing') {
      return;
    }

    // Stop any other sound currently playing on the website.
    this.playSoundService.setActive(this);

    this.status = 'loading';
    const abortController = new AbortController();
    this.abortController = abortController;

    const result = await tts(
      environment.api.baseUrl,
      { text: this.text, language: this.language },
      abortController
    );

    // The request was aborted while loading (either by this component or by
    // another player becoming active) — do not change the state.
    if (abortController.signal.aborted) {
      return;
    }

    if (isError(result)) {
      this.fail();
      return;
    }

    try {
      const audio = new Audio(
        'data:audio/mpeg;base64,' + result.value.audioContent
      );
      this.audio = audio;

      audio.addEventListener('ended', () => {
        if (this.audio === audio) {
          this.reset();
        }
      });
      audio.addEventListener('error', () => {
        if (this.audio === audio) {
          this.fail();
        }
      });

      this.status = 'playing';

      audio.play().catch(() => {
        if (this.audio === audio) {
          this.fail();
        }
      });
    } catch (e) {
      this.fail();
    }
  }

  stop(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }

    this.playSoundService.clear(this);
    this.status = 'idle';
  }

  canPlay(): boolean {
    return isGoogleTTSLanguage(this.language);
  }

  ngOnDestroy(): void {
    this.stop();
  }

  private reset(): void {
    this.audio = null;
    this.abortController = null;
    this.playSoundService.clear(this);
    this.status = 'idle';
  }

  private fail(): void {
    this.audio = null;
    this.abortController = null;
    this.playSoundService.clear(this);
    this.status = 'error';
  }
}
