import { AfterViewChecked, AfterViewInit, ApplicationRef, ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentFactoryResolver, ComponentRef, ElementRef, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { TFNavigationItem, TFShellOptions, TFUserInfo } from '@talentia/components/shell';
import { concat, observable, Observable } from 'rxjs';
import { AsidePanelComponent } from './aside-panel/aside-panel.component';
import { CommandsPanelComponent } from './commands-panel/commands-panel.component';
import { PageContentComponent } from './page-content/page-content.component';
import { ContextService } from './service/ContextService';
import { MenuService } from './service/MenuService';
import { AppService } from './service/AppService';
import { TemplateService } from './service/TemplateService';
import { toArray } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [
    AppService,
    TemplateService
  ]
})
export class AppComponent implements OnInit, AfterViewInit, AfterViewChecked {


  @ViewChild(CommandsPanelComponent)
  commandsPanel!: CommandsPanelComponent;
  @ViewChild(AsidePanelComponent)
  asidePanel!: AsidePanelComponent;
  @ViewChild(PageContentComponent)
  pageContent!: PageContentComponent;

  showTitlebar: boolean = true;
  userInfo!: TFUserInfo;

  private _menu!: Observable<any>;
  get menu(): Observable<any> {
    return !!this._menu ? this._menu : (this._menu = this.menuService.getMenu());
  }

  private _options!: TFShellOptions;
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

  navigationHistory: TFNavigationItem[] = [];


  pageLoading: boolean = false;

  createNavigationHistory(view: any): TFNavigationItem[] {
    if (!!view.legacy) {
      return [
        <TFNavigationItem> {
          title: 'Chargement...'
        }
      ];
    }
    const component = findByComponentName(view, 'Breadcrumb');
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

  constructor(
    private applicationRef: ApplicationRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private changeDetectorRef: ChangeDetectorRef,
    private menuService: MenuService,
    private contextService: ContextService,
    private appService: AppService) {

      this.appService.initialize(this);
    }

    updateView: boolean = false;


  ngOnInit(): void {
    console.log('[APP] ngOnInit()');
    window.TalentiaViewBridge._appComponent = this;
  //  this.doRendering();

    const self = this;

    // userInfo doesn't support async.
    this
      .contextService
      .getUserInfo()
      .subscribe({
        next(userInfo: TFUserInfo) {
          self.userInfo = userInfo;
        }
      })


  }

  ngAfterViewInit(): void {
    console.log('[APP] ngAfterViewInit()');
   // console.log('this.viewRef: ', this.viewRef);
   // this.viewRef.nativeElement.doViewRendering();


   this.doRendering();
  }

  ngAfterViewChecked(): void {
  }

  openView(view: any): void {
    console.log('[APP] openView(', view, ')');
    const 
      self = this,
      iframe = this.pageContent.iframe.nativeElement;

    self.pageLoading = true;

    if (!!view.legacy) {
      this.navigationHistory = this.createNavigationHistory(view);
      concat(
        this.asidePanel.open({ data: [] }),
        this.commandsPanel.open({ data: [] }),
        this.pageContent.open({ data: [] })
        )
        .pipe(toArray())
        .subscribe({
          //complete() {
          next(componentRefs: ComponentRef<any>[]) {
            iframe.src = view.legacy.src;
          }
        });

      
      return;
    }

    //if (true) return;
    
    this.hideLegacyView();
    this.navigationHistory = this.createNavigationHistory(view);

    const commandsPanel = findByComponentName(view, 'CommandsPanel');
    const asidePanel = findByComponentName(view, 'AsidePanel');

    concat(
      this.asidePanel.open( { data: !asidePanel ? [] : [asidePanel] }),
      this.commandsPanel.open({ data: !commandsPanel ? [] : [commandsPanel] }),
      this.pageContent.open(view))
      .pipe(toArray())
      .subscribe({
        //complete() {
        next(componentRefs: ComponentRef<any>[]) {
        //  self.pageLoading = false;
        }
      })
    
  }

  showLegacyView(): void {
    const 
      iframeWrapper = this.pageContent.iframeWrapper.nativeElement,
      contentWrapper = iframeWrapper.ownerDocument.querySelector('#tf-page-content-wrapper');
    if (contentWrapper !== iframeWrapper.parentElement) {
        contentWrapper.appendChild(iframeWrapper);
    }
    this.showTitlebar = false;
    iframeWrapper.style.setProperty('display', 'block');
    window.document.body.style.setProperty('overflow', 'hidden');

    this.pageLoading = false;
  }

  hideLegacyView(): void {
    this.showTitlebar = true;
    this.pageLoading = false;
    const 
      iframeWrapper = this.pageContent.iframeWrapper.nativeElement;  
    iframeWrapper.style.setProperty('display', 'none');
    window.document.body.style.removeProperty('overflow');
  }

  doRendering(): void {
  
    if(true)return;

    // console.log('[APP] doRendering()');

    // // <ng-template #wrapper></ng-template>

    // if (!!this.oldViewRef) {
    //   console.log('[APP] doRendering() oldViewRef.destroy()');
    //   this.oldViewRef.destroy();
    // }
    // this.changeDetectorRef.detectChanges();  


    // this.wrapper.clear();
    // const factory = this.componentFactoryResolver.resolveComponentFactory(ViewComponent);
    // const componentRef = this.wrapper.createComponent(factory);
    // console.log('componentRef:', componentRef);

    // this.oldViewRef = componentRef;
    // componentRef.instance.view = this.currentView;

    // this.changeDetectorRef.detectChanges();  

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


function findByComponentName(view: any, componentName: string): any {
  return findInView(view, 
    (component: any, parent: any, index: Number, start: Boolean) => componentName === component.componentName ? component : undefined);
}

function findInView(view: any, finder: Function) {
  let value;
  visitView(view, (component: any, parent: any, index: Number, start: Boolean) => {
    return undefined === (value = finder(component, parent, index, start));
  });
  return value;
}

function visitView(view: any, visitor: Function) {
  const components = view
    .data
    .filter((component: any) => null !== component);
  for (let i = 0; i < components.length; i++) {
    let component = components[i];
    if (false === visit(component, visitor, null, i)) {
      return;
    }
  }
}

function visit(component: any, visitor: Function, parent?: any, index?: Number) {
  if (false === visitor(component, 
    'object' === typeof parent ? parent : null, 
    'number' === typeof index ? index : 0,
    true)) {
    return false;
  }
  for (let i = 0; i < component.components.length; i++) {
    if (false === visit(component.components[i], visitor, parent, index)) {
      return false;
    }
  }
  if (false === visitor(component, 
    'object' === typeof parent ? parent : null, 
    'number' === typeof index ? index : 0,
    false)) {
      return false;
    }
    return true;
}