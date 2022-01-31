import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-view-editor',
  templateUrl: './view-editor.component.html',
  styleUrls: ['./view-editor.component.css']
})
export class ViewEditorComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }


  mousedownHandler(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
  }



}
