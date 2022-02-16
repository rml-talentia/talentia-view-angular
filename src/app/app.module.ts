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
import { ViewContainerComponent } from './view-container/view-container.component';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { TFLocalizationService, TFUILibraryModule } from '@talentia/components';
import { TFShellLibraryModule } from '@talentia/components/shell';
import { MenuService } from './service/MenuService';
import { ContextService } from './service/ContextService';
import { PageContentComponent } from './page-content/page-content.component';
import { AsidePanelComponent } from './aside-panel/aside-panel.component';
import { CommandsPanelComponent } from './commands-panel/commands-panel.component';
import { TransactionService } from './service/TransactionService';
import { CompilerService } from './service/CompilerService';
import { TemplateService } from './service/TemplateService';
import { FormatService } from './service/FormatService';
import { DataGridService } from './service/DataGridService';
import { ViewEditorToolsComponent } from './view-editor-tools/view-editor-tools.component';
import { ChosenService } from './service/ChosenService';
import { DialogComponent } from './dialog/dialog.component';

/*
Licence ag-Grid

CompanyName=TALENTIA SOFTWARE FRANCE,LicensedGroup=R&D,LicenseType=MultipleApplications,LicensedConcurrentDeveloperCount=5,LicensedProductionInstancesCount=50,AssetReference=AG-015029,ExpiryDate=5_July_2022_[v2]_MTY1Njk3NTYwMDAwMA==27a33a25fbcf6f91189a022d63c7d5a4

*/

function localizationServiceFactory() {
  const localizationService = new TFLocalizationService();
  localizationService.culture = 'fr-FR';
  localizationService.dateFormat = 'DD/MM/YYYY';
  localizationService.dateSeparator = '/';
  localizationService.decimalSeparator = ',';
  localizationService.groupSeparator = ' ';
  localizationService.numberDecimalPlaces = 3;
  localizationService.timeFormat = 'HH:mm:ss';
  localizationService.timeSeparator = ':';
  return localizationService;
}


export function createCompiler(compilerFactory: CompilerFactory) {
  return compilerFactory.createCompiler();
}

@NgModule({
  declarations: [
    AppComponent,
    ViewContainerComponent,
    PageContentComponent,
    AsidePanelComponent,
    CommandsPanelComponent,
    ViewEditorToolsComponent,
    DialogComponent
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
    TransactionService,   
    CompilerService,
    TemplateService,
    FormatService,
    DataGridService,
    ChosenService,
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
    },
    {
      provide: TFLocalizationService,
      useFactory: localizationServiceFactory
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }