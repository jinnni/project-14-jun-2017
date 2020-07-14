import {Component, forwardRef, Input} from '@angular/core';
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from '@angular/forms';

const noop = () => {
};

export const RATING_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => Rating),
  multi: true
};

@Component({
  selector: 'rating',
  styles: [`
    ul.rating li {
      display: inline;
      border: 0;
      background: none;
      padding: 5px 10px;
    }

    ul.rating li i {
      font-size: 30px;
    }
  `],
  template: `
    <ul class="rating" (keydown)="onKeyDown($event)">
      <li *ngFor="let starIndex of starIndexes" tappable (click)="rate(starIndex + 1)">
        <!--<ion-icon [name]="getStarIconName(starIndex)">-->
        <!--</ion-icon>-->
        <img *ngIf="getStarIconName(starIndex) == 'md-star'" src="assets/img/product/full-star.png" style="width: 18px;height: 18px;">
        <img *ngIf="getStarIconName(starIndex) == 'md-star-outline'" src="assets/img/product/empty-star.png" style="width: 18px;height: 18px;">
        <img *ngIf="getStarIconName(starIndex) == 'md-star-half'" src="assets/img/product/half-star.png" style="width: 18px;height: 18px;">
      </li>
    </ul>`,
  providers: [RATING_CONTROL_VALUE_ACCESSOR]
})
export class Rating implements ControlValueAccessor {

  _max: number = 5;
  _readOnly: boolean = false;
  _nullable: boolean = false;

  // fixed icon to md
  // ion-icon component has bugs in host-binding
  // when accessed with deep linking url
  _emptyStarIconName: string = 'md-star-outline';
  _halfStarIconName: string = 'md-star-half';
  _starIconName: string = 'md-star';

  @Input()
  get max() {
    return this._max;
  }

  set max(val: any) {
    this._max = this.getNumberPropertyValue(val);
  }

  @Input()
  get readOnly() {
    return this._readOnly;
  }

  set readOnly(val: any) {
    this._readOnly = this.isTrueProperty(val);
  }

  @Input()
  get emptyStarIconName() {
    return this._emptyStarIconName;
  }

  set emptyStarIconName(val: any) {
    this._emptyStarIconName = val;
  }

  @Input()
  get halfStarIconName() {
    return this._halfStarIconName;
  }

  set halfStarIconName(val: any) {
    this._halfStarIconName = val;
  }

  @Input()
  get starIconName() {
    return this._starIconName;
  }

  set starIconName(val: any) {
    this._starIconName = val;
  }

  @Input()
  get nullable() {
    return this._nullable;
  }

  set nullable(val: any) {
    this._nullable = this.isTrueProperty(val);
  }

  innerValue: any;
  starIndexes: Array<number>;

  onChangeCallback: (_: any) => void = noop;

  ngOnInit() {
    // ngFor needs an array
    this.starIndexes = Array(this.max).fill(1).map((x, i) => i);
  }

  getStarIconName(starIndex: number) {
    if (this.value === undefined) {
      return this.emptyStarIconName;
    }

    if (this.value > starIndex) {
      if (this.value < starIndex + 1) {
        return this.halfStarIconName;
      } else {
        return this.starIconName;
      }
    } else {
      return this.emptyStarIconName;
    }
  }

  get value(): any {
    return this.innerValue;
  }

  set value(value: any) {
    if (value !== this.innerValue) {
      this.innerValue = value;
      this.onChangeCallback(value);
    }
  }

  writeValue(value: any) {
    if (value !== this.innerValue) {
      this.innerValue = value;
    }
  }

  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any) {
  }

  onKeyDown(event: any) {
    if (/(37|38|39|40)/.test(event.which)) {
      event.preventDefault();
      event.stopPropagation();

      let newValue = this.value + ((event.which == 38 || event.which == 39) ? 1 : -1);
      return this.rate(newValue);
    }
  }

  rate(value: number) {
    if (this.readOnly || value < 0 || value > this.max) {
      return;
    }

    if (value === this.value && this.nullable) {
      value = null;
    }

    this.value = value;
  }

  private isTrueProperty(val: any): boolean {
    if (typeof val === 'string') {
      val = val.toLowerCase().trim();
      return (val === 'true' || val === 'on');
    }
    return !!val;
  }

  private getNumberPropertyValue(val: any): number {
    if (typeof val === 'string') {
      return parseInt(val.trim());
    }
    return val;
  }
}
