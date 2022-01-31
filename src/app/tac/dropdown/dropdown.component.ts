import { DOCUMENT } from '@angular/common';
import { Component, ContentChildren, EmbeddedViewRef, EventEmitter, Host, Inject, Input, NgZone, OnInit, Output, QueryList, TemplateRef, ViewChild } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { InputComponent } from '../input/input.component';
import { ItemTypeDirective } from '../itemType/itemType.directive';



interface Location {
  x: number;
  y: number;
}

@Component({
  selector: 'tac-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.css']
})
export class DropdownComponent implements OnInit {

  @Output()
  opened = new EventEmitter<boolean>();


  @ContentChildren(ItemTypeDirective)
  templates!: QueryList<ItemTypeDirective>;

  @ViewChild('template', { read: TemplateRef })
  templateRef!: TemplateRef<any>;
  embeddedViewRef: EmbeddedViewRef<any> | null = null;

  location: Location = { x: 0, y: 0 };


  constructor(
    public parent: InputComponent,
    private appComponent: AppComponent,
    private ngZone: NgZone,
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit(): void {
  }

  get dropdownStyle() {
    return {
      'left': this.location.x + 'px',
      'top': this.location.y + 'px',
      'width': 500 + 'px',
      'height': 200 + 'px'
    };
  }

  open(): void {

    if (null !== this.embeddedViewRef) {
      return;
    }

    

    const rect = (this.parent as InputComponent).input.input.nativeElement.getBoundingClientRect();
    this.location = { 
      x: rect.left + window.visualViewport.pageLeft,
      y: rect.bottom - 4 + window.visualViewport.pageTop };
    
    this.embeddedViewRef = this.appComponent.viewContainerRef.createEmbeddedView(this.templateRef, this);

    //this.document.defaultView.

    // Mousedown handler.
    let mousedown: any;
    this.document.defaultView?.addEventListener('mousedown', mousedown = (event: MouseEvent) => {
    //    if (event.target !== this.glasspanelRef.nativeElement) {
    //      return;
    //    }

      // if ((event.target as any).matches('.fa.fa-chevron-down')) {
      //   return;
      // }
      if (this.parent.input.input.nativeElement.contains(event.target)) {
        return;
      }
      if (!!(event.target as any).closest('.tac-dropdown')) {
        return;
      }
      if (event.target === this.embeddedViewRef?.rootNodes[0]) {
        return;
      }
      this.document.defaultView?.removeEventListener('mousedown', mousedown);
      this.ngZone.runTask(() => this.close());
    });


    this.opened.emit(true);

  }



  close(): void {
    if (null === this.embeddedViewRef) {
      return;
    }
    this.embeddedViewRef.destroy();
    this.embeddedViewRef = null;
    
  }

  isOpened() {
    return null !== this.embeddedViewRef;
  }

}

