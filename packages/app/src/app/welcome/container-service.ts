import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ContainerService {
  size = new BehaviorSubject<'normal' | 'large'>('normal');
}
