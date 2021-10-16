import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TFMessageService, TFMessageType } from '@talentia/components';
import { DataService } from 'src/app/service/DataService';
import { FormService } from 'src/app/service/FormService';

@Component({
  selector: 'tac-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.css']
})
export class TransactionComponent implements OnInit, OnDestroy, AfterViewInit {

  /**
   * 
   * Utility component.
   * It is not intented to really manage anything about the transaction.
   * As quirk workaround, because of form template driven pattern we use it as child of form to register formGroup.
   * It is used to register form data too.
   */
  @Input()
  form!: FormGroup;
  @Input()
  component!: any; // It is the form component.
  data: any; // It is the form data.
  name!: string; // It is the form name. 

  constructor(
    private messageService: TFMessageService,
    private formService: FormService,
    private dataService: DataService
  ) { }


  ngOnInit(): void {

    // Register form to data service like any other components.
    this.name = this.component.name;
    this.data = Object.assign({}, this.component.data); // Clone form data to keep original values.
    this.dataService.register(this);
  

    // Register form's FormGroup.
    this.formService.register({
      data: this.component,
      group: this.form
    });

  }

  ngOnDestroy(): void {
    this.dataService.unregister(this.component);  
    this.formService.unregister({
      data: this.component,
      group: this.form
    });
  }

  ngAfterViewInit(): void {
    // Render server side validation errors.
    this.component.errors.forEach((error: any) => {
      this.messageService.alert(error.text, TFMessageType.error);
    });
  }


}
