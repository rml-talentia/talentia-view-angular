import { AfterContentInit, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChildren, Input, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { NgForm } from '@angular/forms';
import { FormService } from 'src/app/service/FormService';
import { ICellEditorAngularComp } from "@ag-grid-community/angular";
import { IAfterGuiAttachedParams } from 'ag-grid-community';
import { ViewService } from 'src/app/service/ViewService';
import { TFMessageService } from '@talentia/components';

/**
 * This component is used as root component in dynamic templates compiled by TemplateService.
 * 
 * The purpose is to provide services which can't be done by the component created in TemplateService.
 */
@Component({
  selector: 'tac-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent implements OnInit, OnDestroy, AfterContentInit, AfterViewInit {

  @ContentChildren(NgForm)
  formElements!: QueryList<NgForm>;

  @Input()
  parent!: any; // Look at TemplateService

  @Input()
  name!: string;

  constructor(
    private formService: FormService,
    public changeDetectorRef: ChangeDetectorRef,
    private viewService: ViewService 
  ) {}

   
  ngOnInit(): void {

   // this.viewService.register({});

    this.experimentCellEditor();
   
  }
  
  ngOnDestroy(): void {
  }

  ngAfterViewInit(): void {
  }
  
  ngAfterContentInit(): void {   
  }


  value: any = 'empty';

  private experimentCellEditor(): void {
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
