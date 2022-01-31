import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  get wrapperStyle() {
    return {
      'display': 'block',
      //'position': 'absolute',
      'z-index': '1060'
    };
  }

  get dialogStyle() {
    return {
      'position': 'absolute',
      'margin': '0',
      'left': '100px',
      'top': '10px',
      'width': '560px',
      'height': '320px'
    };
  }


  get bodyStyle() {
    return {
      'position': 'absolute',
      'top': '50px',
      'bottom': '2px',
      'left': '0',
      'right': '0',
      'padding': '0'
    };
  }



}
