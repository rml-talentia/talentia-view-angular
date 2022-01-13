import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormatService } from 'src/app/service/FormatService';

@Component({
  selector: 'tac-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextComponent {


  @Input()
  component!: any;

  text: string = '';
  private _value!: any;

  constructor(
    private formatService: FormatService) { }


  @Input()
  get value(): any {
    return this._value;
  }

  set value(value) {
    this._value = value;
    this.text = null === this.component || null === this.component.format 
      ? String(value) 
      : this.formatService.toString(value, this.component.format);
  }


}
