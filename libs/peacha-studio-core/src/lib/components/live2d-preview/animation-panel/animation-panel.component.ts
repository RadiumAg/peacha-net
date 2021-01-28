import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CubismAnimationClip } from '../../../core/engine/gl2d-cubism';

@Component({
  selector: 'peacha-live2d-animation-panel',
  templateUrl: './animation-panel.component.html',
  styleUrls: ['./animation-panel.component.less'],
})
export class AnimationPanelComponent implements OnInit {
  @Input()
  motions!: Array<CubismAnimationClip>;

  @Input()
  exps!: Array<CubismAnimationClip>;

  @Output()
  playMontion = new EventEmitter<number>();

  @Output()
  playExpression = new EventEmitter<number>();

  @Output()
  reset = new EventEmitter();

  selectAnimationOption: 'motions' | 'exps' = 'motions';

  playingExps = new Set<number>();
  constructor() {}

  ngOnInit(): void {}

  setSelectAnimationOption(option: 'motions' | 'exps') {
    this.selectAnimationOption = option;
  }

  onResetClick() {
    this.reset.emit();
    this.playingExps.clear();
  }

  onMotionClick(index: number) {
    this.playMontion.emit(index);
  }

  onExpClick(index: number) {
    this.playExpression.emit(index);
    if (this.playingExps.has(index)) {
      this.playingExps.delete(index);
    } else {
      this.playingExps.add(index);
    }
  }
}
