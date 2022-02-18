import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewRef } from '@angular/core';
import { BaseComponent } from '../base/component-base.component';
import { EditableLayoutComponent } from '../editable-layout/editable-layout.component';

@Component({
  selector: 'tac-editable-layout-placeholder',
  templateUrl: './editable-layout-placeholder.component.html',
  styleUrls: ['./editable-layout-placeholder.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditableLayoutPlaceholderComponent extends BaseComponent implements OnInit, OnDestroy {

  constructor(
    private editableLayout: EditableLayoutComponent,
    public changeDetectorRef: ChangeDetectorRef,
    private elementRef: ElementRef
  ) { super(); }

  hover: boolean = false;

  ngOnInit(): void {
    this.editableLayout.registerPlaceholder(this);
  }

  ngOnDestroy(): void {
    this.editableLayout.unregisterPlaceholder(this);
  }

  get style() {
    return {
      'visibility': this.hover ? 'visible' : 'hidden',
     // 'background': !!this.editableLayout.dragging ? 'red' : 'blue'
    }
  }

  isHover(event: MouseEvent) {
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    return event.clientX >= rect.x 
      && event.clientX <= rect.x + rect.width
      && event.clientY >= rect.y
      && event.clientY <= rect.y + rect.height;
  }

}
