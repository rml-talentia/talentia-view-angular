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

  @ViewChild('el_GridLayout', { read: TemplateRef, static: false })
  private el_GridLayout_TemplateRef!: TemplateRef<any>;
  @ViewChild('el_GridRow', { read: TemplateRef, static: false })
  private el_GridRow_TemplateRef!: TemplateRef<any>;
  @ViewChild('el_Field', { read: TemplateRef, static: false })
  private el_Field_TemplateRef!: TemplateRef<any>;

  @ViewChild('container', { read: ViewContainerRef, static: false })
  private containerRef!: ViewContainerRef;

  constructor(
    private appComponent: AppComponent,
    private referenceService: ReferenceService,
    private changeDetectorRef: ChangeDetectorRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private ngZone: NgZone,
    private injector: Injector) {
    super();
  }

  get dragging() {
    return !this.appComponent ? null : this.appComponent.dragging;
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
      switch(component.componentType) {
        case 'GridLayout':
        case 'GridRow':
          break;
        case 'GridColumn':          
          componentRef.instance.addClasses = 'tf-bold';
          componentRef.instance.cols = <TFGridColConfig> { 'default': 6, 'sm': 6, 'md': 6, 'lg': 6, 'xl': 6 };
          componentRef.instance.setDefaultColsClasses(componentRef.instance.cols); 
          componentRef.changeDetectorRef.detectChanges();
          break;
        case 'Field':
          componentRef.instance.title = 'unnamed field';
          componentRef.instance.addClasses = 'tf-bold';
          componentRef.instance.cols = <TFGridColConfig> { 'default': 6, 'sm': 6, 'md': 6, 'lg': 6, 'xl': 6 };
          componentRef.instance.setDefaultColsClasses(componentRef.instance.cols);
          componentRef.changeDetectorRef.detectChanges();
          break;
      }     

      if (null !== containerRef) {
        containerRef.insert(componentRef.hostView);
      }
      return (componentRef.hostView as any).rootNodes;
    }

    // Content component are created from their templates.
    const templateRef = this.getTemplate(component);
    if (null !== templateRef) {
      const embeddedViewRef = templateRef.createEmbeddedView({ $implicit: component });
      this.appRef.attachView(embeddedViewRef);
      return embeddedViewRef.rootNodes;
    }

    return null;
  }

  
  getTemplate(component: Bindable): TemplateRef<any> | null {
    if ('Insertion' === component.componentType) {
      component = component.insertion;
    }
    const templateRefIndex = this.component
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
      case 'Chosen':
      case 'Input':
      case 'ExtendedInput':
        columnType = 'Field';
        break;
      default:
        columnType = 'GridColumn';
    }

    this.component.components.push(this.referenceService.toInstance(
    {
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
                {
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
                }
              ]
            }
          ]
        }
      ]
    }
    , this.component));
    this._update = true;
    this.changeDetectorRef.markForCheck();
  }
}
