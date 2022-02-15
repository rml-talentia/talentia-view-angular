import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { TFNavigationItem } from '@talentia/components/lib/models/tf-navigation-item.model';


@Component({
  selector: 'tac-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbComponent implements OnInit {

  @Input()
  data: any;

  constructor() { }

  ngOnInit(): void {
  }
 
  _navigationHistory: any[] | null = null; // TFNavigationItem

  get navigationHistory() {
    if (!!this._navigationHistory) {
      return this._navigationHistory;
    }

    const home: any = {}; // TFNavigationItem
    home.title = 'Acceuil';

    return this._navigationHistory = [home]
      .concat(this
        .data
        .items
        .map((data: any) => {
          const item: any = {}; // TFNavigationItem
          item.title = data.title.text;
          item.uri = data.url;
          return item;
        }));
  }
}
