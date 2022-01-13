import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../base/component-base.component';

@Component({
  selector: 'tac-model-switch',
  templateUrl: './model-switch.component.html',
  styleUrls: ['./model-switch.component.css']
})
export class ModelSwitchComponent extends BaseComponent {

  get model() {
    return this.component.dropdown;
  }
  
  get icon() {
    return this.model.icon.text;
  }

  get label() {
    return this.model.label.text;
  }

  doClick(event: MouseEvent) {
    const index = this.component.components.indexOf(this.component.dropdown);
    console.log(this.component);
    console.log(index);
   // console.log(this.component.components[0]);
  //  console.log(this.component.components[1]);
   this.component.dropdown = this.component.components[0 !== index ? 0 : 1];
  }
  
}
