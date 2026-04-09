import { EventEmitter } from 'events';
import { ResultError } from '@vocably/model';

export const apiEventBus = new EventEmitter<{
  error: [ResultError];
}>();
