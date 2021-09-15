
import { HttpClient } from '@angular/common/http';
import { AfterContentInit, AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, ContentChild, forwardRef, Input, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TFChosenComponent, TFEvent } from '@talentia/components';
import { SelectItem } from '@talentia/components/lib/ui/chosen/tf-select-item';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { IAfterGuiAttachedParams } from 'ag-grid-community';
//import { SelectItem } from '@talentia/components/lib/ui/chosen/tf-select-item';
import { Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { DataService } from 'src/app/service/DataService';
import { TransactionService } from 'src/app/service/TransactionService';
import { InputBaseComponent } from '../base/input-base.component';



@Component({
  selector: 'tac-chosen',
  templateUrl: './chosen.component.html',
  styleUrls: ['./chosen.component.css'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: forwardRef(() => ChosenComponent)
  }]
})
export class ChosenComponent extends InputBaseComponent implements AfterContentInit, AfterViewInit,  AfterViewChecked {

  constructor(
    private http: HttpClient,
    private dataService: DataService,
    private transactionService: TransactionService) { 
      super();
    }

  @ViewChild(TFChosenComponent)
  chosen!: TFChosenComponent;


  @Input()
  value!: string;


  selection: any[] = [];
  items: any[] = [];  
  itemsSubscription!: Subscription | null;
  totalCount: number = 0;


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
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  onSelected(item: any): void {
    console.log('[tac-chosen] onSelected(item:', item, ')');
    this.fireChange(this.value = item.id);

console.log(  this
  .component
  .events);


    const form = 'pieceComptableTravailCGSEEForm';

    this
      .component
      .events
      .filter((event: any) => event.eventType === 'Change')
      .forEach((event: any) => {
        event
          .actions
          .forEach((action: any) => {
            // action.type .... Ajax

            switch(action.actionType) {
              case 'Ajax':

                // Traditional HTML form post. 
                const payload = new URLSearchParams();
                action
                  .parameters
                  .forEach((parameter: any) => {
                    payload.set(parameter.name, this.dataService.get(parameter.value, { defaultValue: '' }));
                  });
                this
                  .http
                  .post(
                    `${this.transactionService.contextPath}/viewbridge/ajax/${action.href}?sessionId=${this.transactionService.sessionId}&__form=${form}`,
                    payload.toString(), 
                    {
                        headers: {
                          'Content-Type': 'application/x-www-form-urlencoded',
                          [this.transactionService.csrfTokenName]: this.transactionService.csrfTokenValue
                        }
                    })
                    .subscribe({
                      next: (response: any) => {
                        console.log('response:' , response);
                        response
                          .mutations
                          .forEach((mutation: any) => {
                            this.dataService.set(mutation.target, mutation.value);
                          });


                          console.log(this.dataService.data);
                      }
                    });
                break;
            }

          

          });
      });
  }

  onNeedData(event: TFEvent): void {
   this.fetchData(0);
  }

  onNeedMoreData(event: TFEvent): void {
    this.fetchData(Math.ceil(this.items.length / 30));
  }

  private fetchData(page: number): void {
    const payload = this.component.model.payload;
    payload.search = '';
    payload.pageSize = 30;
    payload.page = page;
   // payload.excludedKeys = null;    
    
    const key = payload.criterias[0].name;
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
        .pipe(tap((response: any) => {
          this.totalCount = response.total;
        }))
        .pipe(map((response: any) => { 
          return response
            .rows
            .map((row: any, index: number) => <any> {
                id:  row[key],
                text: row[key],
                cells: payload.criterias.map((criteria: any) => criteria.name).map((column:any) => row[column])
            });
        }))
        .subscribe({
          next: (items: any[]) => {
            if (0 === page) {
              this.items = items;
            } else {
              //this.items.push.apply(this.items, items);
              //
              this.items = this.items.concat(items);
              this.chosen.refresh();
            }           
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
 ///   console.log('[CHOSEN] writeValue value:', value);
    
    this.selection = !value ? [] : [{ id: value, text: value, cells: [value] }];
    this.items = this.selection;
    this.fireChange(this.value = value);

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


