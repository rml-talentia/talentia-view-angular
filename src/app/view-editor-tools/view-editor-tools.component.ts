import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, NgZone, OnInit, ViewChild } from '@angular/core';
import { TFGridRowComponent, TFTreeViewComponent } from '@talentia/components';
import { AppComponent } from '../app.component';
import { Bindable as Bindable } from '../service/types';
import { EditableLayoutPlaceholderComponent } from '../tac/editable-layout-placeholder/editable-layout-placeholder.component';
import { EditableLayoutComponent } from '../tac/editable-layout/editable-layout.component';
import { findByComponentId, visit } from '../tac/util';

@Component({
  selector: 'app-view-editor-tools',
  templateUrl: './view-editor-tools.component.html',
  styleUrls: ['./view-editor-tools.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewEditorToolsComponent implements OnInit {

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private changeDetectorRef: ChangeDetectorRef,
    private ngZone: NgZone,
    private appComponent: AppComponent
  ) { }

  ngOnInit(): void {
  }

  //
  // Dragging Drop
  //

  dragging: Dragging | null = null;


  //
  // Technical Drawing
  //

  technicalDrawing: TechnicalDrawing | null = null;

  toTechnicalDrawingStyle(drawing: TechnicalDrawing) {
    return {
      ...this.toTechnicalDrawingRectStyle({ x: 0, y: -50, width: 0, height: 0 })
    };
  }

  toTechnicalDrawingRectStyle(rect: RectDrawing) {
    return {
      'left': `${rect.x}px`,
      'top': `${rect.y}px`,
      'width': `${rect.width}px`,
      'height': `${rect.height}px`
    };
  }

  toTechnicalDrawingRowStyle(row: RowDrawing) {
    return {
      ...this.toTechnicalDrawingRectStyle(row)
    };
  }

  toTechnicalDrawingColumnStyle(column: ColumnDrawing) {
    return {
      ...this.toTechnicalDrawingRectStyle(column)
    };
  }

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
    const overlay = this.document.createElement('div');
    overlay.style.position = 'fixed';
    (<any>overlay.style).inset = '0';
    overlay.style.zIndex = '3000';
    overlay.style.cursor = 'grabbing';

    const mousemove = (moveEvent: MouseEvent) => {
      if (null === this.dragging) {
        this.dragging = {};
        this.changeDetectorRef.markForCheck();
      }

      this.mousemoveHandler(moveEvent, node);
    };
    const mouseup = (upEvent: MouseEvent) => {
      mousemove(upEvent);
      this.dragging = null;
      this.mouseupHandler(upEvent, node);
      overlay.parentElement?.removeChild(overlay);
    };    
    overlay.addEventListener('mousemove', mousemove);
    overlay.addEventListener('mouseup', mouseup);
    this.document.body.appendChild(overlay);
  }

  private refreshTechnicalDrawing(editableLayout: EditableLayoutComponent | null, event: MouseEvent) {
    if (null !== editableLayout) {
      // console.log('[mousemoveHandler] editableLayout:', editableLayout);

      const rect = editableLayout.elementRef.nativeElement.getBoundingClientRect();
      this.technicalDrawing = {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        rows: [],
        columns: []
      };      

      visit(this.appComponent.currentView, (component: Bindable, index: number, start: boolean) => {
        let instance;
        switch (component.componentType) {
          case 'GridRow':
   
            break;
          case 'GridColumn':
            break;
          case 'EditableLayoutPlaceholder':
            instance = component._view as EditableLayoutPlaceholderComponent;
            if (null != instance) {
              instance.hover = instance.isHover(event);
              instance.changeDetectorRef.detectChanges();
            }
            break;
        }
      });


      Array.prototype.forEach.call(editableLayout.elementRef.nativeElement.querySelectorAll('tf-grid-row > .tf-grid-row-container'), (element: any, index: number) => {
        const rect = element.getBoundingClientRect();
        console.log(rect);
        this.technicalDrawing?.rows.push({
          x: rect.x + 1,
          y: rect.y + 1,
          width: rect.width - 2,
          height: rect.height - 2
        });
      });
      Array.prototype.forEach.call(editableLayout.elementRef.nativeElement.querySelectorAll('tf-grid-col, tf-field'), (element: any, index: number) => {
        const rect = element.getBoundingClientRect();

        const marginLeft = 0;//element.offsetLeft;
        const marginRight = 0;//rect.width - element.offsetWidth;

        this.technicalDrawing?.columns.push({
          x: rect.x + marginLeft + 4,
          y: rect.y + 4,
          width: element.offsetWidth - marginLeft - marginRight - 8,
          height: element.offsetHeight - 8
        });
      });

     //editableLayout.changeDetectorRef.markForCheck();
    } else {
      this.technicalDrawing = null;
    }

   
  }

  mousemoveHandler(event: MouseEvent, node: any) {

    let editableLayout = this.getEditableLayoutFromEvent(event);
    this.refreshTechnicalDrawing(editableLayout, event);
    this.changeDetectorRef.detectChanges();

    
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

    setTimeout(() => {
      this.refreshTechnicalDrawing(editableLayout, event);
      this.changeDetectorRef.markForCheck();
    });

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

interface RectDrawing {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ColumnDrawing extends RectDrawing {
  
}

interface RowDrawing extends RectDrawing {

}

interface TechnicalDrawing extends RectDrawing {

  rows: RowDrawing[];
  columns: ColumnDrawing[];

}

interface Dragging {

}

