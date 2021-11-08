
import { HttpClient } from '@angular/common/http';
import { AfterContentInit, AfterViewChecked, AfterViewInit, ApplicationRef, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, forwardRef,  Host, Inject, Input, NgZone, OnChanges, OnInit, Optional, SimpleChanges, SkipSelf, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TFChosenComponent, TFEvent, TFPanelComponent } from '@talentia/components';
import { SelectItem } from '@talentia/components/lib/ui/chosen/tf-select-item';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { IAfterGuiAttachedParams } from 'ag-grid-community';
//import { SelectItem } from '@talentia/components/lib/ui/chosen/tf-select-item';
import { Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { DataGridService } from 'src/app/service/DataGridService';
import { EventService } from 'src/app/service/EventService';
import { TransactionService } from 'src/app/service/TransactionService';
import { InputBaseComponent } from '../base/input-base.component';



@Component({
  selector: 'tac-chosen',
  templateUrl: './chosen.component.html',
  styleUrls: ['./chosen.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => ChosenComponent)
    }
  //,{ provide: TFPanelComponent, useExisting: forwardRef(() => ChosenComponent) }
  ]
  ,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChosenComponent extends InputBaseComponent implements  AfterViewInit {

  constructor(
    //  @SkipSelf() @Optional() private view: TFPanelComponent,
    // private applicationRef: ApplicationRef,
    // private zone: NgZone,
    private changeDetectorRef: ChangeDetectorRef,
    private http: HttpClient,
    //private dataService: DataService,
    private transactionService: TransactionService,
    private eventService: EventService,
    private dataGridService: DataGridService) { 
      super();
    }

  @ContentChild('myItemTemplate', { read: TemplateRef})
  myItemTemplate!: TemplateRef<any>;

  @ViewChild(TFChosenComponent)
  tfChosen!: TFChosenComponent;
  @Input()
  value!: string;
  selection: any[] = [];
  items: any[] = [];  
  itemsSubscription!: Subscription | null;
  totalCount: number = 0;

  ngAfterViewInit(): void {
//    this.workaroundTAC2786();  
  //  this.changeDetectorRef.detectChanges();
  }

  onSelected(item: any): void {
    console.log('[ChosenComponent] onSelected(item:', item, ')');

    
    this.fireChange(this.value = item.id);
    this.component.value = this.value;
    //this.dataGridService.setValue(this.component.getClosest('DataGrid'), 0, this.component.name, this.value);


    // In case of cell editor, the event is triggered from DataGrid.
    if (!this.isInCellEditor()) {
      this.eventService.doEvent(this.component, 'Change');
    } 

    

  }

  onNeedData(event: TFEvent): void {
   this.fetchData(0);
  }

  onNeedMoreData(event: TFEvent): void {
    this.fetchData(Math.ceil(this.items.length / 30));
  }

  private fetchData(page: number): void {


    const model = this.component.model.toObject();
    const key = model.criterias[0].name;

    console.log('[ChosenComponent] fetchData model: ', model, ' component: ', this.component);

    this.itemsSubscription = this.http
      .post(
          `${this.transactionService.contextPath}/services/private/api/chosen/${this.component.model.componentType}/getPage?sessionId=${this.transactionService.sessionId}`,
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
          .pipe(tap((response: any) => {
            this.totalCount = response.total;
          }))
          .pipe(map((response: any) => { 
            return response
              .rows
              .map((row: any, index: number) => <any> {
                  id:  row[key],
                  text: row[key],
                  cells: model.criterias.map((criteria: any) => criteria.name).map((column:any) => row[column])
              });
          }))
          .subscribe({
            next: (items: any[]) => {

              if (0 === page) {
                this.items = [{
                  id: '',
                  text: '<Aucune sélection>',
                  cells: ['<Aucune sélection>', '', '', '']
                }];
              }

              this.items = this.items.concat(items);

              // if (0 === page) {
              //   this.items = items;
              // } else {
              //   this.items = this.items.concat(items);
              // //  this.chosen.refresh();
              // }           
              this.changeDetectorRef.markForCheck();
            }
          })
          .add(() => this.itemsSubscription = null);

  
  }



  createCellEditor(): ICellEditorAngularComp {
    let value: any = null;
    return  <ICellEditorAngularComp> {       

        
      agInit: (params) => {
        console.log('[ChosenComponent] agInit(params:', params, ')');
       // this.value = params.value;
       //this.writeValue(params.value);
       value = params.value;

       

      //  this.selection = !value ? [] : [{ id: value, text: value, cells: [value] }];
      //  this.items = this.selection;
      //  this.value = value;
      },

      afterGuiAttached: (params?: IAfterGuiAttachedParams) => {
        console.log('[ChosenComponent] afterGuiAttached(params:', params, ')');
        //this.value =
      },

      getValue: () => {
        return this.value;
      }

    };
  }


  writeValue(value: any): void {
    console.log('[ChosenComponent] writeValue(value:', value, ')');
//    if (value !== this.value) {
//     this.value = value;
//     this.cd.markForCheck();
// }


    //const payload = this.data.model.payload;
    //const key = payload.criterias[0].name;
 ///   console.log('[CHOSEN] writeValue value:', value);


    this.value = value;
    this.selection = !value ? [] : [{ id: value, text: value, cells: [value] }];
    this.items = this.selection;
    this.fireChange(value);



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


