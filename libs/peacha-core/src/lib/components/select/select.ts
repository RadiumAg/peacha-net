import {
	Component,
	ContentChildren,
	QueryList,
	ViewChild,
	TemplateRef,
	ViewContainerRef,
	forwardRef,
	ElementRef,
	Input,
	Renderer2,
	AfterContentInit,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Option } from '../option/option';
import { Overlay, CdkOverlayOrigin, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { takeUntil } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs'
import { SelectAnimations } from './select.animations';
import { SelectFather, SELECT_FATHER } from './selectfather';

export const EXE_COUNTER_VALUE_ACCESSOR: any = {
	provide: NG_VALUE_ACCESSOR,
	useExisting: forwardRef(() => Select),
	multi: true,
};

@Component({
	selector: 'ivo-select',
	templateUrl: './select.html',
	styleUrls: ['./select.less'],
	providers: [
		EXE_COUNTER_VALUE_ACCESSOR,
		{
			provide: SELECT_FATHER,
			useExisting: Select,
		},
	],
	animations: [SelectAnimations.transformPanel],
})
export class Select implements ControlValueAccessor, SelectFather, AfterContentInit {
	constructor(private overlay: Overlay, private vc: ViewContainerRef, private render: Renderer2) { }

	@Input()
	tipText = { text: '请选择', value: '-1' };
	@Input()
	disabled = false;
	@ViewChild('hello')
	hello: ElementRef;
	@ViewChild('trigger')
	trigger: ElementRef;
	@ViewChild(CdkOverlayOrigin)
	overlayOrigin: CdkOverlayOrigin;
	@ViewChild('hoverboard')
	hoverboard: TemplateRef<any>;
	@Input()
	fontSize = '14px';
	@Input()
	height = '34px';
	@ContentChildren(Option)
	options: QueryList<Option>;
	selected = false;
	y = 0;
	private overlayRef: OverlayRef;
	optionClicked = new BehaviorSubject<any>(undefined);
	selectValue$: BehaviorSubject<number> = new BehaviorSubject(-1);
	fnOnChange?: (v: any) => void;
	fnOnTouched?: () => void;
	subscribe;

	onOptionClick(option: Option): void {
		this.optionClicked.next(option);
		this.fnOnChange(option.value);
		this.overlayRef.detach();
		this.selected = false;
		this.y = this.options.toArray().indexOf(option);
	}

	open(): void {
		this.hello && this.render.addClass(this.hello?.nativeElement, 'zhuan');
		if (this.disabled) {
			return;
		}
		const positionStrategy = this.overlay
			.position()
			.flexibleConnectedTo(this.overlayOrigin.elementRef)
			.withPositions([
				{
					originX: 'start',
					originY: 'bottom',
					overlayX: 'start',
					overlayY: 'top',
				},
			]);
		this.overlayRef = this.overlay.create({
			positionStrategy,
			scrollStrategy: this.overlay.scrollStrategies.block(),
			hasBackdrop: true,
			backdropClass: 'cdk-backdrop-transparent',
		});
		this.selected = true;
		const portal = new TemplatePortal(this.hoverboard, this.vc);
		this.overlayRef.attach(portal);
		this.overlayRef
			.backdropClick()
			.pipe(takeUntil(this.overlayRef.detachments()))
			.subscribe(_ => {
				this.overlayRef.detach();
				this.render.removeClass(this.hello?.nativeElement, 'zhuan');
				this.selected = false;
			});
	}

	writeValue(selectValue: number): void {
		this.selectValue$.next(selectValue);
	}

	ngAfterContentInit(): void {
		this.setDefalut();
		this.setWriteValue();
	}

	private setDefalut(): void {
		const option = this.options.find(x => x.selected) ?? this.tipText;
		this.optionClicked.next(option);
	}

	private setWriteValue(): void {
		if (this.subscribe) {
			return;
		}
		this.subscribe = this.selectValue$.pipe().subscribe(_ => {
			const option = this.options.find(x => x.value == _);
			option && this.optionClicked.next(option);
		});
	}

	registerOnChange(fn: any): void {
		this.fnOnChange = fn;
	}

	registerOnTouched(fn: any): void {
		this.fnOnTouched = fn;
	}
}
