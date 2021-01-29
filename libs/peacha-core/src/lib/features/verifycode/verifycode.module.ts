import { NgModule } from '@angular/core';
import { VerifycodeFetchDirective } from './verifycode.directive';

@NgModule({
	declarations: [VerifycodeFetchDirective],
	exports: [VerifycodeFetchDirective],
})
export class VerifyModule {}
