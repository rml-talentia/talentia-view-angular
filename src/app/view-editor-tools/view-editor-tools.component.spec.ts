import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewEditorToolsComponent } from './view-editor-tools.component';

describe('ViewEditorToolsComponent', () => {
  let component: ViewEditorToolsComponent;
  let fixture: ComponentFixture<ViewEditorToolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewEditorToolsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewEditorToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
