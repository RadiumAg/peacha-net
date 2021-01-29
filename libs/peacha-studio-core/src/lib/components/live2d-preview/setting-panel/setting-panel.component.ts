import { Component, Input, Output, EventEmitter } from '@angular/core';
import { all, ifElse, compose, map, T, F, always } from 'ramda';
import { SliderParam } from './slider/slider.component';
@Component({
	selector: 'peacha-live2d-setting-panel',
	templateUrl: './setting-panel.component.html',
	styleUrls: ['./setting-panel.component.less'],
})
export class SettingPanelComponent {
	@Input()
	parameterValues!: Map<number, SliderParam>;

	@Input()
	partOpacities!: Map<number, SliderParam>;

	@Output()
	parameterValuesUpdate = new EventEmitter();

	@Output()
	partOpacitiesUpdate = new EventEmitter();

	allParamsLock = false;
	selectSettingOption: 'parameterValues' | 'partOpacities' = 'parameterValues';

	setSelectSettingOption(option: 'parameterValues' | 'partOpacities') {
		this.selectSettingOption = option;
	}

	lockAll = () => {
		if (all(params => params.lock, [...this.parameterValues.values(), ...this.partOpacities.values()])) {
			this.parameterValues.forEach((_, index) => {
				this.parameterValues.get(index).lock = false;
			});
			this.partOpacities.forEach((_, index) => {
				this.partOpacities.get(index).lock = false;
			});
			this.allParamsLock = false;
		} else {
			this.parameterValues.forEach((_, index) => {
				this.parameterValues.get(index).lock = true;
			});
			this.partOpacities.forEach((_, index) => {
				this.partOpacities.get(index).lock = true;
			});
			this.allParamsLock = true;
		}
	};

	onParameterValuesUpdate(params: SliderParam) {
		this.allParamsLock = ifElse(
			always(params.lock),
			ifElse(
				always(
					all<SliderParam>(params => params.lock, [...this.partOpacities.values()])
				),
				ifElse(
					compose(
						all<SliderParam>(params => params.lock),
						map<SliderParam, SliderParam>(_params => (_params.index === params.index ? params : _params))
					),
					T,
					F
				),
				always(this.allParamsLock)
			),
			F
		)(this.parameterValues);
		this.parameterValuesUpdate.emit(params);
	}

	onPartOpacitiesUpdateUpdate(params: SliderParam) {
		this.allParamsLock = ifElse(
			always(params.lock),
			ifElse(
				always(
					all<SliderParam>(params => params.lock, [...this.parameterValues.values()])
				),
				ifElse(
					compose(
						all<SliderParam>(params => params.lock),
						map<SliderParam, SliderParam>(_params => (_params.index === params.index ? params : _params))
					),
					T,
					F
				),
				always(this.allParamsLock)
			),
			F
		)(this.partOpacities);
		this.partOpacitiesUpdate.emit(params);
	}
}
