import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';
import { fromEvent, throttleTime, debounceTime } from 'rxjs';

@Directive({
  selector: '[appFluidHeight]',
  standalone: true,
})
export class FluidHeightDirective {
  @Input() minHeight: number;
  @Input('fluidHeight') topOffset: number;

  private domElement: HTMLElement;

  constructor(private renderer: Renderer2, private elementRef: ElementRef) {
    this.domElement = this.elementRef.nativeElement as HTMLElement;

    // register on window resize event
    fromEvent(window, 'resize')
      .pipe(throttleTime(5000), debounceTime(5000))
      .subscribe(() => this.setHeight());
  }

  ngAfterViewInit() {
    this.setHeight();
  }

  private setHeight() {
    const windowHeight = window?.innerHeight;
    const topOffset = this.topOffset || this.calcTopOffset();
    let height = windowHeight - topOffset;

    // set min height instead of the calculated
    if (this.minHeight && height < this.minHeight) {
      height = this.minHeight;
    }

    this.renderer.setStyle(this.domElement, 'height', `${height}px`);
  }

  private calcTopOffset(): number {
    try {
      const rect = this.domElement.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      return rect.top + scrollTop;
    } catch (e) {
      return 0;
    }
  }
}
