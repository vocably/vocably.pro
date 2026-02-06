import {
  Overlay,
  OverlayPositionBuilder,
  OverlayRef,
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  ViewContainerRef,
} from '@angular/core';
import { TooltipComponent } from './tooltip.component';

export declare type TooltipPosition = 'top';

let nextId = 0;

@Directive({
  selector: '[appTooltipTriggerFor]',
  standalone: false,
})
export class TooltipTriggerForDirective implements OnInit, AfterViewInit {
  private overlayRef!: OverlayRef;
  private portal!: TemplatePortal<any>;

  id = 'ng-cdk-tooltip-' + nextId++;

  @Input('appTooltipTriggerFor') tooltip!: TooltipComponent;
  @Input('appTooltipPosition') position: TooltipPosition = 'top';

  constructor(
    private overlay: Overlay,
    private elementRef: ElementRef,
    private viewContainerRef: ViewContainerRef,
    private overlayPositionBuilder: OverlayPositionBuilder
  ) {}

  ngOnInit() {
    const positionStrategy = this.overlayPositionBuilder
      .flexibleConnectedTo(this.elementRef)
      .withPositions([
        {
          originX: 'center',
          originY: 'top',
          overlayX: 'center',
          overlayY: 'bottom',
        },
      ]);

    this.overlayRef = this.overlay.create({ positionStrategy });
    return this.overlayRef;
  }

  ngAfterViewInit() {
    this.portal = new TemplatePortal(
      this.tooltip.templateRef,
      this.viewContainerRef
    );
  }

  @HostListener('mouseenter')
  @HostListener('focus')
  onMouseEnter() {
    this.openTooltip();
  }

  @HostListener('mouseleave')
  @HostListener('focusout')
  onMouseExit() {
    this.closeTooltip();
  }

  private openTooltip(): void {
    if (!this.overlayRef.hasAttached()) {
      this.overlayRef.attach(this.portal);
    }
  }

  private closeTooltip(): void {
    if (this.overlayRef.hasAttached()) {
      this.overlayRef.detach();
    }
  }
}
