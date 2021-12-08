import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, forwardRef, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TFEvent, TFInputComponent } from '@talentia/components';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { IAfterGuiAttachedParams } from 'ag-grid-community';
import { InputBaseComponent } from '../base/input-base.component';



@Component({
  selector: 'tac-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: forwardRef(() => InputComponent)
  }]
  ,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputComponent extends InputBaseComponent  {


  constructor(
    private changeDetectionRef: ChangeDetectorRef) {
    super();
  }


  typeinput!: 'text' | 'amount';
  decimals!: number;

  @ViewChild('input', { read: TFInputComponent })
  input!: TFInputComponent;

  @Output() 
  blur: EventEmitter<TFEvent> = new EventEmitter<TFEvent>();

  @Input()
  get value() {
    return this.component.value;
  }

  set value(value: any) {
    this.component.value = value;
  }

  get styleClasses() {
    return `text-${(this.component.alignment || 'LEFT').toLowerCase()}`;
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.configureFromFormat();
  }

 

  private configureFromFormat(): void {
 //  console.log('[text-input] formatType: ', !this.component.format ? '' : this.component.format.formatType);
    switch (!this.component.format ? '' : this.component.format.formatType) {
      case 'NumberFormat':
        this.typeinput = 'amount';
        this.decimals = this.component.format.precision;
        break;
      default:
        this.typeinput = 'text';
        this.decimals = 0;
    }
  }
  
  createCellEditor(): ICellEditorAngularComp {
    return  <ICellEditorAngularComp> {       
        
      agInit: (params) => {
        this.value = params.value;
      },

      afterGuiAttached: (params?: IAfterGuiAttachedParams) => { 
        this.focus();
      },

      getValue: () => {
        return this.value;
      }

    };
  }

  createData(): any {
    return {
      show: this.component.show,
      access: this.component.access
    };
  }

  writeValue(value: any): void {
    console.log('[TextInputComponent] writeValue(value:', value, ')');
    this.value = value;
  }


  focus(): void {
    // Used in ag-grid cell editor.
    // setTimeout is mostly needed by select()...
    // This is a tweak but agGrid documentation himself uses it.
    
    this.input.input.nativeElement.focus();
    setTimeout(() => {
      this.input.input.nativeElement.select();
    });
  }

  doBlur(event: TFEvent) {
    console.log('[text-input] onBlur:', event);
    this.fireTouched();
    this.blur.emit(new TFEvent("blur", this, { "event": event }));
  }
}
