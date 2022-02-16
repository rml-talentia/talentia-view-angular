import { AfterContentChecked, ApplicationRef, ChangeDetectorRef, Component, ComponentFactoryResolver, ComponentRef, ContentChildren, ElementRef, EmbeddedViewRef, Injector, NgZone, QueryList, TemplateRef, Type, ViewChild, ViewContainerRef, ViewRef } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { BaseComponent } from '../base/component-base.component';
import { Bindable } from '../../service/types';
import { ReferenceService } from 'src/app/service/ReferenceService';
import { TFField, TFFieldComponent, TFGridColumnComponent, TFGridComponent, TFGridRowComponent } from '@talentia/components';
import { TFGridColConfig } from '@talentia/components/lib/models/tf-grid-col-config.model';

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

  constructor(
    private appComponent: AppComponent,
    private referenceService: ReferenceService,
    private changeDetectorRef: ChangeDetectorRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private ngZone: NgZone,
    private injector: Injector,
    private elementRef: ElementRef) {
    super();
  }

  get dragging() {
    return !this.appComponent?.viewEditorTools ? null : this.appComponent.viewEditorTools.dragging;
  }

  _initialize: boolean = true;
  _update: boolean = false;

  ngAfterContentChecked(): void {
    // When createEmbeddedView are made in ngAfterViewInit 
    // we get a ExpressionChangedAfterItHasBeenCheckedError.
    // So we made them here, but we add this initialization condition as recursion prevention.
    if (!this.containerRef 
      || (!this._initialize || (this._initialize = false))
      && (!this._update || (this._update = false))) {
      return;
    }

    console.log('[EditableLayout] ngAfterContentChecked component:', this.component);


    // Clear container.
    for (let i = -1 + this.containerRef.length; i >= 0; i--) {
      this.containerRef.remove(i);
    }

    // Insert components.
    this.component
      .components
      .filter((child: Bindable) => child.componentType !== 'InsertableComponent')
      .forEach((child: Bindable) => {
        const callbacks: Function[] = [];
        this.insertComponentImpl(child, this.containerRef);
      });

  }

  private insertComponentImpl(component: Bindable, containerRef: ViewContainerRef | null): any[] | null {
    
    // Layout components are created from factory.
    const componentType = this.getComponentType(component);
    if (null !== componentType) {
      
      // Create layout components.
      const componentRef = this.componentFactoryResolver
        .resolveComponentFactory(componentType)
        .create(
            this.injector,
            component
              .components
              .map((child: Bindable) => this.insertComponentImpl(child, null)));
      
      // Bind layout components.
      this.setupComponentInstance(component, componentRef);

      
      if (null !== containerRef) {
        // Finally add to container.
        containerRef.insert(componentRef.hostView);
      }
      return (componentRef.hostView as any).rootNodes;
    }

    // Content component are created from their templates.
    const templateRef = this.getTemplate(component);
    if (null !== templateRef) {
      const embeddedViewRef = templateRef.createEmbeddedView({ $implicit: component });
      
      
      if (null !== containerRef) {
        // Finally add to container.
        containerRef.insert(embeddedViewRef);
      } else {
        // Should be attached when it is not inserted directly but projected on a component create.  
        this.appRef.attachView(embeddedViewRef);
      }
      return embeddedViewRef.rootNodes;
    }

    return null;
  }


  private setupComponentInstance(component: Bindable, componentRef: ComponentRef<any>) {
    const col = this.asidePanel ? 12 : 6;
    switch(component.componentType) {
      case 'GridLayout':
      case 'GridRow':
        break;
      case 'GridColumn':          
        componentRef.instance.addClasses = 'tf-bold';
        componentRef.instance.cols = <TFGridColConfig> { 'default': col, 'sm': col, 'md': col, 'lg': col, 'xl': col };
        componentRef.instance.setDefaultColsClasses(componentRef.instance.cols); 
        componentRef.changeDetectorRef.detectChanges();
        break;
      case 'Field':
        componentRef.instance.title = 'unnamed field';
        componentRef.instance.addClasses = 'tf-bold';
        componentRef.instance.cols = <TFGridColConfig> { 'default': col, 'sm': col, 'md': col, 'lg': col, 'xl': col };
        componentRef.instance.setDefaultColsClasses(componentRef.instance.cols);
        componentRef.changeDetectorRef.detectChanges();
        break;
    }     
  }

  
  private getTemplate(component: Bindable): TemplateRef<any> | null {
    console.log('component: ', component);
    if ('Insertion' === component.componentType) {
      component = component.insertion;
    }
    const templateRefIndex = this.component//this.appComponent.currentView.components[1]
      .components
      .filter((child: Bindable) => child.componentType === 'InsertableComponent')
      .map((child: Bindable) => child.components[0].id)
      .indexOf(component.id);
    return this.templateRefs.get(templateRefIndex) || null;
  }

  private getComponentType(component: Bindable): Type<any> | null {
    switch(component.componentType) {
      case 'GridLayout':
        return TFGridComponent;
      case 'GridRow':
        return TFGridRowComponent;
      case 'GridColumn':
        return TFGridColumnComponent;
      case 'Field':
        return TFFieldComponent;
      default:
        return null;
    }
  }

  insertComponent(component: Bindable): void {
    let columnType;
    switch (component.componentType) {
      case 'Dropdown':
      case 'Chosen':
      case 'DatePicker':
      case 'Input':
      case 'ExtendedInput':
        columnType = 'Field';
        break;
      default:
        columnType = 'GridColumn';
    }

    let insertion: any = {
      componentType: 'Insertion',
      bindings: { 
        bindingsType: 'Bindings', 
        references: {
          'insertion': {
            referenceType: 'ByIdReference',
            id: component.id,
            parent: null
          }
        } 
      },
      components: []
    };
  

    switch (this.component.id) {
      case 'pageContent':
        insertion = {
          componentType: 'GridLayout',
          bindings: { bindingsType: 'Bindings', references: {} },
          components: [
            {
              componentType: 'GridRow',
              bindings: { bindingsType: 'Bindings', references: {} },
              components: [
                {
                  componentType: columnType,
                  bindings: { bindingsType: 'Bindings', references: {} },
                  components: [
                    insertion
                  ]
                }
              ]
            }
          ]
        };
        break;
      case 'editableAsidePanel':
      case 'editableCommandsPanel':
    }


    this.component.components.push(this.referenceService.toInstance(insertion, this.component));
    this._update = true;
    this.changeDetectorRef.markForCheck();
  }

  getBoundingRect() {
    const asidePanel = this.elementRef.nativeElement.closest('#tf-aside');
    if (asidePanel) {
      return asidePanel.getBoundingClientRect();
    }
    const commandsPanel = this.elementRef.nativeElement.closest('#tf-titlebar-container');//.closest('#tf-titlebar-commands');
    if (commandsPanel) {
      return commandsPanel.getBoundingClientRect();
    }
    const pageContent = this.elementRef.nativeElement.closest('#tf-page-content');
    if (pageContent) {
      return pageContent.getBoundingClientRect();
    }
    return null;
  }

  get asidePanel(): boolean {
    return 'editableAsidePanel' === this.component.id;
  }

  get wrapperStyle() {
    return {
      'margin-right': this.asidePanel ? '1em' : '0'
    };
  }
}
