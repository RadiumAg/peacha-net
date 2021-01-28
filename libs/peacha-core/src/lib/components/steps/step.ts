import {
  Directive,
  ViewContainerRef,
  TemplateRef,
  Input,
  Host,
} from '@angular/core';
import { Steps } from './steps';

@Directive({
  selector: '[ivoStep]',
})
export class Step {
  constructor(
    public viewContainer: ViewContainerRef,
    public template: TemplateRef<any>,
    @Host() private stepHost: Steps
  ) {}

  @Input('ivoStep') step: string;

  private stepIndex = 0;

  created = false;

  ngOnInit() {
    this.stepIndex = this.stepHost.addStep(this.step);
  }

  ngDoCheck() {
    this.enforceState();
  }

  enforceState() {
    if (this.stepHost.currentStepIndex == this.stepIndex) {
      if (!this.created) {
        this.viewContainer.createEmbeddedView(this.template);
        this.created = true;
      }
    } else {
      if (this.created) {
        this.viewContainer.clear();
        this.created = false;
      }
    }
  }
}
