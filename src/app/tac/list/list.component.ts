import { AfterViewChecked, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChildren, ElementRef, EmbeddedViewRef, Injector, Input, NgZone, OnInit, Optional, QueryList, TemplateRef, ViewChild, ViewChildren, ViewContainerRef, ViewRef } from '@angular/core';
import { asyncScheduler, BehaviorSubject, EMPTY, forkJoin, Observable, of, ReplaySubject, Subject, Subscription } from 'rxjs';
import { debounceTime, first, last, map, sample, tap, throttleTime } from 'rxjs/operators';
import { ChosenService } from 'src/app/service/ChosenService';
import { Component as Bindable } from "src/app/service/types";
import { DropdownComponent } from '../dropdown/dropdown.component';
import { ItemTypeDirective } from '../itemType/itemType.directive';




@Component({
  selector: 'tac-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, AfterViewInit, AfterViewChecked {

  @Input()
  component!: Bindable;
  @ContentChildren(TemplateRef)
  templateRefs!: QueryList<TemplateRef<any>>;
  @ViewChildren('itemContainer', { read: ViewContainerRef })
  itemContentRefs!: QueryList<ViewContainerRef>;
  @ViewChild('wrapper', { read: ElementRef })
  wrapper!: ElementRef;
  @ViewChild('viewport', { read: ElementRef })
  viewport!: ElementRef;
  @ViewChild('list', { read: ElementRef })
  list!: ElementRef;
  @ViewChild('listContent', { read: ViewContainerRef })
  listContent!: ViewContainerRef;
  @ViewChild('item', { read: TemplateRef })
  itemTemplateRef!: TemplateRef<any>;
  @ViewChild('scrollbar', { read: ElementRef })
  scrollbar!: ElementRef;
  @ViewChild('scrollbarContent', { read: ElementRef })
  scrollbarContent!: ElementRef;


  pageSize: number = 30;
  pages: Pages = {};
  view: View = { items: [], top: 0, range: { first: -1, last: -1 } };
  viewSize: number = 10;

  _itemCount: number | null = null;
  _averageItemHeight: number | null = null;
  _listHeight: number | null = null;
  _listMargins: Margins | null = null;
  _scrollRatio: number | null = null;
  _itemTopReseting: number | null = null;
  _refreshSubject: Subject<RefreshOptions>;


  constructor(
    @Optional()
    private dropdown: DropdownComponent,
    private changeDetectorRef: ChangeDetectorRef,
    private chosenService: ChosenService) {
    if (null !== dropdown) {
      dropdown.opened.subscribe({
        next: (opened: boolean) => {
          this.refreshView(true);
          
        }
      })
    }
    (this._refreshSubject = new Subject<any>())
      // .pipe(throttleTime(1000, asyncScheduler, { trailing: true } ))
      .pipe(debounceTime(1000))
      .subscribe({
        next: options => {
          console.log('[ListComponent] trigger refresh time:', new Date().getTime());
          this.glasspanel = null;
          this.changeDetectorRef.markForCheck();
          this.refreshView(options.initialize);
        }
      });
  }


  ngOnInit(): void {
    this.view = { items: [], top: 0, range: { first: -1, last: -1 } };
    for (let i = 0; i < this.viewSize; i++) {
      this.view.items.push({
        top: null,
        bottom: null,
        height: null,
        data: null,
        embeddedViewRef: null
      });
    }
  }  

  ngAfterViewInit(): void {
  }


  ngAfterViewChecked(): void {
    if (this._initialize) {
      this._initialize = false;
    }
  }

  _initialize: boolean = false;

  private getPage(index: number): Observable<Page> {
    const modelIndex = this.getModelIndex();
    if (!(modelIndex in this.pages)) {
      this.pages[modelIndex] = {};
    }
    let subject = this.pages[modelIndex][index];
    if (!!subject) {
      return subject;
    }
    this.pages[modelIndex][index] = subject = new ReplaySubject<Page>(1);

    this.glasspanel = {
      icon: 'fas fa-spinner fa-spin',
      message: `Chargement de la page ${index + 1}...`
    };
    this.changeDetectorRef.markForCheck();


    this
      .chosenService
      .getPage({
        page: index,
        pageSize: this.pageSize,
        search: this.search,
        model: this.component
      })
      .subscribe((response: any) => {
        this.itemCount = response.total;
        const page: Page = {
          index: index,
          range: {
            first: index * this.pageSize,
            last: index * this.pageSize + response.rows.length - 1
          },
          items: response.rows.map((row: any) => (<Item> {
            top: null,
            bottom: null,
            height: null,
            data: row
          }))
        };
        subject.next(page);
        subject.complete();
      });
    return subject;
  }

  private getModelIndex(): number {
    if (this.component.parent?.model) {
      // not extendedInput
      return 0;
    }
    return this.component.parent?.components.indexOf(this.component);
  }

  private getPages(indices: number[]): Observable<Page[]> {
    return forkJoin(indices.map(index => this.getPage(index)));
  }

  private getVisiblePageIndices(): number[] {
    const first = this.getPageIndex(this.view.range.first);
    const last = this.getPageIndex(Math.min(this.view.range.first + this.pageSize, this.itemCount));
    const indices: number[] = [];    
    if (first === last) {
      indices.push(first);
    } else {
      for (let page = first; page <= last; page++) {
        indices.push(page);
      }
    }
    console.log('indices:', indices);
    return indices;
  }

  private refreshView(intialize?: boolean) {
    // First refresh
    if (intialize) {
      this._initialize = true;
      this.pages = {};
      for (let i = this.view.items.length - 1; i >= 0; i--) {
        let item = this.view.items[i];
        if (!item.embeddedViewRef) {
          continue;
        }
        //  const viewContainerRef = this.itemContentRefs.get(i);
        //  viewContainerRef?.remove(0);
        item.embeddedViewRef.destroy();
        item.embeddedViewRef = null;
      }
      this
        .getPage(0)
        .subscribe({
          next: page => {
            this.refreshView();
            this.changeDetectorRef.markForCheck();
          }
        });
      
      return;
    }

    // Fix view range first item index.
    this.view.range.first = this.getFirstVisibleItemIndex();   
          
    // Their is no items.
    // TODO : show a "no data" message.
    if (0 > this.view.range.first) {
      return;
    }

    // this.view.items.forEach(item => {
    //   item.data = null;
    //   if (null !== item.embeddedViewRef) {
    //     item.embeddedViewRef.context.ready = false;
    //     item.embeddedViewRef.detectChanges();
    //   }
    // });

    this
      .getPages(this.getVisiblePageIndices())
      .subscribe({
        next: pages => {
          this._pages = pages;
          this.renderView(pages);
          this.glasspanel = null;
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  _pages: Page[] = [];



  private renderView(pages: Page[]) {

    // Fix view range first item index.
    this.view.range.first = this.getFirstVisibleItemIndex();   
       
    // Fix view top location.
    this.view.top = this.getItemTop(this.view.range.first);
    
    // Get item content template.
    const templateRef = this.templateRefs.get(this.getModelIndex()) || null;
    if (null === templateRef) {
      throw new Error();
    }


    // Render visible items.
    let viewIndex = 0;
    pages
      .forEach(page => {
        for (let i = this.view.range.first + viewIndex; i <= page.range.last && viewIndex < this.view.items.length; i++) {
          let pageItem = page.items[i - page.range.first];
          let viewItem = this.view.items[viewIndex];

          viewItem.data = pageItem.data;
          

          if (null === viewItem.embeddedViewRef) {
            viewItem.embeddedViewRef = this.itemContentRefs.get(viewIndex)?.createEmbeddedView(templateRef, { $implicit: pageItem.data }) || null;
            //viewItem.embeddedViewRef?.detach();
            //viewItem.embeddedViewRef?.detectChanges();
          } else {
            viewItem.embeddedViewRef.context.$implicit = pageItem.data; 
            //viewItem.embeddedViewRef.detectChanges();
          }

          // Fix view range last item index.
          this.view.range.last = viewIndex;

          viewIndex++;
        }
      });


    for (; viewIndex < this.view.items.length; viewIndex++) {
      let viewItem = this.view.items[viewIndex];
      viewItem.data = null;
      if (null === viewItem.embeddedViewRef) {
        viewItem.embeddedViewRef = this.itemContentRefs.get(viewIndex)?.createEmbeddedView(templateRef, { $implicit: null }) || null;
        //viewItem.embeddedViewRef?.detach();
        viewItem.embeddedViewRef?.detectChanges();
      } else {
        viewItem.embeddedViewRef.context.$implicit = null; 
        viewItem.embeddedViewRef.detectChanges();
      }
    }
      
  }

  private getPageIndex(itemIndex: number) {
    return 0 > itemIndex  ? -1 : Math.floor(itemIndex / this.pageSize);
  }


  private getItem(index: number): Item {
    const page = Math.floor(index / this.pageSize);
    
    throw new Error('');
  }

  private getFirstVisibleItemIndex(): number {
    const scrollTop = this.scrollTop;
    const itemCount = this.itemCount;
    for (var itemIndex = 0; itemIndex < itemCount; itemIndex++) {
      if (this.getItemBottom(itemIndex) >= scrollTop) {
        return itemIndex;
      }
    }
    return -1;
  }


  private getItemBottom(index: number): number {
    return this.getItemTop(index) + this.getItemHeight(index);
  }

  private getItemTop(index: number): number {
    return this.averageItemHeight * index;
    // var item = this.getItem(index);
    // if (null !== item.top) {
    //   if (!this.isTopReseting(index)) {
    //     return item.top;
    //   }
    //   item.top = null;
    //   this.resetItemTops(index);			
    // }
    // item.top = (1 > index ? 0 : this.getItemBottom(-1 + index));
    // return item.top;
  }

  private getItemHeight(index: number) {
    return this.averageItemHeight;
    // var item = this.getItem(index);
    // return null !== item.height ? item.height : (item.height = this.getAverageItemHeight());
  }

  private isTopReseting(index: number): boolean {
    return null !== this._itemTopReseting && this._itemTopReseting < index;
  }

  private resetItemTops(index: number) {
    this._itemTopReseting = index;
  }
  
  get wrapperStyle() {
    return {};
  }

  get glassWrapperStyle() {
    return {};
  }

  get viewportStyle() {
    return {};
  }

  get scrollbarStyle() {
    return {
      'width': this.getScrollbarWidth() + 'px'      
    };
  }

  get scrollbarContentStyle() {
    return {
      'height': this.listHeight + 'px'
    };
  }

  get listStyle() {
    return {
      'height': this.listHeight + 'px',
      'transform': `translate(0, ${this.view.top}px)`,
      'padding': '0'
    };
  }
  
  get itemCount(): number {
    return null !== this._itemCount ? this._itemCount : (this._itemCount = -1);
  }
  
  set itemCount(itemCount) {
    this._itemCount = itemCount;
    this._listHeight = null;
  }

  get scrollTop() {
    return this.scrollbar.nativeElement.scrollTop;
  }

  set scrollTop(scrollTop) {
    const maxScrollTop = this.list.nativeElement.offsetHeight - this.viewport.nativeElement.offsetHeight;
    const newScrollRatio = Math.max(0, Math.min(1, scrollTop / maxScrollTop));
    this.setScrollRatio(newScrollRatio);
  }

  get scrollBottom() {
    return this.scrollTop + this.scrollbar.nativeElement.offsetHeight;
  }

  private resetAverageItemHeight() {
    this._averageItemHeight = null;
    this.resetListHeight();
  }

  private resetListHeight() {
    this._listHeight = null;
  }

  get averageItemHeight() {
    return null !== this._averageItemHeight ? this._averageItemHeight : (this._averageItemHeight = this.getAverageItemHeight());
  }

  get listHeight(): number  {
    return null !== this._listHeight ? this._listHeight : (this._listHeight = this.getListHeight());
  }

  private getListHeight(): number {
    return this.itemCount * this.averageItemHeight;
  }

  private getAverageItemHeight(): number {
    return 39;
  }

  private getScrollbarWidth(): number {
    return 7;
  }

  private getListMargins(): Margins {
    // const rect = this.list.nativeElement.getBoundingClientRect();
    // return { 
    //   top: (rect.height - this.list.nativeElement.offsetHeight) / 2, 
    //   bottom: (rect.height - this.list.nativeElement.offsetHeight) / 2 };
    // TODO : compute it.
    return {
      top: 6.5,
      bottom: 6.5 };
  }

  private getScrollRatio(): number {
    return null !== this._scrollRatio ? this._scrollRatio : (this._scrollRatio = 0);
  }

  private setScrollRatio(scrollRatio: number) {
    this._scrollRatio = scrollRatio;
    let maxScrollTop = this.scrollbarContent.nativeElement.offsetHeight - this.scrollbar.nativeElement.offsetHeight;
  //  let maxScrollTop = this.list.nativeElement.offsetHeight - this.viewport.nativeElement.offsetHeight;
    //let scrollbarMaxScrollTop = this.scrollbarContent.nativeElement.get(0).offsetHeight - this.viewport.nativeElement.offsetHeight;
    // quand on va a la fin et que on a deja charger la derniere page
    // mais que on en charge une autre au milieu ????
    this.viewport.nativeElement.scrollTop = maxScrollTop * scrollRatio;
  }

  private _refreshingScrollbar: boolean = false;

  private refreshScrollbar() {
    const scrollRatio = this.getScrollRatio();
    // TODO : update height
    const scrollbarMaxScrollTop = this.scrollbarContent.nativeElement.offsetHeight - this.scrollbar.nativeElement.offsetHeight;
    this._refreshingScrollbar = true;
		this.scrollbar.nativeElement.scrollTop = scrollbarMaxScrollTop * scrollRatio;
    this._refreshingScrollbar = false;
  }

  scrollbarScrollHandler(event: Event) {
    if (this._refreshingScrollbar) {
      return;
    }
    let maxScrollTop = this.scrollbarContent.nativeElement.offsetHeight - this.scrollbar.nativeElement.offsetHeight;
    let ratio = this.scrollbar.nativeElement.scrollTop / maxScrollTop;
    this.setScrollRatio(ratio);
  }

  viewportWheelHandler(event: WheelEvent) {
    event.preventDefault();
    let delta = 0 < event.deltaY ? 100 : -100;
    //let maxScrollTop = this.list.nativeElement.offsetHeight - this.viewport.nativeElement.offsetHeight;
    let maxScrollTop = this.scrollbarContent.nativeElement.offsetHeight - this.scrollbar.nativeElement.offsetHeight;
    let oldScrollRatio = this.getScrollRatio();
    let newScrollRatio = Math.max(0, Math.min(1, oldScrollRatio + delta / maxScrollTop));
    this.setScrollRatio(newScrollRatio);
    this.refreshScrollbar();
  }

  viewportScrollHandler(event: Event) {
   // this.refreshView();
    event.preventDefault();


    this.renderView(this._pages);

     this.refresh({ initialize: false });//.subscribe();
  }

  _search: string | null = null;  

  private refresh(options: RefreshOptions) {
   // options = options ? options : { initialize: false };
   // this.refreshView(options.initialize);

    this._refreshSubject.next(options);
  }

  get search(): string {
    return null !== this._search ? this._search : (this._search = '');
  }

  _searchSubscription: Subscription | null = null;

  set search(search: string) {
    this._search = search;

    this.glasspanel = {
      icon: 'fal fa-keyboard',
      message: 'Saisie en cours...'
    };
    this.changeDetectorRef.markForCheck();

    // fas fa-spinner fa-spin

    this.refresh({ initialize: true });

    // if (null === this._searchSubscription) {
    //   this._searchSubscription = this
    //   .refresh()
    //   .pipe(first())
    //   .subscribe({
    //     next: () => {
    //       console.log('[ListComponent] next refresh time:', new Date().getTime());
    //       this.glasspanel = null;
    //     }
    //   });
    // }
  }


  glasspanel: GlassPanel | null = null;


}

interface RefreshOptions {
  initialize: boolean;
}

interface GlassPanel {

  icon: string;
  message: string;
}

interface Item {

  data: any;
  height: number | null;
  top: number | null;
  bottom: number | null;
  embeddedViewRef: EmbeddedViewRef<any> | null;

}

interface Page {

  items: Item[];
  index: number;
  range: Range;
}

type Pages = {
  // By model
  [index: number]: {
    // By page index 
    [index: number]: Subject<Page>
  } 
};

interface Margins {
  top: number;
  bottom: number;
}


interface View {

  top: number;
  items: Item[];
  range: Range;

}

interface Range {
  first: number;
  last: number;
}