import { NgTemplateOutlet } from '@angular/common';
import { AfterContentChecked, AfterContentInit, AfterViewInit, ApplicationRef, ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentFactoryResolver, ComponentRef, ContentChild, ContentChildren, ElementRef, EmbeddedViewRef, EventEmitter, forwardRef, Host, Inject, Injector, Input, OnChanges, OnInit, Optional, Output, QueryList, SimpleChanges, SkipSelf, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TFEvent, TFInputComponent } from '@talentia/components';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { IAfterGuiAttachedParams } from 'ag-grid-community';
import { AppComponent } from 'src/app/app.component';
import { ChosenService } from 'src/app/service/ChosenService';
import { InputBaseComponent } from '../base/input-base.component';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { ItemTypeDirective } from '../itemType/itemType.directive';
import { ListComponent } from '../list/list.component';



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
export class InputComponent extends InputBaseComponent implements AfterContentInit, AfterContentChecked, OnChanges {


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
  @ContentChildren(ItemTypeDirective)
  templates!: QueryList<ItemTypeDirective>;
  @ContentChild(DropdownComponent)
  dropdown!: DropdownComponent;
  @ContentChild(ListComponent)
  list!: ListComponent;


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
  }

  ngAfterContentChecked(): void {
      

  }

  
  ngOnChanges(changes: SimpleChanges) {
 //   console.log('[LIST] changes:', changes);
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

  blurHandler(event: TFEvent) {
    //console.log('[text-input] blurHandler:', event);
    this.fireTouched();
    this.blur.emit(new TFEvent("blur", this, { "event": event }));
  }


  keydownHandler(event: KeyboardEvent) {
    if (!!this.list) {
      //this.list.search = this.input.value;
      this.list.keydownHandler(event);
    }
  }

  inputHandler(event: Event) {
    console.log('event:', event);
    if (!!this.list) {
      this.list.inputHandler(event);
    }
  }

  clickHandler(event: MouseEvent) {
    this.focus();
    if (!!this.dropdown) {      
      this.dropdown.open();
    }
  }
}
