import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormControl } from '@angular/forms';

export interface SliderParam {
  lock: boolean;
  id: string;
  index: number;
  value: number;
  max: number;
  min: number;
  default: number;
  name: string;
}

@Component({
  selector: 'peacha-live2d-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderComponent {
  @ViewChild('sliderBody')
  private sliderBody!: ElementRef;

  @Input()
  lock!: boolean;

  @Input()
  id!: string;

  @Input()
  index!: number;

  @Input()
  set value(value: number) {
    this.inputValue.setValue(
      Math.max(
        this.min,
        Math.min(
          this.max,
          value % 1 === 0 ? value : parseFloat(value.toFixed(1))
        )
      ),
      {
        emitEvent: false,
      }
    );
    this._value = value;
  }

  get value() {
    return this._value;
  }

  @Input()
  max!: number;

  @Input()
  min!: number;

  @Input()
  default!: number;

  @Input()
  name!: string;

  @Output()
  update = new EventEmitter<SliderParam>();

  _value!: number;
  inputValue = new FormControl();
  sliderWidth!: number;
  offsetXStart!: number;
  private mousePress = false;
  constructor() {}

  ngAfterViewInit(): void {
    this.sliderWidth = (this.sliderBody
      .nativeElement as HTMLDivElement).clientWidth;
    document.addEventListener('mouseup', this.mouseUp.bind(this));
    (this.sliderBody.nativeElement as HTMLDivElement).addEventListener(
      'mousedown',
      this.mouseDown.bind(this)
    );
    document.addEventListener('mousemove', this.mouseMove.bind(this));
    this.inputValue.valueChanges.subscribe({
      next: (value) => {
        if (value === null) {
          this.inputValue.reset(this.default);
        } else if (value <= this.max && value >= this.min) {
          this.update.emit({
            lock: true,
            id: this.id,
            index: this.index,
            min: this.min,
            max: this.max,
            default: this.default,
            value: Math.max(this.min, Math.min(this.max, value)),
            name: this.name,
          });
        } else {
          this.inputValue.reset(Math.min(this.max, Math.max(this.min, value)));
        }
      },
    });
  }

  ngOnDestroy(): void {
    document.removeEventListener('mouseup', this.mouseUp.bind(this));
    (this.sliderBody.nativeElement as HTMLDivElement).removeEventListener(
      'mousedown',
      this.mouseDown.bind(this)
    );
    document.removeEventListener('mousemove', this.mouseMove.bind(this));
  }

  lockValue() {
    this.update.emit({
      id: this.id,
      index: this.index,
      min: this.min,
      max: this.max,
      default: this.default,
      value: this.value,
      lock: !this.lock,
      name: this.name,
    });
  }

  reset() {
    this.update.emit({
      lock: this.lock,
      id: this.id,
      index: this.index,
      min: this.min,
      max: this.max,
      default: this.default,
      value: this.default,
      name: this.name,
    });
  }

  private movePersent(event: MouseEvent) {
    if (this.mousePress) {
      const offset = Math.min(
        1,
        Math.max(
          0,
          (event.clientX -
            (this.sliderBody
              .nativeElement as HTMLDivElement).getBoundingClientRect().x) /
            this.sliderWidth
        )
      );
      this.update.emit({
        lock: true,
        id: this.id,
        index: this.index,
        min: this.min,
        max: this.max,
        default: this.default,
        value: this.min + offset * (this.max - this.min),
        name: this.name,
      });
    }
  }

  private mouseUp(event: MouseEvent) {
    this.mousePress = false;
    this.movePersent(event);
  }

  private mouseDown(event: MouseEvent) {
    this.mousePress = true;
    this.movePersent(event);
  }

  private mouseMove(event: MouseEvent) {
    this.movePersent(event);
  }
}
