import { AfterViewChecked, AfterViewInit, ApplicationRef, ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentFactoryResolver, ComponentRef, ElementRef, forwardRef, Inject, InjectionToken, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { TFShellOptions, TFUserInfo } from '@talentia/components/shell';
import { concat, observable, Observable } from 'rxjs';
import { AsidePanelComponent } from './aside-panel/aside-panel.component';
import { CommandsPanelComponent } from './commands-panel/commands-panel.component';
import { PageContentComponent } from './page-content/page-content.component';
import { ContextService } from './service/ContextService';
import { MenuService } from './service/MenuService';
import { AppService } from './service/AppService';
import { toArray } from 'rxjs/operators';
import { findByComponentType } from './tac/util';
import { TFLocalizationService, TFMessageService, TFTreeViewComponent } from '@talentia/components';
import { TransactionService, WritableTransactionService } from './service/TransactionService';
import { ReferenceService } from './service/ReferenceService';
import { ActionService } from './service/ActionService';
import { MutationService } from './service/MutationService';
import { AjaxService } from './service/AjaxService';
import { EventService } from './service/EventService';
import { ToolsService } from './service/ToolsService';
import { Bindable as Bindable } from './service/types';
import { DOCUMENT } from '@angular/common';
import { ViewEditorToolsComponent } from './view-editor-tools/view-editor-tools.component';

export function localizationServiceFactory() {
  const localizationService: TFLocalizationService = new TFLocalizationService();

  localizationService.culture = 'fr-FR';
  localizationService.dateFormat = 'dd/mm/yyyy';
  localizationService.dateSeparator = '/';
  localizationService.decimalSeparator = ',';
  localizationService.groupSeparator = ' ';
  localizationService.numberDecimalPlaces = 3;
  localizationService.timeFormat = 'HH:mm:ss';
  localizationService.timeSeparator = ':'

  return localizationService;
}



//export declare const APP_COMPONENT_ACCESSOR: InjectionToken<AppComponent>;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [
    {
      provide: TFLocalizationService,
      useFactory: localizationServiceFactory
    },
    // {
    //   provide: AppComponent,
    //   multi: false,
    //   useExisting: forwardRef(() => AppComponent)
    // },
    AppService,
    ReferenceService,
    MutationService,
    ActionService,
    AjaxService,
    EventService,
    ToolsService
  ]
})
export class AppComponent implements OnInit {

  pageLoading: boolean = false;
  showTitlebar: boolean = true;
  userInfo!: TFUserInfo;
  navigationHistory: any[] = [];
  private _menu!: Observable<any>;
  private _options!: TFShellOptions;
  
  @ViewChild(CommandsPanelComponent)
  commandsPanel!: CommandsPanelComponent;
  @ViewChild(AsidePanelComponent)
  asidePanel!: AsidePanelComponent;
  @ViewChild(PageContentComponent)
  pageContent!: PageContentComponent;

 
  currentView!: Bindable;
  viewAsData: any;

  constructor(
    public viewContainerRef: ViewContainerRef,
    private messageService: TFMessageService,
    //private applicationRef: ApplicationRef,
    private transactionService: TransactionService,
    private menuService: MenuService,
    private contextService: ContextService,
    private appService: AppService,
    private toolsService: ToolsService,
    private referenceService: ReferenceService) {
      this.appService.postConstruct(this);
    }

  ngOnInit(): void {
    console.log('[APP] ngOnInit()');
    window.TalentiaViewBridge._appComponent = this;   

    // userInfo doesn't support async.
    const self = this;
    this
      .contextService
      .getUserInfo()
      .subscribe({
        next(userInfo: TFUserInfo) {
          self.userInfo = userInfo;
        }
      });
  }


  openView(view: any): void {
    console.log('[APP] openView(', view, ')');
    
    const 
      self = this,
      iframe = this.pageContent.iframe.nativeElement;

    // Shell loading state.
    self.pageLoading = true;

    if (!!view.legacy) {
      this.navigationHistory = this.createNavigationHistory(view);
      this
        .clearView()
        .subscribe({
          next(componentRefs: ComponentRef<any>[]) {
            iframe.src = view.legacy.src;
          }
        });
      return;
    }

    
    
    this.hideLegacyView();
    this.navigationHistory = this.createNavigationHistory(view);
    //this.currentView = view;

    this.viewAsData = view;

    // Share view's transaction infos through other services and components.
    (this.transactionService as WritableTransactionService)
      .setView(view);

    this
      .showView(view)
      .subscribe({
        next(componentRefs: ComponentRef<any>[]) {
          console.log('[APP] views:', componentRefs);
        }
      });
    
  }

  showView(view: any): Observable<any> {

    if (this.designMode) {
      view = {
        componentType: 'View',
        bindings: { bindingsType: 'Bindings', references: {} },
        components: [
          view.components[0],
          {
            componentType: 'EditableLayout',
            id: 'pageContent',
            bindings: { bindingsType: 'Bindings', references: {} },
            components: []
              .concat(this.toInsertableComponents(view.components[0].components) as any)
              .concat([
                {
                  componentType: 'GridLayout',
                  bindings: { bindingsType: 'Bindings', references: {} },
                  components: [
                    {
                      componentType: 'GridRow',
                      bindings: { bindingsType: 'Bindings', references: {} },
                      components: [
                        {
                          componentType: 'GridColumn',
                          bindings: { 
                            bindingsType: 'Bindings', 
                            references: {
                              'size': {
                                referenceType: 'ValueReference',
                                parent: null,
                                value: {
                                  'small': 12,
                                  'medium': 12,
                                  'large': 12
                                }
                              }
                            } 
                          },
                          components: [
                            {
                              componentType: 'EditableLayoutPlaceholder',
                              bindings: { 
                                bindingsType: 'Bindings', 
                                references: {} 
                              },
                              components: []
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ] as any)
          },
          {
            componentType: 'EditableLayout',
            id: 'editableCommandsPanel',
            bindings: { bindingsType: 'Bindings', references: {} },
            components: this.toInsertableComponents(view.components[0].components)
          },
          {
            componentType: 'EditableLayout',
            id: 'editableAsidePanel',
            bindings: { bindingsType: 'Bindings', references: {} },
            components: this.toInsertableComponents(view.components[0].components)
          }
        ]
      };
    }


    view = this.referenceService.toInstance(view);
    this.currentView = view;

    if (!!this.viewEditorTools) {
      this.viewEditorTools.inspector = null;
    }

    console.debug('[APP] showView(view:', view, ')');  
    // Remove previous view error messages.
    this.messageService.clearMessages();
    // Slit view into three view-container.
    const commandsPanel = !view.components || !view.components.length ? null : this.designMode ? view.components[2] : findByComponentType(view.components[1], 'CommandsPanel');
    const asidePanel = !view.components || !view.components.length ? null : this.designMode ? view.components[3] : findByComponentType(view.components[1], 'AsidePanel');
    const pageContent = !view.components || !view.components.length ? [] : [view.components[1]];
    return concat(
        this.asidePanel.open({ name: 'asidePanel', components: !asidePanel ? [] : [asidePanel] }),
        this.commandsPanel.open({ name: 'commandsPanel', components: !commandsPanel ? [] : [commandsPanel] }),
        this.pageContent.open({ name: 'pageContent', components: pageContent }))
      .pipe(toArray());
  }

  toInsertableComponents(components: any[]): any[] {
      const insertableComponents: any[] = [];


      function recurse(component: any) {
        switch (component.componentType) {
          case 'Form':
            break;
          default:
            insertableComponents.push({
              componentType: 'InsertableComponent',
              bindings: { bindingsType: 'Bindings', references: {} },
              components: [component]
            });
        }
        component.components.forEach(recurse);
      }
      components.forEach(recurse);


      return insertableComponents;
  }

  clearView(): Observable<any> {
    return this.showView({ components: [], bindings: { references: {} } });
  }

  showLegacyView(): void {
    const 
      iframeWrapper = this.pageContent.iframeWrapper.nativeElement,
      contentWrapper = iframeWrapper.ownerDocument.querySelector('#tf-page-content-wrapper');
    if (contentWrapper !== iframeWrapper.parentElement) {
        contentWrapper.appendChild(iframeWrapper);
    }
    this.showTitlebar = false;
    // TODO : angularize
    iframeWrapper.style.setProperty('display', 'block');
    window.document.body.style.setProperty('overflow', 'hidden');

    this.pageLoading = false;
  }

  hideLegacyView(): void {
    this.showTitlebar = true;
    this.pageLoading = false;
    const 
      iframeWrapper = this.pageContent.iframeWrapper.nativeElement;  
    // TODO : angularize
    iframeWrapper.style.setProperty('display', 'none');
    window.document.body.style.removeProperty('overflow');
  }

  get menu(): Observable<any> {
    return !!this._menu ? this._menu : (this._menu = this.menuService.getMenu());
  }

  get options(): TFShellOptions {
    if (!!this._options) {
      return this._options;
    }
    this._options = new TFShellOptions();
    //this._options.menuSize = 'sm';
    this._options.menuWrap = true;
    this._options.showRefreshButton = false;
    //this._options.simplifiedShell = true;

    return this._options;
  }

  createNavigationHistory(view: any): any[] { // TFNavigationItem
    if (!!view.legacy) {
      return [
        {
          title: 'Chargement...'
        }
      ];
    }
    const component = findByComponentType(view, 'Breadcrumb');
    return [
      {
        title: 'Acceuil'
      }
    ].concat(component     
      .items
      .map((data: any) => {
        return {
          title: data.title.text,
          uri: data.url
        };
      }));
  }

  menuItemSelected(item: any) {
    console.log('[APP] menuItemSelected:', item);
    const 
      contextPath = this.contextService.getContextPath(),
      sessionId = this.contextService.getSessionId(),
      option = item.data.option;
    this
      .openView({
        legacy: {
          src: `${contextPath}/dashboardFunction.action?function=${option}&sessionId=${sessionId}`
        }
      })
    // this
    //   .menuService
    //   .openOption(this.view.iframe, item.data.option);
  }

  menuToggled(menuVisible: boolean) {
    console.log('[APP] menuToggled:', menuVisible);
    const iframeWrapper = this.pageContent.iframeWrapper.nativeElement;
    if (!menuVisible) {
      iframeWrapper.classList.add('menu-toggled');
    } else {
      iframeWrapper.classList.remove('menu-toggled');
    }
  } 


  //
  // View Editor 
  //

  @ViewChild(ViewEditorToolsComponent)
  viewEditorTools!: ViewEditorToolsComponent;

  designMode: boolean = false;

  toggleDesignMode() {
    this.designMode = !this.designMode;
    this
      .showView(this.viewAsData)
      .subscribe({
        next(componentRefs: ComponentRef<any>[]) {
          console.log('[APP] views:', componentRefs);
        }
      });
  }



  
}








// export interface ObservableFactory<T> {
//   (): Observable<T>;
// }

// function sequencial<T>(...factories: ObservableFactory<T>[])  {
//   return new Observable<T>(subscriber => {
//     console.log('SUBSCRIBE');
//     (function f(i: number) {
//       console.log('f i:', i);
//       if (i >= factories.length) {
//         subscriber.complete();
//         return;
//       }
//       factories[i]()
//         .subscribe({
//           next(value: T) {
//        //     observable.next(value);
//        console.log('next value:', value);
//             f(i + 1);
//           }
//         });
//     })(0);
//   });
// }


