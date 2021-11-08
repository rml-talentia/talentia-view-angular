import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { TFNavigationItem } from '@talentia/components/shell';

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

  _navigationHistory: TFNavigationItem[] | null = null;

  get navigationHistory() {
    if (!!this._navigationHistory) {
      return this._navigationHistory;
    }

    const home = new TFNavigationItem();
    home.title = 'Acceuil';

    return this._navigationHistory = [home]
      .concat(this
        .data
        .items
        .map((data: any) => {
          const item = new TFNavigationItem();
          item.title = data.title.text;
          item.uri = data.url;
          return item;
        }));
  }
}
