import { AfterContentInit, AfterViewInit, ChangeDetectorRef, Component, ContentChildren, Input, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { NgForm } from '@angular/forms';
import { FormService } from 'src/app/service/FormService';
import { ICellEditorAngularComp } from "@ag-grid-community/angular";
import { IAfterGuiAttachedParams } from 'ag-grid-community';

/**
 * This component is used as root component in dynamic templates compiled by TemplateService.
 * 
 * The purpose is to provide services which can't be done by the component created in TemplateService.
 */
@Component({
  selector: 'tac-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit, AfterContentInit, AfterViewInit {

  @ContentChildren(NgForm)
  formElements!: QueryList<NgForm>;

  @Input()
  parent!: any; // Look at TemplateService

  constructor(
    private formService: FormService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {

   }

  value: any = 'empty';

  ngAfterViewInit(): void {
   
  }
  
  ngAfterContentInit(): void {
 //  console.log('[tac-view] formElements:', this.formElements);
   this.formService.setForm(this.formElements.first?.form);


   
  }

  ngOnInit(): void {
    if (this.parent && 'cellEditor' in this.parent) {
      console.log('[tac-view] in an editor');


      this.parent.cellEditor = <ICellEditorAngularComp> {       
        
        agInit: (params) => {
          console.log('[tac-view] agInit(params:', params, ')');
          this.value = params.value;
      //    this.changeDetectorRef.detectChanges();
        },

        afterGuiAttached: (params?: IAfterGuiAttachedParams) => {
        },

        getValue: () => {
          return this.value;
        }


      };
    }
  }

}
