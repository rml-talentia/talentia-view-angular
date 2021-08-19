import { AfterViewChecked, AfterViewInit, Component, ComponentRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TFCollapsePanelComponent, TFMessage, TFMessages, TFMessagesComponent, TFMessageService, TFMessageType } from '@talentia/components';

@Component({
  selector: 'tac-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
  inputs: [
    'data'
  ]
})
export class FormComponent implements OnInit, AfterViewChecked, AfterViewInit {

  @Input('data')
  data: any;

  @Input()
  formGroup!: FormGroup;

  // @ViewChild('messages')
  // messagesRef!: ComponentRef<TFMessagesComponent>;

  constructor(private messageService: TFMessageService) { 
    console.log('[FormComponent] constructor()');
  }
  ngAfterViewInit(): void {
    this.messageService.clearMessages();
    this.data.errors.forEach((error: any) => {
      this.messageService.alert(error.text, TFMessageType.error);
    });
  }

  ngOnInit(): void {
  }

  ngAfterViewChecked(): void {
  }
  

  doSubmit() {
    console.log('[FORM] doSubmit()');
   

    const data: { [field: string]: any; } = {};
    for (let field in this.formGroup.value) {
      let value = this.formGroup.value[field];
      if ('boolean' === typeof value) {
        value = value ? 'on' : 'off';
      }
      data[field] = value;
    }

    
    window.TalentiaViewBridge.submitObject(this.data.action, data);
  }

}