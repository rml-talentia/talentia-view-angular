import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextInputCellEditor } from './text-input-cell-editor.component';

describe('TextInputCellEditorComponent', () => {
  let component: TextInputCellEditor;
  let fixture: ComponentFixture<TextInputCellEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TextInputCellEditor ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TextInputCellEditor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
