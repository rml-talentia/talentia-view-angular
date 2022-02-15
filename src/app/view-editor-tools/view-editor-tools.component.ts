import { Component, Input, OnInit } from '@angular/core';
import { Bindable as Bindable } from '../service/types';
import { visit } from '../tac/util';

@Component({
  selector: 'app-view-editor-tools',
  templateUrl: './view-editor-tools.component.html',
  styleUrls: ['./view-editor-tools.component.css']
})
export class ViewEditorComponent implements OnInit {


  @Input()
  view!: Bindable;

  constructor() { }

  ngOnInit(): void {
  }

  
  get content() {
    return !this.view || !this.view.components || 1 > this.view.components.length ? null : this.view.components[0]; 
  }

  get layout() {
    return !this.view || !this.view.components || 2 > this.view.components.length ? null : this.view.components[1]; 
  }

  mousedownHandler(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();


    //console.log('view:', this.view);

    if (null === this.content) {
      return;
    }

    visit(this.content, (component: any, parent: any, index: Number, start: Boolean) => {
      if (!component._view) {
        return;
      }
      
      // console.log(component);
      // console.log(document.getElementById(component.id));
    });

  }



}
