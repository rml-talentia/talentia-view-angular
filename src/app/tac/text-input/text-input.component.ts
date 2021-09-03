import { Component, ElementRef, EventEmitter, forwardRef, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TFEvent, TFInputComponent } from '@talentia/components';


@Component({
  selector: 'tac-text-input',
  templateUrl: './text-input.component.html',
  styleUrls: ['./text-input.component.css'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: forwardRef(() => TextInputComponent)
  }]
})
export class TextInputComponent implements OnInit, ControlValueAccessor  {

  @Input()
  form!: FormGroup;
  @Input()
  name!: string;
  _value!: string;
  @Input()
  data!: any;  
  @Input()
  title!: string;
  private onchange: any;
  private ontouched: any;

  typeinput!: 'text' | 'amount';
  decimals!: number;

  @ViewChild('input', { read: TFInputComponent })
  input!: TFInputComponent;


  @Output() 
  blur: EventEmitter<TFEvent> = new EventEmitter<TFEvent>();

  constructor() { }


  ngOnInit(): void {
    this.configureFromFormat();
  }

  @Input()
  get value() {
    return this._value;
  }

  set value(value: string) {
    //console.log('[text-input] set value(value:', value, ')');
    this._value = value;
    this.fireChange(value);
  }

  private configureFromFormat(): void {
    console.log('[text-input] formatType: ', !this.data.format ? '' : this.data.format.formatType);
    switch (!this.data.format ? '' : this.data.format.formatType) {
      case 'NumberFormat':
        this.typeinput = 'amount';
        this.decimals = this.data.format.precision;
        break;
      default:
        this.typeinput = 'text';
        this.decimals = 0;
    }
  }
  
  private fireChange(newValue: any): void {
    if (!!this.onchange) {
      this.onchange(newValue);
    }
  }


  private fireTouched(): void {
    if (!!this.ontouched) {
      this.ontouched();
    }
  }
 
  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(onchange: any): void {
    this.onchange = onchange;
  }
 
  registerOnTouched(ontouched: any): void {
    this.ontouched = ontouched;
  }

  focus(): void {
    // Used in ag-grid cell editor.
    // setTimeout is mostly needed by select()...
    // This is a tweak but agGrid documentation himself uses it.
    setTimeout(() => {
      this.input.input.nativeElement.focus();
      this.input.input.nativeElement.select();
    });
  }

  doBlur(event: TFEvent) {
    console.log('[text-input] onBlur:', event);
    this.fireTouched();
    this.blur.emit(new TFEvent("blur", this, { "event": event }));
  }
}
