import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormService } from 'src/app/service/FormService';

@Component({
  selector: 'tac-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.css']
})
export class TransactionComponent implements OnInit, OnDestroy {

  /**
   * As quirk workaround, because of template driven pattern, we need to retrieve formGroup instance.
   * 
   * So, each form element contains a tac-transaction which register form in FormService. 
   */
  @Input()
  form!: FormGroup;
  @Input()
  formData!: any;


  constructor(
    private formService: FormService
  ) { }


  ngOnInit(): void {
    this.formService.register({
      data: this.formData,
      group: this.form
    });
  }

  ngOnDestroy(): void {  
    this.formService.unregister({
      data: this.formData,
      group: this.form
    });
  }

}
