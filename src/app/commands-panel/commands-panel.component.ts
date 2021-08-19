import { Component, OnInit } from '@angular/core';
import { DataService } from '../service/DataService';
import { ViewComponent, ViewService } from '../view/view.component';

@Component({
  selector: 'app-commands-panel',
  templateUrl: './commands-panel.component.html',
  styleUrls: ['./commands-panel.component.css'],
  providers: [
    ViewService,
    DataService
  ]
})
export class CommandsPanelComponent extends ViewComponent {
}

