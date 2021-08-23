import { HttpClient } from '@angular/common/http';
import { AfterContentInit, AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, ContentChild, forwardRef, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TFChosenComponent } from '@talentia/components';
//import { SelectItem } from '@talentia/components/lib/ui/chosen/tf-select-item';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ViewService } from 'src/app/view/view.component';


// class ExtendedSelectItem extends SelectItem {

//   constructor(source: any) {
//     super(source);
//   }

//   cells: any[] = [];

  
// }

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
export class ChosenComponent implements OnInit, AfterContentInit, AfterViewInit,  AfterViewChecked, ControlValueAccessor {

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private http: HttpClient,
    private viewService: ViewService) { }

  @Input()
  form!: FormGroup;
  @Input()
  name!: string;
  
  @Input()
  data!: any;
  @Input()
  title!: string;
  @Input()
  value!: any[];
  items!: any[];  
  itemsSubscription!: Subscription | null;

  text!: string;
  onchange: any;
  ontouched: any;

  @ContentChild('myItemTemplate', { read: TemplateRef})
  myItemTemplate!: TemplateRef<any>;

  @ViewChild(TFChosenComponent)
  tfChosen!: TFChosenComponent;

  ngAfterViewChecked(): void {
   
  }


  ngAfterViewInit(): void {
    this.workaroundTAC2786();
   
  }

  ngAfterContentInit(): void {
    // Array.prototype.forEach.call(document.querySelectorAll('tf-chosen > div.dropdown'), element => { element.addEventListener('focus', event => {  var chosen = event.target.parentElement.__component; chosen.form.controls[chosen.name].markAsTouched();   }); })
 

  }




  ngOnInit(): void {
    this.text = '';
   

   // console.log('this.data: ', this.data);

 
    const payload = this.data.model.payload;
    payload.search = '';
    payload.pageSize = 30;
   // payload.excludedKeys = null;    
    
    const key = payload.criterias[0].name;


    if (this.value) {
      this.value[0] = { id: this.value[0][key], text: this.value[0][key] };
    }


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


  writeValue(value: any): void {
   // console.log('writeValue(value:', value, ')');
//    if (value !== this.value) {
//     this.value = value;
//     this.cd.markForCheck();
// }
  }

  registerOnChange(onchange: any): void {
    this.onchange = onchange;
  }

  registerOnTouched(ontouched: any): void {
    this.ontouched = ontouched;
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
        if (!!event.relatedTarget && isDescendant(event.relatedTarget, event.target)) {
          return;
        }
        this
          .form
          .controls[this.name]
          .markAsTouched();
      });
  }

}
