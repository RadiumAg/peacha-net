import { BehaviorSubject, combineLatest } from 'rxjs';
import {
	Component,
	forwardRef,
	OnInit,
	ViewChild,
	ElementRef,
	Input,
	AfterViewInit,
	ChangeDetectorRef,
	Renderer2,
	QueryList,
	ViewChildren,
	AfterViewChecked,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { tap } from 'rxjs/operators';

@Component({
	selector: 'ivo-commission-node',
	templateUrl: './commission-node.component.html',
	styleUrls: ['./commission-node.component.less'],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => CommissionNodeComponent),
			multi: true,
		},
	],
})
export class CommissionNodeComponent implements OnInit, ControlValueAccessor, AfterViewInit, AfterViewChecked {
	constructor(public cdr: ChangeDetectorRef, private re2: Renderer2) {}
	maxSize = 6;
	minSize = 3;
	// tslint:disable-next-line: variable-name
	_isCute = false;
	@Input() isEdit = false;
	minRate = 10;
	maxRate = 40;
	isCanDelete = false;
	nodes$: BehaviorSubject<Partial<{ n: string; r: number; symbol: symbol }>[]> = new BehaviorSubject([]);
	nodesSpecial$: BehaviorSubject<Partial<{ n: string; r: number; symbol: symbol }>[]> = new BehaviorSubject([]);
	isHasError = true;
	@ViewChildren('commission_errors')
	commissionErrors: QueryList<ElementRef<HTMLSpanElement>>;
	@Input() set IsCute(isCute: boolean) {
		this._isCute = isCute;
		this.setSpecial(isCute);
	}
	@ViewChildren('proportion')
	proportionList: QueryList<ElementRef<HTMLInputElement>>;
	@ViewChildren('progress')
	progressList: QueryList<ElementRef<HTMLInputElement>>;
	@ViewChildren('word')
	word: QueryList<ElementRef<HTMLInputElement>>;
	@ViewChildren('proportion_word')
	proportionWord: QueryList<ElementRef<HTMLInputElement>>;
	nodesDefalut: Partial<{ n: string; r: number; symbol: symbol }>[] = [{ r: 100, n: '提交源文件' }];
	@ViewChild('cut')
	cut: ElementRef<HTMLDivElement>;
	@ViewChild('special_word')
	specialWord: ElementRef<HTMLSpanElement>;
	@ViewChild('node_special')
	specialNode: ElementRef<HTMLInputElement>;
	fnChange: (r: Partial<{ n: string; r: number; symbol: symbol }>[]) => void;
	verify = {
		maxSizeValidator: () => {
			if (this.nodes$.getValue().concat(this.nodesSpecial$.getValue()).length >= this.maxSize) {
				return false;
			}
			return true;
		},
	};

	private setSpecial(isCute: boolean) {
		if (this.isEdit) {
			this.isHasError = false;
			return;
		}
		if (isCute) {
			this.nodesSpecial$.next([{ n: '立绘拆分', r: 90, symbol: Symbol() }]);
		} else {
			this.nodesSpecial$.next([...this.nodesSpecial$.getValue().filter(x => x.n != '立绘拆分')]);
		}
	}

	edit(index: number, e: Event, typeId: 0 | 1 | 2 = 0) {
		if (this.isEdit) {
			return;
		}
		if (typeId === 0) {
			const target = this.progressList.find((x, i) => i === index);
			// this.toggleHidden(target, e.target as HTMLElement);
			target.nativeElement.focus();
		} else if (typeId === 1) {
			const target = this.proportionList.find((x, i) => i === index);
			// this.toggleHidden(target, e.target as HTMLElement);
			target.nativeElement.focus();
		} else if (typeId === 2) {
			// this.toggleHidden(this.specialNode, this.specialWord.nativeElement);
			this.specialNode.nativeElement.focus();
		}
	}

	addNode() {
		if (!this.verify.maxSizeValidator()) {
			return;
		}

		this.nodes$.next([...this.nodes$.getValue(), { symbol: Symbol(), n: '新建节点', r: 10 }]);
	}

	endEdit(e: Event, symbol: symbol, typeId: 0 | 1 | 2 = 0) {
		const target = e.target as HTMLInputElement;
		const targetIndex = this.nodes$.getValue().findIndex(x => x.symbol == symbol);
		if (typeId === 0) {
			const wordTarget = this.word.find((x, i) => i === targetIndex);
			// this.toggleHidden(wordTarget, target);
		} else if (typeId === 1) {
			const wordTarget = this.proportionWord.find((x, i) => i === targetIndex);
			// this.toggleHidden(wordTarget, target);
		} else if (typeId === 2) {
			// this.toggleHidden(this.specialWord, this.specialNode.nativeElement);
		}
		const oldValue = this.nodes$.getValue();
		if (oldValue[targetIndex]?.n.trim() == '') {
			this.nodes$.next(oldValue.filter((value, index) => index !== targetIndex));
		}
	}

	private toggleHidden(showTarget: ElementRef<HTMLElement>, hiddenTarget: HTMLElement) {
		this.re2.removeClass(showTarget.nativeElement, 'hidden');
		hiddenTarget.classList.add('hidden');
	}

	editNodeName(symbol: symbol, e: Event) {
		if (this.isEdit) {
			return;
		}
		const target = e.target as HTMLInputElement;
		const editIndex = this.nodes$.getValue().findIndex(x => x.symbol == symbol);
		const oldValue = this.nodes$.getValue();
		oldValue[editIndex].n = target.value;
		this.nodes$.next([...oldValue]);
	}

	editNodeR(symbol: symbol, e: Event) {
		const target = e.target as HTMLInputElement;
		const editIndex = this.nodes$.getValue().findIndex(x => x.symbol == symbol);
		const oldValue = this.nodes$.getValue();
		oldValue[editIndex].r = Number(target.value);
		this.nodes$.next([...oldValue]);
	}

	checkNodes() {
		if (this.isEdit) {
			return;
		}
		const result = new Set<number>();
		this.nodes$
			.getValue()
			.concat(this.nodesSpecial$.getValue())
			.concat(this.nodesDefalut)
			.reduce((total, currentValue, index, arr) => {
				if (index === 0) {
					const nextlowValue = Math.abs(currentValue.r - arr[index + 1]?.r);
					const prelowValue = Math.abs(currentValue.r - 0);
					this.compare(prelowValue, nextlowValue, result, index);
					return currentValue;
				} else if (index === arr.length - 1) {
					// const prelowValue = Math.abs(currentValue.r - total.r);
					// const nextlowValue = Math.abs(currentValue.r - 100);
					// this.compare(prelowValue, nextlowValue, result, index);
					return currentValue;
				} else {
					const nextlowValue = Math.abs(currentValue.r - arr[index + 1].r);
					const prelowValue = Math.abs(currentValue.r - total.r);
					this.compare(prelowValue, nextlowValue, result, index);
					return currentValue;
				}
			}, {});
		this.setErrorMessage(result);
	}

	private setErrorMessage(result: Set<number>) {
		this.setError(result);
		this.commissionErrors?.forEach((item, index, arr) => {
			if (result.has(index)) {
				this.re2.removeClass(item.nativeElement, 'hidden');
				this.re2.setProperty(item.nativeElement, 'innerText', '每个阶段节点间的稿酬比例最低不得低于10%，最大不得超过40%');
				this.isHasError = true;
			} else {
				this.isHasError = false;
				if (item.nativeElement.classList.contains('hidden')) {
					return;
				}
				this.re2.addClass(item.nativeElement, 'hidden');
			}
		});
	}

	private setError(result: Set<number>) {
		if (result.size === 0) {
			this.isHasError = false;
		} else {
			this.isHasError = false;
		}
	}

	private compare(prelowValue: number, nextlowValue: number, result: Set<number>, index: number) {
		if (prelowValue > this.maxRate || prelowValue < this.minRate || nextlowValue > this.maxRate || nextlowValue < this.minRate) {
			result.add(index);
		}
	}

	editNodeCuteR(e: Event) {
		const value = this.nodesSpecial$.getValue()[0];
		value.r = Number((e.target as HTMLInputElement).value);
		this.nodesSpecial$.next([value]);
	}

	changeEdit(e: Event) {
		const target = e.target as HTMLInputElement;
		target.removeAttribute('readonly');
	}

	deleteNode(symbol: symbol) {
		if (this.nodes$.getValue().length + this.nodesSpecial$.getValue().length <= this.minSize) {
			return;
		}
		this.nodes$.next(this.nodes$.getValue().filter(x => x.symbol != symbol));
	}

	writeValue(obj: any[]): void {
		if (!obj.length) {
			return;
		}
		const nodes = obj.map(x => {
			return { n: x.n || '', r: x.r, symbol: Symbol() };
		});
		const addNodes = nodes.filter(
			x =>
				// x.n != '立绘拆分' &&
				x.n != '企划开始' && x.n != '企划完成' && x.n != '源文件'
		);
		if (addNodes && addNodes.length) {
			this.nodes$.next(addNodes);
		}
		this.cdr.markForCheck();
		this.cdr.detectChanges();
	}

	registerOnChange(fn: any): void {
		if (this.fnChange) {
			return;
		}
		this.fnChange = fn;
	}

	registerOnTouched(fn: any): void {}

	setDisabledState?(isDisabled: boolean): void {}

	private setDelete(x: [Partial<{ n: string; r: number; symbol: symbol }>[], Partial<{ n: string; r: number; symbol: symbol }>[]]) {
		if (x[0].length + x[1].length <= this.minSize) {
			this.isCanDelete = false;
		} else {
			this.isCanDelete = true;
		}
	}

	ngOnInit(): void {
		this.subscribeData();
	}

	ngAfterViewInit(): void {
		this.setNodes();
	}

	private setNodes() {
		this.nodes$.next([
			{ n: '草稿完成', r: 30, symbol: Symbol() },
			{ n: '线稿完成', r: 50, symbol: Symbol() },
			{ n: '上色完成', r: 80, symbol: Symbol() },
		]);
	}

	ngAfterViewChecked(): void {
		this.checkNodes();
	}

	private subscribeData() {
		combineLatest([this.nodes$, this.nodesSpecial$])
			.pipe(
				tap(x => {
					this.checkNodes();
					this.setDelete(x);
				})
			)
			.subscribe(x => {
				if (!this.isHasError) {
					let res = x[0]?.concat(x[1]);
					res = res.map(_ => {
						const copyObject = JSON.parse(JSON.stringify(_));
						delete copyObject.symbol;
						return copyObject;
					});
					this.fnChange?.call(this, res);
				} else {
					this.fnChange?.call(this, []);
				}
			});
	}
}
