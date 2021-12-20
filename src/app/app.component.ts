import { AfterViewChecked, AfterViewInit, ApplicationRef, ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentFactoryResolver, ComponentRef, ElementRef, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { TFNavigationItem, TFShellOptions, TFUserInfo } from '@talentia/components/shell';
import { concat, observable, Observable } from 'rxjs';
import { AsidePanelComponent } from './aside-panel/aside-panel.component';
import { CommandsPanelComponent } from './commands-panel/commands-panel.component';
import { PageContentComponent } from './page-content/page-content.component';
import { ContextService } from './service/ContextService';
import { MenuService } from './service/MenuService';
import { AppService } from './service/AppService';
import { toArray } from 'rxjs/operators';
import { findByComponentType } from './tac/util';
import { TFLocalizationService, TFMessageService } from '@talentia/components';
import { TransactionService, WritableTransactionService } from './service/TransactionService';
import { ReferenceService } from './service/ReferenceService';
import { ActionService } from './service/ActionService';
import { MutationService } from './service/MutationService';
import { AjaxService } from './service/AjaxService';
import { EventService } from './service/EventService';
import { ToolsService } from './service/ToolsService';

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


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [
    {
      provide: TFLocalizationService,
      useFactory: localizationServiceFactory
    },
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
  navigationHistory: TFNavigationItem[] = [];
  private _menu!: Observable<any>;
  private _options!: TFShellOptions;
  
  @ViewChild(CommandsPanelComponent)
  commandsPanel!: CommandsPanelComponent;
  @ViewChild(AsidePanelComponent)
  asidePanel!: AsidePanelComponent;
  @ViewChild(PageContentComponent)
  pageContent!: PageContentComponent;

  currentView: any;

  constructor(
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
    view = this.referenceService.toInstance(view);
    this.currentView = view;
    console.debug('[APP] showView(view:', view, ')');  
    // Remove previous view error messages.
    this.messageService.clearMessages();
    // Slit view into three view-container.
    const commandsPanel = findByComponentType(view, 'CommandsPanel');
    const asidePanel = findByComponentType(view, 'AsidePanel');
    return concat(
        this.asidePanel.open({ name: 'asidePanel', components: !asidePanel ? [] : [asidePanel] }),
        this.commandsPanel.open({ name: 'commandsPanel', components: !commandsPanel ? [] : [commandsPanel] }),
        this.pageContent.open({ name: 'pageContent', components: view.components }))
      .pipe(toArray());
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

  createNavigationHistory(view: any): TFNavigationItem[] {
    if (!!view.legacy) {
      return [
        <TFNavigationItem> {
          title: 'Chargement...'
        }
      ];
    }
    const component = findByComponentType(view, 'Breadcrumb');
    return [
      <TFNavigationItem> {
        title: 'Acceuil'
      }
    ].concat(component     
      .items
      .map((data: any) => {
        return <TFNavigationItem> {
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

  designMode: boolean = false;

  
  toggleDesignMode() {
    this.designMode = true;
  }

}

export interface ObservableFactory<T> {
  (): Observable<T>;
}



function sequencial<T>(...factories: ObservableFactory<T>[])  {
  return new Observable<T>(subscriber => {
    console.log('SUBSCRIBE');
    (function f(i: number) {
      console.log('f i:', i);
      if (i >= factories.length) {
        subscriber.complete();
        return;
      }
      factories[i]()
        .subscribe({
          next(value: T) {
       //     observable.next(value);
       console.log('next value:', value);
            f(i + 1);
          }
        });
    })(0);
  });
}


