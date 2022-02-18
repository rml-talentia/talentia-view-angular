import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditableLayoutPlaceholderComponent } from './editable-layout-placeholder.component';

describe('EditableLayoutPlaceholderComponent', () => {
  let component: EditableLayoutPlaceholderComponent;
  let fixture: ComponentFixture<EditableLayoutPlaceholderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditableLayoutPlaceholderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditableLayoutPlaceholderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
