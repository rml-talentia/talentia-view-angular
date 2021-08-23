import { 
  Compiler,
  COMPILER_OPTIONS,
  CompilerFactory,
  NgModule 
} from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import {JitCompilerFactory} from '@angular/platform-browser-dynamic';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { ViewComponent, ViewService } from './view/view.component';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { TFUILibraryModule } from '@talentia/components';
import { TFShellLibraryModule } from '@talentia/components/shell';
import { MenuService } from './service/MenuService';
import { ContextService } from './service/ContextService';
import { PageContentComponent } from './page-content/page-content.component';
import { AsidePanelComponent } from './aside-panel/aside-panel.component';
import { CommandsPanelComponent } from './commands-panel/commands-panel.component';
import { TemplateService } from '@ag-grid-enterprise/all-modules';

export function createCompiler(compilerFactory: CompilerFactory) {
  return compilerFactory.createCompiler();
}

@NgModule({
  declarations: [
    AppComponent,
    ViewComponent,
    PageContentComponent,
    AsidePanelComponent,
    CommandsPanelComponent
  ],
  imports: [ 
    BrowserAnimationsModule,
    SimpleNotificationsModule.forRoot(),
    BrowserModule,
    HttpClientModule,
    TFUILibraryModule,
    TFShellLibraryModule
  ],
  exports: [

  ],
  providers: [
    MenuService,
    ContextService,
    ViewService,
    TemplateService,
    {
      provide: COMPILER_OPTIONS,
      useValue: {},
      multi: true
    },
    {
      provide: CompilerFactory,
      useClass: JitCompilerFactory,
      deps: [COMPILER_OPTIONS]
    },
    {
      provide: Compiler,
      useFactory: createCompiler,
      deps: [CompilerFactory]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }