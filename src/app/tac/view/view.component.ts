import { AfterContentInit, Component, ContentChildren, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'tac-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit, AfterContentInit {

  @ContentChildren(NgForm)
  formElements!: QueryList<NgForm>;

  constructor() { }
  
  ngAfterContentInit(): void {
   console.log('[tac-view] formElements:', this.formElements);
  }

  ngOnInit(): void {
  }

}
