import { AfterContentInit, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChildren, Input, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ICellEditorAngularComp } from "@ag-grid-community/angular";
import { IAfterGuiAttachedParams } from 'ag-grid-community';
import { TemplateService } from 'src/app/service/TemplateService';
import { TFMessageService } from '@talentia/components';
import { BaseComponent } from '../base/component-base.component';

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
export class ViewComponent extends BaseComponent implements OnInit, OnDestroy, AfterContentInit, AfterViewInit {

  @ContentChildren(NgForm)
  formElements!: QueryList<NgForm>;

  @Input()
  parent!: any; // Look at TemplateService

  @Input()
  name!: string;

  constructor(
    public changeDetectorRef: ChangeDetectorRef) {
    super();
  }

   
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
