import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Live2dPreviewComponent } from './live2d-preview.component';

describe('Live2dPreviewComponent', () => {
	let component: Live2dPreviewComponent;
	let fixture: ComponentFixture<Live2dPreviewComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [Live2dPreviewComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(Live2dPreviewComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
