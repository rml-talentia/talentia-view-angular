import { NgTemplateOutlet } from '@angular/common';
import { AfterContentChecked, AfterContentInit, AfterViewInit, ApplicationRef, ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentFactoryResolver, ComponentRef, ContentChildren, ElementRef, EmbeddedViewRef, EventEmitter, forwardRef, Host, Inject, Injector, Input, OnChanges, OnInit, Optional, Output, QueryList, SimpleChanges, SkipSelf, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TFEvent, TFInputComponent } from '@talentia/components';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { IAfterGuiAttachedParams } from 'ag-grid-community';
import { AppComponent } from 'src/app/app.component';
import { ChosenService } from 'src/app/service/ChosenService';
import { InputBaseComponent } from '../base/input-base.component';
import { ItemDirective } from '../item/item.directive';



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
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class InputComponent extends InputBaseComponent implements AfterContentInit, AfterContentChecked {


  constructor(
    @Optional() 
    private appComponent: AppComponent,
    private chosenService: ChosenService) {
    super();
  }


  typeinput!: 'text' | 'amount';
  decimals!: number;

  @ViewChild('input', { read: TFInputComponent })
  input!: TFInputComponent;

  @ViewChild('dropdown', { read: TemplateRef })
  dropdownRef!: TemplateRef<any>;

  @ContentChildren(ItemDirective, { read: TemplateRef })
  templates!: QueryList<ItemDirective>;


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

  ngAfterContentInit(): void {
    
    console.log('templates:', this.templates);
    console.log('templates.length:', this.templates.length);
  }

  ngAfterContentChecked(): void {
      
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
    //console.log('[TextInputComponent] writeValue(value:', value, ')');
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
    console.log('[text-input] doBlur:', event);
    this.fireTouched();
    this.blur.emit(new TFEvent("blur", this, { "event": event }));
  }

  doClick(event: MouseEvent) {
    console.log('[text-input] doClick:', event);
    this.focus();

    this.appComponent.openDropdown({
      templateRef: this.dropdownRef,
      elementRef: this.input.input,
      data: this.component
    });

  }
}
