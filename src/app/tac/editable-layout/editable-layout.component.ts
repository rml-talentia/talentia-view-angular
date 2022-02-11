import { AfterContentChecked, AfterContentInit, AfterViewChecked, AfterViewInit, Component, ContentChildren, ElementRef, NgZone, OnChanges, OnInit, QueryList, SimpleChanges, TemplateRef, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { BaseComponent } from '../base/component-base.component';

@Component({
  selector: 'tac-editable-layout',
  templateUrl: './editable-layout.component.html',
  styleUrls: ['./editable-layout.component.css']
})
export class EditableLayoutComponent extends BaseComponent implements AfterContentChecked {

  @ContentChildren(TemplateRef)
  private templateRefs!: QueryList<TemplateRef<any>>;

  @ViewChild('container', { read: ViewContainerRef, static: false })
  private containerRef!: ViewContainerRef;

  constructor(private ngZone: NgZone) {
    super();
  }

  _initialize: boolean = true;

  ngAfterContentChecked(): void {
    // When createEmbeddedView are made in ngAfterViewInit 
    // we get a ExpressionChangedAfterItHasBeenCheckedError.
    // So we made them here, but we add this initialization condition as recursion prevention.
    if (!this.containerRef || !this._initialize || (this._initialize = false)) {
      return;
    }
    this.templateRefs.forEach(templateRef => {
      this.containerRef.createEmbeddedView(templateRef, {  });
    });
  }

}
