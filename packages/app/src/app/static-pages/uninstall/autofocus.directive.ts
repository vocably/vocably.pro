import { AfterViewInit, Directive, ElementRef } from '@angular/core';

// Focuses the host element once it is inserted into the DOM. Useful for inputs
// revealed via *ngIf, where the native `autofocus` attribute does not fire.
@Directive({
  selector: '[appAutofocus]',
})
export class AutofocusDirective implements AfterViewInit {
  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    this.elementRef.nativeElement.focus();
  }
}
