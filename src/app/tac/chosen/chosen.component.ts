
import { HttpClient } from '@angular/common/http';
import { AfterContentInit, AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, ContentChild, forwardRef, Input, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TFChosenComponent } from '@talentia/components';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { IAfterGuiAttachedParams } from 'ag-grid-community';
//import { SelectItem } from '@talentia/components/lib/ui/chosen/tf-select-item';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { TransactionService } from 'src/app/service/TransactionService';
import { InputBaseComponent } from '../base/input-base.component';



@Component({
  selector: 'tac-chosen',
  templateUrl: './chosen.component.html',
  styleUrls: ['./chosen.component.css']
  // ,
  // providers: [{
  //   provide: NG_VALUE_ACCESSOR,
  //   multi: true,
  //   useExisting: forwardRef(() => ChosenComponent)
  // }]
})
export class ChosenComponent extends InputBaseComponent implements OnInit, AfterContentInit, AfterViewInit,  AfterViewChecked, ControlValueAccessor {

  constructor(
    private http: HttpClient,
    private transactionService: TransactionService) { 
      super();
    }



  @Input()
  value!: string;


  selection: any[] = [];
  items: any[] = [];  
  itemsSubscription!: Subscription | null;


  @ContentChild('myItemTemplate', { read: TemplateRef})
  myItemTemplate!: TemplateRef<any>;

  @ViewChild(TFChosenComponent)
  tfChosen!: TFChosenComponent;

  ngAfterViewChecked(): void {
   
  }


  ngAfterViewInit(): void {
//    this.workaroundTAC2786();
   
  }

  ngAfterContentInit(): void {
    // Array.prototype.forEach.call(document.querySelectorAll('tf-chosen > div.dropdown'), element => { element.addEventListener('focus', event => {  var chosen = event.target.parentElement.__component; chosen.form.controls[chosen.name].markAsTouched();   }); })
 

  }




  ngOnInit(): void {
    //this.text = '';
   
  //  console.log('[CHOSEN] value: ', this.value);
 //   console.log('[CHOSEN] data: ', this.data);
   // console.log('this.data: ', this.data);

 
    const payload = this.data.model.payload;
    payload.search = '';
    payload.pageSize = 30;
   // payload.excludedKeys = null;    
    
    const key = payload.criterias[0].name;


    // if (this.value) {
     
    //   this.value[0] = { id: this.value[0][key], text: this.value[0][key] };
    // }


    // this.items = [];
    // const value = this.data.value.value;
    // console.log('[CHOSEN] value: ', value);
    // this.selection = !value ? [] : [{ id: value, text: value, cells: [value] }];
    // this.items = this.selection.slice(0);

    if (true) return;

    this.itemsSubscription = this
        .http
        .post(
            `${this.transactionService.contextPath}/services/private/api/consultation/all?sessionId=${this.transactionService.sessionId}`,
            payload, 
            {
                headers: {
                // CSRF
                [this.transactionService.csrfTokenName]: this.transactionService.csrfTokenValue
                }
            })
        .pipe(map((response: any) => response
          .rows
          .map((row: any, index: number) => <any> {
              id:  row[key],
              text: row[key],
              cells: payload.criterias.map((criteria: any) => criteria.name).map((column:any) => row[column])
          })))
        .subscribe({
          next: (items: any[]) => {
            this.items = items;            
          }
        })
        .add(() => this.itemsSubscription = null);

  }

  createCellEditor(): ICellEditorAngularComp {
    return  <ICellEditorAngularComp> {       
        
      agInit: (params) => {
        this.value = params.value;
      },

      afterGuiAttached: (params?: IAfterGuiAttachedParams) => {
      },

      getValue: () => {
        return this.value;
      }

    };
  }


  writeValue(value: any): void {
   // console.log('writeValue(value:', value, ')');
//    if (value !== this.value) {
//     this.value = value;
//     this.cd.markForCheck();
// }


    //const payload = this.data.model.payload;
    //const key = payload.criterias[0].name;
   // console.log('[CHOSEN] writeValue value:', value);
    this.value = value;
    this.selection = !value ? [] : [{ id: value, text: value, cells: [value] }];
    this.items = this.selection;

    // if (!!this.onchange) {
    //   this.onchange(value);
    // }
  //  this.tfChosen.c
    //this.cd.markForCheck();

  }




  private workaroundTAC2786(): void {
     // TAC-2786 : workaround.
     function isDescendant(element: any, parent: any) {
      for (let current = element.parentNode; !!current; current = current.parentNode) {
        if (current === parent) {
          return true;
        }
      }
      return false;
    }
    this
      .tfChosen
      .element
      .nativeElement
      .querySelector('div.dropdown')
      .addEventListener('blur', (event: any) => {
        console.log('blur: ', event);
        if (!event.relatedTarget || isDescendant(event.relatedTarget, event.target)) {
          return;
        }
        console.log('blur');
        this
          .form
          .controls[this.name]
          .markAsTouched();
      });
    // this
    //   .tfChosen
    //   .element
    //   .nativeElement
    //   .querySelector('div.dropdown > input')
    //   .addEventListener('blur', (event: any) => {
    //     console.log('blur: ', event);
    //     if (!event.relatedTarget || isDescendant(event.relatedTarget, event.target)) {
    //       return;
    //     }
    //     console.log('blur');
    //     this
    //       .form
    //       .controls[this.name]
    //       .markAsTouched();
    //   });


    // https://github.com/angular/angular/issues/10887
    // this.form.statusChanges.subscribe({
    //   next(status: any) {
        
    //   }
    // });
  }

}


