import { Component, ContentChildren, ElementRef, Input, OnInit, QueryList, ViewChild } from '@angular/core';
import { ChosenService } from 'src/app/service/ChosenService';
import { Component as Bindable } from "src/app/service/types";




@Component({
  selector: 'tac-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

 // @QueryList

//  @ContentChildren()

  @Input()
  component!: Bindable;

  items: any[] = [];

  pages: Page[] = [];

  constructor(
    private chosenService: ChosenService) { }

  ngOnInit(): void {
    
    
   
    for (let i = 0; i < 100; i++) {
      this.items.push({
        code: 'CODE_' + i,
        shortLabel: 'Label ' + i,
        label: 'Full description' + i
      });
    }

    this
      .chosenService
      .getPage({
        page: 0,
        pageSize: 30,
        search: '',
        model: this.component
      })
      .subscribe({
        next: (response: any) => {

          console.log('response:', response);
          
          this.itemCount = response.total;

          this.items.splice(0, this.items.length);
          for (let i = 0; i < response.rows.length; i++) {
            let row = response.rows[i];
            this.items.push({
              code: row.fkOrigine,
              shortLabel: '',
              label: row.libOrigine
            });
          }

        }
      });

  }  

  @ViewChild('wrapper', { read: ElementRef })
  wrapper!: ElementRef;
  @ViewChild('viewport', { read: ElementRef })
  viewport!: ElementRef;
  @ViewChild('list', { read: ElementRef })
  list!: ElementRef;
  @ViewChild('scrollbar', { read: ElementRef })
  scrollbar!: ElementRef;
  @ViewChild('scrollbarContent', { read: ElementRef })
  scrollbarContent!: ElementRef;

  _itemCount: number | null = null;
  _averageItemHeight: number | null = null;
  _listHeight: number | null = null;
  _scrollRatio: number | null = null;
  
  get wrapperStyle() {
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
      'height': this.listHeight + 'px'
    };
  }
  
  get itemCount(): number {
    return null !== this._itemCount ? this._itemCount : (this._itemCount = 0);
  }
  
  set itemCount(itemCount) {
    this._itemCount = itemCount;
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
  
  private getScrollRatio(): number {
    return null !== this._scrollRatio ? this._scrollRatio : (this._scrollRatio = 0);
  }
  
  private setScrollRatio(scrollRatio: number) {
    this._scrollRatio = scrollRatio;
    let maxScrollTop = this.list.nativeElement.offsetHeight - this.viewport.nativeElement.offsetHeight;
    //let scrollbarMaxScrollTop = this.scrollbarContent.nativeElement.get(0).offsetHeight - this.viewport.nativeElement.offsetHeight;
    // quand on va a la fin et que on a deja charger la derniere page
    // mais que on en charge une autre au milieu ????
    this.viewport.nativeElement.scrollTop = maxScrollTop * scrollRatio;
  }

  scrollbarScrollHandler(event: Event) {
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
  }

  viewportScrollHandler(event: Event) {
    // TODO : renderItems ....
    // self._renderListItems();
    // self._renderScrollbar();
  }

}



interface Item {

  data: any;
  height: number | null;
  bottom: number | null;

}

interface Page {

  items: Item[];
}