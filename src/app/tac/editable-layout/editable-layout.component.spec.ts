import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditableLayoutComponent } from './editable-layout.component';

describe('EditableLayoutComponent', () => {
  let component: EditableLayoutComponent;
  let fixture: ComponentFixture<EditableLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditableLayoutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditableLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
