import { Component, ElementRef, Input, NgZone, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';

@Component({
  selector: 'app-dropdown-panel',
  templateUrl: './dropdown-panel.component.html',
  styleUrls: ['./dropdown-panel.component.css']
})
export class DropdownPanelComponent {

  constructor(
    private ngZone: NgZone,
    private viewContainerRef: ViewContainerRef) { }

  @ViewChild('glasspanel', { read: ElementRef })
  glasspanelRef!: ElementRef;

  @Input()
  x: number = 0;
  @Input()
  y: number = 0;

  display: string = 'none';

  templateRef!: TemplateRef<any>;

  context!: any;

  get glasspanelStyle() {
    return {
      'position': 'absolute',
      'z-index': '1000',
      'inset': '0',
      'display': this.display
    };
  }

  get dropdownStyle() {
    return {
      'position': 'absolute',
      'display': 'block',
      'z-index': '1001',
      'width': '300px',
      'height': '200px',
      'top': `${this.y}px`,
      'left': `${this.x}px`
    };
  }

  openDropdown<T>(options: OpenDropdownOptions<T>) {
  //  const viewRef = this.viewContainerRef.createEmbeddedView(options.templateRef, options.data);
    
    const rect = options.elementRef.nativeElement.getBoundingClientRect();
    this.display = 'block';
    this.x = rect.left + window.visualViewport.pageLeft;
    this.y = rect.bottom - 4 + window.visualViewport.pageTop;

    this.templateRef = options.templateRef;
    this.context = { $implicit: options.data };




    // Mousedown handler.
    let mousedown: any;
    window.addEventListener('mousedown', mousedown = (event: MouseEvent) => {
  //    if (event.target !== this.glasspanelRef.nativeElement) {
  //      return;
  //    }
      if ((event.target as any).matches('.fa.fa-chevron-down')) {
        return;
      }
      if (!!(event.target as any).closest('.tac-dropdown-panel')) {
        return;
      }
      if (event.target === options.elementRef.nativeElement) {
        return;
      }
      window.removeEventListener('mousedown', mousedown);
      this.ngZone.runTask(() => this.closeDropdown());
    });

  }

  closeDropdown() {
    this.display = 'none';
  }

  // doMousedown(event: MouseEvent) {
  //   this.closeDropdown();
  // }

}


export interface OpenDropdownOptions<T> {

  /**
   * Element responsible of opening a dropdown.
   */
  elementRef: ElementRef; 
  /**
   * Dropdown content.
   */
  templateRef: TemplateRef<T>;
  /**
   * Dropdown context.
   */
  data: T;

}