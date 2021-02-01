import { Component, OnInit, ViewChild, Renderer2, ElementRef, OnDestroy, Output, EventEmitter, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

export interface SliderParam {
	index: number;
	value: number;
	default: number;
}

@Component({
	selector: 'ivo-ingredient',
	templateUrl: './ingredient.component.html',
	styleUrls: ['./ingredient.component.less'],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => IngredientComponent),
			multi: true,
		},
	],
})
export class IngredientComponent implements OnDestroy, ControlValueAccessor, OnInit {
	@ViewChild('dothead', { read: ElementRef })
	dotHead: ElementRef<any>;

	@ViewChild('ngredientbody', { read: ElementRef })
	ngredientBody: ElementRef<any>;

	@ViewChild('ingredientprocess', { read: ElementRef })
	ingredientProcess: ElementRef<any>;

	@Output()
	// eslint-disable-next-line @typescript-eslint/ban-types
	update: EventEmitter<object> = new EventEmitter();

	@Input()
	disabled: false;

	// eslint-disable-next-line @angular-eslint/no-input-rename
	@Input('process')
	set Process(value: number) {
		this.init();
		if (!Number.isNaN(value)) {
			const width =
				((this.ngredientBody.nativeElement as HTMLElement).clientWidth - (this.dotHead.nativeElement as HTMLElement).offsetWidth) *
				(Number(value) / 100);
			this.re2.setStyle(this.dotHead.nativeElement, 'left', width + 'px');
			this.setProcess(width);
			this.updata?.(value / 100);
		}
	}

	constructor(private re2: Renderer2) {
		document.body.onselectstart = document.body.ondrag = () => {
			return false;
		};
	}

	sliderWidth: number;

	/**
	 * @description start：记录鼠标开始，end:记录鼠标结束，min:记录最小X，width:记录最大x,innerStart:相对于点击目标的x
	 */
	mouser: {
		start: number;
		max: number;
		min: number;
		width: number;
		innerStart: number;
		end: number;
	} = {
			start: 0,
			max: 0,
			min: 0,
			width: 0,
			innerStart: 0,
			end: 0,
		};

	/**
	 * @description 文档是否已经绑定mouseup,mousemove事件
	 */
	isBind = false;
	isPress = false;

	updata: (o: number) => void = () => { };



	writeValue(pro: number): void {
		this.Process = pro;
	}

	private init() {
		if (!this.ngredientBody) {
			this.ngredientBody = new ElementRef<any>(document.getElementById('ingredient-body'));
		}
		if (!this.dotHead) {
			this.dotHead = new ElementRef<any>(document.getElementById('dothead'));
		}
		if (!this.ingredientProcess) {
			this.ingredientProcess = new ElementRef<any>(document.getElementById('ingredientprocess'));
		}
	}

	registerOnChange(fn: any): void {
		this.updata = fn;
	}

	registerOnTouched(fn: any): void { }

	setDisabledState?(isDisabled: boolean): void { }

	ngOnDestroy(): void {
		document.removeEventListener('mousemove', this.mouseMove.bind(this));
		document.removeEventListener('mouseup', this.mouseUp.bind(this));
	}

	start(e: MouseEvent) {
		if (this.disabled) {
			return;
		}

		this.isPress = true;
		this.setMouser(e);
		if (!this.isBind) {
			this.sliderWidth = (this.ngredientBody.nativeElement as HTMLElement).clientWidth;
			this.isBind = true;
			document.addEventListener('mousemove', this.mouseMove.bind(this));
			document.addEventListener('mouseup', this.mouseUp.bind(this));
			(this.dotHead.nativeElement as HTMLElement).addEventListener('mouseup', this.mouseUp.bind(this));
		}
	}

	private setMouser(e: MouseEvent) {
		this.mouser.innerStart = e.offsetX;
		this.mouser.width = (e.target as HTMLElement).offsetWidth;
		this.mouser.max =
			(this.ngredientBody.nativeElement as HTMLElement).clientWidth - (this.dotHead.nativeElement as HTMLElement).offsetWidth;
		this.mouser.min = 0;
		this.mouser.start = e.pageX - (this.dotHead.nativeElement as HTMLElement).offsetLeft;
	}

	mouseUp() {
		this.isPress = false;
	}

	mouseMove(e: MouseEvent) {
		if (this.isPress) {
			this.moveEvent(e);
		}
	}

	getMove(e: MouseEvent): number {
		return e.pageX - this.mouser.start - this.mouser.innerStart;
	}

	private moveEvent(e: MouseEvent) {
		const move = this.getMove(e);
		if (move <= this.mouser.max && move >= this.mouser.min) {
			this.re2.setStyle(this.dotHead.nativeElement, 'left', move + 'px');
			this.setProcess(move);
			this.update.emit({
				process: move / this.mouser.max,
			});
			this.updata(move / this.mouser.max);
		}

		if (move >= this.mouser.max) {
			this.re2.setStyle(this.dotHead.nativeElement, 'left', this.mouser.max + 'px');
			this.setProcess(this.mouser.max);
			this.update.emit({
				process: 1,
			});
			this.updata(1);
		}

		if (move <= this.mouser.min) {
			this.re2.setStyle(this.dotHead.nativeElement, 'left', this.mouser.min + 'px');
			this.setProcess(this.mouser.min);
			this.update.emit({
				process: 0,
			});
			this.updata(0);
		}
	}

	private setProcess(left: number) {
		this.re2.setStyle(this.ingredientProcess.nativeElement, 'width', left + 'px');
	}

	ngOnInit(): void {
		this.init();
	}
}
