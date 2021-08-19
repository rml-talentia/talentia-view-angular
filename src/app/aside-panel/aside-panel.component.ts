import { Component } from "@angular/core";
import { DataService } from "../service/DataService";
import { ViewComponent, ViewService } from "../view/view.component";


@Component({
  selector: 'app-aside-panel',
  templateUrl: './aside-panel.component.html',
  styleUrls: ['./aside-panel.component.css'],
  providers: [
    ViewService,
    DataService
  ]
})
export class AsidePanelComponent extends ViewComponent {
}

