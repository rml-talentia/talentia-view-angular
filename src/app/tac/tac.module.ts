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
import { SelectComponent } from './select/select.component';
import { ChosenComponent } from './chosen/chosen.component';
import { DatetimePickerComponent } from './datetime-picker/datetime-picker.component';
import { ButtonComponent } from './button/button.component';
import { ViewComponent } from './view/view.component';
import { InputComponent } from './input/input.component';
import { TransactionComponent } from './transaction/transaction.component';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { CellRendererComponent } from './cell-renderer/cell-renderer.component';
import { TextComponent } from './text/text.component';
import { TacConstraintsDirective } from './validation';
import { RadioComponent } from './radio/radio.component';
import { ModelSwitchComponent } from './model-switch/model-switch.component';
import { ListComponent } from './list/list.component';
import { ItemTypeDirective } from './itemType/itemType.directive';
import { DropdownComponent } from './dropdown/dropdown.component';
import { EditableLayoutComponent } from './editable-layout/editable-layout.component';


@NgModule({
  declarations: [
    TacConstraintsDirective,
    ButtonComponent,
    FormComponent,
    TransactionComponent,
    DataGridComponent,
    BreadcrumbComponent,
    SelectComponent,
    ChosenComponent,
    DatetimePickerComponent,
    InputComponent,
    ViewComponent,
    CheckboxComponent,
    CellRendererComponent,
    CellEditorComponent,
    TextComponent,
    RadioComponent,
    ModelSwitchComponent,
    ListComponent,
    ItemTypeDirective,
    DropdownComponent,
    EditableLayoutComponent
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
      // ,
      // TextInputCellEditor
    ])
  ],
  /**
   * This module export every components used inside dynamic template views.
   */
  exports: [    
    TFUILibraryModule,
    TFShellLibraryModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TacConstraintsDirective,
    ViewComponent,
    ButtonComponent,
    FormComponent,
    TransactionComponent,
    DataGridComponent,
    BreadcrumbComponent,
    SelectComponent,
    ChosenComponent,
    DatetimePickerComponent,
    InputComponent,
    ItemTypeDirective,
    CheckboxComponent,
    CellRendererComponent,
    CellEditorComponent,
    TextComponent,
    RadioComponent,
    ModelSwitchComponent,
    ListComponent,
    DropdownComponent,
    EditableLayoutComponent
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
