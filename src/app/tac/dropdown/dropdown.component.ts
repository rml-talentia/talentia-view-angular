import { HttpClient } from '@angular/common/http';
import { AfterContentInit } from '@angular/core';
import { ChangeDetectorRef, Component, forwardRef, Injector, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import {  TFDropdownItem, TFEvent } from '@talentia/components';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ViewService } from 'src/app/view-container/view-container.component';

@Component({
  selector: 'tac-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.css'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: forwardRef(() => DropdownComponent)
  }],
  encapsulation: ViewEncapsulation.None
})
export class DropdownComponent implements OnInit, ControlValueAccessor, AfterContentInit {

  constructor(
    private http: HttpClient,
    private viewService: ViewService,
    private changeDetectorRef: ChangeDetectorRef,
    private injector: Injector) { }
  ngAfterContentInit(): void {
   // console.log('form: ', this.form);
  }

    @Input()
    form!: FormGroup;


  @Input()
  data!: any;
  @Input()
  title!: string;
  items!: TFDropdownItem[];
  itemsSubscription!: Subscription | null;
  @Input()
  value!: string | null;
  text: string  = '';
  onchange: any;
  ontouched: any;


  ngOnInit(): void {

    const payload = this.data.model.payload;
    payload.search = '';
    payload.pageSize = 30;
   // payload.excludedKeys = null;    
    
    this.itemsSubscription = this
        .http
        .post(
            `${this.viewService.contextPath}/services/private/api/consultation/all?sessionId=${this.viewService.sessionId}`,
            payload, 
            {
                headers: {
                // CSRF
                [this.viewService.csrfTokenName]: this.viewService.csrfTokenValue
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

  private setValue(value: string | null) {
    this.value = value;
    this.text = null !== this.items && null !== this.value ? this.items.find((item: TFDropdownItem) => item.name === this.value)?.label || '' : '';
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

  registerOnChange(onchange: any): void {
    this.onchange = onchange;
  }

  registerOnTouched(ontouched: any): void {
    this.ontouched = ontouched;
  }

  valueChanged(event: TFEvent) {
    if (!!this.onchange) {
      this.onchange(event.source.selectedItem?.name || null);
    }
  }
}
