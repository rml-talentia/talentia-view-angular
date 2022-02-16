import { DOCUMENT } from '@angular/common';
import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { TFTreeViewComponent } from '@talentia/components';
import { AppComponent } from '../app.component';
import { Bindable as Bindable } from '../service/types';
import { EditableLayoutComponent } from '../tac/editable-layout/editable-layout.component';
import { findByComponentId, visit } from '../tac/util';

@Component({
  selector: 'app-view-editor-tools',
  templateUrl: './view-editor-tools.component.html',
  styleUrls: ['./view-editor-tools.component.css']
})
export class ViewEditorToolsComponent implements OnInit {

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private appComponent: AppComponent
  ) { }

  ngOnInit(): void {
  }

    //
  // Dragging Drop
  //

  dragging: Dragging | null = null;



  //
  // Inspector
  //

  @ViewChild('inspectorView', { read: TFTreeViewComponent })
  inspectorView!: TFTreeViewComponent;
  inspectorSelection: any[] = [];

  _inspector: any = null;
  _guard: any[] = [];

  get inspector(): any {
    if (null === this._inspector) {
      //this._guard = [];
      this._inspector = !this.appComponent.currentView ? [] : [this.toInspectorNode(this.appComponent.currentView)];
    }
    return this._inspector;
  }
  
  set inspector(inspector: any) {
    this._inspector = inspector;
  }

  private toInspectorNode(component: Bindable) {
    
    // if (this._guard.indexOf(component)) {
    //   console.log('[Inspector] toInspectorNode(', component, ')');
    //   throw new Error();
    // }
    // this._guard.push(component);

    
    switch (component.componentType) {
      case 'Insertion':
        component = component.insertion;
        if (null == component) {
          return null;
        }
        return {
          name: component.id ||  `${component.componentType}`,
          icon: 'fas fa-link',
          children: []
        }
        //component = this.referenceService.getValue(component, component.insertion);
    }
    return {
      name: component.id ||  `${component.componentType}`,
      icon: 'fas fa-code',
      children: this.toInspectorNodes(component)
    }
  }

  private toInspectorNodes(component: Bindable) {
    return component.components.map((child: Bindable) => this.toInspectorNode(child)).filter((node: any) => null !== node);
  }

  inspectorMousedownHandler(ev: any, node: any) {
    console.log('mousedown:', ev, node);

    // https://github.com/Talentia-Software/core-components/blob/develop/projects/components/src/lib/ui/treeview/tf-treeview.component.ts
    // https://angular2-tree.readme.io/docs/drag-drop#drag-a-node-outside-of-the-tree
    // Selection on mousedown rather than on click.
    this.inspectorView.selectNode(node);

    // Start dragging
    const glass = this.document.createElement('div');
    glass.style.position = 'fixed';
    (<any>glass.style).inset = '0';
    glass.style.zIndex = '3000';
    glass.style.cursor = 'grabbing';

    const mousemove = (moveEvent: MouseEvent) => {
      if (null === this.dragging) {
        this.dragging = {};
      }

      this.mousemoveHandler(moveEvent, node);
    };
    const mouseup = (upEvent: MouseEvent) => {
      mousemove(upEvent);
      this.dragging = null;
      this.mouseupHandler(upEvent, node);
      glass.parentElement?.removeChild(glass);
    };    
    glass.addEventListener('mousemove', mousemove);
    glass.addEventListener('mouseup', mouseup);
    this.document.body.appendChild(glass);
  }

  mousemoveHandler(event: MouseEvent, node: any) {

    let editableLayout = this.getEditableLayoutFromEvent(event);
    if (null !== editableLayout) {
     // console.log('[mousemoveHandler] editableLayout:', editableLayout);
    }
  }

  mouseupHandler(event: MouseEvent, node: any) {

    let editableLayout = this.getEditableLayoutFromEvent(event);

    if (null !== editableLayout) {
    //  console.log('[mouseupHandler] editableLayout:', editableLayout);
    }
    
    if (null !== editableLayout) {
      const component = findByComponentId(this.appComponent.viewAsData, node.data.name);
      console.log('component:', component);
      console.log('currentView:', this.appComponent.currentView);
      editableLayout.insertComponent(component);

    }

  }

  getEditableLayoutFromEvent(event: MouseEvent): EditableLayoutComponent | null {
    for (let i = -1 + this.appComponent.currentView.components.length; i >= 1; i--) {
      const editableLayout: EditableLayoutComponent = this.appComponent.currentView.components[i]._view;
      const rect = editableLayout.getBoundingRect();
      //console.log('rect:', rect);
      if (rect.x <= event.clientX
        && rect.x + rect.width >= event.clientX
        && rect.y <= event.clientY
        && rect.y + rect.height >= event.clientY) {
          return editableLayout;
      }
    }
    return null;
  }

}

interface Dragging {

}

