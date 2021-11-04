import { IAfterGuiAttachedParams } from '@ag-grid-community/core';
import { HttpClient } from '@angular/common/http';
import { AfterContentInit, AfterViewChecked, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { ChangeDetectorRef, Component, forwardRef, Injector, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import {  TFDropdownItem, TFEvent } from '@talentia/components';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { TransactionService } from 'src/app/service/TransactionService';
import { InputBaseComponent } from '../base/input-base.component';

@Component({
  selector: 'tac-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.css'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: forwardRef(() => DropdownComponent)
  }]
  ,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropdownComponent extends InputBaseComponent implements ControlValueAccessor {


  items!: TFDropdownItem[];
  itemsSubscription!: Subscription | null;
 // @Input()
//  value!: string | null;
  //text: string  = '';

  _text: string = '';

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private http: HttpClient,
    private transactionService: TransactionService) {
    super();
  }




  ngOnInit(): void {
    super.ngOnInit();


    // Require to render the initial value.
    if (!!this.component.selection) {
      this.items = [this.component.selection];
    }

    const model = this.component.model.toObject();
    this.itemsSubscription = this
        .http
        .post(
            `${this.transactionService.contextPath}/services/private/api/chosen/FinanceLabelTableChosenModel/getPage?sessionId=${this.transactionService.sessionId}`,
            {
              page: 0,
              pageSize: 30,
              search: '',
              model: model
            }, 
            {
                headers: {
                // CSRF
                [this.transactionService.csrfTokenName]: this.transactionService.csrfTokenValue
                }
            })
        .pipe(map((response: any) => response
          .rows
          .map((row: any, index: number) => <TFDropdownItem> {
              name:  row.key,
              label: row.value
          })))
        .subscribe({
          next: (items: TFDropdownItem[]) => {
            this.items = items;            
          }
        })
        .add(() => this.itemsSubscription = null);

    
  }

  createCellEditor(): ICellEditorAngularComp {
    return {
      agInit: (params) => {
        this.value = params.value;
      },

      afterGuiAttached: (params?: IAfterGuiAttachedParams) => {
      //  this.focus();
      },

      getValue: () => {
        return this.value;
      }
    };
  }


  private setValue(value: string | null) {
    //console.log('[Dropdown] setValue(value:', value, ')');
    this.value = value;
    this.component.value = value;
    // Doesn't work with mutation API
    // this.text = null !== this.items && null !== this.value ? this.items.find((item: TFDropdownItem) => item.name === this.value)?.label || '' : '';
  }

  private getText() {
    return !!this.items && null !== this.value ? this.items.find((item: TFDropdownItem) => item.name === this.value)?.label || '' : '';
  }

  @Input()
  get value() {
    return this.component.value;
  }

  set value(value: any) {
    this.component.value = value;
  }

  get text() {
    // TODO : how to cache this computedValue ??
    //return null !== this.items && null !== this.value ? this.items.find((item: TFDropdownItem) => item.name === this.value)?.label || '' : '';
    return !!this.items && null !== this.value ? this.items.find((item: TFDropdownItem) => item.name === this.value)?.label || '' : '';
  }

  set text(text) {
    // TODO : how to cache this computedValue ??
    this.value = this.items.find((item: TFDropdownItem) => item.label === text)?.name || '';  
    this.component.value = this.value;
  }

  writeValue(value: any): void {
    //console.log('writeValue(value:', value, ')');
    if (!!this.itemsSubscription) {
      // If TFDropdownComponent data is not loaded, the value binding is not made.
      // This ensure it will be done at the right time.
      this.itemsSubscription.add(() => {
        this.setValue(value);
      });
    } else {
      this.setValue(value);
    }
  }


  valueChanged(event: TFEvent) {
    //console.log('[Dropdown] valueChanged(event:', event, ')');
    this.setValue(event.data);
    if (!!this.onchange) {
      this.onchange(event.source.selectedItem?.name || null);
    }
  }
}
