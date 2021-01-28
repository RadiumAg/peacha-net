import { InjectionToken } from '@angular/core';

export const STEP_NAVIGATE = new InjectionToken<StepNavigatable>(
  'step navigate tap'
);

export interface StepNavigatable {
  next(): void;
  previous(): void;
  goto(step: string | number): void;
}
