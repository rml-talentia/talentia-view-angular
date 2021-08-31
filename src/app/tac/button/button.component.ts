import { Component, Input, OnInit } from '@angular/core';
import { TFEvent } from '@talentia/components';

@Component({
  selector: 'tac-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css']
})
export class ButtonComponent implements OnInit {

  @Input()
  data!: any;

  constructor() { }

  ngOnInit(): void {
  }

  get name() {
    return this.data.action.name;
  }

  get icon() {
    return this.data.action.icon;
  }

  get text() {
    return !this.data.action.title ? '' : this.data.action.title.text;
  }

  onSelected(event: TFEvent) {
    console.log(event);
  }

}
