import { Component, OnInit } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { ViewComponent } from 'src/app/view/view.component';

@Component({
  selector: 'tac-cell-editor',
  templateUrl: './cell-editor.component.html',
  styleUrls: ['./cell-editor.component.css']
})
export class CellEditorComponent extends ViewComponent implements ControlValueAccessor {

  writeValue(newValues: any): void {
    throw new Error('Method not implemented.');
  }

  registerOnChange(fn: any): void {
    throw new Error('Method not implemented.');
  }

  registerOnTouched(fn: any): void {
    throw new Error('Method not implemented.');
  }
}
