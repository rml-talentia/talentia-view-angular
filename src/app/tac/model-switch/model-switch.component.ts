import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../base/component-base.component';

@Component({
  selector: 'tac-model-switch',
  templateUrl: './model-switch.component.html',
  styleUrls: ['./model-switch.component.css']
})
export class ModelSwitchComponent extends BaseComponent {

  get model() {
    return this.component.components[0];
  }
  
  get icon() {
    return this.model.icon.text;
  }

  get label() {
    return this.model.label.text;
  }
  
}
