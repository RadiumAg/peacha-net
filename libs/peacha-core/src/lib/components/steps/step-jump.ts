import { StepNavigatable, STEP_NAVIGATE } from './step-navigatable';
import {
  Directive,
  SkipSelf,
  Inject,
  Input,
  HostListener,
} from '@angular/core';

@Directive({
  selector: '[ivoStepNext], [ivoStepPrevious], [ivoStepGoto]',
})
export class StepJump {
  constructor(
    @SkipSelf() @Inject(STEP_NAVIGATE) private step: StepNavigatable
  ) {}

  @Input('ivoStepNext') next: any;
  @Input('ivoStepPrevious') previous: any;
  @Input('ivoStepGoto') goto: string | number;

  @HostListener('click')
  click() {
    if (this.next != undefined) {
      this.step.next();
    } else if (this.previous != undefined) {
      this.step.previous();
    } else if (this.goto != undefined) {
      this.step.goto(this.goto);
    }
  }
}
