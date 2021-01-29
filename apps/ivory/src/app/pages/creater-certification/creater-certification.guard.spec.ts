import { TestBed } from '@angular/core/testing';

import { CreaterCertificationGuard } from './creater-certification.guard';

describe('CreaterCertificationGuard', () => {
	let guard: CreaterCertificationGuard;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		guard = TestBed.inject(CreaterCertificationGuard);
	});

	it('should be created', () => {
		expect(guard).toBeTruthy();
	});
});
