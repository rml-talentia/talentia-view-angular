import { FormComponent } from './form/form.component';
import { DataGridComponent } from './data-grid/data-grid.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from '@ag-grid-community/angular';
import { 
  TFAdvancedDatagridAmountRenderer, 
  TFAdvancedDatagridBooleanEditor, 
  TFAdvancedDatagridBooleanRenderer, 
  TFAdvancedDatagridCustomEditor, 
  TFAdvancedDatagridCustomRenderer, 
  TFAdvancedDatagridDateFilter, 
  TFAdvancedDatagridDatetimeEditor, 
  TFAdvancedDatagridDatetimeRenderer, 
  TFAdvancedDatagridImageDataRenderer, 
  TFAdvancedDatagridImagePathRenderer, 
  TFAdvancedDatagridInputEditor,
  TFUILibraryModule } from '@talentia/components';
import { TFShellLibraryModule } from '@talentia/components/shell';
import { HttpClientModule } from '@angular/common/http';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { CellEditorComponent } from './cell-editor/cell-editor.component';
import { DropdownComponent } from './dropdown/dropdown.component';
import { ChosenComponent } from './chosen/chosen.component';



@NgModule({
  declarations: [
    FormComponent,
    DataGridComponent,
    BreadcrumbComponent,
    DropdownComponent,
    ChosenComponent//,
    //CellEditorComponent
  ],
  imports: [
    TFUILibraryModule,
    TFShellLibraryModule,
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,    
    AgGridModule.withComponents([
      TFAdvancedDatagridAmountRenderer,
      TFAdvancedDatagridBooleanRenderer,
      TFAdvancedDatagridBooleanEditor, 
      TFAdvancedDatagridCustomEditor,
      TFAdvancedDatagridCustomRenderer,
      TFAdvancedDatagridDatetimeEditor,
      TFAdvancedDatagridDatetimeRenderer,
      TFAdvancedDatagridImageDataRenderer,
      TFAdvancedDatagridImagePathRenderer,
      TFAdvancedDatagridInputEditor,
      TFAdvancedDatagridDateFilter
    ])
  ],
  exports: [    
    TFUILibraryModule,
    TFShellLibraryModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FormComponent,
    DataGridComponent,
    BreadcrumbComponent,
    DropdownComponent,
    ChosenComponent
  ]
})
export class TacModule { 

  public static AG_GRID_FRAMEWORK_COMPONENTS = {

    /* Renderer */
    amountRenderer: TFAdvancedDatagridAmountRenderer,
    booleanRenderer: TFAdvancedDatagridBooleanRenderer,
    customRenderer: TFAdvancedDatagridCustomRenderer,
    datetimeRenderer: TFAdvancedDatagridDatetimeRenderer,
    imageDataRenderer: TFAdvancedDatagridImageDataRenderer,
    imagePathRenderer: TFAdvancedDatagridImagePathRenderer,
    /* Editor */
    booleanEditor: TFAdvancedDatagridBooleanEditor,
    customEditor: TFAdvancedDatagridCustomEditor,
    datetimeEditor: TFAdvancedDatagridDatetimeEditor,
    inputEditor: TFAdvancedDatagridInputEditor,
    /* Filter */
    agDateInput: TFAdvancedDatagridDateFilter

  };
}
