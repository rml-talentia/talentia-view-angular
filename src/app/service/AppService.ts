import { Injectable } from "@angular/core";
import { AppComponent } from "../app.component";
import { Component } from "./types";

@Injectable()
export class AppService {

    private appComponent!: AppComponent;

    postConstruct(appComponent: AppComponent): void {
        this.appComponent = appComponent;
    }

    openLegacy(path: string): void {
      this.open({
        legacy: {
          src: path
        }
      });
    }

    open(view: any): void {
        this.appComponent.openView(view);
    }

    getView(): Component {
      return this.appComponent.currentView;
    }

}

