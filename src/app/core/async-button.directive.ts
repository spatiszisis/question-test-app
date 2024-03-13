import { Directive, HostBinding, Input } from '@angular/core';
import { Subscription } from 'rxjs';

@Directive({
  standalone: true,
  selector: '[asyncButton]',
})
export class AsyncButtonDirective {
  @Input() subscription: Subscription;
  @Input() disabled: boolean;
  @Input() showSpinner = true;

  @HostBinding('disabled')
  get isDisabled() {
    return this.loading || this.disabled;
  }

  @HostBinding('class.loading-button')
  get isLoading() {
    return this.loading && this.showSpinner;
  }

  private get loading() {
    return this.subscription && !this.subscription.closed;
  }
}
