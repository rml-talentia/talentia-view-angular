import {
  AfterViewInit,
  Component,
  ViewChild,
  ViewContainerRef,
  ChangeDetectorRef,
  ComponentRef,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  ElementRef,
} from '@angular/core';
import { Observable } from 'rxjs';
import { ViewService } from '../service/ViewService';
import { tap } from 'rxjs/operators';


@Component({
  selector: 'app-view-container',
  templateUrl: './view-container.component.html',
  styleUrls: ['./view-container.component.css']
})
export class ViewContainerComponent implements OnDestroy, AfterViewInit, OnChanges  {

  @ViewChild('iframe', { read: ElementRef })
  iframe!: ElementRef<any>;
  @ViewChild('iframeWrapper', { read: ElementRef })
  iframeWrapper!: ElementRef<any>;
  @ViewChild('container', {read: ViewContainerRef, static: true })
  container!: ViewContainerRef;
  componentRef!: ComponentRef<any>;
 
  constructor(
    public changeDetectorRef: ChangeDetectorRef,
    private viewService: ViewService) {}

  ngAfterViewInit() {
    window.TalentiaViewBridge._viewComponent = this;
  }

  ngOnDestroy(): void {
      this.componentRef.destroy();
  }

  doAction(data: any): void {
    console.log('[VIEW] doAction(data:', data, ')');
  }

  ngOnChanges(changes: SimpleChanges): void {
    // if (null === changes.view.currentValue) {
    //  // this.close();
    // } 
  }

  open(view: any): Observable<any> {

    if (!!this.componentRef) {
      this.componentRef.destroy();
    }


    return this.viewService
      .createAndCompileTemplate({
        container: this.container,
        components: [view],
        isIgnoredComponent: this.isIgnoredComponent.bind(this)
      })
      .pipe(tap((componentRef: ComponentRef<any>) => this.componentRef = componentRef));
  }

  isIgnoredComponent(component: any): boolean {
    return false;
  }
  
}



