import { Component, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { tap } from 'rxjs/operators';
import { ModalService, Tag } from '@peacha-core';
import { PopTips } from 'libs/peacha-core/src/lib/components/pop-tips/pop-tips';

@Component({
	selector: 'ivo-tag-input',
	templateUrl: './tag-input.component.html',
	styleUrls: ['./tag-input.component.less'],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: TagInputComponent,
			multi: true,
		},
	],
})
export class TagInputComponent implements ControlValueAccessor {
	constructor(private modal: ModalService) {}
	@Input()
	tagCount = 5;
	readonly tags$ = new BehaviorSubject<Tag[]>([]);
	readonly tagsShow$ = this.tags$.pipe(
		tap(s => {
			this.fnChange?.(s.map(x => x.value));
		})
	);

	fnChange: (v: string[]) => void;

	proxy = {
		whiteValidator: (value: any[]) => {
			if (!value.length || value.join().trim()) {
				return false;
			}
			return true;
		},
		tagCountValidator: () => {
			if (this.tags$.getValue().length >= this.tagCount) {
				return false;
			}
			return true;
		},
		/**
		 * @description 过滤相同tag
		 */
		tagFilter: (value: Tag, array: Tag[]) => {
			if (array.map(x => x.value).includes(value.value)) {
				this.modal.open(PopTips, ['标签重复，添加失败', false]);
			} else {
				array.push(value);
			}
			return array;
		},
	};

	validator(fn, ...argArray: any[]): any {
		return fn.call(this, argArray);
	}

	addTag(t: string, event: Event) {
		event.preventDefault();
		// this.setBulr(event);
		if (!this.validator(this.proxy.tagCountValidator)) {
			return;
		}

		if (t.trim().length) {
			this.tags$.next(
				this.proxy.tagFilter(
					{
						value: t,
						symbol: Symbol(),
					},
					this.tags$.getValue()
				)
			);
		}
	}

	removeTag(symbol: symbol) {
		this.tags$.next(this.tags$.value.filter(s => s.symbol !== symbol));
	}

	private setBulr(event: Event) {
		(event.target as HTMLElement).blur();
	}

	registerOnChange(fn: any) {
		this.fnChange = fn;
	}

	registerOnTouched() {}

	writeValue(word: string[]): void {
		if (this.validator(this.proxy.whiteValidator, [word])) {
			return;
		}
		this.tags$.next(
			word.map(x => {
				return {
					value: x,
					symbol: Symbol(),
				};
			})
		);
	}

	setDisabledState?(isDisabled: boolean): void {}
}
