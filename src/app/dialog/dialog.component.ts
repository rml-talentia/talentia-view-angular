import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent implements OnInit {

  @Input()
  title: string = '';
  @Input()
  bounds = { x: 100, y: 10, width: 320, height: 450 };


  @ViewChild('dialog', { read: ElementRef, static: true })
  dialog!: ElementRef<any>;



  constructor(
    @Inject(DOCUMENT) private document: Document) {
  }

  ngOnInit(): void {
  }

  get wrapperStyle() {
    return {
      'display': 'block',
      //'position': 'absolute',
      'z-index': '1060'
    };
  }

  get dialogStyle() {
    return {
      'position': 'absolute',
      'margin': '0',
      'max-width': 'initial',
      'left': this.bounds.x + 'px',
      'top': this.bounds.y + 'px',
      'width': this.bounds.width + 'px',
      'height': this.bounds.height + 'px'
    };
  }


  get bodyStyle() {
    return {
      'position': 'absolute',
      'top': '50px',
      'bottom': '2px',
      'left': '0',
      'right': '0',
      'padding': '0'
    };
  }

  headerMousedownHandler(downEvent: MouseEvent): void {
    const oldBounds = { ...this.bounds };// this.dialog.nativeElement.getBoundingClientRect();
    const newBounds = this.bounds;
    const mousemove = (moveEvent: MouseEvent) => {
      newBounds.x = oldBounds.x + moveEvent.clientX - downEvent.clientX;
      newBounds.y = oldBounds.y + moveEvent.clientY - downEvent.clientY;
    };
    const mouseup = (upEvent: MouseEvent) => {
      mousemove(upEvent);
      this.document.defaultView?.removeEventListener('mouseup', mouseup);
      this.document.defaultView?.removeEventListener('mousemove', mousemove);
    };
    this.document.defaultView?.addEventListener('mousemove', mousemove);
    this.document.defaultView?.addEventListener('mouseup', mouseup);
  }

}
